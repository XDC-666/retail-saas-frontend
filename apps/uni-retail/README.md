# RetailOps Uni-App 子项目

这是主仓库中的独立 Uni-App 演示端，复用同一套 RetailOps Mock API，覆盖 H5、微信小程序和 App-Plus。代码包含登录、经营看板、销售列表分页、下拉刷新、扫码能力、条件编译以及 `uni.requireNativePlugin` 原生插件桥接示例。

## 运行

先在仓库根目录启动 Mock API：

```bash
npm run mock
```

再进入本目录安装并运行：

```bash
npm install
npm run dev:h5
# 或 npm run dev:mp-weixin
# 或 npm run dev:app
```

也可以直接用 HBuilderX 导入 `apps/uni-retail`。真机调试时请把 `src/api/client.ts` 的 `API_BASE` 改为电脑在局域网内可访问的 IP，而不是 `127.0.0.1`。

> `package.json` 中 DCloud 相关包使用 `latest`，用于保证同一时间安装时版本线一致；正式业务项目建议锁定团队验证过的 HBuilderX/CLI 版本并提交 lockfile。
