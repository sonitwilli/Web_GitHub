let sdkLoadedResolve = false
let sdkLoaded = false

// console.log('windowwindow', window)

window.pluginInit = function (sdk) {
  window.sdk = sdk
  sdkLoaded = true
  console.log('pluginInit', sdk)
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
