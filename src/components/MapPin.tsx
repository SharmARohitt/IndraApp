import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface MapPinProps {
  status: 'assigned' | 'in_progress' | 'completed' | 'urgent';
  size?: number;
}

export const MapPin: React.FC<MapPinProps> = ({ status, size = 40 }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Stop any existing animations
    scaleAnim.stopAnimation();
    pulseAnim.stopAnimation();
    rotationAnim.stopAnimation();

    if (status === 'urgent') {
      // Intense pulse animation for urgent tasks
      const scaleAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
      
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ])
      );

      scaleAnimation.start();
      pulseAnimation.start();
    } else if (status === 'in_progress') {
      // Gentle rotation for in-progress tasks
      const rotationAnimation = Animated.loop(
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      );
      rotationAnimation.start();
    } else {
      // Reset to default state
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotationAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [status]);

  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [1, 2],
    outputRange: [0.8, 0],
  });

  const getGradientColors = () => {
    switch (status) {
      case 'urgent':
        return ['#dc2626', '#991b1b'];
      case 'in_progress':
        return ['#f59e0b', '#d97706'];
      case 'completed':
        return ['#10b981', '#059669'];
      default:
        return ['#3b82f6', '#2563eb'];
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'urgent':
        return 'alert';
      case 'in_progress':
        return 'time';
      case 'completed':
        return 'checkmark';
      default:
        return 'location';
    }
  };

  const gradientColors = getGradientColors();
  const iconName = getIcon();

  return (
    <View style={styles.container}>
      {/* Pulse Ring for Urgent Tasks */}
      {status === 'urgent' && (
        <Animated.View 
          style={[
            styles.pulseRing, 
            { 
              width: size * 2, 
              height: size * 2,
              transform: [{ scale: pulseAnim }],
              opacity: pulseOpacity,
            }
          ]}
        >
          <LinearGradient
            colors={[gradientColors[0] + '40', gradientColors[1] + '20'] as const}
            style={[styles.pulseGradient, { width: size * 2, height: size * 2, borderRadius: size }]}
          />
        </Animated.View>
      )}

      {/* Main Pin */}
      <Animated.View 
        style={[
          {
            transform: [
              { scale: scaleAnim },
              { rotate: rotation }
            ],
          }
        ]}
      >
        <View style={[styles.pinShadow, { width: size + 4, height: size + 4, borderRadius: (size + 4) / 2 }]} />
        <LinearGradient
          colors={gradientColors as const}
          style={[styles.pin, { width: size, height: size, borderRadius: size / 2 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.iconContainer}>
            <Ionicons name={iconName as any} size={size * 0.4} color="#fff" />
          </View>
          
          {/* Shine Effect */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.4)', 'transparent'] as const}
            style={styles.shine}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </LinearGradient>

        {/* Status Ring */}
        <View style={[styles.statusRing, { width: size + 8, height: size + 8, borderRadius: (size + 8) / 2 }]} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    borderRadius: 50,
  },
  pulseGradient: {
    borderRadius: 50,
  },
  pinShadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    top: 2,
  },
  pin: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    overflow: 'hidden',
  },
  iconContainer: {
    zIndex: 2,
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 50,
  },
  statusRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    top: -4,
    left: -4,
  },
});
