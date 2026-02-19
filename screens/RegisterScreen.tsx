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
import { useSignUp } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { Colors } from '../constants/colors';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

export default function RegisterScreen({ navigation }: Props) {
  const { signUp, isLoaded } = useSignUp();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');

    if (!email.trim() || !password || !confirm) {
      setError('Por favor completa todos los campos obligatorios.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('El correo electrónico no es válido.');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (!isLoaded) return;

    setLoading(true);
    try {
      await signUp.create({
        emailAddress: email.trim().toLowerCase(),
        password,
        firstName: displayName.trim() || undefined,
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      navigation.navigate('EmailVerification');
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage ?? 'Error al crear la cuenta.');
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
          {/* Back */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text.secondary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoIcon}>
              <Ionicons name="person-add-outline" size={36} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Crear cuenta</Text>
            <Text style={styles.subtitle}>
              Registra tus datos para comenzar a guardar tu progreso.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.card}>
            {/* Name (optional) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre <Text style={styles.optional}>(opcional)</Text></Text>
              <View style={styles.inputRow}>
                <Ionicons name="person-outline" size={20} color={Colors.text.secondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Tu nombre"
                  placeholderTextColor={Colors.text.secondary}
                  autoCapitalize="words"
                  value={displayName}
                  onChangeText={setDisplayName}
                />
              </View>
            </View>

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
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.text.secondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { paddingRight: 40 }]}
                  placeholder="Mín. 8 caracteres"
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

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar Contraseña</Text>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.text.secondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { paddingRight: 40 }]}
                  placeholder="Repite la contraseña"
                  placeholderTextColor={Colors.text.secondary}
                  secureTextEntry={!showPassword}
                  value={confirm}
                  onChangeText={setConfirm}
                />
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
              onPress={handleRegister}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Crear Cuenta</Text>
                  <Ionicons name="checkmark" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Login link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>¿Ya tienes cuenta?</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.link}> Iniciar sesión</Text>
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
  scroll: { flexGrow: 1, padding: 24, gap: 24 },

  backButton: { alignSelf: 'flex-start', padding: 4, marginBottom: -8 },

  header: { alignItems: 'center', gap: 8 },
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
  optional: { fontSize: 12, color: Colors.text.secondary, fontWeight: '400' },
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

  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText: { color: Colors.text.secondary, fontSize: 14 },
  link: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
});
