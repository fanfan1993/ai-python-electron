from typing import TypedDict

from langgraph.graph import END, START, StateGraph

from app.config import settings
from app.knowledge import retrieve


class ChatState(TypedDict, total=False):
    message: str
    history: list[dict[str, str]]
    intent: str
    documents: list[dict[str, str]]
    reply: str
    sources: list[str]


def classify_intent(state: ChatState) -> ChatState:
    message = state["message"]
    intent = (
        "booking"
        if any(word in message for word in ("预约", "订餐", "点餐", "预订"))
        else "recommendation"
        if any(word in message for word in ("推荐", "吃什么", "好吃", "菜单"))
        else "mood"
        if any(word in message for word in ("心情", "疲惫", "焦虑", "开心", "压力", "难过"))
        else "chat"
    )
    return {"intent": intent}


def retrieve_context(state: ChatState) -> ChatState:
    docs = retrieve(state["message"])
    return {"documents": docs, "sources": [doc["title"] for doc in docs]}


def compose_reply(state: ChatState) -> ChatState:
    context = "\n".join(f"- {doc['title']}：{doc['content']}" for doc in state.get("documents", []))
    if settings.openai_api_key:
        try:
            from langchain_core.messages import HumanMessage, SystemMessage
            from langchain_openai import ChatOpenAI

            model = ChatOpenAI(
                model=settings.openai_model, api_key=settings.openai_api_key, temperature=0.7
            )
            messages = [
                SystemMessage(
                    content=(
                        "你是 Morrow，一位温柔、靠谱的每日饮食与情绪陪伴助手。请用简体中文简洁自然地回答。"
                        "优先参考检索资料；不要虚构预约已成功。情绪建议不替代专业医疗意见。\n"
                        f"检索资料：\n{context or '暂无相关资料'}"
                    )
                )
            ]
            for item in state.get("history", [])[-8:]:
                role = item.get("role")
                content = item.get("content", "")
                if role in ("user", "assistant") and content:
                    messages.append(
                        HumanMessage(content=content)
                        if role == "user"
                        else SystemMessage(content=f"此前助手回复：{content}")
                    )
            messages.append(HumanMessage(content=state["message"]))
            response = model.invoke(messages)
            return {"reply": str(response.content)}
        except Exception:
            pass

    docs = state.get("documents", [])
    message = state["message"]
    if docs:
        top = docs[0]
        if state.get("intent") == "recommendation":
            reply = f"今天可以試試「{top['title']}」：{top['content']} 想要我按清淡、饱腹或素食再缩小范围吗？".replace(
                "試試", "试试"
            )
        elif state.get("intent") == "mood":
            reply = f"听起来你今天有些感受需要被照顾。{top['content']} 也可以告诉我现在更想要陪伴、建议，还是只想先记下来。"
        else:
            reply = f"我找到一些和你有关的内容：{top['content']} 你可以继续告诉我口味、预算或今天的状态，我会一起帮你想。"
    else:
        reply = f"收到啦。关于“{message}”，我可以结合今天的菜单、你的心情和饮食偏好一起帮你想。你现在比较想先聊哪一部分？"
    return {"reply": reply}


builder = StateGraph(ChatState)
builder.add_node("classify", classify_intent)
builder.add_node("retrieve", retrieve_context)
builder.add_node("respond", compose_reply)
builder.add_edge(START, "classify")
builder.add_edge("classify", "retrieve")
builder.add_edge("retrieve", "respond")
builder.add_edge("respond", END)
chat_graph = builder.compile()
