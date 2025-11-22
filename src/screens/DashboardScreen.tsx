import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/Card';
import { SkeletonLoader, SkeletonList } from '../components/feedback/SkeletonLoader';
import { useStore } from '../store/useStore';
import { fetchTasks } from '../api/tasks';
import { saveTasks } from '../libs/db';
import { haptic } from '../libs/haptics';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { tasks, setTasks, isOnline } = useStore();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
    enabled: isOnline,
  });

  useEffect(() => {
    if (data) {
      setTasks(data);
      saveTasks(data).catch(console.error);
    }
  }, [data]);

  // Animated Task Card Component
  const AnimatedTaskCard = ({ item, index }: { item: any; index: number }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          delay: index * 100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          delay: index * 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    const priorityColorMap = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      urgent: '#dc2626',
    } as const;
    const priorityColor: string = priorityColorMap[item.priority as keyof typeof priorityColorMap] || '#64748b';

    const priorityGradientMap = {
      low: ['#10b981', '#059669'],
      medium: ['#f59e0b', '#d97706'],
      high: ['#ef4444', '#dc2626'],
      urgent: ['#dc2626', '#991b1b'],
    } as const;
    const priorityGradient: readonly string[] = priorityGradientMap[item.priority as keyof typeof priorityGradientMap] || ['#64748b', '#475569'];

    const statusIconMap = {
      assigned: 'time-outline',
      in_progress: 'hourglass-outline',
      completed: 'checkmark-circle',
      urgent: 'alert-circle',
    } as const;
    const statusIcon: string = statusIconMap[item.status as keyof typeof statusIconMap] || 'document-outline';

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        }}
      >
        <TouchableOpacity
          onPress={() => {
            haptic.buttonPress();
            (navigation as any).navigate('TaskDetail', { taskId: item.id });
          }}
          activeOpacity={0.7}
        >
          <Card style={styles.taskCard}>
            <LinearGradient
              colors={['#ffffff', '#f8fafc']}
              style={styles.cardGradient}
            >
              <View style={styles.taskHeader}>
                <View style={styles.taskTitleContainer}>
                  <Ionicons name="business" size={20} color="#3b82f6" />
                  <Text style={styles.taskTitle} numberOfLines={1}>
                    {item.substationName}
                  </Text>
                </View>
                <LinearGradient
                  colors={priorityGradient}
                  style={styles.priorityBadge}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.priorityText}>{item.priority.toUpperCase()}</Text>
                </LinearGradient>
              </View>

              <Text style={styles.taskDescription} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.taskFooter}>
                <View style={styles.dateContainer}>
                  <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                  <Text style={styles.taskDate}>
                    {format(new Date(item.assignedAt), 'MMM dd, yyyy')}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                  <Ionicons name={statusIcon} size={14} color={getStatusColor(item.status)} />
                  <Text style={[styles.taskStatus, { color: getStatusColor(item.status) }]}>
                    {item.status.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderTask = ({ item, index }: { item: any; index: number }) => {
    return <AnimatedTaskCard item={item} index={index} />;
  };

  // Show loading skeleton while data is loading
  if (isLoading && tasks.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#3b82f6', '#2563eb']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Welcome back!</Text>
              <Text style={styles.title}>My Tasks</Text>
            </View>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <SkeletonLoader width={40} height={24} />
              <SkeletonLoader width={60} height={12} style={{ marginTop: 4 }} />
            </View>
            <View style={styles.statCard}>
              <SkeletonLoader width={40} height={24} />
              <SkeletonLoader width={60} height={12} style={{ marginTop: 4 }} />
            </View>
            <View style={styles.statCard}>
              <SkeletonLoader width={40} height={24} />
              <SkeletonLoader width={60} height={12} style={{ marginTop: 4 }} />
            </View>
          </View>
        </LinearGradient>

        <SkeletonList count={5} style={styles.list} />
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
            <Text style={styles.greeting}>Welcome back!</Text>
            <Text style={styles.title}>My Tasks</Text>
          </View>
          {!isOnline && (
            <View style={styles.offlineBadge}>
              <Ionicons name="cloud-offline" size={16} color="#fff" />
              <Text style={styles.offlineText}>Offline</Text>
            </View>
          )}
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{tasks.length}</Text>
            <Text style={styles.statLabel}>Total Tasks</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {tasks.filter(t => t.status === 'in_progress').length}
            </Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {tasks.filter(t => t.status === 'completed').length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
      </LinearGradient>

      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor="#3b82f6"
            colors={['#3b82f6']}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="clipboard-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>No tasks assigned</Text>
            <Text style={styles.emptySubtext}>New tasks will appear here</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return '#10b981';
    case 'in_progress':
      return '#f59e0b';
    case 'urgent':
      return '#dc2626';
    default:
      return '#64748b';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
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
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  offlineText: {
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
  list: {
    padding: 16,
  },
  taskCard: {
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
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  priorityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  taskDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 20,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskDate: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  taskStatus: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
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
    marginTop: 8,
  },
});

export default DashboardScreen;
