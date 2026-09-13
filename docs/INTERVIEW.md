# 面试讲解脚本

## 30 秒版本

“这是我做的一套零售多租户 SaaS 前端作品。技术栈是 Vue 3、TypeScript、Pinia、Vue Router、ECharts、UnoCSS 和 SCSS。登录后权限和菜单来自独立 Mock API，前端动态注册路由，并通过 route guard 和 `v-permission` 做三层 RBAC。销售列表是真正的服务端筛选分页，不是前端切数组；项目还有 Electron IPC、完整 Uni-App 子项目、Vitest、Playwright 和 GitHub Actions。”

## 2 分钟建议演示顺序

1. Owner 登录：看 ECharts、租户切换、销售筛选分页、CSV 导出、门店状态修改。
2. 切暗黑主题：说明 CSS token 与 ECharts 同步重建。
3. 退出用 Manager 登录：门店页面还在，但管理按钮消失。
4. 再用 Clerk 登录：门店菜单和导出按钮都消失。
5. 手输无权限 URL：展示 route guard 的 403。
6. 打开 `mock-server/server.mjs`：强调后端也做 permission + tenant 校验。
7. 打开 `electron/` 与 `apps/uni-retail/`：说明跨端边界和 Bridge 设计。
8. 打开 `.github/workflows/ci.yml`：说明单测、构建和 E2E 如何进 CI。

## 高频追问

### 为什么前端权限不能算安全？

因为前端代码和请求都能被用户篡改。前端 RBAC 只提升体验；真正安全边界必须在服务端。这个项目的 Mock Server 也检查 token、权限和租户访问范围。

### 为什么做动态路由，而不是全部静态路由再隐藏菜单？

动态路由更接近后台系统的 server-driven navigation，能减少无权限页面在 UI 路由表中的暴露；但它仍不能取代 route guard 和服务端鉴权，所以我同时保留了二次检查。

### 为什么销售列表做服务端分页？

当数据从几百条增长到几十万条时，前端全量拉取不可行。这里把 keyword、门店、渠道、日期、page/pageSize 都下沉到 API，让真实后端替换 Mock Server 时页面层不需要重构。

### ECharts 主题切换怎么处理？

图表实例初始化时绑定 theme，切 light/dark 时 dispose 后重新 init，同时通过 ResizeObserver 处理容器尺寸变化。

### Electron 为什么要 preload？

renderer 不开 `nodeIntegration`，通过 contextIsolation + contextBridge 暴露白名单能力，能显著缩小 XSS 导致本地系统能力被直接利用的攻击面。

### H5 / 小程序 / App 怎么复用？

把业务状态和 API 放在共享逻辑层，平台能力集中到 adapter/bridge。Uni-App 中通过条件编译接入 App-Plus 插件，Web/Electron 则有自己的 platform adapter。
