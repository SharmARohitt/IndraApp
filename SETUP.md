# INDRA Mobile - Complete Setup Guide

## Quick Start (5 minutes)

### 1. Install Dependencies

```bash
# Install all dependencies
npm install

# If you encounter any issues, use expo install for native modules:
expo install react-native-reanimated react-native-gesture-handler react-native-screens react-native-safe-area-context @react-native-async-storage/async-storage expo-notifications expo-sqlite expo-secure-store expo-image-manipulator expo-file-system expo-camera expo-location expo-haptics react-native-maps
```

### 2. Start Mock Backend Server

```bash
# In a separate terminal, install server dependencies
cd server
npm install --package-lock-only
npm install

# Start the server
npm start

# Note your computer's IP address (e.g., 192.168.1.100)
```

### 3. Configure Environment

```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env and replace YOUR_IP with your actual IP:
# API_BASE_URL=http://192.168.1.100:3000/api
# WEBSOCKET_URL=ws://192.168.1.100:3000
```

### 4. Initialize EAS (One-time)

```bash
# Login to Expo
npx expo login

# Initialize EAS
eas init

# This will add your project ID to app.json automatically
```

### 5. Run the App

**Option A: Expo Go (Quick Test)**
```bash
npm start
# Scan QR code with Expo Go app
```

**Option B: Development Build (Recommended)**
```bash
# For Android
npm run build:dev:android
# Install the APK on your device, then:
npm start

# For iOS
npm run build:dev:ios
```

## Detailed Setup Instructions

### Prerequisites

1. **Node.js 18+**
   ```bash
   node --version  # Should be 18.x or higher
   ```

2. **Expo CLI**
   ```bash
   npm install -g expo-cli
   ```

3. **EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

4. **For Android Development:**
   - Android Studio
   - Android SDK (API 33+)
   - Java JDK 11+

5. **For iOS Development (Mac only):**
   - Xcode 14+
   - CocoaPods: `sudo gem install cocoapods`

### Environment Configuration

Create a `.env` file in the project root:

```env
# Backend API
API_BASE_URL=http://192.168.1.100:3000/api
WEBSOCKET_URL=ws://192.168.1.100:3000

# Map tiles (free, no API key needed)
OSM_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

**Important:** Replace `192.168.1.100` with your computer's actual IP address. Find it with:
- **Windows:** `ipconfig` (look for IPv4 Address)
- **Mac/Linux:** `ifconfig` or `ip addr`

### Running the Mock Backend

The mock server simulates the INDRA manager system:

```bash
# Navigate to project root
cd indra-mobile

# Install server dependencies
npm install express socket.io multer cors --save-dev

# Start server
node server.js
```

The server provides:
- Authentication endpoints
- Task management API
- WebSocket for real-time updates
- File upload handling
- Mock push notification registration

### Building for Different Platforms

#### Expo Go (Fastest for Testing)

```bash
npm start
```

Limitations:
- Cannot use custom native modules
- Limited to Expo SDK modules only

#### Development Build (Full Features)

**Android:**
```bash
# Build development client
eas build --profile development --platform android

# Or use local build:
npx expo prebuild
npx expo run:android
```

**iOS:**
```bash
eas build --profile development --platform ios

# Or local build (Mac only):
npx expo prebuild
npx expo run:ios
```

#### Production Build

**Android APK:**
```bash
eas build --profile production --platform android
```

**iOS:**
```bash
eas build --profile production --platform ios
```

### Testing the App

1. **Login Screen**
   - Email: `worker@indra.com`
   - Password: `password123`

2. **Dashboard**
   - View assigned tasks
   - Pull to refresh
   - Tap task to view details

3. **Map Screen**
   - See all assigned substations
   - Tap marker to see task summary
   - Navigate to location

4. **Task Detail**
   - Complete checklist items
   - Take photos
   - Add notes
   - Submit report (works offline)

5. **Offline Queue**
   - View pending uploads
   - Manually sync reports
   - Monitor sync status

### Troubleshooting

#### "Reanimated 2 failed to create a worklet"

**Solution:**
1. Check `babel.config.js` has `react-native-reanimated/plugin` as the **last** plugin
2. Clear cache: `npm run start:clear`
3. Reinstall: `rm -rf node_modules && npm install`
4. Use development build instead of Expo Go

#### "Unable to resolve module"

**Solution:**
```bash
# Clear all caches
rm -rf node_modules
rm package-lock.json
npm install
npm run start:clear
```

#### Map not showing tiles

**Solution:**
- Ensure device has internet connection
- Check OSM tile URL is correct
- Verify no firewall blocking OSM servers
- Try alternative tile provider in MapScreen.tsx

#### Cannot connect to backend

**Solution:**
- Verify server is running: `node server.js`
- Check IP address in `.env` matches your computer's IP
- Ensure phone and computer are on same WiFi network
- Disable firewall temporarily to test
- Try `http://YOUR_IP:3000/api/worker/tasks` in browser

#### SQLite errors

**Solution:**
```bash
expo install expo-sqlite
npm run start:clear
```

#### Camera/Location permissions not working

**Solution:**
- Check `app.json` has correct permission configurations
- Manually grant permissions in device settings
- Rebuild app after changing permissions

### Performance Optimization

1. **Enable Hermes** (already configured in app.json)
2. **Optimize images** before including in assets
3. **Use production build** for performance testing
4. **Enable ProGuard** for Android release builds

### Debugging

**React Native Debugger:**
```bash
# Install
brew install --cask react-native-debugger

# Or download from: https://github.com/jhen0409/react-native-debugger
```

**Flipper:**
```bash
# Install Flipper desktop app
# https://fbflipper.com/

# Flipper plugins will auto-detect your app
```

**Console Logs:**
```bash
# Android
npx react-native log-android

# iOS
npx react-native log-ios
```

### Next Steps

1. **Customize branding** in `app.json`
2. **Add app icons** to `assets/`
3. **Configure push notifications** with your Expo project ID
4. **Set up real backend** API
5. **Add more Lottie animations** for better UX
6. **Implement unit tests** with Jest
7. **Add E2E tests** with Detox

### Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- [Reanimated 2 Docs](https://docs.swmansion.com/react-native-reanimated/)
- [Zustand Guide](https://github.com/pmndrs/zustand)
- [React Query Docs](https://tanstack.com/query/latest)

### Support

For issues or questions:
1. Check the troubleshooting section above
2. Review console logs for errors
3. Verify all dependencies are correctly installed
4. Ensure backend server is running and accessible

## Production Checklist

Before deploying to production:

- [ ] Update `app.json` with correct bundle identifiers
- [ ] Configure proper API endpoints (not localhost)
- [ ] Set up SSL/TLS for API
- [ ] Configure proper push notification credentials
- [ ] Add proper app icons and splash screens
- [ ] Test on multiple devices and OS versions
- [ ] Enable crash reporting (Sentry, Bugsnag)
- [ ] Set up CI/CD pipeline
- [ ] Configure app signing for stores
- [ ] Prepare privacy policy and terms of service
- [ ] Test offline functionality thoroughly
- [ ] Optimize bundle size
- [ ] Enable code obfuscation for release builds
