import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { COLORS, SIZES } from '../utils/constants';

interface LockedImageViewerProps {
  photos: string[];
  initialIndex: number;
  onPageChange?: (index: number) => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

function PhotoPage({ uri }: { uri: string }) {
  const [scale, setScale] = useState(1);
  const lastScale = useRef(1);
  const tapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDoubleTap = () => {
    if (tapTimeout.current) {
      clearTimeout(tapTimeout.current);
      tapTimeout.current = null;
      const newScale = scale > 1 ? 1 : 2;
      setScale(newScale);
      lastScale.current = newScale;
    } else {
      tapTimeout.current = setTimeout(() => {
        tapTimeout.current = null;
      }, 300);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleDoubleTap}>
      <View style={styles.page}>
        <Image
          source={uri}
          style={[styles.image, { transform: [{ scale }] }]}
          contentFit="contain"
          recyclingKey={uri}
          cachePolicy="memory-disk"
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

export function LockedImageViewer({ photos, initialIndex, onPageChange }: LockedImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const flatListRef = useRef<FlatList<string>>(null);

  const handleViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        const idx = viewableItems[0].index;
        setCurrentIndex(idx);
        onPageChange?.(idx);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={photos}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={({ item }) => <PhotoPage uri={item} />}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
        overScrollMode="never"
        decelerationRate="fast"
      />

      <View style={styles.dotsContainer} pointerEvents="none">
        {photos.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor:
                  index === currentIndex
                    ? 'rgba(255,255,255,0.9)'
                    : 'rgba(255,255,255,0.35)',
                width: index === currentIndex ? SIZES.pageIndicatorSize + 4 : SIZES.pageIndicatorSize,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  page: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: SIZES.pageIndicatorSize,
    borderRadius: SIZES.pageIndicatorSize / 2,
  },
});
