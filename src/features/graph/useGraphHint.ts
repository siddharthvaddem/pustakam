import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SETTING_DEFAULTS, setSetting, settingQuery } from '../settings/repository';

const HINT_MS = 4000;

// Shown until the first gesture ever, and hidden after a few seconds each visit.
export function useGraphHint(active: boolean) {
  const { data, updatedAt } = useLiveQuery(settingQuery('graphHint'));
  // Waits for the stored value so a returning user never sees it flash.
  const unseen =
    updatedAt !== undefined && (data[0]?.value ?? SETTING_DEFAULTS.graphHint) === 'unseen';
  const [hidden, setHidden] = useState(false);
  const saved = useRef(false);
  const show = active && unseen && !hidden;

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => setHidden(true), HINT_MS);
    return () => clearTimeout(timer);
  }, [show]);

  const interact = useCallback(() => {
    setHidden(true);
    if (!unseen || saved.current) return;
    saved.current = true;
    setSetting('graphHint', 'seen');
  }, [unseen]);

  return { show, interact };
}
