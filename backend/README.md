# Morrow API

Python 3.14 + FastAPI service for authentication, meal bookings, mood entries, and LangGraph chat.

## Layout

```text
app/
  api/routes/       HTTP endpoints grouped by feature
  repositories/     SQLite queries and persistence
  services/         Authentication and chat orchestration
  config.py         Environment-backed settings
  database.py       SQLite connection and base schema
  graph.py          LangGraph intent → retrieval → response flow
  knowledge.py      Local SQLite FTS5 knowledge index
  schemas.py        Request and response contracts
  security.py       Password hashing and JWT verification
tests/              API integration tests with isolated temporary databases
pyproject.toml      Runtime/dev dependencies, package and tool configuration
uv.lock             Reproducible dependency resolution
```

## Development

```bash
uv sync --all-groups
cp .env.example .env
uv run uvicorn app.main:app --reload
uv run pytest
uv run ruff check .
uv run ruff format --check .
```

`DATABASE_URL` currently supports SQLite. `OPENAI_API_KEY` is optional; without it, the graph answers from the local FTS5 knowledge base and its built-in fallback. Set a unique `SECRET_KEY` of at least 32 random characters before deployment.
