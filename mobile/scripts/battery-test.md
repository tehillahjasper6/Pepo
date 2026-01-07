# Android Battery Usage Testing

1. **Energy Profiler**
   - Open Android Studio > View > Tool Windows > Profiler
   - Select your device/emulator and app package
   - Click 'Energy' tab to monitor battery usage during app activity

2. **Simulate background tasks**
   - Test push notifications, location updates, and sync in background
   - Observe battery impact in profiler

3. **Long session test**
   - Run the app for 1+ hours with typical user flows
   - Record battery drain and energy events

4. **Automated Detox run**
   - Use `scripts/performance-test.sh` to simulate user flows

---

For more info: https://developer.android.com/studio/profile/energy-profiler
