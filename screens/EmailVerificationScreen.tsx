import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSignUp } from '@clerk/clerk-expo';
import { Colors } from '../constants/colors';

export default function EmailVerificationScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError('');
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        // RootNavigator redirige automáticamente por isSignedIn
      } else {
        setError('Verificación incompleta. Intenta de nuevo.');
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage ?? 'Código inválido.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!isLoaded) return;
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setError('');
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage ?? 'Error al reenviar el código.');
    }
  };

  const email = signUp?.emailAddress ?? '';

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Ionicons name="mail-outline" size={40} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Verifica tu correo</Text>
            <Text style={styles.subtitle}>
              Enviamos un código de 6 dígitos a{'\n'}
              <Text style={styles.emailText}>{email}</Text>
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Código de verificación</Text>
              <TextInput
                style={styles.codeInput}
                placeholder="000000"
                placeholderTextColor={Colors.text.secondary}
                keyboardType="number-pad"
                maxLength={6}
                value={code}
                onChangeText={setCode}
                textAlign="center"
              />
            </View>

            {!!error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={16} color={Colors.status.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, (loading || code.length < 6) && styles.buttonDisabled]}
              onPress={handleVerify}
              activeOpacity={0.85}
              disabled={loading || code.length < 6}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Verificar</Text>
                  <Ionicons name="checkmark" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={handleResend} style={styles.resendButton}>
              <Text style={styles.resendText}>Reenviar código</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.dark },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 24 },

  logoContainer: { alignItems: 'center', gap: 8 },
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: { fontSize: 26, fontWeight: '900', color: Colors.text.primary },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  emailText: { color: Colors.text.primary, fontWeight: '700' },

  card: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.background.border,
    padding: 24,
    gap: 16,
  },
  inputGroup: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text.primary },
  codeInput: {
    backgroundColor: '#151a1f',
    borderWidth: 1,
    borderColor: Colors.background.border,
    borderRadius: 10,
    height: 56,
    color: Colors.text.primary,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 8,
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.status.danger + '18',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.status.danger + '40',
  },
  errorText: { flex: 1, color: Colors.status.danger, fontSize: 13 },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    height: 48,
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  resendButton: { alignItems: 'center', paddingVertical: 4 },
  resendText: { color: Colors.primary, fontWeight: '600', fontSize: 14 },
});
