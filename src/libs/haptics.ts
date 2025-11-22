import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export enum HapticType {
  LIGHT = 'light',
  MEDIUM = 'medium',
  HEAVY = 'heavy',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  SELECTION = 'selection',
}

class HapticService {
  private static instance: HapticService;
  private isEnabled: boolean = true;

  private constructor() {}

  static getInstance(): HapticService {
    if (!HapticService.instance) {
      HapticService.instance = new HapticService();
    }
    return HapticService.instance;
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  isHapticEnabled(): boolean {
    return this.isEnabled && Platform.OS !== 'web';
  }

  async impact(type: HapticType.LIGHT | HapticType.MEDIUM | HapticType.HEAVY): Promise<void> {
    if (!this.isHapticEnabled()) return;

    try {
      const impactStyle = {
        [HapticType.LIGHT]: Haptics.ImpactFeedbackStyle.Light,
        [HapticType.MEDIUM]: Haptics.ImpactFeedbackStyle.Medium,
        [HapticType.HEAVY]: Haptics.ImpactFeedbackStyle.Heavy,
      }[type];

      await Haptics.impactAsync(impactStyle);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  async notification(type: HapticType.SUCCESS | HapticType.WARNING | HapticType.ERROR): Promise<void> {
    if (!this.isHapticEnabled()) return;

    try {
      const notificationType = {
        [HapticType.SUCCESS]: Haptics.NotificationFeedbackType.Success,
        [HapticType.WARNING]: Haptics.NotificationFeedbackType.Warning,
        [HapticType.ERROR]: Haptics.NotificationFeedbackType.Error,
      }[type];

      await Haptics.notificationAsync(notificationType);
    } catch (error) {
      console.warn('Haptic notification failed:', error);
    }
  }

  async selection(): Promise<void> {
    if (!this.isHapticEnabled()) return;

    try {
      await Haptics.selectionAsync();
    } catch (error) {
      console.warn('Haptic selection failed:', error);
    }
  }

  // Convenience methods for common interactions
  async buttonPress(): Promise<void> {
    await this.impact(HapticType.LIGHT);
  }

  async toggleSwitch(): Promise<void> {
    await this.impact(HapticType.MEDIUM);
  }

  async longPress(): Promise<void> {
    await this.impact(HapticType.HEAVY);
  }

  async taskComplete(): Promise<void> {
    await this.notification(HapticType.SUCCESS);
  }

  async taskError(): Promise<void> {
    await this.notification(HapticType.ERROR);
  }

  async taskWarning(): Promise<void> {
    await this.notification(HapticType.WARNING);
  }

  async tabSelection(): Promise<void> {
    await this.selection();
  }

  async checkboxToggle(): Promise<void> {
    await this.impact(HapticType.LIGHT);
  }

  async pullToRefresh(): Promise<void> {
    await this.impact(HapticType.MEDIUM);
  }

  async swipeAction(): Promise<void> {
    await this.impact(HapticType.LIGHT);
  }

  async modalPresent(): Promise<void> {
    await this.impact(HapticType.MEDIUM);
  }

  async modalDismiss(): Promise<void> {
    await this.impact(HapticType.LIGHT);
  }
}

export const hapticService = HapticService.getInstance();

// Convenience functions for direct use
export const haptic = {
  light: () => hapticService.impact(HapticType.LIGHT),
  medium: () => hapticService.impact(HapticType.MEDIUM),
  heavy: () => hapticService.impact(HapticType.HEAVY),
  success: () => hapticService.notification(HapticType.SUCCESS),
  warning: () => hapticService.notification(HapticType.WARNING),
  error: () => hapticService.notification(HapticType.ERROR),
  selection: () => hapticService.selection(),
  
  // Common interactions
  buttonPress: () => hapticService.buttonPress(),
  toggleSwitch: () => hapticService.toggleSwitch(),
  longPress: () => hapticService.longPress(),
  taskComplete: () => hapticService.taskComplete(),
  taskError: () => hapticService.taskError(),
  taskWarning: () => hapticService.taskWarning(),
  tabSelection: () => hapticService.tabSelection(),
  checkboxToggle: () => hapticService.checkboxToggle(),
  pullToRefresh: () => hapticService.pullToRefresh(),
  swipeAction: () => hapticService.swipeAction(),
  modalPresent: () => hapticService.modalPresent(),
  modalDismiss: () => hapticService.modalDismiss(),
};

export default hapticService;