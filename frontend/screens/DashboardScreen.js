import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { supabase } from '../supabaseClient';

// home screen, need to update
export default function DashboardScreen({ navigation }) {
  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.auth.signOut();
          if (error) Alert.alert('Error', error.message);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Your Spending</Text>
        <Text style={styles.subheading}>Dashboard coming soon — receipts and analytics will appear here.</Text>

        <TouchableOpacity style={styles.scanButton} onPress={() => navigation.navigate('Capture')}>
          <Text style={styles.buttonText}>📷  Scan New Receipt</Text>
        </TouchableOpacity>

        {/* added signout button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  heading: { fontSize: 26, fontWeight: '700', color: '#1a1a1a', marginBottom: 10 },
  subheading: { fontSize: 14, color: '#6c757d', textAlign: 'center', marginBottom: 48, lineHeight: 22 },
  scanButton: { backgroundColor: '#3b82f6', paddingVertical: 18, paddingHorizontal: 40, borderRadius: 14, alignItems: 'center', width: '100%' },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  signOutButton: { marginTop: 20 },
  signOutText: { color: '#6c757d', fontSize: 14 },
});
