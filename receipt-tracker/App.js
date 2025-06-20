// App.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { supabase } from './supabaseClient';

export default function App() {
  const [receipts, setReceipts] = useState([]);

  useEffect(() => {
    const fetchReceipts = async () => {
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
      } else {
        setReceipts(data);
      }
    };

    fetchReceipts();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.store}>{item.store_name}</Text>
      <Text style={styles.meta}>{item.date} • {item.location}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>📦 Your Receipts</Text>
      <FlatList
        data={receipts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 40, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '600', marginBottom: 16 },
  card: { marginBottom: 12, padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8 },
  store: { fontSize: 18, fontWeight: '500' },
  meta: { fontSize: 14, color: '#666' },
});
