import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

// home screen, need to update
export default function DashboardScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Your Spending</Text>
        <Text style={styles.subheading}>Dashboard coming soon — receipts and analytics will appear here.</Text>

        <TouchableOpacity style={styles.scanButton} onPress={() => navigation.navigate('Capture')}>
          <Text style={styles.buttonText}> Scan New Receipt</Text>
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
});
