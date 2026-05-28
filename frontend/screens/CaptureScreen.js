import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// backend url, but i need to delpoy it next
const BACKEND_URL = 'http://192.168.1.166:8000/api/parse-receipt';

export default function CaptureScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  // scan the receipt
  const handleScanReceipt = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync(); //handle permissions
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow photo library access to scan receipts.');
      return;
    }

    // await image selection
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });

    if (result.canceled) return;

    setLoading(true);
    try {
      const asset = result.assets[0];

      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        name: asset.fileName || 'receipt.jpg',
        type: asset.mimeType || 'image/jpeg',
      });

      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!response.ok) throw new Error('Failed to parse image through backend server pipeline.');

      const data = await response.json();

      navigation.navigate('Review', { receiptData: data });
    } catch (err) {
      console.error(err);
      Alert.alert('Scanning Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Upload a Receipt</Text>
        <Text style={styles.subheading}>
          Select a photo from your library.
        </Text>

        <TouchableOpacity style={styles.scanButton} onPress={handleScanReceipt} disabled={loading}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" />
              <Text style={styles.loadingText}>Scanning receipt...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}> Pick Receipt Photo</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  heading: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', marginBottom: 12, textAlign: 'center' },
  subheading: { fontSize: 14, color: '#6c757d', textAlign: 'center', marginBottom: 40, lineHeight: 22 },
  scanButton: { backgroundColor: '#3b82f6', paddingVertical: 18, paddingHorizontal: 40, borderRadius: 14, alignItems: 'center', width: '100%' },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  loadingText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
