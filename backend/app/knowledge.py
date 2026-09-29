"""A compact local RAG store backed by SQLite FTS5.

Documents can be replaced by an embedding/vector store without changing the graph contract.
"""

from app.database import get_connection

DOCUMENTS = [
    (
        "dish",
        "山野菌菇鸡汤饭",
        "菌菇鸡汤饭 清淡 暖胃 鸡肉 蘑菇 米饭 午餐 推荐 心情疲惫 低能量",
        "慢炖鸡汤搭配当季菌菇和杂粮饭，适合想吃得舒服、补充能量的一天。",
    ),
    (
        "dish",
        "青柠牛油果能量碗",
        "牛油果 能量碗 清爽 牛肉 鸡蛋 藜麦 午餐 高蛋白 推荐",
        "牛油果、香煎牛肉、溏心蛋和藜麦，口感清爽也有足够蛋白质。",
    ),
    (
        "dish",
        "番茄海鲜烩面",
        "番茄 海鲜 面条 虾 番茄酸甜 热乎 午餐 心情开心 推荐",
        "番茄汤底加入鲜虾和蛤蜊，酸甜开胃，适合想来点热乎鲜味的时候。",
    ),
    (
        "dish",
        "香煎豆腐彩蔬碗",
        "豆腐 素食 彩椒 西兰花 杂粮饭 清淡 健康 午餐",
        "香煎豆腐配西兰花、彩椒和杂粮饭，是一份轻盈的植物蛋白餐。",
    ),
    (
        "dish",
        "黑椒鸡腿暖心饭",
        "鸡腿 黑椒 米饭 热量 饱腹 午餐 推荐 想吃肉",
        "黑椒鸡腿肉配软糯米饭和烤时蔬，香气十足、饱腹感强。",
    ),
    (
        "mood",
        "低能量时的饮食建议",
        "疲惫 低落 没精神 能量 心情 温热 清淡 热汤",
        "感到疲惫时，可以选温热、易消化且含优质蛋白的餐食，补水并给自己一点缓冲。",
    ),
    (
        "mood",
        "压力大时的饮食建议",
        "压力 焦虑 紧张 心情 放松 均衡 饮食",
        "压力大时优先规律进餐，选择熟悉的均衡食物；不用用食物惩罚或奖励自己。",
    ),
    (
        "mood",
        "记录心情的小提示",
        "心情 日记 记录 情绪 感受 写下",
        "用一个词记录心情，再写下此刻最需要什么。简短、真实就很好。",
    ),
]


def init_knowledge() -> None:
    with get_connection() as db:
        db.execute(
            "CREATE VIRTUAL TABLE IF NOT EXISTS knowledge USING fts5(kind, title, keywords, content)"
        )
        existing = db.execute("SELECT count(*) FROM knowledge").fetchone()[0]
        if not existing:
            db.executemany(
                "INSERT INTO knowledge(kind, title, keywords, content) VALUES (?, ?, ?, ?)",
                DOCUMENTS,
            )
        db.commit()


def retrieve(query: str, limit: int = 4) -> list[dict[str, str]]:
    # FTS5 tokenizes English well; matching individual CJK characters also keeps local search useful.
    tokens = [
        token for token in query.replace("？", " ").replace("，", " ").split() if len(token) > 1
    ]
    tokens += sorted({char for char in query if "\u4e00" <= char <= "\u9fff"})
    expression = " OR ".join('"' + token.replace('"', '""') + '"' for token in tokens[:32])
    if not expression:
        return []
    with get_connection() as db:
        try:
            rows = db.execute(
                "SELECT kind, title, content, bm25(knowledge) AS rank FROM knowledge WHERE knowledge MATCH ? ORDER BY rank LIMIT ?",
                (expression, limit),
            ).fetchall()
        except Exception:
            rows = []
        if rows:
            return [dict(row) for row in rows]
        # Some SQLite FTS builds treat a full CJK phrase as one token, so fall back to
        # lightweight character overlap against the indexed documents.
        documents = db.execute("SELECT kind, title, keywords, content FROM knowledge").fetchall()
    characters = [char for char in query if "\u4e00" <= char <= "\u9fff"]
    ranked = []
    for row in documents:
        haystack = f"{row['title']} {row['keywords']} {row['content']}"
        hits = sum(char in haystack for char in set(characters))
        if hits:
            ranked.append((hits, dict(row)))
    ranked.sort(key=lambda item: item[0], reverse=True)
    return [
        {key: value for key, value in item.items() if key != "keywords"}
        for _, item in ranked[:limit]
    ]
