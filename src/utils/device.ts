/** iOS "Add to Home Screen" — popups are blocked; use redirect instead. */
export function isIOSStandalone(): boolean {
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return (
    window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true
  )
}

export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

export function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent)
}

export function shouldUseAuthRedirect(): boolean {
  if (isIOSStandalone()) return true
  return isIOS() || isAndroid()
}

export function getSiteUrl(): string {
  return window.location.origin
}
