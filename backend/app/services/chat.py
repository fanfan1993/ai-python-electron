from app.graph import chat_graph


def reply(message: str, history: list[dict[str, str]]) -> dict:
    result = chat_graph.invoke({"message": message, "history": history})
    return {
        "reply": result.get("reply", "我在听。"),
        "sources": result.get("sources", []),
        "intent": result.get("intent", "chat"),
    }
