import { Platform } from 'react-native';

// Simple fallback for animations when Reanimated has issues
export const createAnimationFallback = () => {
  const isWeb = Platform.OS === 'web';
  
  return {
    // Simple animated value fallback
    useSharedValue: (initialValue: number) => {
      if (isWeb) {
        return { value: initialValue };
      }
      try {
        const { useSharedValue } = require('react-native-reanimated');
        return useSharedValue(initialValue);
      } catch (error) {
        console.warn('Reanimated not available, using fallback');
        return { value: initialValue };
      }
    },
    
    // Simple animated style fallback
    useAnimatedStyle: (styleFunction: () => any) => {
      if (isWeb) {
        return {};
      }
      try {
        const { useAnimatedStyle } = require('react-native-reanimated');
        return useAnimatedStyle(styleFunction);
      } catch (error) {
        console.warn('Reanimated not available, using fallback');
        return {};
      }
    },
    
    // Simple timing fallback
    withTiming: (toValue: number, config?: any) => {
      try {
        const { withTiming } = require('react-native-reanimated');
        return withTiming(toValue, config);
      } catch (error) {
        return toValue;
      }
    },
    
    // Simple repeat fallback
    withRepeat: (animation: any, numberOfReps?: number, reverse?: boolean) => {
      try {
        const { withRepeat } = require('react-native-reanimated');
        return withRepeat(animation, numberOfReps, reverse);
      } catch (error) {
        return animation;
      }
    },
    
    // Simple sequence fallback
    withSequence: (...animations: any[]) => {
      try {
        const { withSequence } = require('react-native-reanimated');
        return withSequence(...animations);
      } catch (error) {
        return animations[0];
      }
    },
    
    // Simple interpolate fallback
    interpolate: (value: number, inputRange: number[], outputRange: number[]) => {
      try {
        const { interpolate } = require('react-native-reanimated');
        return interpolate(value, inputRange, outputRange);
      } catch (error) {
        // Simple linear interpolation fallback
        const ratio = (value - inputRange[0]) / (inputRange[1] - inputRange[0]);
        return outputRange[0] + ratio * (outputRange[1] - outputRange[0]);
      }
    }
  };
};

export const animationFallback = createAnimationFallback();