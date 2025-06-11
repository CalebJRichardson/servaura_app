import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react-native';
import { useThemeColors } from '@/constants/Colors';
import { useAuth } from '@/app/_layout'; // Assuming auth context

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  
  // Get auth context
  const { 
    user,
    authLoading,
    authError,
    login,
    clearAuthError,
    isAuthenticated
  } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Partial<LoginFormData>>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, user]);

  // Clear auth error when component mounts or form changes
  useEffect(() => {
    if (authError) {
      clearAuthError();
    }
  }, [formData]);

  const validateForm = (): boolean => {
    const errors: Partial<LoginFormData> = {};

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    // Clear previous errors
    setValidationErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoggingIn(true);

    try {
      const success = await login(formData.email, formData.password);
      
      if (success) {
        // Clear form on successful login
        setFormData({ email: '', password: '' });
        // Navigation will be handled by the useEffect hook
      } else {
        // Handle login failure (error should be in authError)
        Alert.alert('Login Failed', authError || 'Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgotPassword = () => {
    if (!formData.email.trim()) {
      Alert.alert('Email Required', 'Please enter your email address first.');
      return;
    }

    Alert.alert(
      'Reset Password',
      `We'll send password reset instructions to ${formData.email}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send', 
          onPress: () => {
            // TODO: Implement forgot password functionality
            Alert.alert('Email Sent', 'Password reset instructions have been sent to your email.');
          }
        }
      ]
    );
  };

  const updateFormData = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Show loading state if auth is still initializing
  if (authLoading && !isLoggingIn) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Checking authentication...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    inner: {
      flex: 1,
    },
    logoContainer: {
      height: 250,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    backgroundImage: {
      position: 'absolute',
      width: '100%',
      height: '100%',
    },
    overlay: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    logo: {
      width: 300,
      height: 300,
      zIndex: 10,
    },
    formContainer: {
      flex: 1,
      paddingHorizontal: 30,
      paddingTop: 30,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      backgroundColor: colors.background,
      marginTop: -30,
    },
    title: {
      fontSize: 28,
      fontFamily: 'Inter-Bold',
      marginBottom: 10,
      color: colors.text,
    },
    subtitle: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: colors.gray,
      marginBottom: 30,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: 5,
      paddingBottom: 10,
    },
    inputContainerError: {
      borderBottomColor: colors.destructive,
    },
    input: {
      flex: 1,
      marginLeft: 10,
      color: colors.text,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginLeft: 10,
    },
    passwordInput: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
    },
    eyeIcon: {
      padding: 5,
    },
    errorText: {
      color: colors.destructive,
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      marginBottom: 15,
      marginLeft: 30,
    },
    forgotPassword: {
      alignSelf: 'flex-end',
      marginBottom: 20,
      marginTop: 10,
    },
    forgotPasswordText: {
      color: colors.accent,
      fontFamily: 'Inter-SemiBold',
    },
    button: {
      backgroundColor: colors.accent,
      paddingVertical: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 10,
      opacity: (isLoggingIn || authLoading) ? 0.7 : 1,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontFamily: 'Inter-Bold',
    },
    needHelp: {
      marginTop: 30,
      alignItems: 'center',
    },
    needHelpText: {
      color: colors.gray,
      fontSize: 14,
      fontFamily: 'Inter-Regular',
    },
    authErrorText: {
      color: colors.destructive,
      marginBottom: 15,
      textAlign: 'center',
      fontSize: 14,
      fontFamily: 'Inter-Regular',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 15,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="auto" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.inner}>
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg' }}
              style={styles.backgroundImage}
            />
            <View style={styles.overlay} />
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Log in to access your personalized home services
            </Text>

            {authError && (
              <Text style={styles.authErrorText}>{authError}</Text>
            )}

            <View style={[
              styles.inputContainer,
              validationErrors.email && styles.inputContainerError
            ]}>
              <Mail color={colors.accent} size={20} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={formData.email}
                onChangeText={(text) => updateFormData('email', text)}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor={colors.gray}
                editable={!isLoggingIn && !authLoading}
              />
            </View>
            {validationErrors.email && (
              <Text style={styles.errorText}>{validationErrors.email}</Text>
            )}

            <View style={[
              styles.inputContainer,
              validationErrors.password && styles.inputContainerError
            ]}>
              <Lock color={colors.accent} size={20} />
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Password"
                  value={formData.password}
                  onChangeText={(text) => updateFormData('password', text)}
                  secureTextEntry={!showPassword}
                  placeholderTextColor={colors.gray}
                  editable={!isLoggingIn && !authLoading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff color={colors.gray} size={20} />
                  ) : (
                    <Eye color={colors.gray} size={20} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
            {validationErrors.password && (
              <Text style={styles.errorText}>{validationErrors.password}</Text>
            )}

            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={isLoggingIn || authLoading}
            >
              {isLoggingIn ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Log In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.needHelp}>
              <Text style={styles.needHelpText}>
                Need help? Contact our customer support
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}