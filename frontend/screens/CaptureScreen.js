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
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { C, F, R } from '../theme';

// backend url, but i need to deploy it next
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
    <SafeAreaView style={s.container}>
      <View style={s.content}>

        {/* page title */}
        <Text style={s.pageTitle}>Scan</Text>
        <Text style={s.pageSubtitle}>Pick a receipt photo to extract and review</Text>

        {/* icon well — double-bezel */}
        <View style={s.iconShell}>
          <View style={s.iconInner}>
            <Ionicons name="receipt-outline" size={52} color={C.gold} />
          </View>
        </View>

        {/* primary action */}
        <TouchableOpacity
          style={s.primaryBtn}
          onPress={handleScanReceipt}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <View style={s.loadingRow}>
              <ActivityIndicator color={C.goldText} size="small" />
              <Text style={s.primaryBtnText}>Scanning receipt...</Text>
            </View>
          ) : (
            <View style={s.loadingRow}>
              <Ionicons name="image-outline" size={18} color={C.goldText} />
              <Text style={s.primaryBtnText}>Pick receipt photo</Text>
            </View>
          )}
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
  },

  pageTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: C.text,
    letterSpacing: -1,
  },
  pageSubtitle: {
    fontSize: F.sm,
    color: C.sub,
    marginTop: 6,
    marginBottom: 48,
  },

  // double-bezel icon
  iconShell: {
    alignSelf: 'center',
    backgroundColor: C.surface,
    borderRadius: R.xl,
    borderWidth: 1,
    borderColor: C.border,
    padding: 3,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  iconInner: {
    backgroundColor: C.goldDim,
    borderRadius: R.xl - 3,
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryBtn: {
    backgroundColor: C.gold,
    borderRadius: R.md,
    paddingVertical: 18,
    alignItems: 'center',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  primaryBtnText: {
    color: C.goldText,
    fontSize: F.base,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
