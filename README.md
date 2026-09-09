# 一二布布：萌境奇旅

私人朋友局的 Q 萌隐藏身份卡牌游戏原型。

## 已包含

- React + Vite + TypeScript 网页桌面
- 12 名原创角色、4 种身份、72 张测试卡、8 张场景卡设计文档
- 基础手牌、活力、友情值、场景轮换和回合推进
- Fastify + Socket.IO 房间服务端骨架
- 私有玩家状态单播、公开状态广播、玩家身份校验
- Docker、Docker Compose、Render 和 GitHub Actions 配置

## 本地运行

需要 Node.js 20+：

```bash
npm install
npm run dev
```

服务端：

```bash
npm run server
npm run build:server
```

服务端默认监听 `8787`，健康检查为 `/health`。多人事件包括 `room:create`、`room:join`、`room:ready`、`room:start`、`game:action` 和 `room:leave`。

使用 Docker 同时启动网页和实时服务：

```bash
docker compose up --build
```

网页端口 `8080`，服务端端口 `8787`。

## 目录

- `src/`：网页原型
- `apps/server/`：房间与实时同步服务
- `packages/shared/`：前后端共享类型和常量
- `docs/`：产品规则、角色、卡牌设计
