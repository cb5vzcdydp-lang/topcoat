# Form for iPhone

The existing `mobile/` Expo SDK 55 project now contains the full Form iPhone shell, not only the health companion. It embeds the existing signed-in Form interface in WKWebView, uses the same hosted account/data/AI, and adds native connection controls, Keychain storage, file sharing and optional read-only Apple Health sync. UI updates continue to arrive through the hosted app. It is not a rewrite of every screen in SwiftUI.

## What is delivered

- Native iOS project, app icon, camera/microphone/photo usage descriptions, safe areas and system status bar.
- One-use account-pairing codes from Form → Connections. Users explicitly choose account access or health-upload-only access. Old health-only devices cannot become app sessions without new consent.
- Long-lived device credential stays in SecureStore/Keychain. A 60-second single-use ticket is submitted in a POST body to establish a 12-hour, Secure/HttpOnly host cookie. No credential is injected into the page or put in a URL.
- Account authorization remains server enforced. Revoking a phone also rejects its existing cookies and future health sync. Conflicting browser/native accounts fail instead of silently switching users.
- Same-origin navigation stays in the app. External HTTPS links open the system browser. Unsupported navigation schemes are rejected. Form's own colour tokens update the native controls.
- Real camera/file inputs stay in WKWebView. Blob downloads up to 5 MB use the iOS share sheet; larger exports explain the Safari fallback. Temporary export files are removed after sharing.
- Loading, reconnect and network failure states; back gestures and Android back handling retained. The hosted app must be reachable for a cold launch; this is not a fully offline native database.
- Apple Health remains optional and manually synced. Quantities request explicit units; overlapping sleep samples are merged and missing active/basal energy is not fabricated into a complete TDEE. Reading IDs are namespaced to the paired account so two friends' iPhones cannot collide.

## Build on a Mac

This Linux workspace can generate the Xcode project and bundle JavaScript, but cannot run Xcode, sign an IPA, run an iPhone simulator or install an app on a physical iPhone.

1. On a Mac with current Xcode and Node.js 22 or newer, download/unzip the source package, open `mobile/`, then run `npm ci`.
2. Run `npx expo prebuild --platform ios` on the Mac to install native dependencies (CocoaPods). No Expo/EAS cloud-build subscription is required.
3. Open `ios/Form.xcworkspace` in Xcode. Choose your Apple Team under **Signing & Capabilities**, select your iPhone and enable Developer Mode on the phone when requested.
4. Run the app. For a self-contained local install, build the **Release** configuration (or run `npx expo run:ios --device --configuration Release` after signing is configured).
5. In the app, tap **Open Form in Safari**. Sign in to the existing Form account, go to Connections, approve your own phone, create an **account access** code and enter it in the iOS app.

Default builds omit the HealthKit entitlement so ordinary app testing can use a Personal Team. Apple states that free Personal Team provisioning expires after seven days and has device/app limits. The developer must rebuild/reinstall when provisioning expires. Advanced capabilities and App Store/TestFlight distribution require an appropriate Apple Developer Program membership. No Apple account, certificate, provisioning profile, purchase or paid build has been created here.

## Optional HealthKit build

Use `FORM_HEALTH_ENABLED=1 npx expo prebuild --platform ios` and configure a signing team that supports HealthKit. This enables the HealthKit entitlement and its permission description. Build/run the resulting project on a physical iPhone. In the app's iPhone connection sheet, the user must explicitly choose **Allow Apple Health access & sync**. The app never writes HealthKit records or starts background sync. Read denial cannot be distinguished reliably from absent records; empty results are reported honestly.

The default build keeps manual steps, sleep, screenshot imports and all other existing web logging available. Expo Go cannot load the native HealthKit module and is not the target distribution path.

## Configuration and release

- Default backend: https://form-coaching-training.declanleonard8.chatgpt.site
- `EXPO_PUBLIC_API_URL` may select a different trusted HTTPS origin at build time. It is a public URL, not a secret or AI key.
- Existing bundle ID is preserved: `com.formcoaching.health`. Use a bundle ID registered to the actual Apple team before public distribution.
- No Apple signing material belongs in Git or the download package. Store/App Store Connect privacy disclosures must cover the actual health/fitness, account, photos and optional AI data flows.
- Native health/camera/permission behaviour, physical Safari/WebKit, iOS signing, TestFlight and App Store review still need real-device/platform verification. An Xcode project or JavaScript bundle is not an installable IPA and does not imply App Store approval.

## Verification

Run `npm run check` and `npm run export:ios` in `mobile/`; run `pnpm check` and `node tests/ios-account.mjs` in the parent. The account tests use isolated D1 fixtures for scope elevation, single-use codes/tickets, HttpOnly cookies, identity/account separation, revocation, logout and independent health record IDs. Device/simulator execution is explicitly outside the Linux test evidence.

Official references: [Expo SDK 55](https://expo.dev/changelog/sdk-55), [Expo WebView](https://docs.expo.dev/versions/v55.0.0/sdk/webview/), [React Native WebView](https://github.com/react-native-webview/react-native-webview/blob/master/docs/Reference.md), [Apple developer account / Personal Team](https://developer.apple.com/help/account/basics/about-your-developer-account).

Generated `mobile/ios/` uses Expo Continuous Native Generation and stays out of Git; it is included in the source download. Regenerate it from `app.config.js` before building after any permission, icon or native configuration change. Signing/user-machine state and Pods stay excluded.

Keychain records are isolated per backend origin and include that origin in the stored connection. An old unscoped companion credential is never sent automatically to a potentially different server; reconnect it using a fresh code. Existing uploaded health history is preserved.

### Checks completed on 7 November 2026

- Web and mobile TypeScript passed; Expo Doctor passed 20/20 checks.
- Generated `ios/Form.xcodeproj` successfully on Linux without CocoaPods installation or signing. Default generated entitlements are empty; the optional HealthKit configuration is independently checked.
- Metro produced the iOS Hermes JavaScript bundle successfully. This validates JavaScript/native-module resolution, not Apple compilation or on-device execution.
- Isolated D1 tests passed for the native account flow, backwards-compatible health-only scope, namespace separation and revoke/logout behaviour. The 167-assertion integration suite also passed after updating its old global health-ID assumption. Other existing automated checks passed.
- Controlled browser tests passed for pairing consent, separate scope selection, code display, phone revocation, 320–1280 px layouts, live theme messages and a real CSV Blob export through the web bridge.
- No Mac/Xcode, Apple signing account, iPhone simulator or physical iPhone was available. HealthKit permission prompts, native camera, native share sheets and App Store distribution are still unverified on device.
