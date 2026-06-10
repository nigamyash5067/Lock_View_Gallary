import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { EmptyState } from '../components/EmptyState';
import { PhotoGrid } from '../components/PhotoGrid';
import { useSelection } from '../context/SelectionContext';
import { useMediaLibrary } from '../hooks/useMediaLibrary';
import { COLORS, RELEASE_VERSION } from '../utils/constants';
import { setPreviewPhotos } from '../utils/previewStore';

export default function HomeScreen() {
  const router = useRouter();
  const { selectedPhotos, togglePhoto, clearSelection } = useSelection();
  const {
    photos,
    loading,
    hasPermission,
    accessPrivileges,
    canAskAgain,
    error,
    requestPermission,
    openAppSettings,
    loadMore,
  } = useMediaLibrary();
  const [selectionMode, setSelectionMode] = useState(false);

  const diagnosticLine =
    `Status: ${hasPermission === null ? 'checking' : hasPermission ? 'granted' : 'denied'}` +
    (accessPrivileges ? ` · ${accessPrivileges}` : '') +
    (!canAskAgain ? ' · system-locked' : '');

  const handleLockAndShow = useCallback(() => {
    router.push('/locked-viewer');
  }, [router]);

  const handleLongPress = useCallback((uri: string) => {
    setSelectionMode(true);
    togglePhoto(uri);
  }, [togglePhoto]);

  const handlePreview = useCallback((uri: string, index: number) => {
    const allUris = photos.map((p) => p.uri);
    setPreviewPhotos(allUris, index);
    router.push('/photo-preview');
  }, [photos, router]);

  const handleCancelSelection = useCallback(() => {
    setSelectionMode(false);
    clearSelection();
  }, [clearSelection]);

  const handleSelectButtonPress = useCallback(() => {
    setSelectionMode(true);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.appBar}>
        <View>
          <Text style={styles.appTitle}>Lock View</Text>
          <Text style={styles.releaseVersion}>{RELEASE_VERSION}</Text>
        </View>
        <View style={styles.appBarRight}>
          {selectionMode ? (
            <TouchableOpacity onPress={handleCancelSelection} style={styles.appBarButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity onPress={handleSelectButtonPress} style={styles.appBarButton}>
                <Text style={styles.selectText}>Select</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/settings')} style={styles.settingsButton}>
                <Text style={styles.settingsIcon}>⚙️</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {selectionMode && (
        <View style={styles.selectionBar}>
          <Text style={styles.selectionText}>
            {selectedPhotos.length > 0
              ? `${selectedPhotos.length} photo${selectedPhotos.length !== 1 ? 's' : ''} selected`
              : 'Tap to select photos'}
          </Text>
          {selectedPhotos.length > 0 && (
            <TouchableOpacity onPress={clearSelection}>
              <Text style={styles.clearAll}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.content}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={COLORS.primary} size="large" />
          </View>
        ) : hasPermission === false ? (
          <EmptyState
            title="Photo Access Required"
            subtitle={
              !canAskAgain
                ? "Android has blocked the permission prompt. Tap below to grant access in Settings."
                : "LockView needs access to your photos to let you select which ones to show."
            }
            action={
              <View style={{ gap: 12, alignItems: 'center' }}>
                <TouchableOpacity
                  style={styles.permissionButton}
                  onPress={canAskAgain ? requestPermission : openAppSettings}
                >
                  <Text style={styles.permissionButtonText}>
                    {canAskAgain ? 'Grant Permission' : 'Open App Settings'}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.diagnostic}>{diagnosticLine}</Text>
              </View>
            }
          />
        ) : photos.length === 0 ? (
          <EmptyState
            title="No Photos Found"
            subtitle={
              accessPrivileges === 'limited'
                ? "You granted 'Selected photos' but none were selected, or LockView can't read them. Open Settings and switch to 'Allow all'."
                : error
                  ? `Error: ${error}`
                  : "Your gallery appears empty. If you have photos, open Settings and ensure 'All photos' is allowed."
            }
            action={
              <View style={{ gap: 12, alignItems: 'center' }}>
                <TouchableOpacity style={styles.permissionButton} onPress={openAppSettings}>
                  <Text style={styles.permissionButtonText}>Open App Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={requestPermission}>
                  <Text style={{ color: COLORS.primary, fontSize: 14, fontWeight: '600' }}>
                    Retry
                  </Text>
                </TouchableOpacity>
                <Text style={styles.diagnostic}>{diagnosticLine}</Text>
              </View>
            }
          />
        ) : (
          <PhotoGrid
            photos={photos}
            selectedUris={selectedPhotos}
            selectionMode={selectionMode}
            onToggle={togglePhoto}
            onPreview={handlePreview}
            onLongPress={handleLongPress}
            onLoadMore={loadMore}
          />
        )}
      </View>

      {selectionMode && selectedPhotos.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={handleLockAndShow} activeOpacity={0.85}>
          <Text style={styles.fabText}>🔒 Lock & Show ({selectedPhotos.length})</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: COLORS.surface,
  },
  appTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
  },
  appBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appBarButton: {
    padding: 8,
  },
  selectText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  settingsButton: {
    padding: 8,
  },
  releaseVersion: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '600',
    marginTop: -2,
    letterSpacing: 0.5,
  },
  settingsIcon: {
    fontSize: 22,
  },
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.surfaceLight,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
  },
  selectionText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  clearAll: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  permissionButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  diagnostic: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    left: 32,
    right: 32,
    backgroundColor: COLORS.primary,
    borderRadius: 32,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
