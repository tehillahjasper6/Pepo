# Android Environment Setup

1. **Install Android Studio**
   - Download from https://developer.android.com/studio
   - Install SDK, emulator, and platform tools

2. **Install Java (JDK 17+)**
   - `brew install openjdk@17`
   - Add to PATH: `export PATH="/usr/local/opt/openjdk@17/bin:$PATH"`

3. **Install Node.js and Watchman**
   - `brew install node watchman`

4. **Install React Native CLI or Expo CLI**
   - React Native: `npm install -g react-native-cli`
   - Expo: `npm install -g expo-cli`

5. **Clone the mobile repo and install dependencies**
   - `git clone <repo-url> && cd mobile && npm install`

6. **Configure Android emulator**
   - Open Android Studio > Device Manager > Create Pixel 6 (API 33+)

7. **Configure signing key for release builds**
   - Generate with: `keytool -genkey -v -keystore keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias pepo-key`
   - Add to `android/app/build.gradle`

8. **Run the app**
   - `npx react-native run-android` or `expo start --android`

---

# Troubleshooting
- If emulator not detected: `adb devices`
- If build fails: check JDK version, Android SDK path, and dependencies
