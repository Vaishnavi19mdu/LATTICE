import { useEffect, useRef, useState, useCallback } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase/firebase';

export type SettingsSaveStatus = 'loading' | 'ready' | 'saving' | 'saved' | 'error';

/**
 * Loads and saves a single named settings object under
 * userSettings/{uid} in Firestore — private to the signed-in account.
 *
 * Firestore doc shape: { [settingsKey]: T, updatedAt: Timestamp }
 * Multiple settings keys (e.g. 'buildingOperator', 'networkAdministrator')
 * can live on the same doc without clobbering each other (merge: true).
 */
export function useAccountSettings<T extends Record<string, any>>(
  uid: string | null | undefined,
  settingsKey: string,
  defaults: T
) {
  const [data, setData] = useState<T>(defaults);
  const [status, setStatus] = useState<SettingsSaveStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const loadedForUid = useRef<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setStatus('ready');
      return;
    }
    if (loadedForUid.current === uid) return; // already loaded this session

    let cancelled = false;
    setStatus('loading');
    setError(null);

    (async () => {
      try {
        const ref = doc(db, 'userSettings', uid);
        const snap = await getDoc(ref);
        if (cancelled) return;

        if (snap.exists()) {
          const stored = snap.data()?.[settingsKey];
          if (stored) {
            // Merge over defaults so newly-added fields still get a value
            setData({ ...defaults, ...stored });
          }
        }
        loadedForUid.current = uid;
        setStatus('ready');
      } catch (e) {
        console.error(`Failed to load ${settingsKey} settings:`, e);
        if (!cancelled) {
          setError('Could not load your saved settings. Showing defaults.');
          setStatus('error');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, settingsKey]);

  const save = useCallback(
    async (next?: T) => {
      if (!uid) {
        setError('You need to be signed in for settings to save.');
        setStatus('error');
        return;
      }
      const toSave = next ?? data;
      setStatus('saving');
      setError(null);
      try {
        const ref = doc(db, 'userSettings', uid);
        await setDoc(ref, { [settingsKey]: toSave, updatedAt: serverTimestamp() }, { merge: true });
        if (next) setData(next);
        setStatus('saved');
        setTimeout(() => setStatus('ready'), 1800);
      } catch (e) {
        console.error(`Failed to save ${settingsKey} settings:`, e);
        setError('Save failed — check your connection and try again.');
        setStatus('error');
      }
    },
    [uid, settingsKey, data]
  );

  const update = useCallback((patch: Partial<T>) => {
    setData((prev) => ({ ...prev, ...patch }));
  }, []);

  return { data, update, setData, save, status, error };
}