import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

interface MapPinProps {
  status: 'assigned' | 'in_progress' | 'completed' | 'urgent';
  size?: number;
}

export const MapPin: React.FC<MapPinProps> = ({ status, size = 40 }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (status === 'urgent') {
      // Pulse animation for urgent tasks
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        false
      );
      
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        false
      );
    } else {
      scale.value = withTiming(1);
      opacity.value = withTiming(1);
    }
  }, [status]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getColor = () => {
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
    <Animated.View style={[animatedStyle]}>
      <View
        style={[
          styles.pin,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: getColor(),
          },
        ]}
      >
        <View style={styles.innerDot} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  pin: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  innerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
});
