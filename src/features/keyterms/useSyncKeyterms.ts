import { useEffect } from 'react';
import MoonshineStt from '../../../modules/moonshine-stt';
import { useSetting } from '../settings/useSetting';
import { useKeyterms } from './useKeyterms';

// Mount once, on a screen that stays alive (the record screen).
export function useSyncKeyterms() {
  const rows = useKeyterms();
  const boost = Number(useSetting('keytermBoost'));

  // Joined so the effect only fires when the list really changes.
  const termsKey = rows.map((row) => row.term).join('\n');

  useEffect(() => {
    MoonshineStt.setKeyterms(termsKey ? termsKey.split('\n') : []).catch(() => {});
  }, [termsKey]);

  useEffect(() => {
    MoonshineStt.setKeytermBoost(boost).catch(() => {});
  }, [boost]);
}
