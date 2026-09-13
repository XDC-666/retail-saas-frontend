# Contributing

RetailOps 使用“页面编排 / Domain Store / API / 类型 / 平台适配”分层。新增业务时优先沿用现有边界，避免页面直接调用 Electron IPC 或把后端 DTO 散落在组件里。

## 提交前

```bash
npm run typecheck
npm run test:unit
npm run build
npm run test:e2e
```

从 `main` 创建 feature 分支，Commit 建议使用 Conventional Commits，例如 `feat: add sales channel filter`。Pull Request 请说明业务背景、权限影响、租户影响和验证方式。
