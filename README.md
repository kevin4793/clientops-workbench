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

### 线上部署（替代 Manus 旧链接）

旧地址 `https://clientops-hybuephs.manus.space` **没有**本仓库新功能。要公网打开 **高效录入** 等模块，请部署本项目：

- **详细步骤**：[docs/DEPLOY-VERCEL.md](docs/DEPLOY-VERCEL.md)
- **GitHub 账号**：[kevin4793](https://github.com/kevin4793) — 请先创建仓库 **`clientops-workbench`**（见下方），再部署。

**一键部署（仓库创建并 push 后可用）：**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fkevin4793%2Fclientops-workbench&project-name=clientops-workbench&repository-name=clientops-workbench)

**首次推送到 GitHub（在本地 / Cursor 终端，已有本仓库代码时）：**

```bash
# 1. 在 https://github.com/new 创建空仓库 kevin4793/clientops-workbench（不要加 README）
git remote add github https://github.com/kevin4793/clientops-workbench.git
git push -u github main
# 2. 打开上一「Deploy with Vercel」按钮，或 https://vercel.com/new 导入该仓库
# 3. 部署完成后访问 https://<你的项目>.vercel.app/intake
```

可选环境变量见 [.env.example](.env.example)。仓库根目录含 `vercel.json`（默认 `npm run build`，区域 `hkg1`）。

## 模块导航

| 路由 | 模块 |
|------|------|
| `/` | 总览仪表盘（跨模块摘要） |
| `/intake` | **高效录入**（粘贴 / 图片 OCR → 字段核对登记） |
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
- 浏览器持久化：`localStorage` 键 `clientops-state-v3`（含高效录入新增客户）

## 高效录入（Smart Intake）

路由：`/intake`

1. **粘贴模式**：杂乱中文（粤普混写）→ `POST /api/intake/parse`，优先 **通义千问文本**（`qwen-plus`，可 `QWEN_TEXT_MODEL` 覆盖）输出 17 字段 JSON。
2. **图片模式**：前端长边压缩 ≤1600px 的 base64 → 同一接口，优先 **通义千问视觉**（默认 `qwen-vl-max`，可 `QWEN_VL_MODEL` 覆盖）直接读图结构化；**图片会发送至阿里云百炼**（页面有提示）。
3. **回退**：未配置 `DASHSCOPE_API_KEY` 或调用失败 → **Tesseract.js** OCR + `lib/intake-parser.ts` 本地规则；界面显示当前识别方式。
4. **核对**：每项 `value` / `confidence`（高·中·低）/ `source` 来源片段；看不清留空，不臆造。
5. **确认登记**：`localStorage`，客户档案可见。

### 环境变量（仅服务端）

| 变量 | 说明 |
|------|------|
| `DASHSCOPE_API_KEY` | 阿里云百炼 API Key（**切勿** `NEXT_PUBLIC_` 暴露） |
| `QWEN_VL_MODEL` | 默认 `qwen-vl-max` |
| `QWEN_TEXT_MODEL` | 默认 `qwen-plus` |

接口：[OpenAI 兼容](https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions)，实现见 `lib/qwen-intake.ts`。

### 本地 OCR 限制

- Tesseract 仅在回退路径使用；首次会下载语言包。
- Vercel 部署时在 Project → Environment Variables 配置 `DASHSCOPE_API_KEY` 后 Redeploy。

Grok Bot 可转发 `POST /api/intake/parse`（`text` / `imageBase64` + `mimeType`）。

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
  ```json
  { "type": "intake_parse", "text": "姓名：… 产品代码：…" }
  ```
- 可选鉴权：请求头 `Authorization: Bearer <GROK_BOT_WEBHOOK_SECRET>`
- 演示环境不做真实写库，返回 `accepted` 与前端路由提示；Kevin 的 Grok Bot 可据此对接后再实现服务端处理器。

## 在 Cursor Origin 中长期维护

1. 在本仓库继续迭代 UI、数据模型与集成逻辑（Manus 链接不再作为交付物）。
2. Grok Bot 通过 HTTPS 调用部署后的 `/api/integrations/grok-bot`（本地开发可用隧道转发）。
3. Notion 同步建议在 CI 或定时任务中调用 `/api/integrations/notion` 的 POST 实现。
4. 部署：见 [docs/DEPLOY-VERCEL.md](docs/DEPLOY-VERCEL.md)；`npm run build` 为发布前检查。

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
