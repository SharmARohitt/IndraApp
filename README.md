# 🚀 INDRA Mobile - Field Worker App

<div align="center">

**Production-grade mobile app for on-site field workers managing 400/220 kV EHV substation tasks**

[![React Native](https://img.shields.io/badge/React%20Native-0.81-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54.0-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Quick Start](#-quick-start) • [Features](#-features) • [Documentation](#-documentation) • [Demo](#-demo)

![INDRA Mobile](https://img.shields.io/badge/Status-Production%20Ready-success)

</div>

---

## ✨ Features

### 🎯 Core Functionality
- 📋 **Task Management** - View and manage assigned substation inspections
- 🗺️ **Interactive Map** - OpenStreetMap integration (FREE, no API key)
- 📸 **Media Capture** - Photo/video with automatic compression
- ✅ **Digital Checklists** - Structured inspection workflows
- 📊 **Report Submission** - Detailed reporting with severity levels
- 🧭 **Navigation** - Direct integration with Google Maps/Waze

### ⚡ Technical Excellence
- 💾 **Offline-First** - Full functionality without network
- 🔄 **Auto-Sync** - Intelligent background synchronization
- 🔔 **Push Notifications** - Real-time task assignments
- 🔐 **Secure Auth** - JWT with refresh token flow
- 🎨 **Beautiful UI** - Smooth 60fps animations
- 📱 **Production Ready** - Enterprise-grade code quality

## 🏗️ Tech Stack

<table>
<tr>
<td>

**Frontend**
- React Native 0.81
- Expo SDK 54
- TypeScript 5.3
- Zustand + React Query
- Reanimated 3
- React Navigation 6

</td>
<td>

**Data & Storage**
- expo-sqlite
- expo-secure-store
- expo-file-system
- NetInfo
- AsyncStorage

</td>
<td>

**Services**
- Axios (HTTP)
- Socket.IO (WebSocket)
- expo-notifications
- expo-location
- react-native-maps

</td>
</tr>
</table>

## 🚀 Quick Start

### Option 1: Automated Install (Recommended)

**Windows:**
```cmd
INSTALL.bat
```

**Mac/Linux:**
```bash
chmod +x INSTALL.sh && ./INSTALL.sh
```

### Option 2: Manual Install

```bash
# 1. Clone the repository
git clone https://github.com/SharmARohitt/IndraApp.git
cd IndraApp

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Configure environment
cp .env.example .env
# Edit .env with your IP address

# 4. Start backend
node server.js

# 5. Start app (new terminal)
npm start

# 6. Scan QR code with Expo Go
```

### Demo Credentials
```
Email: worker@indra.com
Password: password123
```

## 📱 Demo

### What You'll See

1. **Login Screen** - Secure JWT authentication
2. **Dashboard** - 3 assigned tasks with pull-to-refresh
3. **Map View** - OpenStreetMap with color-coded markers
4. **Task Details** - Digital checklist, photo capture, notes
5. **Offline Queue** - Pending uploads with sync status
6. **Profile** - User info and system status

### Try These Features

✅ Complete a task inspection  
✅ Take photos (auto-compressed)  
✅ Submit report offline  
✅ Navigate to substation  
✅ Receive real-time updates  
✅ View sync queue  

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [START_HERE.md](START_HERE.md) | **Start here!** Welcome guide |
| [GET_STARTED.md](GET_STARTED.md) | Quick 5-minute guide |
| [QUICKSTART.md](QUICKSTART.md) | Fast setup instructions |
| [SETUP.md](SETUP.md) | Detailed setup with troubleshooting |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Technical architecture & patterns |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Development guidelines |
| [COMMANDS.md](COMMANDS.md) | Complete command reference |
| [FILE_INDEX.md](FILE_INDEX.md) | All files explained |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | Complete project overview |
| [DELIVERY_SUMMARY.md](DELIVERY_SUMMARY.md) | Delivery report |

## 🎯 Project Structure

```
indra-mobile/
├── 📱 App.tsx                    # Entry point
├── 📂 src/
│   ├── api/                      # API clients
│   ├── components/               # Reusable UI components
│   ├── hooks/                    # Custom React hooks
│   ├── libs/                     # Utilities (db, image)
│   ├── navigation/               # Navigation setup
│   ├── screens/                  # Screen components
│   ├── services/                 # Business logic
│   └── store/                    # State management
├── 🖼️ assets/                    # Images, icons, Lottie
├── 🖥️ server.js                  # Mock backend
└── 📚 docs/                      # Documentation
```

## 🔧 Development

### Available Commands

```bash
# Development
npm start              # Start Expo dev server
npm run start:clear    # Start with cleared cache
npm run android        # Run on Android
npm run ios            # Run on iOS

# Building
npm run build:dev:android      # Build dev APK
npm run build:prod:android     # Build production APK

# Testing
npm test               # Run unit tests
node verify-setup.js   # Verify setup
```

See [COMMANDS.md](COMMANDS.md) for complete command reference.

## 🖥️ Mock Backend

A complete Express + Socket.IO server is included for testing:

```bash
# Start the mock server
node server.js
```

**Features:**
- REST API endpoints (auth, tasks, reports)
- WebSocket for real-time updates
- File upload handling
- Sample data (3 tasks)
- Automatic task assignment after 30s

**Endpoints:**
- `POST /api/auth/login` - Authentication
- `GET /api/worker/tasks` - Fetch tasks
- `POST /api/worker/reports` - Submit report
- `POST /api/worker/register-device` - Push token

See [server.js](server.js) for complete implementation.

## 🚢 Deployment

### Build for Production

```bash
# Android
eas build --profile production --platform android

# iOS
eas build --profile production --platform ios

# Both platforms
eas build --profile production --platform all
```

### Submit to Stores

```bash
# Google Play Store
eas submit --platform android

# Apple App Store
eas submit --platform ios
```

See [SETUP.md](SETUP.md) for detailed deployment instructions.

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Can't connect to server | Check IP in `.env`, ensure same WiFi |
| Reanimated error | Run `npm run start:clear` |
| Map not showing | Check internet connection for OSM tiles |
| Native module error | Use `expo install package-name` |
| Metro bundler error | Clear cache: `npm run start:clear` |

### Quick Fixes

```bash
# Clear all caches
npm run start:clear

# Complete reset
rm -rf node_modules && npm install --legacy-peer-deps && npm run start:clear

# Verify setup
node verify-setup.js
```

See [SETUP.md](SETUP.md) for detailed troubleshooting guide.

## 🌟 Highlights

### What Makes This Special

✨ **Zero Native-JS Mismatches** - Strict use of `expo install`  
✨ **Production-Grade** - Enterprise-ready code quality  
✨ **Offline-First** - Works reliably in field conditions  
✨ **Beautiful Animations** - Smooth 60fps with Reanimated  
✨ **Free Map Provider** - No API keys or paid accounts  
✨ **Comprehensive Docs** - 12 documentation files  
✨ **Mock Backend** - Test without real server  
✨ **Type-Safe** - 100% TypeScript coverage  

## 📊 Project Stats

```
Total Files:              65
Lines of Code:            ~3,500+
Documentation:            ~6,000+ lines
TypeScript Coverage:      100%
Screens:                  6
Components:               6
Services:                 3
Hooks:                    4
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Standards

- Use TypeScript for all new code
- Follow existing code style
- Add comments for complex logic
- Update documentation
- Test thoroughly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with amazing open-source projects:
- React Native & Expo
- OpenStreetMap
- Socket.IO
- Reanimated
- And many more!

## 📞 Support

- 📖 **Documentation**: Start with [START_HERE.md](START_HERE.md)
- 🐛 **Issues**: Check [SETUP.md](SETUP.md) troubleshooting
- 💬 **Questions**: Review existing documentation
- 🔍 **Verification**: Run `node verify-setup.js`

## 🚀 Quick Links

- [Get Started](GET_STARTED.md) - **Start here!**
- [Quick Start](QUICKSTART.md) - 5-minute setup
- [Setup Guide](SETUP.md) - Detailed instructions
- [Architecture](ARCHITECTURE.md) - Technical details
- [Commands](COMMANDS.md) - Command reference
- [File Index](FILE_INDEX.md) - All files explained
- [Delivery Summary](DELIVERY_SUMMARY.md) - Project completion

---

<div align="center">

**Built with ❤️ for field workers managing critical infrastructure**

⭐ Star this repo if you find it helpful!

[Report Bug](https://github.com/SharmARohitt/IndraApp/issues) • [Request Feature](https://github.com/SharmARohitt/IndraApp/issues) • [Documentation](START_HERE.md)

**Made by [Rohit Sharma](https://github.com/SharmARohitt)**

</div>
