import React, { createContext, useCallback, useContext, useState } from 'react';

interface SelectionContextType {
  selectedPhotos: string[];
  addPhoto: (uri: string) => void;
  removePhoto: (uri: string) => void;
  togglePhoto: (uri: string) => void;
  clearSelection: () => void;
  isSelected: (uri: string) => boolean;
}

const SelectionContext = createContext<SelectionContextType | null>(null);

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  const addPhoto = useCallback((uri: string) => {
    setSelectedPhotos((prev) => (prev.includes(uri) ? prev : [...prev, uri]));
  }, []);

  const removePhoto = useCallback((uri: string) => {
    setSelectedPhotos((prev) => prev.filter((p) => p !== uri));
  }, []);

  const togglePhoto = useCallback((uri: string) => {
    setSelectedPhotos((prev) =>
      prev.includes(uri) ? prev.filter((p) => p !== uri) : [...prev, uri]
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPhotos([]);
  }, []);

  const isSelected = useCallback(
    (uri: string) => selectedPhotos.includes(uri),
    [selectedPhotos]
  );

  return (
    <SelectionContext.Provider
      value={{ selectedPhotos, addPhoto, removePhoto, togglePhoto, clearSelection, isSelected }}
    >
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection(): SelectionContextType {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error('useSelection must be used within SelectionProvider');
  return ctx;
}
