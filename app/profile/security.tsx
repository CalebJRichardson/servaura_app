import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Lock, Shield, Smartphone } from 'lucide-react-native';
import { useThemeColors } from '@/constants/Colors';
import Header from '@/components/ui/Header';

export default function SecurityScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);

  const handleChangePassword = () => {
    // Change password logic
  };

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
                placeholder="Enter current password"
                placeholderTextColor={colors.gray}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                placeholder="Enter new password"
                placeholderTextColor={colors.gray}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                placeholder="Confirm new password"
                placeholderTextColor={colors.gray}
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
              <Text style={styles.buttonText}>Update Password</Text>
            </TouchableOpacity>
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
                value={twoFactorEnabled}
                onValueChange={setTwoFactorEnabled}
                trackColor={{ false: colors.lightGray, true: colors.lightAccent }}
                thumbColor={twoFactorEnabled ? colors.accent : '#f4f3f4'}
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
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                trackColor={{ false: colors.lightGray, true: colors.lightAccent }}
                thumbColor={biometricEnabled ? colors.accent : '#f4f3f4'}
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