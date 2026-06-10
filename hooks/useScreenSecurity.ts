import { useEffect } from 'react';
import * as ScreenCapture from 'expo-screen-capture';

export function useScreenSecurity(enabled: boolean) {
  useEffect(() => {
    if (enabled) {
      ScreenCapture.preventScreenCaptureAsync();
    }
    return () => {
      ScreenCapture.allowScreenCaptureAsync();
    };
  }, [enabled]);
}
