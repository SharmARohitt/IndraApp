# 🚀 Get Started with INDRA Mobile

Welcome! This guide will get you from zero to running the app in **5 minutes**.

---

## ⚡ Super Quick Start

### 1️⃣ One Command Install (Recommended)

**Windows:**
```cmd
INSTALL.bat
```

**Mac/Linux:**
```bash
chmod +x INSTALL.sh && ./INSTALL.sh
```

This automatically:
- ✅ Checks Node.js version
- ✅ Installs all dependencies
- ✅ Installs Expo & EAS CLI
- ✅ Creates .env file with your IP
- ✅ Sets up project structure

### 2️⃣ Start Backend

```bash
node server.js
```

### 3️⃣ Start App

```bash
npm start
```

### 4️⃣ Open on Phone

1. Install **Expo Go** from App Store/Play Store
2. Scan the QR code
3. Login with: `worker@indra.com` / `password123`

**Done! 🎉**

---

## 📱 What You'll See

### Login Screen
- Enter demo credentials
- Secure JWT authentication
- Auto-login on subsequent opens

### Dashboard
- 3 assigned tasks
- Pull to refresh
- Tap to view details
- Offline indicator when disconnected

### Map View
- OpenStreetMap with task markers
- Color-coded by priority
- Tap marker for details
- Navigate button opens Maps

### Task Detail
- Digital checklist
- Photo capture
- Notes and severity
- Submit (works offline!)

### Queue Screen
- Pending uploads
- Sync status
- Manual sync button

---

## 🎯 Try These Features

### ✅ Complete a Task
1. Dashboard → Tap any task
2. Check all checklist items
3. Tap "+ Add Photo"
4. Add notes
5. Submit report

### 🗺️ Navigate to Substation
1. Map → Tap marker
2. Tap "Navigate"
3. Opens in Google Maps/Waze

### 📴 Test Offline Mode
1. Turn off WiFi
2. Complete a task
3. Submit report (queues locally)
4. Turn WiFi back on
5. Report syncs automatically

### 🔔 Real-time Updates
- After 30 seconds, server sends new task
- Notification appears
- Task added to dashboard

---

## 🛠️ Troubleshooting

### "Can't connect to server"

**Quick Fix:**
1. Check server is running: `node server.js`
2. Verify IP in `.env` matches your computer
3. Both devices on same WiFi

**Find Your IP:**
- Windows: `ipconfig` → IPv4 Address
- Mac: `ifconfig` → inet
- Linux: `ip addr` → inet

### "Metro bundler error"

**Quick Fix:**
```bash
npm run start:clear
```

### "Reanimated error"

**Quick Fix:**
```bash
rm -rf node_modules
npm install
npm run start:clear
```

### Map not showing

**Quick Fix:**
- Ensure phone has internet
- OSM tiles need network
- Check no VPN blocking

---

## 📚 Next Steps

### Learn More
- 📖 [README.md](README.md) - Full overview
- 🏗️ [ARCHITECTURE.md](ARCHITECTURE.md) - How it works
- 🔧 [SETUP.md](SETUP.md) - Detailed setup

### Customize
- Change colors in `tailwind.config.js`
- Update app name in `app.json`
- Add your logo to `assets/`

### Deploy
```bash
# Build for Android
eas build --profile production --platform android

# Build for iOS
eas build --profile production --platform ios
```

---

## 🎓 Understanding the Code

### Key Files to Explore

**Start Here:**
- `App.tsx` - Entry point
- `src/navigation/AppNavigator.tsx` - Navigation
- `src/store/useStore.ts` - Global state

**Screens:**
- `src/screens/LoginScreen.tsx` - Authentication
- `src/screens/DashboardScreen.tsx` - Task list
- `src/screens/MapScreen.tsx` - Map view
- `src/screens/TaskDetailScreen.tsx` - Task inspection

**Core Logic:**
- `src/hooks/useAuth.ts` - Authentication
- `src/hooks/useOfflineSync.ts` - Sync logic
- `src/services/SyncService.ts` - Background sync
- `src/libs/db.ts` - SQLite database

---

## 💡 Pro Tips

### Development
- Use `npm run start:clear` when things break
- Check server logs for API errors
- Use React Native Debugger for debugging
- Test offline mode frequently

### Performance
- Images auto-compress before upload
- Animations run at 60fps
- Database queries are optimized
- Background sync is throttled

### Security
- Tokens stored in encrypted storage
- Auto-refresh on expiry
- No sensitive data in logs
- Input validation on all forms

---

## 🎨 Customization Quick Guide

### Change App Name
Edit `app.json`:
```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug"
  }
}
```

### Change Colors
Edit `tailwind.config.js`:
```js
theme: {
  extend: {
    colors: {
      primary: '#YOUR_COLOR',
      secondary: '#YOUR_COLOR',
    }
  }
}
```

### Add App Icon
1. Create 1024x1024 PNG
2. Save as `assets/icon.png`
3. Rebuild app

---

## 📊 Project Stats

- **Files**: 52+
- **Lines of Code**: 3,500+
- **Documentation**: 5,000+ lines
- **Screens**: 6
- **Components**: 6
- **Services**: 3
- **Hooks**: 4

---

## 🌟 Features Included

### Core Features
- ✅ Offline-first architecture
- ✅ Real-time WebSocket updates
- ✅ Push notifications
- ✅ Map with free OSM tiles
- ✅ Photo capture & compression
- ✅ Background sync queue
- ✅ JWT authentication
- ✅ SQLite local database

### UI/UX
- ✅ Smooth 60fps animations
- ✅ Pull-to-refresh
- ✅ Loading states
- ✅ Error handling
- ✅ Offline indicators
- ✅ Haptic feedback

### Developer Experience
- ✅ 100% TypeScript
- ✅ Comprehensive docs
- ✅ Mock backend included
- ✅ Unit test setup
- ✅ Hot reload
- ✅ Clear code structure

---

## 🤝 Getting Help

### Documentation
1. **QUICKSTART.md** - This file
2. **README.md** - Project overview
3. **SETUP.md** - Detailed setup
4. **ARCHITECTURE.md** - Technical details

### Common Issues
- Check SETUP.md troubleshooting section
- Verify setup with `node verify-setup.js`
- Review server logs for API errors
- Clear cache: `npm run start:clear`

### Still Stuck?
1. Check existing GitHub issues
2. Review documentation again
3. Verify all dependencies installed
4. Try clean install

---

## 🎯 Success Checklist

After setup, you should be able to:

- [ ] Run `node server.js` successfully
- [ ] Run `npm start` without errors
- [ ] Scan QR code with Expo Go
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

**All checked?** You're ready to build! 🚀

---

## 📱 Demo Credentials

```
Email: worker@indra.com
Password: password123
```

---

## 🔗 Quick Links

- [Full README](README.md)
- [Setup Guide](SETUP.md)
- [Architecture](ARCHITECTURE.md)
- [Contributing](CONTRIBUTING.md)
- [File Index](FILE_INDEX.md)

---

## 🎉 You're All Set!

The app is now running on your phone. Explore the features, check out the code, and start building!

**Happy coding!** 💻✨

---

**Need help?** Check the documentation or run `node verify-setup.js` to diagnose issues.
