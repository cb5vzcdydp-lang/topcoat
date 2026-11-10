# Form for iPhone

The full Form interface, existing accounts and Henry inside a native Expo/React Native iPhone app, with Keychain pairing, native sharing and optional Apple Health sync. The original Android health provider is retained.

See [the iOS setup and verification guide](../docs/IOS_APP.md) for local Xcode installation, optional HealthKit builds, distribution requirements and honest test limits.

```
npm ci
npm run check
npm run prebuild:ios
npm run ios -- --device --configuration Release
```

The last command requires macOS, Xcode and your signing team. Default builds have HealthKit disabled; set `FORM_HEALTH_ENABLED=1` while prebuilding to enable it with a capable Apple signing team. No paid Expo build service is mandatory. No signed IPA or App Store release is supplied by these source files.
