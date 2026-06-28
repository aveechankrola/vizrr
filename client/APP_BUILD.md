# Vizrr — Android, iOS & Windows app builds

Vizrr ships as a **web app**, **installable PWA**, and **native shells** (Android APK, iPhone app, Windows desktop) using [Capacitor](https://capacitorjs.com/).

## Prerequisites

| Platform | Tools |
|----------|--------|
| All | Node.js 18+, npm |
| Android | [Android Studio](https://developer.android.com/studio) (SDK 34+, JDK 17) |
| **iOS (iPhone)** | **Mac** with [Xcode](https://developer.apple.com/xcode/) 15+ and [CocoaPods](https://cocoapods.org/) (`sudo gem install cocoapods`) |
| Windows | No extra tools for dev |

> **On Windows:** you can prepare the iOS project (`npm run build && cap sync ios`), but building and running on iPhone **requires a Mac** with Xcode. Alternatively, use the **PWA** method below on iPhone without a Mac.

## 1. Configure environment

Copy `client/.env.example` to `client/.env` and set:

- `VITE_CLERK_PUBLISHABLE_KEY` — from [Clerk Dashboard](https://dashboard.clerk.com)
- `VITE_API_BASE` — **required for mobile/desktop** (e.g. `https://your-api.onrender.com/api`)

In Clerk, add allowed origins:

- `capacitor://localhost`
- `http://localhost`
- `https://localhost`
- Your production website URL

Deploy the `server/` API somewhere reachable from phones (not `localhost`).

## 2. Build web assets

```bash
cd client
npm install
npm run build
npm run cap:sync
```

## 3. iPhone / iOS (App Store or TestFlight)

**On a Mac:**

```bash
cd client
npm run app:ios
```

This opens **Xcode**. Then:

1. Select your **Apple Developer** team under **Signing & Capabilities**.
2. Plug in your iPhone or pick a simulator.
3. Click **Run** (▶) to install on the device.

### Publish to App Store

1. In Xcode: **Product → Archive**.
2. Use **Organizer** → **Distribute App** → App Store Connect.
3. Complete listing in [App Store Connect](https://appstoreconnect.apple.com).

Camera permission for the AI Face Analyser is already set in `ios/App/App/Info.plist`.

### iPhone without a Mac (PWA)

Host the built `dist/` folder on HTTPS, then on iPhone **Safari**:

1. Open your Vizrr URL.
2. Tap **Share** → **Add to Home Screen**.

Works like an app icon on the home screen (no App Store).

## 4. Android (APK / Play Store)

```bash
cd client
npm run cap:open:android
```

In Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**.

## 5. Windows (desktop .exe)

```bash
cd client
npm run cap:run:windows
```

Installer: `cd client/electron && npm run electron:make`

## Useful scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Production web bundle → `dist/` |
| `npm run cap:sync` | Copy `dist/` into native projects |
| `npm run app:ios` | Build + sync + open Xcode |
| `npm run cap:run:ios` | Build + sync + run on simulator/device |
| `npm run app:android` | Build + sync + open Android Studio |
| `npm run app:windows` | Build + sync + run Windows app |

## App icons (optional)

```bash
npm install -D @capacitor/assets
npx capacitor-assets generate --iconPath public/icon.svg --splashPath public/icon.svg
npm run cap:sync
```

## Troubleshooting

- **Blank screen on iPhone:** Set `VITE_API_BASE` to a live HTTPS API and rebuild.
- **Clerk sign-in fails:** Add `capacitor://localhost` in Clerk allowed origins.
- **Camera not working on iOS:** Allow camera when prompted; rebuild after changing `Info.plist`.
- **Pod install fails:** Run `cd ios/App && pod install` on your Mac.
- **Xcode not found:** iOS builds require macOS — use PWA on iPhone or a cloud Mac CI service.
