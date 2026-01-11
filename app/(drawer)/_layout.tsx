import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer screenOptions={{ 
        drawerPosition: 'right', // Moves menu to the right
        headerShown: false,      // We use our custom sticky header
      }}>
        <Drawer.Screen 
          name="(tabs)" 
          options={{ drawerLabel: 'Main App' }} 
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}