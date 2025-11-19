import '../global.css'; // NativeWind styles
import { Slot } from 'expo-router';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { socket } from '../src/lib/socket';

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

function GlobalSocketListener() {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('[Global] 🚀 Setting up socket listener');

    function onConnect() {
      console.log('[Global] ✅ Socket connected to BFF');
      queryClient.invalidateQueries(); // Invalidate everything on reconnect to ensure freshness
    }

    function onDisconnect() {
      console.log('[Global] ❌ Socket disconnected from BFF');
    }

    function onTaskUpdate(data: any) {
      console.log('========================================');
      console.log('[Global] 🔔 Task update received!');
      console.log('[Global] Event data:', JSON.stringify(data, null, 2));
      console.log('========================================');

      // 1. Always invalidate tasks list
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      console.log('[Global] ✅ Invalidated tasks queries');

      // 2. If we have member update info, REFETCH that member's queries immediately
      if (data.memberUpdate) {
        const { memberId, pointsTotal } = data.memberUpdate;

        console.log(`[Global] 🔄 Member update detected!`);
        console.log(`[Global] - Member ID: ${memberId}`);
        console.log(`[Global] - New Points: ${pointsTotal}`);
        console.log(`[Global] - Triggering refetch for query key: ['member', '${memberId}']`);

        // Refetch the specific member query immediately to update the UI
        const refetchPromise1 = queryClient.refetchQueries({ queryKey: ['member', memberId] });
        const refetchPromise2 = queryClient.refetchQueries({ queryKey: ['member'] });

        Promise.all([refetchPromise1, refetchPromise2]).then(() => {
          console.log('[Global] ✅ Member queries refetch completed!');
        }).catch((err) => {
          console.error('[Global] ❌ Error refetching member queries:', err);
        });
      } else {
        console.log('[Global] ⚠️ No memberUpdate in payload, only invalidating task queries');
      }
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('task_updated', onTaskUpdate);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('task_updated', onTaskUpdate);
    };
  }, [queryClient]);

  return null;
}

export default function RootLayout() {
  return (
    // 2. Wrap the app in the Provider
    <QueryClientProvider client={queryClient}>
      <GlobalSocketListener />
      <SafeAreaProvider>
        {/* Slot renders the current route (e.g., index.tsx) */}
        <Slot />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}