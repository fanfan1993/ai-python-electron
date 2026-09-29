# Morrow · 每日食记

一个把每日点餐、心情记录和 AI 对话放在一起的全栈应用原型。

## 目录

- `backend/`：FastAPI、LangGraph 对话流程、SQLite 本地知识检索、JWT 认证。
- `frontend/`：React 19、TypeScript、Vite、Zustand 和 Electron Forge 桌面端。

## 启动后端

```bash
cd backend
uv sync --all-groups
cp .env.example .env
uv run uvicorn app.main:app --reload
```

服务默认运行于 `http://localhost:8000`，OpenAPI 文档在 `/docs`。设置 `OPENAI_API_KEY` 后会启用 OpenAI 对话模型；未配置时仍可使用本地检索和规则回复。部署前请在 `.env` 中设置随机 `SECRET_KEY`，不要沿用示例开发密钥。

后端依赖和开发工具统一在 `backend/pyproject.toml` 管理，`uv.lock` 锁定解析结果。开发命令：

```bash
cd backend
uv run pytest
uv run ruff check .
uv run ruff format --check .
```

## 启动前端

```bash
cd frontend
npm install
npm run dev
```

项目通过根目录 `.nvmrc` 固定 Node.js 25.9.0。前端默认连接 `http://localhost:8000`。可在 `frontend/.env` 中通过 `VITE_API_URL` 修改 API 地址。页面默认可直接使用演示模式；需要保存到账号时，可从左下角打开登录/注册弹窗。

## 启动桌面端

桌面端以 Electron Forge + Vite 管理 Electron 主进程、隔离的 preload 和 React 渲染进程。开发时先按上面的命令启动 Python API，再运行：

```bash
cd frontend
npm install
npm run desktop
```

打包当前 macOS 架构的桌面应用：

```bash
cd frontend
npm run make
```

`npm run package` 生成未安装的 `.app` 目录，`npm run make` 生成 ZIP 分发包。Forge 使用官方 Vite 插件；Electron 二进制缓存放在系统临时目录，也可通过 `MORROW_ELECTRON_CACHE` 和 `MORROW_ELECTRON_MIRROR` 环境变量覆盖。桌面版默认连接 `http://127.0.0.1:8000`，Python API 仍需单独运行。

桌面代码位于 `frontend/electron/`，Forge 配置位于 `frontend/forge.config.ts`。安全设置启用 `contextIsolation`、禁用 Node 集成并使用 sandbox；渲染端只暴露只读桌面版本信息。

## 当前功能

- 注册、登录、JWT Bearer Token 与受保护的用户接口。
- LangGraph 对话流程：识别意图、检索菜单与情绪知识、生成回复。
- 本地 SQLite FTS5 知识库，启动时写入示例菜单与生活建议；可替换为向量检索实现。
- 今日推荐、点餐预约、心情打卡接口。
- React 19 + TypeScript + Zustand 前端状态管理，组件、hooks、API 客户端分层。
