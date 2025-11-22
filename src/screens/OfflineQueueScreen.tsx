import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/feedback/LoadingSpinner';
import { ErrorState } from '../components/feedback/ErrorState';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { haptic } from '../libs/haptics';
import SyncService from '../services/SyncService';

const OfflineQueueScreen = () => {
  const { queuedReports, unsyncedCount, forceSyncReport, manualSync, isOnline } = useOfflineSync();
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [queueStats, setQueueStats] = useState({ total: 0, pending: 0, synced: 0, failed: 0 });
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadQueueStats();
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadQueueStats = async () => {
    try {
      const stats = await SyncService.getQueueStatus();
      setQueueStats(stats);
    } catch (error) {
      console.error('Failed to load queue stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    haptic.pullToRefresh();
    
    try {
      await loadQueueStats();
      // Refresh the queued reports list if needed
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSyncReport = async (reportId: string) => {
    if (!isOnline) {
      Alert.alert('Offline', 'Cannot sync while offline. Please check your internet connection.');
      haptic.error();
      return;
    }

    haptic.buttonPress();
    setSyncing(true);

    try {
      const success = await forceSyncReport(reportId);
      if (success) {
        haptic.success();
        Alert.alert('Success', 'Report synced successfully');
        await loadQueueStats();
      } else {
        haptic.error();
        Alert.alert('Error', 'Failed to sync report. Please try again.');
      }
    } catch (error) {
      haptic.error();
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncAll = async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Cannot sync while offline. Please check your internet connection.');
      haptic.error();
      return;
    }

    if (queueStats.pending === 0) {
      Alert.alert('Nothing to Sync', 'All reports are already synced.');
      return;
    }

    haptic.buttonPress();
    setSyncing(true);

    try {
      await manualSync();
      haptic.success();
      Alert.alert('Sync Complete', `Successfully synced ${queueStats.pending} reports`);
      await loadQueueStats();
    } catch (error) {
      haptic.error();
      Alert.alert('Sync Failed', 'Some reports could not be synced. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteReport = (reportId: string) => {
    Alert.alert(
      'Delete Report',
      'Are you sure you want to delete this report? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            haptic.buttonPress();
            // Implement delete functionality
            console.log('Delete report:', reportId);
          },
        },
      ]
    );
  };

  const getStatusInfo = (item: any) => {
    if (item.synced) {
      return {
        icon: 'checkmark-circle' as const,
        color: '#10b981',
        text: 'Synced',
        bgColor: '#d1fae5',
      };
    } else if (item.syncAttempts >= 3) {
      return {
        icon: 'alert-circle' as const,
        color: '#ef4444',
        text: 'Failed',
        bgColor: '#fee2e2',
      };
    } else if (item.syncAttempts > 0) {
      return {
        icon: 'refresh' as const,
        color: '#f59e0b',
        text: 'Retrying',
        bgColor: '#fef3c7',
      };
    } else {
      return {
        icon: 'time' as const,
        color: '#3b82f6',
        text: 'Pending',
        bgColor: '#dbeafe',
      };
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#10b981';
    }
  };

  const renderReport = ({ item, index }: { item: any; index: number }) => {
    const statusInfo = getStatusInfo(item);
    const severityColor = getSeverityColor(item.severity);

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          }],
        }}
      >
        <Card style={styles.reportCard}>
          <LinearGradient
            colors={['#ffffff', '#f8fafc']}
            style={styles.cardGradient}
          >
            <View style={styles.reportHeader}>
              <View style={styles.reportTitleContainer}>
                <View style={[styles.severityIndicator, { backgroundColor: severityColor }]} />
                <Text style={styles.reportTitle}>Report #{item.id.slice(-6)}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
                <Ionicons name={statusInfo.icon} size={14} color={statusInfo.color} />
                <Text style={[styles.statusText, { color: statusInfo.color }]}>
                  {statusInfo.text}
                </Text>
              </View>
            </View>

            <View style={styles.reportDetails}>
              <Text style={styles.reportNotes} numberOfLines={2}>
                {item.notes || 'No additional notes provided'}
              </Text>
              
              <View style={styles.reportMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="document-text" size={14} color="#64748b" />
                  <Text style={styles.metaText}>Task: {item.taskId.slice(-6)}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="alert-circle" size={14} color={severityColor} />
                  <Text style={styles.metaText}>{item.severity.toUpperCase()}</Text>
                </View>
              </View>

              {item.photos && item.photos.length > 0 && (
                <View style={styles.metaItem}>
                  <Ionicons name="camera" size={14} color="#64748b" />
                  <Text style={styles.metaText}>{item.photos.length} photo(s)</Text>
                </View>
              )}

              {item.syncAttempts > 0 && (
                <View style={styles.syncAttempts}>
                  <Ionicons name="refresh" size={12} color="#f59e0b" />
                  <Text style={styles.syncAttemptsText}>
                    {item.syncAttempts} sync attempt(s)
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.reportFooter}>
              <View style={styles.dateContainer}>
                <Ionicons name="time" size={14} color="#94a3b8" />
                <Text style={styles.reportDate}>
                  {format(new Date(item.createdAt), 'MMM dd, HH:mm')}
                </Text>
              </View>
              
              <View style={styles.actionButtons}>
                {!item.synced && isOnline && item.syncAttempts < 3 && (
                  <TouchableOpacity 
                    style={styles.syncButton}
                    onPress={() => handleSyncReport(item.id)}
                    disabled={syncing}
                  >
                    <Ionicons name="cloud-upload" size={16} color="#3b82f6" />
                    <Text style={styles.syncButtonText}>Sync</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteReport(item.id)}
                >
                  <Ionicons name="trash" size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </Card>
      </Animated.View>
    );
  };

  if (syncing && queuedReports.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Loading queue...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#3b82f6', '#2563eb']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Sync Status</Text>
            <Text style={styles.title}>Upload Queue</Text>
          </View>
          <View style={styles.connectionStatus}>
            <View style={[styles.connectionDot, { backgroundColor: isOnline ? '#10b981' : '#ef4444' }]} />
            <Text style={styles.connectionText}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{queueStats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{queueStats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{queueStats.synced}</Text>
            <Text style={styles.statLabel}>Synced</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{queueStats.failed}</Text>
            <Text style={styles.statLabel}>Failed</Text>
          </View>
        </View>
      </LinearGradient>

      {queueStats.pending > 0 && isOnline && (
        <View style={styles.actionBar}>
          <Button
            title={syncing ? "Syncing..." : `Sync ${queueStats.pending} Reports`}
            onPress={handleSyncAll}
            variant="primary"
            loading={syncing}
            disabled={syncing}
            style={styles.syncAllButton}
          />
        </View>
      )}

      <FlatList
        data={queuedReports}
        renderItem={renderReport}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#3b82f6"
            colors={['#3b82f6']}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="cloud-done" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>No reports in queue</Text>
            <Text style={styles.emptySubtext}>
              {isOnline 
                ? "All reports have been synced successfully" 
                : "Reports will appear here when created offline"
              }
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  headerGradient: {
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 8,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
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
  },
  actionBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  syncAllButton: {
    marginBottom: 0,
  },
  list: {
    padding: 16,
  },
  reportCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardGradient: {
    padding: 16,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  severityIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
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
    letterSpacing: 0.3,
  },
  reportDetails: {
    marginBottom: 16,
  },
  reportNotes: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  reportMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  syncAttempts: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  syncAttemptsText: {
    fontSize: 11,
    color: '#f59e0b',
    fontWeight: '600',
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reportDate: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#dbeafe',
    borderRadius: 8,
  },
  syncButtonText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '700',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
    lineHeight: 20,
  },
});

export default OfflineQueueScreen;
