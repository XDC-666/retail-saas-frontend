# RetailOps · STAR 量化讲稿

> 所有数字均为**本机实测**产出，复现命令见文末。口径与不可夸大项见最后一节。

---

## 一、30 秒版（直接背）

> 这是我做的一套**多租户零售 SaaS 管理后台**，Vue 3 + TypeScript，49 个源文件、2100 行。
> 核心是三件事：
> **一是动态 RBAC** —— 登录后按服务端返回的权限列表动态注册路由，7 个权限码、3 种角色、2 个租户；
> **二是真实的服务端分页** —— 我把 keyword、门店、渠道、日期全部下沉到接口，实测一次拉全量 10 万条是 **19.11 MB / 291 ms**，分页取 20 条只要 **3.98 KB**，差 **4917 倍**；
> **三是工程化闭环** —— 单测 + 接口授权回归 + Playwright E2E 三层共 **16 条用例**全绿，接进了 GitHub Actions。
> 我实测时发现服务端有 **4 个端点漏了授权校验**，低权角色能读权限配置、甚至能改角色权限提权，我全部补上并写了 10 条回归断言防复发。

---

## 二、STAR 主线

### S｜情境

- 多租户 SaaS 后台，同一套系统要给**不同租户**（华东零售集团 / 北方生活馆）和**不同角色**（超级管理员 / 区域经理 / 门店员工）用。
- 典型矛盾：门店员工不该看到门店管理菜单，也不该导出销售数据；但"前端把菜单藏起来"**不是安全措施**——前端代码和请求都能被篡改。
- 数据量矛盾：销售明细在演示环境就有 10 万行量级，前端全量拉取不可行。

### T｜任务

1. 实现**动态路由 + 权限**，做到菜单级、路由级、按钮级三层控制；
2. 销售列表做成**真正的服务端筛选分页**，而不是前端切数组；
3. 保证权限边界在**服务端**也成立，可被验证、可回归。

### A｜行动

| # | 动作 | 关键实现 |
|---|---|---|
| 1 | 动态注册路由 | `src/router/routes.ts` 维护 route manifest（4 条受控路由）；登录后按 `/api/navigation` 返回的权限码**只注册有权的路由**，而非静态全注册再隐藏菜单 |
| 2 | 三层权限 | 路由级 `router.beforeEach` 守卫 + 菜单级 `navigationFor()` 过滤 + 按钮级 `v-permission` 指令 |
| 3 | 筛选分页下沉 | `keyword / storeId / channel / from / to / page / pageSize` 全部作为查询参数给服务端；`pageSize` 服务端强制上限 50 |
| 4 | 服务端硬校验 | `/api/sales` 校验 `sales:view` + `canAccessTenant`；`/api/stores/:id` PATCH 校验 `stores:manage` |
| 5 | **实测发现并修复越权** | 用真实 HTTP 请求逐端点验证时，发现 4 个端点**只校验登录态没校验权限**，逐条补齐并新增回归测试 |

**第 5 步是这次最有价值的发现**，专门展开见下节。

### R｜结果（量化）

| 指标 | 实测值 |
|---|---|
| 源码规模 | 49 个文件（19 `.vue` / 28 `.ts` / 2 `.scss`），2100 行 |
| 权限模型 | 7 个权限码 / 3 种角色 / 2 个租户 / 5 家门店 |
| 受控路由 | 4 条，按权限动态注册 |
| Mock Server 端点 | 14 个 |
| 测试用例 | **16 条全绿**（单测 4 + 接口授权 10 + E2E 2） |
| 类型检查 | `vue-tsc --noEmit` 通过，17.25 s |
| 生产构建 | Vite 7 `792` 个模块，10.88 s；产物 835 KB（不含 sourcemap） |
| 分页收益 | 全量 **19.11 MB / 291 ms** → 分页 **3.98 KB**，**4917 倍** |
| 接口延迟（本机回环，60 轮） | 全部端点 **P50 ≤ 0.55 ms，P95 ≤ 0.90 ms** |
| 并发吞吐 | 50 并发 × 20 次 = 1000 请求，0.53 s，**≈1874 req/s** |
| 越权修复 | 4 处，修复后 10/10 回归断言通过，耗时 **1.2 s** |

---

## 三、最有价值的一段：服务端授权越权（真实踩坑）

### 怎么发现的

不是读代码看出来的 —— 是**起服务、拿三种角色 token、逐端点打真实 HTTP 请求**测出来的：

| 端点 | 期望 | 实测（修复前） | 实际影响 |
|---|---|---|---|
| `GET /api/rbac/roles` | 403 | **200** | 门店员工可读全部角色与权限配置（3 角色 / 7 权限码） |
| `PATCH /api/rbac/roles/:id` | 403 | **200** | **提权**：低权角色可给自己写 `rbac:manage` |
| `GET /api/orders/:id` | 403/404 | **200** | **跨租户越权**：读到 tenant-b 的订单（天津和平店） |
| `GET /api/sales/mock-large` | 403 | **200** | 单次返回 10 万条（19.11 MB），可当资源放大器 |

对照组证明是"**漏接**"而不是"整体没做"：`PATCH /api/stores/:id` 与 `GET /api/sales` 都正确返回 403。

根因：`hasPermission()` 函数**已定义**，`/api/dashboard`、`/api/stores`、`/api/sales` 都调用了，
但这 4 个端点只写了 `requireUser()`（验登录态）就漏了授权。

### 怎么修的

1. 补 `hasPermission(user, 'rbac:view' / 'rbac:manage' / 'sales:export')`；
2. `GET /api/orders/:id` 补 `canAccessTenant(user, row.tenantId)`；
3. **无权与不存在统一返回 404**（而非 403），避免用状态码探测他租户资源是否存在；
4. 新增 `mock-server/authz.test.mjs`，10 条断言覆盖认证 / 权限隔离 / 租户隔离 / 提权拦截 / 参数上限，接入 `npm run test:api` 与 CI。

### 这段怎么讲

> "前端 RBAC 只提升体验，**真正的安全边界在服务端**。我写完后做了件反直觉的事：不读代码，而是拿三种角色的 token 去逐端点打请求——结果发现 4 个管理类端点只验了登录态没验权限，低权角色能直接读权限配置，甚至能改角色权限提权。
> 这说明**前端菜单藏起来不等于接口挡住了**。我补齐了服务端校验，并且拒绝的返回统一用 404 而不是 403，避免通过状态码探测别家租户的单据是否存在。"

---

## 四、追问预案（按数字追问）

| 可能会被问 | 怎么答 |
|---|---|
| 4917 倍怎么算的？ | 同一个 `/api/sales` 口径，`mock-large` 返回 100000 条 = 19.11 MB；`pageSize=20` 返回 3.98 KB。19.11 MB ÷ 3.98 KB ≈ 4917。**是单次响应体体积之比，不是耗时之比**（耗时 291 ms vs 0.55 ms，约 530 倍）。 |
| P50 0.55 ms 是不是太理想？ | 是。这是 **本机回环 + 内存 Mock Server**，没有网络、没有真实 DB。它的意义是**排除网络因素后的服务端处理基线**，不能当生产指标。 |
| 1874 req/s 可信吗？ | 同样是回环压测，Node 单进程、纯内存数据。用来对比**并发上升时是否线性退化**（10 并发 1466 → 50 并发 1874 req/s），不是容量承诺。 |
| 为什么 store 页面 chunk 91 KB，Dashboard 518 KB？ | Dashboard 懒加载且内含 ECharts。ECharts 已按需引入（只注册 `LineChart` + 必要组件 + `CanvasRenderer`），518 KB 是 ECharts 本体量级，且**只在进入看板路由时才加载**。 |
| 为什么产物带 sourcemap？ | 显式配置 `build.sourcemap: true`，占产物 **4.84 MB / 5.5 MB（88%）**。仓库本身开源、源码本就公开，所以不构成泄露；留着是为了便于任何人（含面试官）调试。若部署要压体积，改 `sourcemap: 'hidden'` 并把 map 单独上传即可。 |
| 测试为什么只有 16 条？ | 本项目是**面试作品**，测试按"覆盖关键边界"设计而非堆数量：单测打权限判定与格式化纯函数，接口测试打授权/租户边界，E2E 只打两条最高价值的角色差异路径（owner 全功能 / clerk 权限收缩）。 |
| 前端为什么不用 Mock Service Worker？ | 需要**服务端也能校验权限和租户**，纯前端 mock 做不到，所以选了独立 Node Mock Server（14 端点、真实 HTTP）。 |

---

## 五、复现命令

```bash
# 1. 装依赖（有 package-lock.json，用 ci 保证可复现）
npm ci

# 2. 类型检查
npm run typecheck

# 3. 单元测试（Vitest）
npm run test:unit

# 4. 接口授权/多租户回归（node:test）
npm run test:api

# 5. E2E（首次需装浏览器）
npx playwright install chromium
npm run test:e2e

# 6. 全量
npm test

# 7. 构建 + 产物体积
npm run build
```

**接口基准复现**：`node _retail_bench.mjs`（脚本在仓库外，不进版本库）
**越权验证复现**：`node _retail_authz_exploit.mjs`

---

## 六、注意事项（口径与坑）

### 不能夸大的

- ❌ 别说"生产级性能"：所有延迟/吞吐都是**回环 + 内存 Mock**，无网络无 DB。
- ❌ 别说"测试覆盖率 X%"：没跑覆盖率，只有 16 条用例全绿。
- ❌ 别说"支持百万级数据"：实测口径是 10 万条单次响应 19.11 MB，仅证明**为什么必须服务端分页**。
- ⚠️ 518 KB 的单块大小是 ECharts 体量，且懒加载；被追问就如实说，别包装成"极致优化"。

### 本地环境的坑（本次真实踩到，别当成项目缺陷）

| 现象 | 真因 | 结论 |
|---|---|---|
| `npm ci` 报 `EBUSY ... esbuild` 后单测 `Cannot find module '@csstools/css-calc'` | Windows 上杀软/索引器锁住刚解压的 `esbuild.exe`，导致 postinstall 中断、依赖树不完整 | **环境问题**：重跑 `npm install` 补齐即恢复；远端 CI 三次全绿可证项目本身没问题 |
| E2E 卡住，报 `Timed out waiting 60000ms from config.webServer` | 沙箱注入了 `HTTP_PROXY`，Playwright 的 webServer 探测与 Chromium 都走了上游代理 | 运行前清空 `HTTP_PROXY/HTTPS_PROXY/http_proxy/https_proxy` 即通过 |
| `npx playwright install chromium` 下载失败 | Playwright CDN 访问不通 | 加镜像：`PLAYWRIGHT_DOWNLOAD_HOST=https://cdn.npmmirror.com/binaries/playwright` |
| 浏览器控制台报 `grid.containLabel` 无 `use(LegacyGridContainLabel)` | ECharts 6 已废弃该配置，按需引入时未注册 legacy 特性 → **配置被静默忽略** | **真实缺陷**，已迁移为 `outerBoundsMode:'same' + outerBoundsContain:'axisLabel'`（官方等价写法） |

### 演示顺序建议

1. Owner 登录 → 看板（ECharts）→ 租户切换 → 销售筛选分页 → CSV 导出；
2. 切暗黑主题（说明 CSS token 与 ECharts 主题重建）；
3. 退出换 Manager → 门店页在、管理按钮消失；
4. 换 Clerk → 门店菜单与导出按钮都消失；
5. 手输无权限 URL → 展示 route guard 403；
6. **重点**：打开 `mock-server/authz.test.mjs` 跑 `npm run test:api`，讲第三节那 4 个越权。
