# 在线 Demo 部署

## Cloudflare Workers API

1. 安装并登录 Wrangler：`npx wrangler login`
2. 创建 KV：`npx wrangler kv namespace create DEMO_LOGS`，将返回的 id 写入 `wrangler.toml`
3. 发布：`npx wrangler deploy`

## Vercel Web

1. 在 Vercel 导入 GitHub 仓库。
2. 配置 `VITE_API_BASE_URL=https://retailops-demo-api.<account>.workers.dev`。
3. Production Branch 设为 `main` 后部署。

本地发布前执行：`npm run generate:api && npm run test:unit && npm run build`。
