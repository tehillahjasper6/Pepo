#!/bin/bash
# Run Detox tests and capture performance metrics

echo "Starting Detox performance test..."
npx detox test --configuration android.emu.debug --record-logs all --take-screenshots all

echo "Run Android Studio Profiler for detailed CPU, memory, and battery analysis."
echo "1. Open Android Studio > View > Tool Windows > Profiler"
echo "2. Select your running emulator/device and app package"
echo "3. Record CPU, memory, and energy usage during test runs"
