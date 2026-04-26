import { useEffect, useState, useCallback } from 'react';
import { Settings } from '../../src/store/types';
import { getSettings, patchSettings, onSettingsChanged } from '../../src/store/storage';

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  useEffect(() => {
    getSettings().then(setSettings);
    return onSettingsChanged(setSettings);
  }, []);
  const patch = useCallback(async (p: Partial<Settings>) => {
    const next = await patchSettings(p);
    setSettings(next);
  }, []);
  return { settings, patch };
}
