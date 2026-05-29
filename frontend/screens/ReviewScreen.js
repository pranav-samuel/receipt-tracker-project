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
import { C, F, R } from '../theme';

// labeled input with dark styling
function Field({ label, value, onChangeText, placeholder, keyboardType, multiline }) {
  return (
    <View style={s.fieldWrap}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput
        style={[s.input, multiline && { height: 72, textAlignVertical: 'top' }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.muted}
        keyboardType={keyboardType || 'default'}
        multiline={multiline}
      />
    </View>
  );
}

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
      Alert.alert('Hold on', 'Please fill Store Name, Date, and Total.');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const { data: receiptRow, error: receiptError } = await supabase
        .from('receipts')
        .insert([{
          user_id: session.user.id,
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

      Alert.alert('Saved', 'Receipt added to Spendle.', [
        { text: 'Done', onPress: () => navigation.navigate('Main') },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Database Error', error.message);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >

        {/* receipt header fields */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Receipt details</Text>
          <Field label="Store" value={storeName} onChangeText={setStoreName} placeholder="Store name" />
          <Field label="Date" value={purchaseDate} onChangeText={setPurchaseDate} placeholder="YYYY-MM-DD" />
          <Field label="Time" value={purchaseTime} onChangeText={setPurchaseTime} placeholder="HH:MM am/pm" />
          <Field label="Location" value={location} onChangeText={setLocation} placeholder="Store address" multiline />
          <Field label="Discounts ($)" value={discountTotal} onChangeText={setDiscountTotal} placeholder="0.00" keyboardType="numeric" />
          <Field label="Total ($)" value={totalAmount} onChangeText={setTotalAmount} placeholder="0.00" keyboardType="numeric" />
        </View>

        {/* line items */}
        <Text style={s.itemsTitle}>
          Line items <Text style={s.itemsCount}>({items.length})</Text>
        </Text>

        {items.map(item => (
          <View key={item.id} style={s.itemShell}>
            <View style={s.itemInner}>
              <TextInput
                style={s.itemName}
                value={item.standard_name}
                onChangeText={val => handleItemChange(item.id, 'standard_name', val)}
                placeholderTextColor={C.muted}
              />
              <View style={s.itemRow}>
                <View style={s.itemField}>
                  <Text style={s.itemFieldLabel}>Qty</Text>
                  <TextInput
                    style={s.input}
                    value={String(item.quantity)}
                    keyboardType="numeric"
                    onChangeText={val => handleItemChange(item.id, 'quantity', val)}
                    placeholderTextColor={C.muted}
                  />
                </View>
                <View style={[s.itemField, { flex: 2 }]}>
                  <Text style={s.itemFieldLabel}>Row total ($)</Text>
                  <TextInput
                    style={s.input}
                    value={String(item.price)}
                    keyboardType="numeric"
                    onChangeText={val => handleItemChange(item.id, 'price', val)}
                    placeholderTextColor={C.muted}
                  />
                </View>
              </View>
            </View>
          </View>
        ))}

        {/* confirm button */}
        <TouchableOpacity style={s.confirmBtn} onPress={saveReceiptToSupabase} activeOpacity={0.85}>
          <Text style={s.confirmBtnText}>Confirm &amp; save</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 48,
  },

  // receipt details section
  section: {
    backgroundColor: C.surface,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: F.md,
    fontWeight: '700',
    color: C.text,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  fieldWrap: {
    marginTop: 16,
  },
  fieldLabel: {
    fontSize: F.xs,
    fontWeight: '600',
    color: C.sub,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  input: {
    backgroundColor: C.surfaceHigh,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.md,
    padding: 13,
    fontSize: F.base,
    color: C.text,
  },

  // line items
  itemsTitle: {
    fontSize: F.md,
    fontWeight: '700',
    color: C.text,
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  itemsCount: {
    color: C.sub,
    fontWeight: '400',
  },
  itemShell: {
    backgroundColor: C.surface,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.border,
    padding: 2,
    marginBottom: 10,
  },
  itemInner: {
    backgroundColor: C.surfaceHigh,
    borderRadius: R.lg - 2,
    padding: 14,
  },
  itemName: {
    fontSize: F.base,
    fontWeight: '600',
    color: C.text,
    backgroundColor: C.surface,
    borderRadius: R.sm,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  itemRow: {
    flexDirection: 'row',
    gap: 10,
  },
  itemField: {
    flex: 1,
  },
  itemFieldLabel: {
    fontSize: F.xs,
    color: C.muted,
    marginBottom: 6,
    fontWeight: '500',
  },

  // confirm button
  confirmBtn: {
    backgroundColor: C.gold,
    borderRadius: R.md,
    padding: 18,
    alignItems: 'center',
    marginTop: 24,
  },
  confirmBtnText: {
    color: C.goldText,
    fontSize: F.base,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
