# INDRA Mobile - Command Reference

Complete reference of all available commands and scripts.

---

## 📦 Installation Commands

### Initial Setup
```bash
# Install all dependencies
npm install

# Install with expo (recommended for native modules)
expo install

# Install global tools
npm install -g expo-cli eas-cli

# Automated install (Windows)
INSTALL.bat

# Automated install (Mac/Linux)
chmod +x INSTALL.sh && ./INSTALL.sh

# Verify setup
node verify-setup.js
```

---

## 🚀 Development Commands

### Start Development Server
```bash
# Start Expo development server
npm start

# Start with cache cleared
npm run start:clear

# Start with specific platform
npm run android    # Android emulator
npm run ios        # iOS simulator (Mac only)
npm run web        # Web browser
```

### Metro Bundler
```bash
# Clear Metro bundler cache
expo start -c

# Reset Metro bundler
watchman watch-del-all  # If watchman installed
rm -rf $TMPDIR/metro-*
```

---

## 🖥️ Backend Commands

### Mock Server
```bash
# Start mock backend server
node server.js

# Start with nodemon (auto-reload)
cd server && npm run dev

# Install server dependencies
npm install express socket.io multer cors
```

---

## 🏗️ Build Commands

### Development Builds
```bash
# Build development client for Android
npm run build:dev:android
# or
eas build --profile development --platform android

# Build development client for iOS
eas build --profile development --platform ios

# Local development build
npx expo prebuild
npx expo run:android
npx expo run:ios
```

### Production Builds
```bash
# Build production APK for Android
npm run build:prod:android
# or
eas build --profile production --platform android

# Build production IPA for iOS
eas build --profile production --platform ios

# Build for both platforms
eas build --profile production --platform all
```

### Preview Builds
```bash
# Build preview/staging version
eas build --profile preview --platform android
eas build --profile preview --platform ios
```

---

## 🧪 Testing Commands

### Unit Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- useAuth.test.ts
```

### E2E Tests (if configured)
```bash
# Build for Detox
detox build --configuration ios.sim.debug

# Run E2E tests
detox test --configuration ios.sim.debug
```

---

## 🔍 Debugging Commands

### Logs
```bash
# View Android logs
npx react-native log-android

# View iOS logs
npx react-native log-ios

# View Expo logs
expo start --dev-client
```

### Debugging Tools
```bash
# Open React Native Debugger
open "rndebugger://set-debugger-loc?host=localhost&port=8081"

# Enable remote debugging
# Press 'd' in terminal, then select "Debug Remote JS"
```

---

## 🧹 Cleanup Commands

### Clear Caches
```bash
# Clear all caches
npm run start:clear

# Clear Metro bundler cache
rm -rf $TMPDIR/metro-*

# Clear watchman cache (if installed)
watchman watch-del-all

# Clear Expo cache
expo start -c

# Clear iOS build cache (Mac only)
cd ios && xcodebuild clean && cd ..

# Clear Android build cache
cd android && ./gradlew clean && cd ..
```

### Reset Project
```bash
# Remove node_modules and reinstall
rm -rf node_modules
rm package-lock.json
npm install

# Complete reset
rm -rf node_modules
rm -rf .expo
rm -rf ios
rm -rf android
rm package-lock.json
npm install
npx expo prebuild
```

---

## 📱 Device Commands

### iOS (Mac only)
```bash
# List iOS simulators
xcrun simctl list devices

# Boot specific simulator
xcrun simctl boot "iPhone 14"

# Install on simulator
npx expo run:ios

# Install on physical device
npx expo run:ios --device
```

### Android
```bash
# List Android devices/emulators
adb devices

# Start emulator
emulator -avd Pixel_5_API_33

# Install on device
npx expo run:android

# Install specific APK
adb install app.apk

# Reverse port for localhost
adb reverse tcp:3000 tcp:3000
```

---

## 🔐 EAS Commands

### Setup
```bash
# Login to Expo
npx expo login

# Initialize EAS
eas init

# Configure EAS
eas build:configure
```

### Building
```bash
# Build for development
eas build --profile development --platform android

# Build for production
eas build --profile production --platform android

# Build locally
eas build --profile development --platform android --local
```

### Submission
```bash
# Submit to Google Play
eas submit --platform android

# Submit to App Store
eas submit --platform ios

# Submit specific build
eas submit --platform android --id <build-id>
```

### Updates
```bash
# Publish OTA update
eas update --branch production --message "Bug fixes"

# View updates
eas update:list

# Rollback update
eas update:rollback
```

---

## 🔧 Configuration Commands

### Environment
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env  # or use your editor
```

### Dependencies
```bash
# Add new dependency
npm install package-name

# Add native dependency (use expo install)
expo install package-name

# Update dependencies
npm update

# Check for outdated packages
npm outdated

# Audit dependencies
npm audit
npm audit fix
```

---

## 📊 Analysis Commands

### Bundle Analysis
```bash
# Analyze bundle size
npx expo export --dump-sourcemap

# View bundle composition
npx react-native-bundle-visualizer
```

### Code Quality
```bash
# Run ESLint
npx eslint src/

# Fix ESLint issues
npx eslint src/ --fix

# Run Prettier
npx prettier --write "src/**/*.{ts,tsx}"

# Type check
npx tsc --noEmit
```

---

## 🗃️ Database Commands

### SQLite
```bash
# Access SQLite database (Android)
adb shell
run-as com.indra.mobile
cd databases
sqlite3 indra.db

# Common SQLite queries
.tables                    # List tables
.schema tasks             # Show table schema
SELECT * FROM tasks;      # Query data
.quit                     # Exit
```

---

## 🌐 Network Commands

### Testing API
```bash
# Test backend endpoint
curl http://localhost:3000/api/worker/tasks

# Test with authentication
curl -H "Authorization: Bearer TOKEN" http://localhost:3000/api/worker/tasks

# Test WebSocket
wscat -c ws://localhost:3000
```

### Network Debugging
```bash
# Check if port is in use
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill process on port
kill -9 $(lsof -t -i:3000)  # Mac/Linux
```

---

## 📝 Git Commands

### Common Workflows
```bash
# Clone repository
git clone <repository-url>

# Create feature branch
git checkout -b feature/your-feature

# Stage changes
git add .

# Commit changes
git commit -m "feat: add new feature"

# Push changes
git push origin feature/your-feature

# Pull latest changes
git pull origin main
```

---

## 🎨 Asset Commands

### Image Optimization
```bash
# Optimize images (if imagemagick installed)
mogrify -resize 1920x1920 -quality 80 assets/images/*.jpg

# Convert to WebP
cwebp input.jpg -o output.webp
```

---

## 📦 Package Scripts (from package.json)

```bash
# Development
npm start              # Start Expo dev server
npm run start:clear    # Start with cleared cache
npm run android        # Run on Android
npm run ios            # Run on iOS
npm run web            # Run on web

# Building
npm run prebuild       # Generate native code
npm run build:dev:android      # Build dev APK
npm run build:prod:android     # Build production APK

# Testing
npm test               # Run tests
npm run lint           # Run linter

# Server
node server.js         # Start mock backend
```

---

## 🔄 Update Commands

### Expo SDK Update
```bash
# Update to latest Expo SDK
npx expo upgrade

# Update to specific version
npx expo upgrade 51.0.0
```

### Dependency Updates
```bash
# Update all dependencies
npm update

# Update specific package
npm update package-name

# Update to latest (breaking changes)
npm install package-name@latest
```

---

## 🐛 Troubleshooting Commands

### Common Fixes
```bash
# Fix: Metro bundler issues
npm run start:clear

# Fix: Native module issues
rm -rf node_modules
npm install
npx expo prebuild

# Fix: iOS build issues (Mac)
cd ios
pod install
cd ..

# Fix: Android build issues
cd android
./gradlew clean
cd ..

# Fix: Watchman issues
watchman watch-del-all

# Fix: Port already in use
kill -9 $(lsof -t -i:8081)  # Metro bundler port
kill -9 $(lsof -t -i:3000)  # Backend port
```

---

## 📱 Expo Go Commands

### Using Expo Go
```bash
# Start for Expo Go
npm start

# Generate QR code
npm start

# Open on specific device
npm start --android
npm start --ios

# Tunnel mode (for different networks)
npm start --tunnel
```

---

## 🎯 Quick Reference

### Most Used Commands
```bash
# Daily development
npm start              # Start dev server
node server.js         # Start backend
npm test              # Run tests

# When things break
npm run start:clear    # Clear cache
rm -rf node_modules && npm install  # Reinstall

# Building
eas build --profile development --platform android
eas build --profile production --platform android
```

---

## 💡 Pro Tips

### Aliases (add to .bashrc or .zshrc)
```bash
alias expo-start="npm run start:clear"
alias expo-clean="rm -rf node_modules && npm install && npm run start:clear"
alias expo-build-dev="eas build --profile development --platform android"
alias expo-build-prod="eas build --profile production --platform android"
```

### Useful Combinations
```bash
# Complete reset and start
rm -rf node_modules && npm install && npm run start:clear

# Build and install on device
eas build --profile development --platform android --local && adb install build.apk

# Test and build
npm test && eas build --profile production --platform android
```

---

## 📚 Additional Resources

- [Expo CLI Documentation](https://docs.expo.dev/workflow/expo-cli/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [React Native CLI](https://reactnative.dev/docs/environment-setup)

---

**Last Updated**: November 21, 2025
