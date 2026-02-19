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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSignIn } from '@clerk/clerk-expo';
import { RootStackParamList } from '../App';
import { Colors } from '../constants/colors';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Ingresa tu correo y contraseña.');
      return;
    }
    if (!isLoaded) return;
    setLoading(true);
    try {
      const result = await signIn.create({
        identifier: email.trim().toLowerCase(),
        password,
      });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        // RootNavigator redirige automáticamente por isSignedIn
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage ?? 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

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
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Ionicons name="barbell-outline" size={40} color={Colors.primary} />
            </View>
            <Text style={styles.appName}>CaliSheet</Text>
            <Text style={styles.tagline}>
              Ingresa tus credenciales para acceder a tu historial de entrenamiento.
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <View style={styles.inputRow}>
                <Ionicons name="mail-outline" size={20} color={Colors.text.secondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="tu@email.com"
                  placeholderTextColor={Colors.text.secondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Contraseña</Text>
              </View>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.text.secondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { paddingRight: 40 }]}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.text.secondary}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.text.secondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Error */}
            {!!error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={16} color={Colors.status.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Submit */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Iniciar Sesión</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>O</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Register button */}
            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.85}
            >
              <Ionicons name="person-add-outline" size={18} color={Colors.primary} />
              <Text style={styles.registerButtonText}>Crear cuenta nueva</Text>
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
  appName: { fontSize: 28, fontWeight: '900', color: Colors.text.primary },
  tagline: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },

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
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151a1f',
    borderWidth: 1,
    borderColor: Colors.background.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: Colors.text.primary, fontSize: 14 },
  eyeButton: { position: 'absolute', right: 12 },

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

  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.background.border },
  dividerText: { fontSize: 11, color: Colors.text.secondary, fontWeight: '600' },

  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary + '60',
    backgroundColor: Colors.primary + '12',
  },
  registerButtonText: { color: Colors.primary, fontWeight: '700', fontSize: 15 },
});
