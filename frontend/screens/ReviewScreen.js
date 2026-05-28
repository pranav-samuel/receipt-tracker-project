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
} from 'react-native';
import { supabase } from '../supabaseClient';

//prefilled form + supabase save
export default function ReviewScreen({ route, navigation }) {
  const { receiptData } = route.params;
  // initialize everything
  const [storeName, setStoreName] = useState(receiptData.store_name || '');
  const [purchaseDate, setPurchaseDate] = useState(receiptData.purchase_date || '');
  const [purchaseTime, setPurchaseTime] = useState(receiptData.purchase_time || '');
  const [location, setLocation] = useState(receiptData.location || '');
  const [discountTotal, setDiscountTotal] = useState(String(receiptData.discount_total ?? ''));
  const [totalAmount, setTotalAmount] = useState(String(receiptData.total_amount || ''));
  const [items, setItems] = useState(
    receiptData.items.map((item, index) => ({ ...item, id: String(index + 1) }))
  );

  // deal with change of items
  const handleItemChange = (id, field, value) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        return { ...item, [field]: field === 'quantity' ? parseInt(value) || 0 : value };
      })
    );
  };

  // upload to supabase
  const saveReceiptToSupabase = async () => {
    if (!storeName || !purchaseDate || !totalAmount) {
      Alert.alert('Hold on', 'Please ensure Store Name, Date, and Total are filled.');
      return;
    }

    try {
      const { data: receiptRow, error: receiptError } = await supabase
        .from('receipts')
        .insert([{
          store_name: storeName,
          purchase_date: purchaseDate,
          purchase_time: purchaseTime || null,
          location: location || null,
          discount_total: parseFloat(discountTotal) || 0.00,
          total_amount: parseFloat(totalAmount) || 0.00,
        }])
        .select();

      if (receiptError) throw receiptError;
      const newReceiptId = receiptRow[0].id;

      const itemsToInsert = items.map(item => ({
        receipt_id: newReceiptId,
        raw_item_name: item.raw_item_name,
        standard_name: item.standard_name,
        category: item.category,
        quantity: item.quantity,
        package_size: item.package_size || 1,
        weight: item.weight || null,
        discount: parseFloat(item.discount) || 0.00,
        price: parseFloat(item.price) || 0.00,
      }));

      const { error: itemsError } = await supabase.from('receipt_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;

      Alert.alert('Success', 'Receipt saved to Spendle.', [
        { text: 'OK', onPress: () => navigation.navigate('Dashboard') },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Database Error', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>

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

        <Text style={styles.sectionTitle}>🛒 Line Items</Text>
        {items.map(item => (
          <View key={item.id} style={styles.itemCard}>
            <TextInput
              style={[styles.input, { fontWeight: 'bold' }]}
              value={item.standard_name}
              onChangeText={val => handleItemChange(item.id, 'standard_name', val)}
            />
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.miniLabel}>Qty</Text>
                <TextInput
                  style={styles.input}
                  value={String(item.quantity)}
                  keyboardType="numeric"
                  onChangeText={val => handleItemChange(item.id, 'quantity', val)}
                />
              </View>
              <View style={{ flex: 2 }}>
                <Text style={styles.miniLabel}>Row Total ($)</Text>
                <TextInput
                  style={styles.input}
                  value={String(item.price)}
                  keyboardType="numeric"
                  onChangeText={val => handleItemChange(item.id, 'price', val)}
                />
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.saveButton} onPress={saveReceiptToSupabase}>
          <Text style={styles.buttonText}>Confirm & Save</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContainer: { padding: 16, paddingBottom: 40 },
  section: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#e5e7eb' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#343a40', marginBottom: 10 },
  label: { fontSize: 12, fontWeight: '600', color: '#495057', marginBottom: 4, marginTop: 10 },
  miniLabel: { fontSize: 11, color: '#6c757d', marginBottom: 2 },
  input: { backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8, fontSize: 15, color: '#212529', marginTop: 2 },
  itemCard: { backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#dee2e6' },
  row: { flexDirection: 'row', marginTop: 8 },
  saveButton: { backgroundColor: '#22c55e', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
