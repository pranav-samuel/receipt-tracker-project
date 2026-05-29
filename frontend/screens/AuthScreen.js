import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { supabase } from '../supabaseClient';
import { C, F, R } from '../theme';

export default function AuthScreen() {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // login page
  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert('Sign In Failed', error.message);
    setLoading(false);
  };

  // sign up page
  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      Alert.alert('Sign Up Failed', error.message);
    } else {
      Alert.alert('Account Created', 'You are now signed in.');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.inner}
      >
        {/* wordmark */}
        <View style={s.logoArea}>
          <View style={s.logoMark} />
          <Text style={s.logoText}>spendle</Text>
          <Text style={s.tagline}>every receipt, accounted for</Text>
        </View>

        {/* form card — double-bezel: outer shell + inner surface */}
        <View style={s.cardShell}>
          <View style={s.cardInner}>
            <Text style={s.formTitle}>
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </Text>

            <Text style={s.label}>Email</Text>
            <TextInput
              style={s.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={C.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={s.label}>Password</Text>
            <TextInput
              style={s.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={C.muted}
              secureTextEntry
            />

            <TouchableOpacity
              style={s.primaryBtn}
              onPress={mode === 'signin' ? handleSignIn : handleSignUp}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color={C.goldText} />
                : <Text style={s.primaryBtnText}>
                    {mode === 'signin' ? 'Sign in' : 'Create account'}
                  </Text>
              }
            </TouchableOpacity>

            <TouchableOpacity
              style={s.switchBtn}
              onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            >
              <Text style={s.switchText}>
                {mode === 'signin'
                  ? "No account? Sign up"
                  : 'Have an account? Sign in'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  // wordmark
  logoArea: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoMark: {
    width: 10,
    height: 10,
    borderRadius: 3,
    backgroundColor: C.gold,
    marginBottom: 14,
  },
  logoText: {
    fontSize: F.display,
    fontWeight: '700',
    color: C.text,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: F.sm,
    color: C.sub,
    marginTop: 6,
    letterSpacing: 0.3,
  },

  // double-bezel card
  cardShell: {
    backgroundColor: C.surface,
    borderRadius: R.xl,
    borderWidth: 1,
    borderColor: C.border,
    padding: 3,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  cardInner: {
    backgroundColor: C.surfaceHigh,
    borderRadius: R.xl - 3,
    padding: 24,
  },

  formTitle: {
    fontSize: F.lg,
    fontWeight: '700',
    color: C.text,
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  label: {
    fontSize: F.xs,
    fontWeight: '600',
    color: C.sub,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.md,
    padding: 14,
    fontSize: F.base,
    color: C.text,
  },
  primaryBtn: {
    backgroundColor: C.gold,
    borderRadius: R.md,
    padding: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  primaryBtnText: {
    color: C.goldText,
    fontSize: F.base,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  switchBtn: {
    alignItems: 'center',
    marginTop: 18,
    paddingVertical: 4,
  },
  switchText: {
    color: C.sub,
    fontSize: F.sm,
  },
});
