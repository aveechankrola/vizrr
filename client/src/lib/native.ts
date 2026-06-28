import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'

export const isNativeApp = Capacitor.isNativePlatform()
export const nativePlatform = Capacitor.getPlatform()

export function isAndroid() {
  return nativePlatform === 'android'
}

export function isIOS() {
  return nativePlatform === 'ios'
}

export function isWindowsDesktop() {
  return nativePlatform === 'electron'
}

/** Configure status bar, splash, and platform back gestures for packaged apps. */
export async function initNativeShell() {
  document.documentElement.classList.add('native-shell')
  if (isAndroid()) document.documentElement.classList.add('native-android')
  if (isIOS()) document.documentElement.classList.add('native-ios')
  if (isWindowsDesktop()) document.documentElement.classList.add('native-windows')

  if (!isNativeApp) return

  try {
    await StatusBar.setStyle({ style: Style.Dark })
    if (isAndroid()) {
      await StatusBar.setBackgroundColor({ color: '#240046' })
    }
  } catch {
    /* plugin unavailable on web */
  }

  try {
    await SplashScreen.hide()
  } catch {
    /* ignore */
  }

  if (isAndroid()) {
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back()
      } else {
        App.minimizeApp()
      }
    })
  }
}
