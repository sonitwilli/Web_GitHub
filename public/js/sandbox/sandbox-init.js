let sdkLoadedResolve = false
let sdkLoaded = false

window.pluginInit = function (sdk) {
  window.sdk = sdk
  sdkLoaded = true
  if (sdkLoadedResolve) {
    sdkLoadedResolve() // resolve waitForSdk
  }
}

window.waitForSdk = () => {
  return new Promise((resolve) => {
    if (sdkLoaded) return resolve()
    sdkLoadedResolve = resolve
  })
}
