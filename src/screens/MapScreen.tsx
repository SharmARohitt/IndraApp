import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, UrlTile, PROVIDER_DEFAULT, Polyline, Circle } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
// Conditional BlurView import with fallback
let BlurView: any;
try {
  BlurView = require('expo-blur').BlurView;
} catch (error) {
  // Fallback component if BlurView is not available
  BlurView = ({ children, style }: any) => <View style={[style, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]}>{children}</View>;
}
import { useStore } from '../store/useStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { MapPin } from '../components/MapPin';
import LocationService from '../services/LocationService';
import { haptic } from '../libs/haptics';

const { width, height } = Dimensions.get('window');

const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

const MapScreen = () => {
  const navigation = useNavigation();
  const mapRef = useRef<MapView>(null);
  const { tasks, user } = useStore();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');
  const [showUserLocation, setShowUserLocation] = useState(true);
  const [nearestTask, setNearestTask] = useState<any>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fabAnim = useRef(new Animated.Value(0)).current;

  const getInitialRegion = () => {
    // Try user location first
    if (userLocation?.latitude && userLocation?.longitude && 
        typeof userLocation.latitude === 'number' && 
        typeof userLocation.longitude === 'number') {
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
    }
    
    // Try first valid task
    const validTask = tasks.find(task => 
      task.lat && task.lng && 
      typeof task.lat === 'number' && 
      typeof task.lng === 'number' &&
      !isNaN(task.lat) && !isNaN(task.lng)
    );
    
    if (validTask) {
      return {
        latitude: validTask.lat,
        longitude: validTask.lng,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
    }
    
    // Default to India coordinates
    return {
      latitude: 20.5937,
      longitude: 78.9629,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };
  };

  const initialRegion = getInitialRegion();

  useEffect(() => {
    initializeMap();
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (selectedTask) {
      showBottomSheet();
    } else {
      hideBottomSheet();
    }
  }, [selectedTask]);

  const initializeMap = () => {
    // Animate FABs entrance
    Animated.stagger(100, [
      Animated.spring(fabAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getCurrentLocation = async () => {
    try {
      const location = await LocationService.getCurrentLocation();
      setUserLocation(location);
      
      if (location && tasks.length > 0) {
        const nearest = findNearestTask(location);
        setNearestTask(nearest);
        
        if (nearest) {
          const route = createRouteToTask(location, nearest);
          setRouteCoordinates(route);
        }
      }
    } catch (error) {
      console.error('Failed to get location:', error);
    }
  };

  const findNearestTask = (location: any) => {
    if (!tasks.length) return null;
    
    let nearest = tasks[0];
    let minDistance = calculateDistance(location, nearest);
    
    tasks.forEach(task => {
      const distance = calculateDistance(location, task);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = task;
      }
    });
    
    return nearest;
  };

  const calculateDistance = (point1: any, point2: any) => {
    // Validate coordinates
    if (!point1?.latitude || !point1?.longitude || !point2?.lat || !point2?.lng ||
        typeof point1.latitude !== 'number' || typeof point1.longitude !== 'number' ||
        typeof point2.lat !== 'number' || typeof point2.lng !== 'number' ||
        isNaN(point1.latitude) || isNaN(point1.longitude) ||
        isNaN(point2.lat) || isNaN(point2.lng)) {
      return 0;
    }
    
    const R = 6371; // Earth's radius in km
    const dLat = (point2.lat - point1.latitude) * Math.PI / 180;
    const dLon = (point2.lng - point1.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const createRouteToTask = (from: any, to: any) => {
    // Validate coordinates before creating route
    if (!from?.latitude || !from?.longitude || !to?.lat || !to?.lng ||
        typeof from.latitude !== 'number' || typeof from.longitude !== 'number' ||
        typeof to.lat !== 'number' || typeof to.lng !== 'number' ||
        isNaN(from.latitude) || isNaN(from.longitude) ||
        isNaN(to.lat) || isNaN(to.lng)) {
      return [];
    }
    
    // Simple straight line route (in production, use routing API)
    return [
      { latitude: from.latitude, longitude: from.longitude },
      { latitude: to.lat, longitude: to.lng },
    ];
  };

  const showBottomSheet = () => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideBottomSheet = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleMarkerPress = (task: any) => {
    haptic.selection();
    setSelectedTask(task);
    
    // Animate to marker only if coordinates are valid
    if (task.lat && task.lng && 
        typeof task.lat === 'number' && 
        typeof task.lng === 'number' &&
        !isNaN(task.lat) && !isNaN(task.lng)) {
      mapRef.current?.animateToRegion({
        latitude: task.lat,
        longitude: task.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  const handleNavigate = () => {
    if (selectedTask) {
      haptic.buttonPress();
      LocationService.openNavigation(
        selectedTask.lat,
        selectedTask.lng,
        selectedTask.substationName
      );
    }
  };

  const handleViewDetails = () => {
    if (selectedTask) {
      haptic.buttonPress();
      setSelectedTask(null);
      (navigation as any).navigate('TaskDetail', { taskId: selectedTask.id });
    }
  };

  const handleMyLocation = () => {
    haptic.buttonPress();
    if (userLocation && 
        userLocation.latitude && 
        userLocation.longitude && 
        typeof userLocation.latitude === 'number' && 
        typeof userLocation.longitude === 'number' &&
        !isNaN(userLocation.latitude) && 
        !isNaN(userLocation.longitude) && 
        mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  const handleMapTypeToggle = () => {
    haptic.selection();
    const types: ('standard' | 'satellite' | 'hybrid')[] = ['standard', 'satellite', 'hybrid'];
    const currentIndex = types.indexOf(mapType);
    const nextIndex = (currentIndex + 1) % types.length;
    setMapType(types[nextIndex]);
  };

  const handleNearestTask = () => {
    haptic.buttonPress();
    if (nearestTask && 
        nearestTask.lat && 
        nearestTask.lng && 
        typeof nearestTask.lat === 'number' && 
        typeof nearestTask.lng === 'number' &&
        !isNaN(nearestTask.lat) && 
        !isNaN(nearestTask.lng) && 
        mapRef.current) {
      setSelectedTask(nearestTask);
      mapRef.current.animateToRegion({
        latitude: nearestTask.lat,
        longitude: nearestTask.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const urgent = tasks.filter(t => t.status === 'urgent').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    
    return { total, completed, urgent, inProgress };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#dc2626';
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#64748b';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'urgent': return '#dc2626';
      case 'in_progress': return '#f59e0b';
      case 'completed': return '#10b981';
      default: return '#3b82f6';
    }
  };

  const stats = getTaskStats();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3b82f6" />
      
      {/* Enhanced Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        mapType={mapType}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={true}
        rotateEnabled={true}
        pitchEnabled={true}
      >
        {/* OpenStreetMap tiles for standard view */}
        {mapType === 'standard' && (
          <UrlTile
            urlTemplate={OSM_TILE_URL}
            maximumZ={19}
            flipY={false}
          />
        )}

        {/* User location circle */}
        {userLocation && 
         userLocation.latitude && 
         userLocation.longitude && 
         typeof userLocation.latitude === 'number' && 
         typeof userLocation.longitude === 'number' && (
          <Circle
            center={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            radius={100}
            fillColor="rgba(59, 130, 246, 0.2)"
            strokeColor="rgba(59, 130, 246, 0.8)"
            strokeWidth={2}
          />
        )}

        {/* Route to nearest task */}
        {routeCoordinates.length > 0 && 
         routeCoordinates.every(coord => 
           coord.latitude && 
           coord.longitude && 
           typeof coord.latitude === 'number' && 
           typeof coord.longitude === 'number' &&
           !isNaN(coord.latitude) &&
           !isNaN(coord.longitude)
         ) && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#3b82f6"
            strokeWidth={4}
            lineDashPattern={[10, 5]}
          />
        )}

        {/* Enhanced Task markers */}
        {tasks
          .filter(task => 
            task.lat && 
            task.lng && 
            typeof task.lat === 'number' && 
            typeof task.lng === 'number' &&
            !isNaN(task.lat) &&
            !isNaN(task.lng)
          )
          .map((task, index) => (
            <Marker
              key={task.id}
              coordinate={{ latitude: task.lat, longitude: task.lng }}
              onPress={() => handleMarkerPress(task)}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <MapPin 
                status={task.status as any}
                size={task.status === 'urgent' ? 50 : 40}
              />
            </Marker>
          ))}
      </MapView>

      {/* Top Stats Bar */}
      <Animated.View 
        style={[
          styles.topBar,
          {
            opacity: fadeAnim,
            transform: [{ translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-100, 0],
            })}],
          }
        ]}
      >
        <BlurView intensity={80} style={styles.blurContainer}>
          <LinearGradient
            colors={['rgba(59, 130, 246, 0.9)', 'rgba(37, 99, 235, 0.9)']}
            style={styles.statsGradient}
          >
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.urgent}</Text>
                <Text style={styles.statLabel}>Urgent</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.inProgress}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.completed}</Text>
                <Text style={styles.statLabel}>Done</Text>
              </View>
            </View>
          </LinearGradient>
        </BlurView>
      </Animated.View>

      {/* Floating Action Buttons */}
      <Animated.View 
        style={[
          styles.fabContainer,
          {
            opacity: fabAnim,
            transform: [{ scale: fabAnim }],
          }
        ]}
      >
        {/* My Location FAB */}
        <TouchableOpacity style={styles.fab} onPress={handleMyLocation}>
          <LinearGradient
            colors={['#3b82f6', '#2563eb']}
            style={styles.fabGradient}
          >
            <Ionicons name="locate" size={24} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Map Type FAB */}
        <TouchableOpacity style={styles.fab} onPress={handleMapTypeToggle}>
          <LinearGradient
            colors={['#10b981', '#059669']}
            style={styles.fabGradient}
          >
            <Ionicons name="layers" size={24} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Nearest Task FAB */}
        {nearestTask && (
          <TouchableOpacity style={styles.fab} onPress={handleNearestTask}>
            <LinearGradient
              colors={['#f59e0b', '#d97706']}
              style={styles.fabGradient}
            >
              <Ionicons name="navigate" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Enhanced Bottom Sheet */}
      {selectedTask && (
        <Animated.View 
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <BlurView intensity={100} style={styles.sheetBlur}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.95)']}
              style={styles.sheetGradient}
            >
              {/* Sheet Handle */}
              <View style={styles.sheetHandle} />
              
              {/* Task Header */}
              <View style={styles.sheetHeader}>
                <View style={styles.taskHeaderLeft}>
                  <View style={[
                    styles.priorityIndicator,
                    { backgroundColor: getPriorityColor(selectedTask.priority) }
                  ]} />
                  <View>
                    <Text style={styles.sheetTitle}>{selectedTask.substationName}</Text>
                    <View style={styles.taskMeta}>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(selectedTask.status) + '20' }
                      ]}>
                        <Ionicons 
                          name={selectedTask.status === 'completed' ? 'checkmark-circle' : 
                                selectedTask.status === 'urgent' ? 'alert-circle' : 'time'} 
                          size={14} 
                          color={getStatusColor(selectedTask.status)} 
                        />
                        <Text style={[
                          styles.statusText,
                          { color: getStatusColor(selectedTask.status) }
                        ]}>
                          {selectedTask.status.replace('_', ' ').toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.priorityText}>
                        {selectedTask.priority.toUpperCase()} PRIORITY
                      </Text>
                    </View>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    haptic.buttonPress();
                    setSelectedTask(null);
                  }}
                >
                  <Ionicons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              {/* Task Details */}
              <View style={styles.sheetContent}>
                <Text style={styles.sheetDescription}>
                  {selectedTask.description}
                </Text>
                
                {/* Distance Info */}
                {userLocation && (
                  <View style={styles.distanceContainer}>
                    <Ionicons name="location" size={16} color="#64748b" />
                    <Text style={styles.distanceText}>
                      {calculateDistance(userLocation, selectedTask).toFixed(1)} km away
                    </Text>
                  </View>
                )}

                {/* Checklist Preview */}
                {selectedTask.checklist && selectedTask.checklist.length > 0 && (
                  <View style={styles.checklistPreview}>
                    <Text style={styles.checklistTitle}>
                      Checklist ({selectedTask.checklist.filter((item: any) => item.checked).length}/{selectedTask.checklist.length})
                    </Text>
                    <View style={styles.checklistProgress}>
                      <View 
                        style={[
                          styles.progressBar,
                          { 
                            width: `${(selectedTask.checklist.filter((item: any) => item.checked).length / selectedTask.checklist.length) * 100}%` 
                          }
                        ]} 
                      />
                    </View>
                  </View>
                )}
              </View>
              
              {/* Action Buttons */}
              <View style={styles.sheetActions}>
                <TouchableOpacity style={styles.actionButton} onPress={handleNavigate}>
                  <LinearGradient
                    colors={['#3b82f6', '#2563eb']}
                    style={styles.actionGradient}
                  >
                    <Ionicons name="navigate" size={20} color="#fff" />
                    <Text style={styles.actionText}>Navigate</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton} onPress={handleViewDetails}>
                  <LinearGradient
                    colors={['#10b981', '#059669']}
                    style={styles.actionGradient}
                  >
                    <Ionicons name="eye" size={20} color="#fff" />
                    <Text style={styles.actionText}>View Details</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </BlurView>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  map: {
    flex: 1,
  },
  
  // Top Stats Bar
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  blurContainer: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  statsGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 8,
  },

  // Floating Action Buttons
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 120,
    zIndex: 1000,
    gap: 12,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Enhanced Bottom Sheet
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: height * 0.6,
    zIndex: 1000,
  },
  sheetBlur: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  sheetGradient: {
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#cbd5e1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  
  // Sheet Header
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  taskHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12,
  },
  priorityIndicator: {
    width: 4,
    height: 60,
    borderRadius: 2,
    marginTop: 4,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 8,
    lineHeight: 28,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  priorityText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },

  // Sheet Content
  sheetContent: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sheetDescription: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
    marginBottom: 16,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  distanceText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  
  // Checklist Preview
  checklistPreview: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  checklistTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  checklistProgress: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },

  // Action Buttons
  sheetActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
});

export default MapScreen;
