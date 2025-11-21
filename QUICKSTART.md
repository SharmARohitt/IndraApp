# INDRA Mobile - Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- A smartphone with Expo Go app installed
- Computer and phone on the same WiFi network

## Installation (Choose One)

### Option 1: Automated Install (Recommended)

**Windows:**
```cmd
INSTALL.bat
```

**Mac/Linux:**
```bash
chmod +x INSTALL.sh
./INSTALL.sh
```

### Option 2: Manual Install

```bash
# Install dependencies
npm install

# Install global tools
npm install -g expo-cli eas-cli

# Create environment file
cp .env.example .env
```

## Configuration

1. Find your computer's IP address:
   - **Windows**: Run `ipconfig` in CMD
   - **Mac**: Run `ifconfig` in Terminal
   - **Linux**: Run `ip addr` in Terminal

2. Edit `.env` file and replace `192.168.1.100` with your IP:
   ```env
   API_BASE_URL=http://YOUR_IP:3000/api
   WEBSOCKET_URL=ws://YOUR_IP:3000
   ```

## Running the App

### Step 1: Start Backend Server

Open a terminal and run:
```bash
node server.js
```

You should see:
```
🚀 INDRA Mock Server running on http://0.0.0.0:3000
```

### Step 2: Start Expo

Open a **new terminal** and run:
```bash
npm start
```

A QR code will appear in the terminal.

### Step 3: Open on Your Phone

1. Open **Expo Go** app on your phone
2. Scan the QR code
3. Wait for the app to load

## First Login

Use these demo credentials:
- **Email**: `worker@indra.com`
- **Password**: `password123`

## Testing Features

### 1. Dashboard
- View 3 assigned tasks
- Pull down to refresh
- Tap a task to view details

### 2. Map View
- See substations on OpenStreetMap
- Tap a marker to see task info
- Tap "Navigate" to open in Maps app

### 3. Task Details
- Complete checklist items (tap checkboxes)
- Take photos (tap "+ Add Photo")
- Select severity level
- Add notes
- Submit report

### 4. Offline Mode
- Turn off WiFi on your phone
- App continues to work
- Submit a report (it will queue)
- Turn WiFi back on
- Report syncs automatically

### 5. Queue Screen
- View pending uploads
- See sync status
- Manually trigger sync

## Troubleshooting

### "Unable to connect to server"

**Solution:**
1. Verify server is running: `node server.js`
2. Check IP address in `.env` matches your computer
3. Ensure phone and computer on same WiFi
4. Try accessing `http://YOUR_IP:3000/api/worker/tasks` in phone browser

### "Network request failed"

**Solution:**
1. Check firewall isn't blocking port 3000
2. Temporarily disable firewall to test
3. Verify `.env` has correct IP address

### "Reanimated error"

**Solution:**
```bash
npm run start:clear
```

### Map not showing

**Solution:**
- Ensure phone has internet connection
- OSM tiles require network access
- Check no VPN blocking OSM servers

### App crashes on startup

**Solution:**
```bash
# Clear everything and reinstall
rm -rf node_modules
npm install
npm run start:clear
```

## Next Steps

### For Development

1. **Read Documentation**
   - [SETUP.md](SETUP.md) - Detailed setup
   - [ARCHITECTURE.md](ARCHITECTURE.md) - Technical details
   - [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute

2. **Customize the App**
   - Update branding in `app.json`
   - Add your logo to `assets/`
   - Modify colors in `tailwind.config.js`

3. **Build for Device**
   ```bash
   # Android
   eas build --profile development --platform android
   
   # iOS
   eas build --profile development --platform ios
   ```

### For Production

1. **Configure Backend**
   - Replace mock server with real API
   - Update API_BASE_URL in `.env`
   - Set up WebSocket server

2. **Configure Push Notifications**
   - Get EAS project ID: `eas init`
   - Update `app.json` with project ID
   - Configure push notification credentials

3. **Build Production App**
   ```bash
   # Android
   eas build --profile production --platform android
   
   # iOS
   eas build --profile production --platform ios
   ```

## Common Commands

```bash
# Start development server
npm start

# Start with cache cleared
npm run start:clear

# Run on Android emulator
npm run android

# Run on iOS simulator (Mac only)
npm run ios

# Run tests
npm test

# Build development APK
npm run build:dev:android

# Build production APK
npm run build:prod:android
```

## Project Structure

```
indra-mobile/
├── App.tsx              # Entry point
├── src/
│   ├── screens/         # App screens
│   ├── components/      # Reusable components
│   ├── navigation/      # Navigation setup
│   ├── api/             # API clients
│   ├── hooks/           # Custom hooks
│   ├── services/        # Business logic
│   ├── store/           # State management
│   └── libs/            # Utilities
├── assets/              # Images, icons
├── server.js            # Mock backend
└── .env                 # Configuration
```

## Key Features

✅ **Offline-First** - Works without internet
✅ **Real-time Updates** - WebSocket notifications
✅ **Map Integration** - OpenStreetMap (free)
✅ **Photo Capture** - Automatic compression
✅ **Sync Queue** - Automatic background sync
✅ **Secure Auth** - JWT with refresh tokens
✅ **Beautiful UI** - Smooth animations

## Demo Workflow

1. **Login** → Dashboard shows 3 tasks
2. **Tap Task** → View details and checklist
3. **Complete Checklist** → Check all items
4. **Take Photo** → Capture equipment photo
5. **Add Notes** → Describe findings
6. **Submit** → Report saved (syncs when online)
7. **Check Queue** → View pending uploads
8. **Map View** → See all substations
9. **Navigate** → Open in Maps app

## Getting Help

- **Documentation**: Check README.md and SETUP.md
- **Issues**: Search existing GitHub issues
- **Logs**: Check terminal for error messages
- **Server Logs**: Check server terminal for API errors

## Tips

💡 **Use Development Build** for full features (not Expo Go)
💡 **Clear Cache** if you see weird errors
💡 **Check Server Logs** when API calls fail
💡 **Test Offline** by turning off WiFi
💡 **Use Real Device** for best performance

## What's Included

- ✅ Complete working app
- ✅ Mock backend server
- ✅ Sample data (3 tasks)
- ✅ All screens implemented
- ✅ Offline functionality
- ✅ Sync queue system
- ✅ Push notification setup
- ✅ Map with OSM tiles
- ✅ Photo capture & compression
- ✅ WebSocket real-time updates
- ✅ Comprehensive documentation
- ✅ Unit test setup
- ✅ TypeScript throughout

## Success Checklist

After setup, you should be able to:

- [ ] Login with demo credentials
- [ ] See 3 tasks on dashboard
- [ ] View tasks on map
- [ ] Open task details
- [ ] Complete checklist
- [ ] Take a photo
- [ ] Submit report
- [ ] See report in queue
- [ ] Navigate to substation
- [ ] Work offline
- [ ] See sync status

If all checked, you're ready to develop! 🎉

## Need More Help?

- Read [SETUP.md](SETUP.md) for detailed instructions
- Check [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
- See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines

Happy coding! 🚀
