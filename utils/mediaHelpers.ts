import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

export interface PermissionInfo {
  granted: boolean;
  limited: boolean;
  canAskAgain: boolean;
  status: string;
  accessPrivileges: string | null;
}

export async function getMediaPermission(): Promise<PermissionInfo> {
  console.log('[LockView] getMediaPermission: calling getPermissionsAsync');
  const result = await withTimeout(
    MediaLibrary.getPermissionsAsync(false, ['photo']),
    6000,
    'getPermissionsAsync'
  );
  console.log('[LockView] getMediaPermission result:', JSON.stringify(result));
  const accessPrivileges = (result as any).accessPrivileges ?? null;
  const limited = accessPrivileges === 'limited';
  return {
    granted: result.status === 'granted',
    limited,
    canAskAgain: (result as any).canAskAgain ?? true,
    status: result.status,
    accessPrivileges,
  };
}

export async function requestMediaPermission(): Promise<PermissionInfo> {
  console.log('[LockView] requestMediaPermission: calling requestPermissionsAsync');
  const result = await withTimeout(
    MediaLibrary.requestPermissionsAsync(false, ['photo']),
    30000,
    'requestPermissionsAsync'
  );
  console.log('[LockView] requestMediaPermission result:', JSON.stringify(result));
  const accessPrivileges = (result as any).accessPrivileges ?? null;
  const limited = accessPrivileges === 'limited';
  return {
    granted: result.status === 'granted',
    limited,
    canAskAgain: (result as any).canAskAgain ?? true,
    status: result.status,
    accessPrivileges,
  };
}

// On Android (esp. 14–16 with limited/"Selected photos" access) a raw
// asset.uri (file://) sometimes can't be read directly by the image loader.
// getAssetInfoAsync resolves a guaranteed-readable localUri/content:// URI.
// Cached so we only pay the native round-trip once per asset.
const _localUriCache = new Map<string, string>();

export async function resolveLocalUri(assetId: string, fallbackUri: string): Promise<string> {
  if (_localUriCache.has(assetId)) {
    return _localUriCache.get(assetId)!;
  }
  try {
    const info = await MediaLibrary.getAssetInfoAsync(assetId);
    const resolved = info.localUri ?? info.uri ?? fallbackUri;
    _localUriCache.set(assetId, resolved);
    return resolved;
  } catch (e: any) {
    console.log('[LockView] resolveLocalUri error:', e?.message);
    return fallbackUri;
  }
}

export async function fetchPhotos(
  cursor?: string,
  pageSize: number = 50
): Promise<{
  assets: MediaLibrary.Asset[];
  endCursor: string;
  hasNextPage: boolean;
}> {
  const params: MediaLibrary.AssetsOptions = {
    first: pageSize,
    sortBy: [MediaLibrary.SortBy.creationTime],
    mediaType: MediaLibrary.MediaType.photo,
  };

  if (cursor) {
    params.after = cursor;
  }

  console.log('[LockView] fetchPhotos: calling getAssetsAsync', { cursor, pageSize, platform: Platform.OS });
  const result = await withTimeout(
    MediaLibrary.getAssetsAsync(params),
    10000,
    'getAssetsAsync'
  );
  console.log('[LockView] fetchPhotos result:', {
    count: result.assets.length,
    totalCount: result.totalCount,
    hasNextPage: result.hasNextPage,
  });

  return {
    assets: result.assets,
    endCursor: result.endCursor,
    hasNextPage: result.hasNextPage,
  };
}
