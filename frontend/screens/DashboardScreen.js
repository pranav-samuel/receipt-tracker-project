import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../supabaseClient';
import { C, F, R, storeColor } from '../theme';

function StoreAvatar({ name = '' }) {
  return (
    
    <View style={[s.avatar, { backgroundColor: storeColor(name) }]}>
      <Text style={s.avatarLetter}> {name.charAt(0).toUpperCase()}</Text> {/* use first letter of username for now ig*/}
    </View>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <View style={s.statCardShell}>
      <View style={s.statCardInner}>
        <Text style={s.statValue}>{value}</Text>
        <Text style={s.statLabel}>{label}</Text>
        {sub ? <Text style={s.statSub}>{sub}</Text> : null}
      </View>
    </View>
  );
}

export default function DashboardScreen({ navigation }) {
  const [receipts, setReceipts] = useState([]);
  const [monthTotal, setMonthTotal] = useState(0);
  const [savedTotal, setSavedTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // recieve all receipts in a list on dashboard page
  const fetchReceipts = async () => {
    const { data } = await supabase
      .from('receipts')
      .select('id, store_name, purchase_date, total_amount, discount_total')
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) {
      setReceipts(data);
      setMonthTotal(data.reduce((sum, r) => sum + (r.total_amount || 0), 0));
      setSavedTotal(data.reduce((sum, r) => sum + (r.discount_total || 0), 0));
    }
    setLoading(false);
    setRefreshing(false);
  };

  // re-fetch every time the home tab comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchReceipts();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReceipts();
  };

  // only 2 decimals for cents
  const fmt = (n) => `$${Number(n).toFixed(2)}`;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.gold} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* header row */}
        <View style={s.header}>
          <View>
            <View style={s.logoRow}>
              <View style={s.logoMark} />
              <Text style={s.logoText}>spendle</Text>
            </View>
          </View>
        </View>

        {/* page title */}
        <Text style={s.pageTitle}>Overview</Text>
        <Text style={s.pageSubtitle}>Your spending at a glance</Text>

        {/* 2-col stat cards */}
        <View style={s.statsRow}>
          <StatCard
            label="Recent total"
            value={loading ? '—' : fmt(monthTotal)}
            sub={`${receipts.length} receipt${receipts.length !== 1 ? 's' : ''}`}
          />
          <StatCard
            label="Total saved"
            value={loading ? '—' : fmt(savedTotal)}
            sub="discounts applied"
          />
        </View>

        {/* dashed scan button */}
        <TouchableOpacity
          style={s.scanDashed}
          onPress={() => navigation.navigate('Scan')}
          activeOpacity={0.7}
        >
          <Ionicons name="scan-outline" size={18} color={C.gold} />
          <Text style={s.scanDashedText}>Scan new receipt</Text>
        </TouchableOpacity>

        {/* recent receipts section */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>
            Recent receipts
            {receipts.length > 0 && (
              <Text style={s.sectionCount}> ({receipts.length})</Text>
            )}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator color={C.gold} style={{ marginTop: 32 }} />
        ) : receipts.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>🧾</Text>
            <Text style={s.emptyText}>No receipts yet</Text>
            <Text style={s.emptySub}>Scan your first receipt to get started</Text>
          </View>
        ) : (
          receipts.map((r, i) => (
            <View key={r.id} style={[s.receiptRow, i === receipts.length - 1 && { borderBottomWidth: 0 }]}>
              <StoreAvatar name={r.store_name} />
              <View style={s.receiptMeta}>
                <Text style={s.receiptStore} numberOfLines={1}>{r.store_name}</Text>
                <Text style={s.receiptDate}>{formatDate(r.purchase_date)}</Text>
              </View>
              <View style={s.receiptRight}>
                <Text style={s.receiptAmount}>{fmt(r.total_amount)}</Text>
                <Ionicons name="chevron-forward" size={14} color={C.muted} style={{ marginTop: 2 }} />
              </View>
            </View>
          ))
        )}

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
    paddingBottom: 32,
  },

  // header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginBottom: 28,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoMark: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: C.gold,
  },
  logoText: {
    fontSize: F.md,
    fontWeight: '700',
    color: C.text,
    letterSpacing: -0.5,
  },

  // page title
  pageTitle: {
    fontSize: F.display,
    fontWeight: '700',
    color: C.text,
    letterSpacing: -1,
    lineHeight: 40,
  },
  pageSubtitle: {
    fontSize: F.sm,
    color: C.sub,
    marginTop: 4,
    marginBottom: 24,
  },

  // stat cards — double-bezel
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCardShell: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.border,
    padding: 2,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  statCardInner: {
    backgroundColor: C.surfaceHigh,
    borderRadius: R.lg - 2,
    padding: 18,
  },
  statValue: {
    fontSize: F.xl,
    fontWeight: '700',
    color: C.text,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: F.xs,
    color: C.sub,
    fontWeight: '500',
  },
  statSub: {
    fontSize: F.xs,
    color: C.muted,
    marginTop: 2,
  },

  // dashed scan CTA
  scanDashed: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: C.gold,
    borderStyle: 'dashed',
    borderRadius: R.lg,
    paddingVertical: 16,
    marginBottom: 32,
    marginTop: 8,
  },
  scanDashedText: {
    color: C.gold,
    fontSize: F.base,
    fontWeight: '600',
    letterSpacing: 0.1,
  },

  // section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: F.md,
    fontWeight: '700',
    color: C.text,
    letterSpacing: -0.3,
  },
  sectionCount: {
    color: C.sub,
    fontWeight: '400',
  },

  // receipt list rows
  receiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: R.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: F.md,
    fontWeight: '700',
    color: '#fff',
  },
  receiptMeta: {
    flex: 1,
  },
  receiptStore: {
    fontSize: F.base,
    fontWeight: '600',
    color: C.text,
    marginBottom: 2,
  },
  receiptDate: {
    fontSize: F.xs,
    color: C.sub,
  },
  receiptRight: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 4,
  },
  receiptAmount: {
    fontSize: F.base,
    fontWeight: '600',
    color: C.text,
  },

  // empty state
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: F.md,
    fontWeight: '600',
    color: C.sub,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: F.sm,
    color: C.muted,
    textAlign: 'center',
  },
});
