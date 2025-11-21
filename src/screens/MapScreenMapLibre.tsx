// Alternative MapScreen implementation using MapLibre for better offline tile caching
// To use this, install: npm install @maplibre/maplibre-react-native
// Then replace MapScreen.tsx with this file

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import LocationService from '../services/LocationService';

// Initialize MapLibre
MapLibreGL.setAccessToken(null); // OSM doesn't require token

const OSM_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

const MapScreenMapLibre = () => {
  const navigation = useNavigation();
  const { tasks } = useStore();
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const initialCenter = [tasks[0]?.lng || 78.9629, tasks[0]?.lat || 20.5937];

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
      <MapLibreGL.MapView
        style={styles.map}
        styleJSON={JSON.stringify(OSM_STYLE)}
      >
        <MapLibreGL.Camera
          zoomLevel={12}
          centerCoordinate={initialCenter}
        />

        {tasks.map((task) => (
          <MapLibreGL.PointAnnotation
            key={task.id}
            id={task.id}
            coordinate={[task.lng, task.lat]}
            onSelected={() => handleMarkerPress(task)}
          >
            <View
              style={[
                styles.marker,
                { backgroundColor: getMarkerColor(task.status) },
              ]}
            />
          </MapLibreGL.PointAnnotation>
        ))}
      </MapLibreGL.MapView>

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
  marker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#fff',
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

export default MapScreenMapLibre;
