import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SelectionProvider } from '../context/SelectionContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SelectionProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0F0F0F' },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="pattern-setup" />
          <Stack.Screen
            name="pattern-lock"
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen name="home" />
          <Stack.Screen
            name="locked-viewer"
            options={{
              gestureEnabled: false,
            }}
          />
          <Stack.Screen name="settings" />
          <Stack.Screen name="security-question" />
          <Stack.Screen name="photo-preview" />
        </Stack>
      </SelectionProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
