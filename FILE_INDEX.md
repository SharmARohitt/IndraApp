# INDRA Mobile - Complete File Index

## 📋 Project Files Overview

Total Files: 50+
Lines of Code: ~3,500+
Documentation: ~5,000+ lines

---

## 🎯 Core Application Files

### Entry Point
- **App.tsx** - Main application entry point, providers setup

### Configuration Files
- **app.json** - Expo configuration (permissions, plugins, metadata)
- **eas.json** - EAS Build configuration (dev, preview, production)
- **babel.config.js** - Babel configuration with Reanimated plugin
- **tsconfig.json** - TypeScript configuration
- **tailwind.config.js** - NativeWind/Tailwind styling configuration
- **.env.example** - Environment variables template
- **.gitignore** - Git ignore rules
- **package.json** - Dependencies and scripts

---

## 📱 Source Code (src/)

### API Layer (src/api/)
- **index.ts** - Axios instance, interceptors, token refresh logic
- **auth.ts** - Authentication endpoints (login, logout, refresh)
- **tasks.ts** - Task management endpoints (fetch, update, submit reports)

### Components (src/components/)
- **Button.tsx** - Reusable button component with variants
- **Card.tsx** - Card container component
- **TextInput.tsx** - Custom text input with label and error
- **MapPin.tsx** - Animated map marker with pulse effect
- **FloatingActionButton.tsx** - FAB with spring animation
- **ErrorBoundary.tsx** - Error boundary for crash handling

### Screens (src/screens/)
- **LoginScreen.tsx** - Authentication screen
- **DashboardScreen.tsx** - Task list with pull-to-refresh
- **MapScreen.tsx** - Map view with OSM tiles and markers
- **MapScreenMapLibre.tsx** - Alternative MapLibre implementation
- **TaskDetailScreen.tsx** - Task inspection with checklist and media
- **OfflineQueueScreen.tsx** - Upload queue management
- **ProfileScreen.tsx** - User profile and settings

### Hooks (src/hooks/)
- **useAuth.ts** - Authentication logic and state
- **useSocket.ts** - WebSocket connection management
- **useOfflineSync.ts** - Offline synchronization logic
- **useLogger.ts** - Logging utility hook

### Services (src/services/)
- **NotificationService.ts** - Push notification handling
- **LocationService.ts** - GPS and navigation integration
- **SyncService.ts** - Background sync queue processing

### Libraries (src/libs/)
- **db.ts** - SQLite database wrapper and operations
- **imageUtils.ts** - Image compression and file utilities

### Navigation (src/navigation/)
- **AppNavigator.tsx** - Navigation tree (stack + tabs)

### State Management (src/store/)
- **useStore.ts** - Zustand global state store

---

## 🧪 Testing Files

### Test Setup
- **jest.config.js** - Jest configuration
- **jest.setup.js** - Test environment setup and mocks

### Unit Tests (src/__tests__/)
- **useAuth.test.ts** - Authentication hook tests

---

## 🖥️ Backend Files

### Mock Server
- **server.js** - Express + Socket.IO mock backend
- **server-package.json** - Server dependencies

---

## 📚 Documentation Files

### Getting Started
- **README.md** - Project overview and quick start (main documentation)
- **QUICKSTART.md** - 5-minute setup guide
- **SETUP.md** - Detailed setup instructions with troubleshooting
- **PROJECT_SUMMARY.md** - Comprehensive project summary

### Technical Documentation
- **ARCHITECTURE.md** - Technical architecture and design patterns
- **CONTRIBUTING.md** - Contribution guidelines and standards
- **CHANGELOG.md** - Version history and release notes

### Legal
- **LICENSE** - MIT License

---

## 🛠️ Installation & Setup Scripts

### Installation Scripts
- **INSTALL.bat** - Windows automated installation
- **INSTALL.sh** - Unix/Mac automated installation
- **verify-setup.js** - Setup verification script

---

## 📁 Directory Structure

### Assets
- **assets/** - Images, icons, Lottie animations
  - **.gitkeep** - Placeholder file

---

## 📊 File Statistics by Category

### Source Code
```
Components:     6 files
Screens:        7 files
Hooks:          4 files
Services:       3 files
API:            3 files
Libraries:      2 files
Navigation:     1 file
Store:          1 file
Total:         27 files
```

### Configuration
```
App Config:     4 files (app.json, eas.json, babel, tsconfig)
Styling:        1 file (tailwind.config.js)
Environment:    1 file (.env.example)
Package:        1 file (package.json)
Git:            1 file (.gitignore)
Total:          8 files
```

### Documentation
```
Main Docs:      4 files (README, QUICKSTART, SETUP, SUMMARY)
Technical:      2 files (ARCHITECTURE, CONTRIBUTING)
Meta:           2 files (CHANGELOG, LICENSE)
Index:          1 file (this file)
Total:          9 files
```

### Testing
```
Config:         2 files (jest.config, jest.setup)
Tests:          1 file (useAuth.test)
Total:          3 files
```

### Backend
```
Server:         2 files (server.js, server-package.json)
Total:          2 files
```

### Scripts
```
Installation:   3 files (INSTALL.bat, INSTALL.sh, verify-setup.js)
Total:          3 files
```

---

## 🎯 Key Files by Purpose

### Must Read First
1. **README.md** - Start here
2. **QUICKSTART.md** - Get running in 5 minutes
3. **SETUP.md** - Detailed setup guide

### For Development
1. **ARCHITECTURE.md** - Understand the system
2. **CONTRIBUTING.md** - Development guidelines
3. **src/store/useStore.ts** - Global state structure
4. **src/api/index.ts** - API client setup

### For Customization
1. **app.json** - App metadata and permissions
2. **tailwind.config.js** - Styling theme
3. **src/navigation/AppNavigator.tsx** - Navigation structure
4. **.env.example** - Configuration template

### For Deployment
1. **eas.json** - Build profiles
2. **app.json** - App configuration
3. **package.json** - Dependencies

---

## 📝 File Naming Conventions

### Components
- PascalCase: `Button.tsx`, `MapPin.tsx`
- Descriptive names: `FloatingActionButton.tsx`

### Screens
- PascalCase with "Screen" suffix: `LoginScreen.tsx`

### Hooks
- camelCase with "use" prefix: `useAuth.ts`

### Services
- PascalCase with "Service" suffix: `NotificationService.ts`

### Utilities
- camelCase: `imageUtils.ts`, `db.ts`

### Configuration
- kebab-case or standard names: `babel.config.js`, `.env.example`

---

## 🔍 Finding Files

### By Feature

**Authentication:**
- src/screens/LoginScreen.tsx
- src/hooks/useAuth.ts
- src/api/auth.ts

**Task Management:**
- src/screens/DashboardScreen.tsx
- src/screens/TaskDetailScreen.tsx
- src/api/tasks.ts

**Map & Navigation:**
- src/screens/MapScreen.tsx
- src/screens/MapScreenMapLibre.tsx
- src/services/LocationService.ts

**Offline Sync:**
- src/screens/OfflineQueueScreen.tsx
- src/hooks/useOfflineSync.ts
- src/services/SyncService.ts
- src/libs/db.ts

**Notifications:**
- src/services/NotificationService.ts

**Real-time Updates:**
- src/hooks/useSocket.ts

---

## 📦 Dependencies Location

### Native Dependencies
Defined in: **package.json**
- React Native core
- Expo modules
- Native libraries

### Dev Dependencies
Defined in: **package.json** (devDependencies)
- TypeScript
- Testing libraries
- Build tools

### Server Dependencies
Defined in: **server-package.json**
- Express
- Socket.IO
- Multer

---

## 🎨 Asset Organization

### Current Structure
```
assets/
└── .gitkeep
```

### Recommended Structure
```
assets/
├── icons/
│   ├── app-icon.png
│   ├── notification-icon.png
│   └── adaptive-icon.png
├── images/
│   ├── splash.png
│   └── logo.png
├── lottie/
│   ├── loading.json
│   ├── success.json
│   └── error.json
└── fonts/
    └── custom-font.ttf
```

---

## 🔄 File Dependencies

### High-Level Dependencies
```
App.tsx
├── src/navigation/AppNavigator.tsx
│   ├── src/screens/*.tsx
│   │   ├── src/components/*.tsx
│   │   ├── src/hooks/*.ts
│   │   └── src/services/*.ts
│   └── src/hooks/useAuth.ts
├── src/store/useStore.ts
└── src/components/ErrorBoundary.tsx
```

### Data Flow
```
API (src/api/)
    ↓
Services (src/services/)
    ↓
Hooks (src/hooks/)
    ↓
Store (src/store/)
    ↓
Screens (src/screens/)
    ↓
Components (src/components/)
```

---

## 📊 Code Distribution

### By File Type
- TypeScript (.ts/.tsx): ~85%
- JavaScript (.js): ~10%
- Markdown (.md): ~5%

### By Purpose
- Application Code: ~60%
- Documentation: ~25%
- Configuration: ~10%
- Testing: ~5%

---

## 🚀 Quick File Access

### Most Frequently Modified
1. src/screens/*.tsx - Screen implementations
2. src/components/*.tsx - UI components
3. .env - Configuration
4. app.json - App settings

### Rarely Modified
1. babel.config.js - Babel setup
2. tsconfig.json - TypeScript config
3. jest.config.js - Test config
4. LICENSE - Legal

---

## 📝 Notes

- All source files use TypeScript (.ts/.tsx)
- Configuration files use JavaScript (.js)
- Documentation uses Markdown (.md)
- Scripts use appropriate shell syntax (.sh/.bat)

---

## 🔗 Related Files

### Configuration Chain
```
package.json → babel.config.js → tsconfig.json → app.json → eas.json
```

### Documentation Chain
```
README.md → QUICKSTART.md → SETUP.md → ARCHITECTURE.md
```

### Build Chain
```
package.json → babel.config.js → App.tsx → src/** → build output
```

---

**Last Updated**: November 21, 2025
**Total Files**: 52
**Total Directories**: 12
