import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { performanceMonitor } from '../../libs/performance';
import { hapticService } from '../../libs/haptics';
import { clearImageCache, getImageCacheSize } from '../../libs/imageUtils';
import Constants from 'expo-constants';

interface DebugPanelProps {
  visible: boolean;
  onClose: () => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ visible, onClose }) => {
  const store = useStore();
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [imageCacheSize, setImageCacheSize] = useState<number>(0);
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(true);

  useEffect(() => {
    if (visible) {
      loadDebugData();
    }
  }, [visible]);

  const loadDebugData = async () => {
    const perfData = performanceMonitor.getPerformanceSummary();
    const cacheSize = await getImageCacheSize();
    
    setPerformanceData(perfData);
    setImageCacheSize(cacheSize);
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear all cached data?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearImageCache();
            performanceMonitor.clearMetrics();
            await loadDebugData();
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const handleToggleHaptics = (enabled: boolean) => {
    setHapticsEnabled(enabled);
    hapticService.setEnabled(enabled);
  };

  const exportLogs = () => {
    const logs = {
      timestamp: new Date().toISOString(),
      app: {
        version: Constants.expoConfig?.version,
        buildNumber: Constants.expoConfig?.ios?.buildNumber,
        platform: Constants.platform,
      },
      store: {
        user: store.user,
        tasksCount: store.tasks.length,
        queuedReportsCount: store.queuedReports.length,
        isOnline: store.isOnline,
      },
      performance: performanceData,
      cache: {
        imageCacheSize,
      },
    };

    console.log('📋 Debug Export:', JSON.stringify(logs, null, 2));
    Alert.alert('Exported', 'Debug data has been logged to console');
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Debug Panel</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* App Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Information</Text>
            <InfoRow label="Version" value={Constants.expoConfig?.version || 'Unknown'} />
            <InfoRow label="Platform" value={Constants.platform?.ios ? 'iOS' : 'Android'} />
            <InfoRow label="Environment" value={__DEV__ ? 'Development' : 'Production'} />
          </View>

          {/* Store State */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Store State</Text>
            <InfoRow label="User" value={store.user?.name || 'Not logged in'} />
            <InfoRow label="Tasks" value={store.tasks.length.toString()} />
            <InfoRow label="Queued Reports" value={store.queuedReports.length.toString()} />
            <InfoRow label="Online Status" value={store.isOnline ? 'Online' : 'Offline'} />
          </View>

          {/* Performance */}
          {performanceData && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Performance</Text>
              <InfoRow 
                label="Avg Screen Load" 
                value={`${Math.round(performanceData.averageScreenLoad)}ms`} 
              />
              <InfoRow 
                label="Avg API Call" 
                value={`${Math.round(performanceData.averageAPICall)}ms`} 
              />
              <InfoRow 
                label="Screen Loads" 
                value={performanceData.screenLoads.length.toString()} 
              />
              <InfoRow 
                label="API Calls" 
                value={performanceData.apiCalls.length.toString()} 
              />
            </View>
          )}

          {/* Cache */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cache</Text>
            <InfoRow 
              label="Image Cache Size" 
              value={`${Math.round(imageCacheSize / 1024)}KB`} 
            />
          </View>

          {/* Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Debug Settings</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Haptic Feedback</Text>
              <Switch
                value={hapticsEnabled}
                onValueChange={handleToggleHaptics}
                trackColor={{ false: '#cbd5e1', true: '#3b82f6' }}
                thumbColor={hapticsEnabled ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions</Text>
            <TouchableOpacity style={styles.actionButton} onPress={exportLogs}>
              <Ionicons name="download-outline" size={20} color="#3b82f6" />
              <Text style={styles.actionText}>Export Debug Data</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleClearCache}>
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
              <Text style={[styles.actionText, { color: '#ef4444' }]}>Clear Cache</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => performanceMonitor.clearMetrics()}
            >
              <Ionicons name="refresh-outline" size={20} color="#f59e0b" />
              <Text style={[styles.actionText, { color: '#f59e0b' }]}>Reset Performance</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    marginLeft: 8,
  },
});