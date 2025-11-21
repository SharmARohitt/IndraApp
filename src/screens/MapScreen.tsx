import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, UrlTile, PROVIDER_DEFAULT } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import LocationService from '../services/LocationService';

const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

const MapScreen = () => {
  const navigation = useNavigation();
  const mapRef = useRef<MapView>(null);
  const { tasks } = useStore();
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const initialRegion = {
    latitude: tasks[0]?.lat || 20.5937,
    longitude: tasks[0]?.lng || 78.9629,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  };

  const handleMarkerPress = (task: any) => {
    setSelectedTask(task);
  };

  const handleNavigate = () => {
    if (selectedTask) {
      LocationService.openNavigation(
        selectedTask.lat,
        selectedTask.lng,
        selectedTask.substationName
      );
    }
  };

  const handleViewDetails = () => {
    if (selectedTask) {
      setSelectedTask(null);
      navigation.navigate('TaskDetail' as never, { taskId: selectedTask.id } as never);
    }
  };

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'urgent':
        return '#dc2626';
      case 'in_progress':
        return '#f59e0b';
      case 'completed':
        return '#10b981';
      default:
        return '#1e40af';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
      >
        {/* OpenStreetMap tiles */}
        <UrlTile
          urlTemplate={OSM_TILE_URL}
          maximumZ={19}
          flipY={false}
        />

        {/* Task markers */}
        {tasks.map((task) => (
          <Marker
            key={task.id}
            coordinate={{ latitude: task.lat, longitude: task.lng }}
            onPress={() => handleMarkerPress(task)}
            pinColor={getMarkerColor(task.status)}
          />
        ))}
      </MapView>

      {/* Bottom sheet for selected task */}
      {selectedTask && (
        <View style={styles.bottomSheet}>
          <Card>
            <Text style={styles.sheetTitle}>{selectedTask.substationName}</Text>
            <Text style={styles.sheetDescription} numberOfLines={2}>
              {selectedTask.description}
            </Text>
            
            <View style={styles.sheetActions}>
              <Button
                title="Navigate"
                onPress={handleNavigate}
                variant="primary"
                style={styles.actionButton}
              />
              <Button
                title="View Details"
                onPress={handleViewDetails}
                variant="secondary"
                style={styles.actionButton}
              />
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedTask(null)}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </Card>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  sheetDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 18,
    color: '#64748b',
  },
});

export default MapScreen;
