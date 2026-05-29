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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <Text style={styles.logo}>Spendle</Text>
        <Text style={styles.tagline}>Smart receipt tracking</Text>

        <View style={styles.card}>
          <Text style={styles.modeTitle}>
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={mode === 'signin' ? handleSignIn : handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          >
            <Text style={styles.switchText}>
              {mode === 'signin'
                ? "Don't have an account? Sign Up"
                : 'Already have an account? Sign In'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#3b82f6' },
  inner: { flex: 1, justifyContent: 'center', padding: 24 },
  logo: { fontSize: 42, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 6 },
  tagline: { fontSize: 15, color: '#bfdbfe', textAlign: 'center', marginBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24 },
  modeTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a1a', marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '600', color: '#495057', marginBottom: 4, marginTop: 12 },
  input: { backgroundColor: '#f3f4f6', padding: 14, borderRadius: 10, fontSize: 15, color: '#212529' },
  primaryButton: { backgroundColor: '#3b82f6', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  switchButton: { marginTop: 16, alignItems: 'center' },
  switchText: { color: '#6c757d', fontSize: 14 },
});
