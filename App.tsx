import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase } from './src/services/database';
import { registerForPushNotifications } from './src/services/notifications';
import { useAuth } from './src/hooks/useAuth';

function AppContent() {
  const { user } = useAuth();

  useEffect(() => {
    initDatabase();
  }, []);

  useEffect(() => {
    if (user) {
      registerForPushNotifications(user.id);
    }
  }, [user]);

  return <AppNavigator />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
