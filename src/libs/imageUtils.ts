import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

export interface ImageCompressionOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export const compressImage = async (
  uri: string,
  options: ImageCompressionOptions = {}
): Promise<string> => {
  const {
    quality = 0.8,
    maxWidth = 1920,
    maxHeight = 1080,
    format = 'jpeg',
  } = options;

  try {
    // Get image info
    const imageInfo = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width: maxWidth,
            height: maxHeight,
          },
        },
      ],
      {
        compress: quality,
        format: format === 'jpeg' ? ImageManipulator.SaveFormat.JPEG : ImageManipulator.SaveFormat.PNG,
        base64: false,
      }
    );

    return imageInfo.uri;
  } catch (error) {
    console.error('Image compression failed:', error);
    return uri; // Return original if compression fails
  }
};

export const getImageSize = async (uri: string): Promise<{ width: number; height: number }> => {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) {
      throw new Error('Image file does not exist');
    }

    // For now, return default size - in production, you'd use a library like react-native-image-size
    return { width: 1920, height: 1080 };
  } catch (error) {
    console.error('Failed to get image size:', error);
    return { width: 0, height: 0 };
  }
};

export const generateThumbnail = async (
  uri: string,
  size: number = 200
): Promise<string> => {
  try {
    const thumbnail = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width: size,
            height: size,
          },
        },
      ],
      {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: false,
      }
    );

    return thumbnail.uri;
  } catch (error) {
    console.error('Thumbnail generation failed:', error);
    return uri;
  }
};

export const createImageCache = () => {
  const cache = new Map<string, string>();
  const maxSize = 50; // Maximum number of cached images

  return {
    get: (key: string): string | undefined => cache.get(key),
    set: (key: string, value: string): void => {
      if (cache.size >= maxSize) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      cache.set(key, value);
    },
    clear: (): void => cache.clear(),
    size: (): number => cache.size,
  };
};

export const imageCache = createImageCache();

export const getCachedImage = async (
  uri: string,
  options?: ImageCompressionOptions
): Promise<string> => {
  const cacheKey = `${uri}_${JSON.stringify(options)}`;
  const cached = imageCache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  const compressed = await compressImage(uri, options);
  imageCache.set(cacheKey, compressed);
  
  return compressed;
};

export const clearImageCache = async (): Promise<void> => {
  try {
    const cacheDir = `${FileSystem.documentDirectory}images/`;
    const info = await FileSystem.getInfoAsync(cacheDir);
    
    if (info.exists) {
      await FileSystem.deleteAsync(cacheDir);
    }
    
    imageCache.clear();
    console.log('Image cache cleared successfully');
  } catch (error) {
    console.error('Failed to clear image cache:', error);
  }
};

export const getImageCacheSize = async (): Promise<number> => {
  try {
    const cacheDir = `${FileSystem.documentDirectory}images/`;
    const info = await FileSystem.getInfoAsync(cacheDir);
    
    if (!info.exists) {
      return 0;
    }

    // Calculate directory size (simplified)
    return (info as any).size || 0;
  } catch (error) {
    console.error('Failed to get cache size:', error);
    return 0;
  }
};