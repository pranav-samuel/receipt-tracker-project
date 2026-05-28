import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DashboardScreen from './screens/DashboardScreen';
import CaptureScreen from './screens/CaptureScreen';
import ReviewScreen from './screens/ReviewScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerStyle: { backgroundColor: '#3b82f6' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Spendle' }} />
        <Stack.Screen name="Capture" component={CaptureScreen} options={{ title: 'Scan Receipt' }} />
        <Stack.Screen name="Review" component={ReviewScreen} options={{ title: 'Review & Confirm' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
