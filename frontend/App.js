import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { supabase } from './supabaseClient';
import { C } from './theme';

import AuthScreen from './screens/AuthScreen';
import ReviewScreen from './screens/ReviewScreen';
import MainTabs from './navigation/MainTabs';

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // check for existing session on launch
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // keep session state in sync with Supabase auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // wait for session check before rendering anything
  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <>
            {/* maintabs is the bottom bar */}
            <Stack.Screen name="Main" component={MainTabs} />
            {/* review is on top of that */}
            <Stack.Screen
              name="Review"
              component={ReviewScreen}
              options={{
                headerShown: true,
                title: 'Review Receipt',
                headerStyle: { backgroundColor: C.surface },
                headerTintColor: C.text,
                headerTitleStyle: { fontWeight: '600', color: C.text },
                headerShadowVisible: false,
              }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
