# 部署到 Vercel（公网访问高效录入等模块）

Manus 预览域 **不会** 更新本仓库。要在线上使用 `/intake` 等页面，请把 **本 Next.js 项目** 部署到 Vercel（或其它托管）。

## 前置条件

- 本仓库能在本地通过 `npm run build`
- 一个 [Vercel](https://vercel.com) 账号
- 代码在 **GitHub / GitLab / Bitbucket** 之一（推荐 GitHub，与 Vercel 一键关联）

### Kevin（GitHub: [kevin4793](https://github.com/kevin4793)）推荐仓库名

`https://github.com/kevin4793/clientops-workbench`

1. [新建空仓库](https://github.com/new)：`clientops-workbench`，**不要**初始化 README  
2. 在本项目目录执行：

```bash
git remote add github https://github.com/kevin4793/clientops-workbench.git
# 若已存在 github 远程，用：git remote set-url github https://github.com/kevin4793/clientops-workbench.git
git push -u github main
```

> 若代码只在 Cursor Origin：在 Cursor 里用 **Create repo** 发布到 GitHub，或按上表添加 `github` 远程后 `git push`。

> 若 `git push github` 提示 404，说明 GitHub 上还没创建该仓库，先完成第 1 步。

## 方式 A：Vercel 控制台（推荐）

1. 打开 [vercel.com/new](https://vercel.com/new)
2. **Import** 你的 Git 仓库（例如 `kevin-chan/clientops-workbench`）
3. 保持默认检测：
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output**: 自动
4. **Environment Variables**（演示可先跳过，见 `.env.example`）
5. 点击 **Deploy**，等待约 1–3 分钟
6. 得到地址形如：`https://clientops-workbench.vercel.app`

### 部署后请访问

| 页面 | URL |
|------|-----|
| 总览 | `https://<你的域名>/` |
| **高效录入** | `https://<你的域名>/intake` |
| 到期运营 | `https://<你的域名>/expiry` |

在 Vercel 项目 **Settings → Domains** 可绑定自定义域名。

## 方式 B：Vercel CLI

```bash
npm i -g vercel
cd /path/to/clientops-workbench
vercel login
vercel          # 首次：按提示链接项目
vercel --prod   # 生产环境
```

CLI 会输出 Production URL。

## 方式 C：GitHub 一键部署按钮

将仓库推到 GitHub 后，在 `README.md` 里把下面链接中的 `YOUR_GITHUB_REPO_URL` 换成你的仓库 HTTPS 地址（需 URL 编码），即可在 README 显示「Deploy with Vercel」：

```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_GITHUB_REPO_URL_ENCODED&project-name=clientops-workbench&repository-name=clientops-workbench)
```

示例（仓库为 `https://github.com/acme/clientops-workbench`）：

`repository-url=https%3A%2F%2Fgithub.com%2Facme%2Fclientops-workbench`

## 环境变量（可选）

| 变量 | 用途 |
|------|------|
| `GROK_BOT_WEBHOOK_SECRET` | Grok Bot 调 webhook 时 Bearer 校验 |
| `NOTION_TOKEN` / `NOTION_DATABASE_ID` | 未来 Notion 同步 |
| `NEXT_PUBLIC_APP_URL` | 文档/集成里写绝对 API 地址时用 |

在 Vercel：**Project → Settings → Environment Variables**，保存后 **Redeploy**。

## Grok Bot 对接部署地址

部署完成后，将 Bot 的 webhook 指向：

```text
https://<你的域名>/api/integrations/grok-bot
```

解析录入文本：

```text
POST https://<你的域名>/api/intake/parse
Content-Type: application/json

{"text": "姓名：… 产品代码：…"}
```

## 常见问题

### 和 Manus 的关系

- `clientops-hybuephs.manus.space` = 旧原型，**无**高效录入
- Vercel 新域名 = 本仓库完整功能

### OCR 在 Vercel 上能用吗？

可以。**Tesseract 在用户浏览器里跑**，不占用 Vercel 函数；用户首次 OCR 会从 CDN 拉语言包，需能访问外网。

### 录入的数据存哪？

仍在访客浏览器的 **localStorage**（演示设计）。换设备或清缓存会丢失；生产接 Notion/数据库时需改 `context/ClientOpsContext` 与 API。

### 构建失败

本地先执行 `npm run build`。若 Node 版本问题，在 Vercel **Settings → General → Node.js Version** 选 **20.x**。
