import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabaseClient';
import { C, F, R } from '../theme';

export default function ProfileScreen() {
  const [email, setEmail] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setEmail(session?.user?.email || '');
    });
  }, []);

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.auth.signOut();
          if (error) Alert.alert('Error', error.message);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.content}>
        <Text style={s.pageTitle}>Profile</Text>

        {/* avatar + email */}
        <View style={s.avatarSection}>
          <View style={s.avatarCircle}>
            <Text style={s.avatarLetter}>
              {email.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={s.emailText}>{email}</Text>
        </View>

        {/* settings rows — placeholder */}
        <View style={s.card}>
          <TouchableOpacity style={s.row} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={20} color={C.sub} />
            <Text style={s.rowText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={16} color={C.muted} />
          </TouchableOpacity>
          <View style={s.divider} />
          <TouchableOpacity style={s.row} activeOpacity={0.7}>
            <Ionicons name="help-circle-outline" size={20} color={C.sub} />
            <Text style={s.rowText}>Help &amp; feedback</Text>
            <Ionicons name="chevron-forward" size={16} color={C.muted} />
          </TouchableOpacity>
        </View>

        {/* sign out */}
        <TouchableOpacity style={s.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
          <Text style={s.signOutText}>Sign out</Text>
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
    paddingHorizontal: 20,
    paddingTop: 28,
  },

  pageTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: C.text,
    letterSpacing: -1,
    marginBottom: 32,
  },

  avatarSection: {
    alignItems: 'center',
    marginBottom: 36,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.goldDim,
    borderWidth: 2,
    borderColor: C.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarLetter: {
    fontSize: F.xl,
    fontWeight: '700',
    color: C.gold,
  },
  emailText: {
    fontSize: F.base,
    color: C.sub,
  },

  // settings card
  card: {
    backgroundColor: C.surface,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
  },
  rowText: {
    flex: 1,
    fontSize: F.base,
    color: C.text,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginHorizontal: 18,
  },

  // sign out
  signOutBtn: {
    borderWidth: 1,
    borderColor: C.danger,
    borderRadius: R.md,
    padding: 16,
    alignItems: 'center',
  },
  signOutText: {
    color: C.danger,
    fontSize: F.base,
    fontWeight: '600',
  },
});
