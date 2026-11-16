import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { SETTING_DEFAULTS, type SettingKey, settingQuery } from './repository';

export function useSetting(key: SettingKey): string {
  const { data } = useLiveQuery(settingQuery(key), [key]);
  return data[0]?.value ?? SETTING_DEFAULTS[key];
}
