# 客户维护工作台 · Client Maintenance Ops

面向**银行理财经理**的客户全生命周期维护运营平台（Next.js App Router + TypeScript + Tailwind）。  
到期与续期只是其中一个模块；同一工作台还覆盖档案、关怀、持仓、任务、服务记录、合规话术与晨会简报。

> **合规**：全部为虚构演示客户，不提供投资建议；话术含风险提示模板。  
> **原型说明**：早期 Manus 预览（`clientops-hybuephs.manus.space`）仅作交互参考，**已退役**；本仓库为 Cursor Origin 上的长期可维护代码基线。

## 快速开始

```bash
npm install
npm run dev    # http://localhost:43123
npm run build
npm start
```

## 模块导航

| 路由 | 模块 |
|------|------|
| `/` | 总览仪表盘（跨模块摘要） |
| `/profiles` | 客户档案摘要 |
| `/care` | 生日与节日关怀 |
| `/holdings` | 多产品持仓 / 到期总览 |
| `/tasks` | 跟进任务板（待联系 / 已约访 / 已办结） |
| `/timeline` | 服务记录时间线 |
| `/talks` | 合规话术库 |
| `/expiry` | **到期运营**（看板、核对、作战室入口） |
| `/war-room/[id]` | 续期作战室 |
| `/brief` | 晨会简报 |

右上角 **公开演练** / **授权快照** 数据隔离；状态变更写入本地审计（`理财经理·演示`）。

## 演示数据

- 基础到期字段：`data/demo-clients.json`、`data/snapshot-clients.json`
- 维护扩展字段：`data/demo-maintenance.json`、`data/snapshot-maintenance.json`（按客户 id 合并）
- 业务基准日：`lib/dates.ts` → `REFERENCE_DATE`（2026-10-21）
- 浏览器持久化：`localStorage` 键 `clientops-state-v2`

替换数据源：编辑 JSON，或实现 `GET /api/clients`；结构见 `lib/types.ts` 的 `ClientRecord`。

## 集成占位（无密钥，可直接编译）

### Notion 客户库（Kevin）

- `GET/POST /api/integrations/notion` — 返回 stub 与接入注释
- 目标：将 Notion Database 同步为 `ClientRecord` + maintenance 字段
- 环境变量（未来）：`NOTION_TOKEN`、`NOTION_DATABASE_ID`（勿提交仓库）

### Grok Bot Webhook

- `GET/POST /api/integrations/grok-bot` — 接收 Bot 推送的任务载荷
- 示例 POST body：
  ```json
  { "type": "expiry_alert", "clientId": "demo-003", "message": "逾期核对" }
  ```
  ```json
  { "type": "brief_request", "format": "markdown" }
  ```
- 可选鉴权：请求头 `Authorization: Bearer <GROK_BOT_WEBHOOK_SECRET>`
- 演示环境不做真实写库，返回 `accepted` 与前端路由提示；Kevin 的 Grok Bot 可据此对接后再实现服务端处理器。

## 在 Cursor Origin 中长期维护

1. 在本仓库继续迭代 UI、数据模型与集成逻辑（Manus 链接不再作为交付物）。
2. Grok Bot 通过 HTTPS 调用部署后的 `/api/integrations/grok-bot`（本地开发可用隧道转发）。
3. Notion 同步建议在 CI 或定时任务中调用 `/api/integrations/notion` 的 POST 实现。
4. 部署：Vercel / 行内静态托管均可；`npm run build` 为发布前检查。

## 技术结构

```
app/(main)/          带侧栏的各业务模块页面
app/api/             clients、audit、integrations/*
components/          UI 与 ExpiryModule
context/             ClientOpsProvider
data/                演示 JSON
lib/                 类型、优先级、话术、导航
```

## 许可证

内部演示用途；请勿将演示数据当作真实客户信息。
