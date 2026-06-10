import * as MediaLibrary from 'expo-media-library';
import React, { useCallback } from 'react';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';
import { SIZES } from '../utils/constants';
import { PhotoTile } from './PhotoTile';

interface PhotoGridProps {
  photos: MediaLibrary.Asset[];
  selectedUris: string[];
  selectionMode: boolean;
  onToggle: (uri: string) => void;
  onPreview: (uri: string, index: number) => void;
  onLongPress: (uri: string) => void;
  onLoadMore: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const TILE_SIZE = Math.floor(
  (SCREEN_WIDTH - SIZES.thumbnailGap * (SIZES.thumbnailColumns - 1)) / SIZES.thumbnailColumns
);

export function PhotoGrid({ photos, selectedUris, selectionMode, onToggle, onPreview, onLongPress, onLoadMore }: PhotoGridProps) {
  const renderItem = useCallback(
    ({ item, index }: { item: MediaLibrary.Asset; index: number }) => (
      <View
        style={[
          styles.tileWrapper,
          (index + 1) % SIZES.thumbnailColumns !== 0 && { marginRight: SIZES.thumbnailGap },
        ]}
      >
        <PhotoTile
          uri={item.uri}
          isSelected={selectedUris.includes(item.uri)}
          selectionMode={selectionMode}
          onToggle={() => onToggle(item.uri)}
          onPreview={() => onPreview(item.uri, index)}
          onLongPress={() => onLongPress(item.uri)}
          size={TILE_SIZE}
        />
      </View>
    ),
    [selectedUris, selectionMode, onToggle, onPreview, onLongPress]
  );

  const keyExtractor = useCallback((item: MediaLibrary.Asset) => item.id, []);

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: TILE_SIZE + SIZES.thumbnailGap,
      offset: (TILE_SIZE + SIZES.thumbnailGap) * Math.floor(index / SIZES.thumbnailColumns),
      index,
    }),
    []
  );

  return (
    <FlatList
      data={photos}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={SIZES.thumbnailColumns}
      getItemLayout={getItemLayout}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews
      initialNumToRender={18}
      maxToRenderPerBatch={12}
      windowSize={10}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: 100,
    gap: SIZES.thumbnailGap,
  },
  tileWrapper: {
    // gap is handled inline
  },
});
