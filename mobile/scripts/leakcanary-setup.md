# LeakCanary Setup for Memory Leak Detection

1. Add LeakCanary to your app dependencies:
   - In `android/app/build.gradle`:
     ```gradle
     dependencies {
       debugImplementation 'com.squareup.leakcanary:leakcanary-android:2.12'
     }
     ```

2. Rebuild and run the app in debug mode.
   - LeakCanary will automatically show a notification if a leak is detected.

3. Review leak reports and fix issues in your code.

---

For more info: https://square.github.io/leakcanary/
