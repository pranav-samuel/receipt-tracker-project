import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../theme';

import DashboardScreen from '../screens/DashboardScreen';
import CaptureScreen from '../screens/CaptureScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

// gold scan button
function ScanIcon() {
  return (
    <View style={{
      width: 50,
      height: 50,
      borderRadius: 16,
      backgroundColor: C.gold,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
      shadowColor: C.gold,
      shadowOpacity: 0.35,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 4 },
      elevation: 8,
    }}>
      <Ionicons name="scan-outline" size={22} color={C.goldText} />
    </View>
  );
}

// navigator with three main tabs: home, profile, and scan
export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: C.surface,
          borderTopWidth: 1,
          borderTopColor: C.border,
          height: 80,
          paddingBottom: 16,
          paddingTop: 10,
        },
        tabBarActiveTintColor: C.gold,
        tabBarInactiveTintColor: C.muted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          letterSpacing: 0.2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Scan"
        component={CaptureScreen}
        options={{
          tabBarIcon: () => <ScanIcon />,
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
