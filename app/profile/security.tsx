import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Lock, Shield, Smartphone } from 'lucide-react-native';
import { useThemeColors } from '@/constants/Colors';
import Header from '@/components/ui/Header';
import { useAuth } from '@/app/_layout'; // Assuming similar context pattern

interface SecuritySettings {
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  passwordLastChanged: string;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function SecurityScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  
  // Get security context (similar to address context)
  const { 
    securitySettings,
    securityLoading,
    securityError,
    updateSecuritySettings,
    changePassword,
    getSecuritySettings
  } = useAuth();

  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    biometricEnabled: true,
    passwordLastChanged: '',
  });

  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Load security settings on component mount
  useEffect(() => {
    if (securitySettings) {
      setSettings({
        twoFactorEnabled: securitySettings.twoFactorEnabled || false,
        biometricEnabled: securitySettings.biometricEnabled || true,
        passwordLastChanged: securitySettings.passwordLastChanged || '',
      });
    }
  }, [securitySettings]);

  const handleToggleTwoFactor = async (value: boolean) => {
    setIsUpdating(true);
    try {
      const updatedSettings = { ...settings, twoFactorEnabled: value };
      await updateSecuritySettings(updatedSettings);
      setSettings(updatedSettings);
      Alert.alert(
        'Success', 
        value ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled'
      );
    } catch (error) {
      console.error('Error updating two-factor authentication:', error);
      Alert.alert('Error', 'Failed to update two-factor authentication. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleBiometric = async (value: boolean) => {
    setIsUpdating(true);
    try {
      const updatedSettings = { ...settings, biometricEnabled: value };
      await updateSecuritySettings(updatedSettings);
      setSettings(updatedSettings);
      Alert.alert(
        'Success', 
        value ? 'Biometric authentication enabled' : 'Biometric authentication disabled'
      );
    } catch (error) {
      console.error('Error updating biometric authentication:', error);
      Alert.alert('Error', 'Failed to update biometric authentication. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    // Validation
    if (!passwordData.currentPassword.trim() || !passwordData.newPassword.trim() || !passwordData.confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters long');
      return;
    }

    setIsChangingPassword(true);

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      Alert.alert('Success', 'Password changed successfully');
      
      // Clear form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', 'Failed to change password. Please check your current password and try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Show loading state
  if (securityLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Header title="Security Settings" onBack={() => router.back()} />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading security settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (securityError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Header title="Security Settings" onBack={() => router.back()} />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.destructive }]}>{securityError}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.accent }]}
            onPress={() => getSecuritySettings()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    section: {
      marginBottom: 25,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      color: colors.text,
      marginBottom: 15,
    },
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: 15,
      padding: 20,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    cardTitle: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginLeft: 10,
    },
    formGroup: {
      marginBottom: 15,
    },
    label: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: 10,
      padding: 15,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    button: {
      backgroundColor: colors.accent,
      borderRadius: 10,
      padding: 15,
      alignItems: 'center',
      marginTop: 10,
      opacity: isChangingPassword ? 0.7 : 1,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontFamily: 'Inter-Bold',
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      opacity: isUpdating ? 0.7 : 1,
    },
    settingInfo: {
      flex: 1,
      marginRight: 15,
    },
    settingTitle: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginBottom: 4,
    },
    settingDescription: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.gray,
    },
    infoSection: {
      backgroundColor: colors.cardBackground,
      borderRadius: 15,
      padding: 20,
      marginBottom: 20,
    },
    infoTitle: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      color: colors.text,
      marginBottom: 10,
    },
    infoText: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.gray,
      lineHeight: 24,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    errorText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      textAlign: 'center',
      marginBottom: 20,
    },
    retryButton: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    retryButtonText: {
      color: '#fff',
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
    },
    lastChangedText: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: colors.gray,
      marginTop: 10,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Security Settings" onBack={() => router.back()} />
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Password</Text>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Lock size={24} color={colors.accent} />
              <Text style={styles.cardTitle}>Change Password</Text>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Current Password</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                value={passwordData.currentPassword}
                onChangeText={(text) => setPasswordData({ ...passwordData, currentPassword: text })}
                placeholder="Enter current password"
                placeholderTextColor={colors.gray}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                value={passwordData.newPassword}
                onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
                placeholder="Enter new password"
                placeholderTextColor={colors.gray}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                value={passwordData.confirmPassword}
                onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
                placeholder="Confirm new password"
                placeholderTextColor={colors.gray}
              />
            </View>

            <TouchableOpacity 
              style={styles.button} 
              onPress={handleChangePassword}
              disabled={isChangingPassword}
            >
              <Text style={styles.buttonText}>
                {isChangingPassword ? 'Updating...' : 'Update Password'}
              </Text>
            </TouchableOpacity>

            {settings.passwordLastChanged && (
              <Text style={styles.lastChangedText}>
                Last changed: {new Date(settings.passwordLastChanged).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Two-Factor Authentication</Text>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Smartphone size={24} color={colors.accent} />
              <Text style={styles.cardTitle}>2FA Security</Text>
            </View>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Enable Two-Factor Authentication</Text>
                <Text style={styles.settingDescription}>
                  Add an extra layer of security to your account
                </Text>
              </View>
              <Switch
                value={settings.twoFactorEnabled}
                onValueChange={handleToggleTwoFactor}
                disabled={isUpdating}
                trackColor={{ false: colors.lightGray, true: colors.lightAccent }}
                thumbColor={settings.twoFactorEnabled ? colors.accent : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Biometric Authentication</Text>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Shield size={24} color={colors.accent} />
              <Text style={styles.cardTitle}>Biometric Login</Text>
            </View>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Enable Biometric Login</Text>
                <Text style={styles.settingDescription}>
                  Use fingerprint or face recognition to log in
                </Text>
              </View>
              <Switch
                value={settings.biometricEnabled}
                onValueChange={handleToggleBiometric}
                disabled={isUpdating}
                trackColor={{ false: colors.lightGray, true: colors.lightAccent }}
                thumbColor={settings.biometricEnabled ? colors.accent : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Security Tips</Text>
          <Text style={styles.infoText}>
            • Use a strong, unique password{'\n'}
            • Enable two-factor authentication{'\n'}
            • Never share your login credentials{'\n'}
            • Regularly update your security settings
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}