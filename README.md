# 客户维护工作台 · Client Maintenance Ops

面向银行理财经理的**加密云端**客户维护应用（Next.js · Vercel `hkg1`）。

- **单用户登录**：`APP_PASSWORD` + 签名 Session Cookie
- **Neon Postgres**：客户记录在服务端 **AES-256-GCM** 加密后存储（`DATA_KEY`）
- **字段收窄**：仅姓名、客户编号、生日 MM-DD、产品、到期日、金额、备注（不存手机/身份证/账号）
- **高效录入**：通义千问（可选）+ 本地回退；**导入/导出** CSV/Excel（飞书表格）

> 仓库内 JSON 演示数据**不会**自动上传云端。

## 本地开发

```bash
npm install
cp .env.example .env.local   # 填入必填项
npm run dev
npm test
npm run build
```

未配置 `APP_PASSWORD` 时访问任意页会进入 `/setup`（全站锁定）。

## Vercel + Neon（Kevin 推荐步骤）

1. 项目 **Storage / Marketplace** → **Neon** → **Create / Connect**
2. 区域选 **Singapore**（或离香港最近）
3. 自动注入 `DATABASE_URL`
4. **Settings → Environment Variables** 填入下方变量 → **Redeploy**

## 生产环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `APP_PASSWORD` | 是 | 登录密码（自行设定强密码） |
| `SESSION_SECRET` | 是 | 会话签名，随机长串：`openssl rand -base64 32` |
| `DATABASE_URL` | 是 | Neon 连接串（Marketplace 注入） |
| `DATA_KEY` | 是 | 64 位十六进制：`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `BOT_API_TOKEN` | 建议 | Grok Bot 只读：`GET /api/expiring?days=7`，`Authorization: Bearer …` |
| `DASHSCOPE_API_KEY` | 可选 | 高效录入通义千问 |
| `QWEN_VL_MODEL` | 可选 | 默认 `qwen-vl-max` |
| `QWEN_TEXT_MODEL` | 可选 | 默认 `qwen-plus` |

**切勿**使用 `NEXT_PUBLIC_` 暴露密钥。

## 模块

| 路由 | 说明 |
|------|------|
| `/login` | 登录 |
| `/setup` | 环境未配置说明 |
| `/` | 总览 |
| `/profiles` | 客户列表（加密库） |
| `/intake` | 高效录入 |
| `/expiry` | 到期看板 |
| `/import-export` | CSV/Excel |

## Grok Bot

```http
GET https://<your-app>.vercel.app/api/expiring?days=7
Authorization: Bearer <BOT_API_TOKEN>
```

## 安全说明与限制

- 数据库中仅为密文；明文仅在已登录会话的服务端内存中短暂出现。
- 单用户密码模型：无多角色、无细粒度 ACL；请使用强 `APP_PASSWORD` 并启用 Vercel 访问控制（如需要）。
- 登录失败 5 次 / 15 分钟 IP 限流（存 Neon）。
- 高效录入图片会发往阿里云（若配置 `DASHSCOPE_API_KEY`）；未配置则本地 OCR。
- 不提供银行级 HSM、字段级审计、设备绑定；合规投产前需行内安全评审。
- 演示 JSON / `localStorage` 旧版已移除；勿将演示客户当作真实数据。

部署细节：[docs/DEPLOY-VERCEL.md](docs/DEPLOY-VERCEL.md)
