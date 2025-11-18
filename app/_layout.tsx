import '../global.css'; // NativeWind styles
import { Slot } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// 1. Create the QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry failed requests 1 time before failing
      retry: 1,
      // Data is considered fresh for 1 minute
      staleTime: 1000 * 60, 
    },
  },
});

export default function RootLayout() {
  return (
    // 2. Wrap the app in the Provider
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        {/* Slot renders the current route (e.g., index.tsx) */}
        <Slot />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}