import { eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { settings } from '../../db/schema';
import { BOOST_DEFAULT } from '../keyterms/boost';

// Values are saved as text.
export const SETTING_DEFAULTS = {
  keytermBoost: String(BOOST_DEFAULT),
  theme: 'system', // 'system' | 'light' | 'dark'
  accent: 'amber', // see ACCENTS in theme.ts
  haptics: 'on', // 'on' | 'off'
};

export type SettingKey = keyof typeof SETTING_DEFAULTS;

export function settingQuery(key: SettingKey) {
  return db.select({ value: settings.value }).from(settings).where(eq(settings.key, key));
}

export async function setSetting(key: SettingKey, value: string) {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } });
}
