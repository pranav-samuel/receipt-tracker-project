import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from './supabaseClient';

export default function App() {
  const [loading, setLoading] = useState(false);
  
  // initialize vars
  const [storeName, setStoreName] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchaseTime, setPurchaseTime] = useState('');
  const [location, setLocation] = useState('');
  const [discountTotal, setDiscountTotal] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [items, setItems] = useState([]);

  // accesses your photo library
  const handleScanReceipt = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow photo library access to scan receipts.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });

    if (result.canceled) return;

    setLoading(true);
    try {
      const asset = result.assets[0];
      const BACKEND_URL = 'http://192.168.1.166:8000/api/parse-receipt';

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

      // prefill with receipt data
      setStoreName(data.store_name);
      setPurchaseDate(data.purchase_date);
      setPurchaseTime(data.purchase_time || '');
      setLocation(data.location || '');
      setDiscountTotal(String(data.discount_total ?? ''));
      setTotalAmount(String(data.total_amount));
      
      // react needs IDing to distinguish inivid rows from each other
      const itemsWithIds = data.items.map((item, index) => ({
        ...item,
        id: String(index + 1)
      }));
      setItems(itemsWithIds);

      Alert.alert('Parsing Complete', 'Review information and make adjustments before submission.');
    } catch (err) {
      console.error(err);
      Alert.alert('Scanning Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (id, field, value) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: field === 'quantity' ? parseInt(value) || 0 : value };
      }
      return item;
    });
    setItems(updatedItems);
  };

  const saveReceiptToSupabase = async () => {
    // makr sure to include these
    if (!storeName || !purchaseDate || !totalAmount) {
      Alert.alert('Hold on', 'Please ensure Store Name, Date, and Total metrics are filled.');
      return;
    }

    try {
      // upload to receipts table
      const { data: receiptData, error: receiptError } = await supabase
        .from('receipts')
        .insert([{
          store_name: storeName,
          purchase_date: purchaseDate,
          purchase_time: purchaseTime || null,
          location: location || null,
          discount_total: parseFloat(discountTotal) || 0.00,
          total_amount: parseFloat(totalAmount) || 0.00
        }])
        .select();

      if (receiptError) throw receiptError;
      const newReceiptId = receiptData[0].id;

      // format items
      const itemsToInsert = items.map(item => ({
        receipt_id: newReceiptId,
        raw_item_name: item.raw_item_name,
        standard_name: item.standard_name,
        category: item.category,
        quantity: item.quantity,
        package_size: item.package_size || 1,
        weight: item.weight || null,
        discount: parseFloat(item.discount) || 0.00,
        price: parseFloat(item.price) || 0.00
      }));

      // upload items to receipt_items table
      const { error: itemsError } = await supabase
        .from('receipt_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      Alert.alert('🎉 Success', 'Receipt has been confirmed and saved to Spendle.');
      
      // reset
      setStoreName('');
      setPurchaseDate('');
      setPurchaseTime('');
      setLocation('');
      setDiscountTotal('');
      setTotalAmount('');
      setItems([]);
    } catch (error) {
      console.error(error);
      Alert.alert('Database Error', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}> Spendle Engine</Text>
        
        {/* button to scan */}
        <TouchableOpacity style={styles.scanButton} onPress={handleScanReceipt} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>📷 Pick Receipt Photo & Scan</Text>
          )}
        </TouchableOpacity>

        {/* fields blocks */}
        <View style={styles.section}>
          <Text style={styles.label}>Merchant Name</Text>
          <TextInput style={styles.input} value={storeName} onChangeText={setStoreName} placeholder="e.g. Target" />

          <Text style={styles.label}>Transaction Date</Text>
          <TextInput style={styles.input} value={purchaseDate} onChangeText={setPurchaseDate} placeholder="YYYY-MM-DD" />

          <Text style={styles.label}>Transaction Time</Text>
          <TextInput style={styles.input} value={purchaseTime} onChangeText={setPurchaseTime} placeholder="HH:MM:SS am/pm" />

          <Text style={styles.label}>Store Location</Text>
          <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Store address" multiline />

          <Text style={styles.label}>Total Discounts ($)</Text>
          <TextInput style={styles.input} value={discountTotal} keyboardType="numeric" onChangeText={setDiscountTotal} placeholder="0.00" />

          <Text style={styles.label}>Grand Total ($)</Text>
          <TextInput style={styles.input} value={totalAmount} keyboardType="numeric" onChangeText={setTotalAmount} placeholder="0.00" />
        </View>

        {/* view line items */}
        {items.length > 0 && <Text style={styles.sectionTitle}>🛒 Line Items Editor</Text>}
        {items.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <TextInput 
              style={[styles.input, { fontWeight: 'bold' }]} 
              value={item.standard_name} 
              onChangeText={(val) => handleItemChange(item.id, 'standard_name', val)} 
            />
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.miniLabel}>Qty</Text>
                <TextInput 
                  style={styles.input} 
                  value={String(item.quantity)} 
                  keyboardType="numeric"
                  onChangeText={(val) => handleItemChange(item.id, 'quantity', val)} 
                />
              </View>
              <View style={{ flex: 2 }}>
                <Text style={styles.miniLabel}>Row Total ($)</Text>
                <TextInput 
                  style={styles.input} 
                  value={String(item.price)} 
                  keyboardType="numeric"
                  onChangeText={(val) => handleItemChange(item.id, 'price', val)} 
                />
              </View>
            </View>
          </View>
        ))}

        {/* sync confirmation button */}
        {items.length > 0 && (
          <TouchableOpacity style={styles.saveButton} onPress={saveReceiptToSupabase}>
            <Text style={styles.buttonText}>Confirm & Push to Supabase</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContainer: { padding: 16 },
  title: { fontSize: 26, fontWeight: '700', color: '#1a1a1a', marginBottom: 20, textAlign: 'center' },
  scanButton: { backgroundColor: '#3b82f6', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  saveButton: { backgroundColor: '#22c55e', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20, marginBottom: 40 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  section: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#e5e7eb' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#343a40', marginBottom: 10 },
  label: { fontSize: 12, fontWeight: '600', color: '#495057', marginBottom: 4, marginTop: 10 },
  miniLabel: { fontSize: 11, color: '#6c757d', marginBottom: 2 },
  input: { backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8, fontSize: 15, color: '#212529', marginTop: 2 },
  itemCard: { backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#dee2e6' },
  row: { flexDirection: 'row', marginTop: 8 },
});