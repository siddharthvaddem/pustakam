import * as Haptics from 'expo-haptics';

// Every vibration goes through here so the setting can turn them all off.
let enabled = true;

export function setHapticsEnabled(on: boolean) {
  enabled = on;
}

export const haptics = {
  impact(style = Haptics.ImpactFeedbackStyle.Light) {
    if (enabled) Haptics.impactAsync(style);
  },
  select() {
    if (enabled) Haptics.selectionAsync();
  },
  success() {
    if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },
};
