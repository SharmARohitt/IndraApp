import * as Location from 'expo-location';
import { Linking, Platform } from 'react-native';

class LocationService {
  private static instance: LocationService;

  private constructor() {}

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Failed to request location permissions:', error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<Location.LocationObject | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('Location permission not granted');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return location;
    } catch (error) {
      console.error('Failed to get current location:', error);
      return null;
    }
  }

  async openNavigation(lat: number, lng: number, label?: string): Promise<void> {
    const destination = `${lat},${lng}`;
    const labelParam = label ? `&label=${encodeURIComponent(label)}` : '';

    const urls = {
      ios: `maps:0,0?q=${destination}${labelParam}`,
      android: `geo:0,0?q=${destination}${labelParam}`,
      googleMaps: `https://www.google.com/maps/dir/?api=1&destination=${destination}`,
      waze: `https://waze.com/ul?ll=${destination}&navigate=yes`,
    };

    try {
      // Try platform-specific maps first
      const platformUrl = Platform.OS === 'ios' ? urls.ios : urls.android;
      const canOpen = await Linking.canOpenURL(platformUrl);

      if (canOpen) {
        await Linking.openURL(platformUrl);
      } else {
        // Fallback to Google Maps web
        await Linking.openURL(urls.googleMaps);
      }
    } catch (error) {
      console.error('Failed to open navigation:', error);
      // Last resort: open in browser
      await Linking.openURL(urls.googleMaps);
    }
  }

  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    // Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export default LocationService.getInstance();
