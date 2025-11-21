# INDRA Mobile - Architecture Documentation

## System Overview

INDRA Mobile is a production-grade React Native application built with Expo for field workers managing EHV substation tasks. The architecture prioritizes offline-first functionality, real-time updates, and reliability in challenging field conditions.

## Architecture Principles

1. **Offline-First**: All critical functionality works without network connectivity
2. **Progressive Enhancement**: Online features enhance but don't block offline usage
3. **Data Synchronization**: Automatic background sync when connectivity is restored
4. **Security**: JWT-based authentication with secure token storage
5. **Performance**: Optimized animations and efficient data handling
6. **Maintainability**: Clear separation of concerns and modular design

## Technology Stack

### Core Framework
- **React Native 0.74** - Cross-platform mobile framework
- **Expo SDK 51** - Managed workflow with native module support
- **TypeScript** - Type-safe development

### State Management
- **Zustand** - Lightweight global state management
- **React Query** - Server state caching and synchronization
- **Local State** - React hooks for component-level state

### Data Layer
- **expo-sqlite** - Local SQLite database for offline storage
- **expo-secure-store** - Encrypted storage for sensitive data (tokens)
- **AsyncStorage** - Simple key-value storage

### Networking
- **Axios** - HTTP client with interceptors
- **Socket.IO Client** - WebSocket for real-time updates
- **NetInfo** - Network connectivity monitoring

### UI & Animations
- **React Native Reanimated 2** - High-performance animations
- **React Native Gesture Handler** - Touch gesture handling
- **Lottie** - Vector animations
- **NativeWind** - Tailwind CSS for React Native

### Navigation
- **React Navigation 6** - Stack and tab navigation
- **Native Stack Navigator** - Native navigation performance

### Media & Location
- **expo-camera** - Photo/video capture
- **expo-image-manipulator** - Image compression
- **expo-location** - GPS and navigation
- **react-native-maps** - Map display with OSM tiles

### Notifications
- **expo-notifications** - Push notifications via Expo Push Service

## Project Structure

```
indra-mobile/
├── app/                          # Entry point
│   └── App.tsx                   # Root component
├── src/
│   ├── api/                      # API layer
│   │   ├── index.ts             # Axios instance & interceptors
│   │   ├── auth.ts              # Authentication endpoints
│   │   └── tasks.ts             # Task management endpoints
│   ├── components/               # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── TextInput.tsx
│   │   ├── MapPin.tsx           # Animated map marker
│   │   ├── FloatingActionButton.tsx
│   │   └── ErrorBoundary.tsx
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts           # Authentication logic
│   │   ├── useSocket.ts         # WebSocket connection
│   │   ├── useOfflineSync.ts   # Sync management
│   │   └── useLogger.ts         # Logging utility
│   ├── libs/                     # Utility libraries
│   │   ├── db.ts                # SQLite wrapper
│   │   └── imageUtils.ts        # Image compression
│   ├── navigation/               # Navigation configuration
│   │   └── AppNavigator.tsx     # Navigation tree
│   ├── screens/                  # Screen components
│   │   ├── LoginScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── MapScreen.tsx
│   │   ├── TaskDetailScreen.tsx
│   │   ├── OfflineQueueScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── services/                 # Business logic services
│   │   ├── NotificationService.ts
│   │   ├── LocationService.ts
│   │   └── SyncService.ts
│   └── store/                    # Global state
│       └── useStore.ts          # Zustand store
├── assets/                       # Static assets
├── babel.config.js              # Babel configuration
├── app.json                     # Expo configuration
├── eas.json                     # EAS Build configuration
└── package.json                 # Dependencies

```

## Data Flow

### Authentication Flow

```
1. User enters credentials
   ↓
2. LoginScreen → useAuth hook
   ↓
3. API call to /auth/login
   ↓
4. Store tokens in SecureStore
   ↓
5. Update Zustand store (user, accessToken)
   ↓
6. Navigate to Main app
```

### Task Synchronization Flow

```
Online Mode:
1. App starts → Check network status
   ↓
2. Fetch tasks from API
   ↓
3. Save to SQLite (cache)
   ↓
4. Update Zustand store
   ↓
5. Render UI

Offline Mode:
1. App starts → Detect offline
   ↓
2. Load tasks from SQLite
   ↓
3. Update Zustand store
   ↓
4. Render UI (with offline indicator)
```

### Report Submission Flow

```
1. Worker completes task checklist
   ↓
2. Captures photos (compressed)
   ↓
3. Adds notes and severity
   ↓
4. Submits report
   ↓
5. Save to SQLite queue
   ↓
6. If online: Upload immediately
   If offline: Queue for later
   ↓
7. SyncService monitors network
   ↓
8. When online: Process queue
   ↓
9. Mark as synced in DB
```

## Database Schema

### Tasks Table
```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  substationId TEXT,
  substationName TEXT,
  lat REAL,
  lng REAL,
  status TEXT,
  priority TEXT,
  assignedAt TEXT,
  description TEXT,
  checklist TEXT,  -- JSON string
  syncedAt TEXT
);
```

### Queued Reports Table
```sql
CREATE TABLE queued_reports (
  id TEXT PRIMARY KEY,
  taskId TEXT,
  notes TEXT,
  severity TEXT,
  photos TEXT,     -- JSON array
  videos TEXT,     -- JSON array
  checklistData TEXT,  -- JSON array
  createdAt TEXT,
  synced INTEGER DEFAULT 0
);
```

### Media Queue Table
```sql
CREATE TABLE media_queue (
  id TEXT PRIMARY KEY,
  reportId TEXT,
  filePath TEXT,
  fileType TEXT,
  uploaded INTEGER DEFAULT 0,
  createdAt TEXT
);
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token

### Tasks
- `GET /api/worker/tasks` - Fetch assigned tasks
- `GET /api/worker/tasks/:id` - Get task details
- `PATCH /api/worker/tasks/:id/status` - Update task status

### Reports
- `POST /api/worker/reports` - Submit task report (multipart/form-data)

### Device
- `POST /api/worker/register-device` - Register push notification token

### Logging
- `POST /api/logs` - Send client logs to server

## WebSocket Events

### Client → Server
- `connect` - Initial connection
- `disconnect` - Connection closed

### Server → Client
- `connected` - Connection acknowledged
- `task:assigned` - New task assigned
- `task:updated` - Task status/details updated
- `task:deleted` - Task removed

## State Management

### Zustand Store Structure

```typescript
{
  // Authentication
  user: User | null,
  accessToken: string | null,
  isAuthenticated: boolean,
  
  // Tasks
  tasks: Task[],
  
  // Offline Queue
  queuedReports: QueuedReport[],
  
  // Network Status
  isOnline: boolean,
  
  // Push Notifications
  pushToken: string | null,
  
  // Actions
  setUser: (user) => void,
  setTasks: (tasks) => void,
  addQueuedReport: (report) => void,
  // ... more actions
}
```

## Security Considerations

### Token Management
- Access tokens stored in `expo-secure-store` (encrypted)
- Refresh tokens used for automatic token renewal
- Tokens cleared on logout

### API Security
- All requests include `Authorization: Bearer <token>` header
- Automatic token refresh on 401 responses
- Request/response interceptors for centralized handling

### Data Security
- Sensitive data encrypted at rest
- No PII in logs
- Secure file storage for media

## Performance Optimizations

### Image Handling
- Compress images before upload (max 1920x1920, 80% quality)
- Progressive loading for thumbnails
- Lazy loading for image galleries

### Database
- Indexed queries for fast lookups
- WAL mode for concurrent access
- Batch operations for bulk updates

### Animations
- Reanimated 2 runs on UI thread (60fps)
- Worklets for smooth animations
- Gesture handler for native touch response

### Network
- Request debouncing
- Response caching with React Query
- Automatic retry with exponential backoff

## Offline Strategy

### Critical Offline Features
1. View assigned tasks (from cache)
2. Navigate to substations
3. Complete checklists
4. Capture photos/videos
5. Submit reports (queued)
6. View submission queue

### Sync Strategy
1. **Immediate Sync**: When online and report submitted
2. **Periodic Sync**: Every 60 seconds when online
3. **On Reconnect**: When network restored
4. **Manual Sync**: User-triggered from queue screen

### Conflict Resolution
- Last-write-wins for task updates
- Server state takes precedence
- User notified of conflicts

## Error Handling

### Error Boundary
- Catches React component errors
- Displays user-friendly error screen
- Logs errors for debugging

### API Errors
- Network errors: Queue for retry
- 401 Unauthorized: Attempt token refresh
- 403 Forbidden: Logout user
- 5xx Server errors: Show error message

### Logging
- Console logs for development
- Remote logging for errors/warnings
- Structured log format

## Testing Strategy

### Unit Tests
- Hooks (useAuth, useOfflineSync)
- Utilities (imageUtils, db)
- API clients

### Integration Tests
- Authentication flow
- Task synchronization
- Report submission

### E2E Tests (Detox)
- Login → Dashboard → Task Detail → Submit
- Offline mode functionality
- Sync queue processing

## Deployment

### Development
```bash
expo start
```

### Staging
```bash
eas build --profile preview --platform android
```

### Production
```bash
eas build --profile production --platform android
eas submit --platform android
```

## Monitoring & Analytics

### Crash Reporting
- Integrate Sentry or Bugsnag
- Automatic crash reports
- User context included

### Analytics
- Track key user actions
- Monitor sync success rates
- Measure offline usage

### Performance Monitoring
- App startup time
- Screen render time
- API response times

## Future Enhancements

1. **AR Maintenance Guide** - Camera overlay for equipment identification
2. **Voice Notes** - Audio recording for reports
3. **Multi-language Support** - i18n for regional workers
4. **Biometric Auth** - Fingerprint/Face ID login
5. **Offline Maps** - Pre-download map tiles
6. **Worker Chat** - Real-time communication with managers
7. **Equipment History** - View past inspections
8. **Predictive Maintenance** - AI-powered fault prediction

## Contributing

See CONTRIBUTING.md for development guidelines and code standards.

## License

MIT License - See LICENSE file for details.
