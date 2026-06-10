import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { COLORS, SIZES } from '../utils/constants';
import { getPreviewPhotos } from '../utils/previewStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

function PhotoPage({ uri }: { uri: string }) {
  const [scale, setScale] = useState(1);
  const lastTap = { time: 0 };

  const handleTap = () => {
    const now = Date.now();
    if (now - lastTap.time < 300) {
      setScale((s) => (s > 1 ? 1 : 2));
    }
    lastTap.time = now;
  };

  return (
    <TouchableOpacity
      style={styles.page}
      onPress={handleTap}
      activeOpacity={1}
    >
      <Image
        source={uri}
        style={[styles.image, { transform: [{ scale }] }]}
        contentFit="contain"
      />
    </TouchableOpacity>
  );
}

export default function PhotoPreviewScreen() {
  const router = useRouter();
  const { photos, initialIndex } = getPreviewPhotos();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handleViewableItemsChanged = ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <FlatList
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
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        bounces={false}
        overScrollMode="never"
        decelerationRate="fast"
      />

      {/* Top bar */}
      <View style={styles.topBar} pointerEvents="box-none">
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.counter}>
          <Text style={styles.counterText}>
            {currentIndex + 1} / {photos.length}
          </Text>
        </View>
        <View style={{ width: SIZES.lockIconSize }} />
      </View>

      {/* Page dots */}
      {photos.length > 1 && (
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
                  width:
                    index === currentIndex
                      ? SIZES.pageIndicatorSize + 4
                      : SIZES.pageIndicatorSize,
                },
              ]}
            />
          ))}
        </View>
      )}
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.black,
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backButton: {
    width: SIZES.lockIconSize,
    height: SIZES.lockIconSize,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
  },
  backText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  counter: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  counterText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '600',
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
