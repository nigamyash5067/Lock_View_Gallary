// Simple module-level store to pass photo list + initial index to preview screen
// without stuffing hundreds of URIs into route params.

let _photos: string[] = [];
let _initialIndex: number = 0;

export function setPreviewPhotos(photos: string[], initialIndex: number) {
  _photos = photos;
  _initialIndex = initialIndex;
}

export function getPreviewPhotos(): { photos: string[]; initialIndex: number } {
  return { photos: _photos, initialIndex: _initialIndex };
}
