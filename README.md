# 客户到期工作台（ClientOps）

面向银行理财经理的**客户到期 / 续期运营**演练工作台。从 Manus 原型迁移为可维护的 Next.js 应用：到期看板、到账核对、优先级排序、续期作战室、合规话术、晨会简报与本地审计轨迹。

> **合规说明**：全部为虚构演示客户，不提供投资建议；话术模板均含风险提示。

## 快速开始

```bash
npm install
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)（默认端口 3000）。

生产构建：

```bash
npm run build
npm start
```

可部署至 [Vercel](https://vercel.com) 等支持 Next.js 的平台。

## 演示数据与数据模式

| 模式 | 说明 | 数据文件 |
|------|------|----------|
| **公开演练**（默认） | 对外可展示的虚构客户 | `data/demo-clients.json` |
| **授权快照** | 与演练库隔离的测试快照 | `data/snapshot-clients.json` |

- 界面右上角可切换模式；切换会写入**审计轨迹**。
- 业务基准日固定为 **2026-10-21**（见 `lib/dates.ts` 的 `REFERENCE_DATE`），便于「今日 / 7 日内 / 逾期」筛选与演示一致。
- 跟进状态、缺口勾选、合规勾选等变更保存在浏览器 `localStorage`（键名 `clientops-state-v1`），刷新后仍保留。

### 更换数据源

1. **编辑 JSON**：直接修改 `data/demo-clients.json` 或 `data/snapshot-clients.json`，结构见 `lib/types.ts` 中的 `ClientRecord`。
2. **HTTP API**：`GET /api/clients?mode=demo|snapshot` 返回当前 JSON 内容；前端目前以 Context + JSON 为主，可逐步改为 fetch 该接口。
3. **Notion / SQLite（预留）**：见 `app/api/clients/route.ts` 内注释，将查询结果映射为 `ClientRecord[]` 即可。

## 功能一览

- **到期看板**：今日 / 7 日内 / 已逾期 / 本月；按产品类型、优先级、未办结筛选
- **客户卡片**：脱敏姓名、产品、到期日、合同号、跟进状态、到账核对（差异高亮）
- **优先级引擎**：综合距到期天数、金额档、高净值标签、逾期与核对状态，Top1 展示排序原因
- **续期作战室**（`/war-room/[id]`）：时间线、缺口清单、动作级建议、合规勾选
- **合规话术抽屉**：到期提醒 / 到账核对 / 犹豫期回访，一键复制（含不得承诺收益提示）
- **晨会简报**（`/brief`）：该打谁、为什么、说什么 — 支持复制 Markdown 与打印
- **审计轨迹**：操作人固定为「理财经理·演示」

## 技术栈

- Next.js App Router · TypeScript · Tailwind CSS v4
- 无真实 PII、无支付/证券接口

## 目录结构（简要）

```
app/              页面与 API 路由
components/       UI 组件
context/          客户端状态与 localStorage
data/             演示 JSON
lib/              类型、优先级、日期、话术
```

## 许可证

内部演示用途；请勿将演示数据当作真实客户信息使用。
