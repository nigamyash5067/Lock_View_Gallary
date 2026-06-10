import * as MediaLibrary from 'expo-media-library';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking } from 'react-native';
import {
  fetchPhotos,
  getMediaPermission,
  requestMediaPermission,
} from '../utils/mediaHelpers';

interface UseMediaLibraryResult {
  photos: MediaLibrary.Asset[];
  loading: boolean;
  loadingMore: boolean;
  hasPermission: boolean | null;
  accessPrivileges: string | null;
  canAskAgain: boolean;
  hasNextPage: boolean;
  error: string | null;
  requestPermission: () => Promise<void>;
  openAppSettings: () => void;
  loadMore: () => Promise<void>;
}

export function useMediaLibrary(): UseMediaLibraryResult {
  const [photos, setPhotos] = useState<MediaLibrary.Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [accessPrivileges, setAccessPrivileges] = useState<string | null>(null);
  const [canAskAgain, setCanAskAgain] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endCursor = useRef<string | undefined>(undefined);

  const loadPhotos = useCallback(async () => {
    try {
      const result = await fetchPhotos(undefined, 50);
      setPhotos(result.assets);
      endCursor.current = result.endCursor;
      setHasNextPage(result.hasNextPage);
      setError(null);
      console.log('[LockView] loadPhotos: loaded', result.assets.length, 'photos');
    } catch (e: any) {
      console.log('[LockView] loadPhotos error:', e?.message);
      setPhotos([]);
      setError(e?.message ?? 'Failed to load photos');
    }
  }, []);

  const requestPermission = useCallback(async () => {
    console.log('[LockView] requestPermission tapped');
    setLoading(true);
    setError(null);
    try {
      // Always attempt the native request first. requestPermissionsAsync is
      // safe even when the OS can't show a dialog (it returns the current
      // status), and some Android OEM skins wrongly report canAskAgain=false
      // on a fresh install — bouncing to Settings before ever asking would
      // mean the real system prompt never appears. Settings is only a fallback
      // *after* the request comes back not-usable AND non-askable.
      const res = await requestMediaPermission();
      setAccessPrivileges(res.accessPrivileges);
      setCanAskAgain(res.canAskAgain);
      const usable = res.granted || res.limited;
      setHasPermission(usable);

      if (!usable) {
        console.log('[LockView] requestPermission: not usable, canAskAgain =', res.canAskAgain);
        if (!res.canAskAgain) {
          await Linking.openSettings();
        }
        return;
      }

      await loadPhotos();
    } catch (e: any) {
      console.log('[LockView] requestPermission error:', e?.message);
      setError(e?.message ?? 'Permission request failed');
    } finally {
      setLoading(false);
    }
  }, [loadPhotos]);

  const openAppSettings = useCallback(() => {
    console.log('[LockView] openAppSettings tapped');
    Linking.openSettings();
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasNextPage || !endCursor.current) return;
    setLoadingMore(true);
    try {
      const result = await fetchPhotos(endCursor.current, 50);
      setPhotos((prev) => [...prev, ...result.assets]);
      endCursor.current = result.endCursor;
      setHasNextPage(result.hasNextPage);
    } catch (e: any) {
      console.log('[LockView] loadMore error:', e?.message);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasNextPage]);

  useEffect(() => {
    (async () => {
      console.log('[LockView] initial permission check');
      setLoading(true);
      try {
        const current = await getMediaPermission();
        setAccessPrivileges(current.accessPrivileges);
        setCanAskAgain(current.canAskAgain);
        if (current.granted || current.limited) {
          setHasPermission(true);
          await loadPhotos();
        } else {
          setHasPermission(false);
        }
      } catch (e: any) {
        console.log('[LockView] initial check error:', e?.message);
        setHasPermission(false);
        setError(e?.message ?? 'Permission check failed');
      } finally {
        setLoading(false);
      }
    })();
  }, [loadPhotos]);

  return {
    photos,
    loading,
    loadingMore,
    hasPermission,
    accessPrivileges,
    canAskAgain,
    hasNextPage,
    error,
    requestPermission,
    openAppSettings,
    loadMore,
  };
}
