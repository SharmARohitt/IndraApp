import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useOfflineSync } from '../hooks/useOfflineSync';

const OfflineQueueScreen = () => {
  const { queuedReports, unsyncedCount, forceSyncReport, manualSync, isOnline } =
    useOfflineSync();

  const handleSyncReport = async (reportId: string) => {
    if (!isOnline) {
      Alert.alert('Offline', 'Cannot sync while offline');
      return;
    }

    const success = await forceSyncReport(reportId);
    if (success) {
      Alert.alert('Success', 'Report synced successfully');
    } else {
      Alert.alert('Error', 'Failed to sync report');
    }
  };

  const handleSyncAll = async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Cannot sync while offline');
      return;
    }

    await manualSync();
    Alert.alert('Sync Complete', 'All reports have been synced');
  };

  const renderReport = ({ item }: { item: any }) => (
    <Card style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <Text style={styles.reportTitle}>Report #{item.id.slice(-6)}</Text>
        {item.synced ? (
          <View style={styles.syncedBadge}>
            <Text style={styles.syncedText}>✓ Synced</Text>
          </View>
        ) : (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>Pending</Text>
          </View>
        )}
      </View>

      <Text style={styles.reportNotes} numberOfLines={2}>
        {item.notes || 'No notes'}
      </Text>

      <View style={styles.reportFooter}>
        <Text style={styles.reportDate}>
          {format(new Date(item.createdAt), 'MMM dd, HH:mm')}
        </Text>
        {!item.synced && isOnline && (
          <TouchableOpacity onPress={() => handleSyncReport(item.id)}>
            <Text style={styles.syncButton}>Sync Now</Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Upload Queue</Text>
        {unsyncedCount > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{unsyncedCount}</Text>
          </View>
        )}
      </View>

      {unsyncedCount > 0 && isOnline && (
        <Button
          title="Sync All Reports"
          onPress={handleSyncAll}
          variant="primary"
          style={styles.syncAllButton}
        />
      )}

      <FlatList
        data={queuedReports}
        renderItem={renderReport}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No queued reports</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  countBadge: {
    backgroundColor: '#ef4444',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  syncAllButton: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  list: {
    padding: 16,
  },
  reportCard: {
    marginBottom: 12,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  syncedBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  syncedText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  pendingText: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: '600',
  },
  reportNotes: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  syncButton: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
  },
});

export default OfflineQueueScreen;
