# RetailOps Architecture

## 1. 分层原则

`views` 只做页面编排；`stores` 管领域状态；`api` 负责 HTTP；`types` 维护 DTO/领域类型；`components` 沉淀 UI；`directives` 处理横切权限能力。平台差异收敛到 adapter/bridge，页面不直接依赖 Electron `ipcRenderer` 或 Uni-App 原生插件。

## 2. 动态 RBAC

登录返回用户和权限码，随后 `/api/navigation` 返回当前角色可见的菜单。`src/router/routes.ts` 是前端 route manifest，`installAuthorizedRoutes()` 按服务端菜单动态注册页面。

权限共有三层：

1. 菜单：服务端导航决定“看得见什么”。
2. 路由：`meta.permission` + global guard 防止手输 URL 越权。
3. 操作：`v-permission` 控制 CSV 导出、门店状态修改等按钮。

Mock Server 同时检查 token、permission、accessibleTenantIds，所以前端隐藏按钮并不构成安全边界。

## 3. 多租户

用户有 `accessibleTenantIds`，UI 只展示可访问租户。每一个 dashboard / stores / sales 请求都显式携带 `tenantId`，服务端再次校验该 tenant 是否属于当前会话。切换租户后页面 store 监听 `activeTenantId` 并重新拉取数据。

## 4. 数据查询

销售明细不是前端一次性加载再切数组，而是 `/api/sales` 支持 `keyword/storeId/channel/from/to/page/pageSize`。这使页面结构可以自然迁移到大数据量的真实后端。

## 5. ECharts

`SalesTrendChart.vue` 使用 ECharts tree-shaking API，只注册 line/grid/tooltip/legend/canvas。图表监听容器 ResizeObserver，并在主题切换时 dispose/re-init，保证暗黑主题文字与网格正确刷新。

## 6. 样式策略

- SCSS / 语义 class：应用骨架、表格、卡片、响应式、主题变量。
- UnoCSS：保留 Atomic CSS 能力，用于适合的局部排版与快速状态样式。
- CSS Variables：light/dark token 统一驱动业务组件。

## 7. Mock Server

`mock-server/server.mjs` 是独立 Node HTTP 服务，不与 Vue bundle 共享内存数组。它模拟登录、session、导航、看板、门店、销售分页、门店状态更新，并执行 token/RBAC/tenant 校验。Vite 仅通过 proxy 把 `/api` 转发到 8787。

## 8. Electron

主进程开启 `contextIsolation`、关闭 `nodeIntegration`。preload 通过 `contextBridge` 暴露最小能力，渲染层经 IPC 使用 App 信息、本地存储。生产版不应让 renderer 直接接触 `fs`。

## 9. Uni-App

`apps/uni-retail` 是独立端项目：

- H5、微信小程序、App-Plus 共用 Pinia 与 API 层。
- `#ifdef` / `#ifndef` 展示平台条件编译。
- `uni.scanCode` 展示跨端原生能力。
- `uni.requireNativePlugin` 展示 App-Plus 原生插件接入位置。

## 10. 测试与 CI

Vitest 覆盖纯逻辑（RBAC/格式化），Playwright 覆盖登录、动态图表、暗黑主题和不同角色的权限差异。GitHub Actions 分 quality 与 e2e 两个 job，失败时上传 Playwright report。
