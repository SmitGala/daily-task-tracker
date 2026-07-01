/** iOS "Add to Home Screen" and mobile browsers block Google popups. */
export function shouldUseAuthRedirect(): boolean {
  const nav = window.navigator as Navigator & { standalone?: boolean }
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isAndroid = /Android/i.test(navigator.userAgent)
  return isStandalone || isIOS || isAndroid
}
