export function getPlatformLabel() {
  let platform = 'Unknown'
  // #ifdef H5
  platform = 'H5'
  // #endif
  // #ifdef MP-WEIXIN
  platform = 'WeChat Mini Program'
  // #endif
  // #ifdef APP-PLUS
  platform = 'Native App'
  // #endif
  return platform
}

export async function scanStoreCode() {
  return new Promise<string>((resolve, reject) => {
    uni.scanCode({ success: (res) => resolve(res.result), fail: reject })
  })
}

export function callNativeCapability() {
  // #ifdef APP-PLUS
  // 示例：对接自研/第三方原生插件。真实项目将 DemoNative 替换成插件名。
  const plugin = uni.requireNativePlugin('DemoNative') as { getDeviceInfo?: () => unknown }
  return plugin?.getDeviceInfo?.() ?? null
  // #endif

  // #ifndef APP-PLUS
  return { message: '当前不是 App-Plus 环境，已回退到 Web/小程序实现' }
  // #endif
}
