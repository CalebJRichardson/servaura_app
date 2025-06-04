import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CreditCard, Plus } from 'lucide-react-native';
import { useThemeColors } from '@/constants/Colors';
import Header from '@/components/ui/Header';

const PAYMENT_METHODS = [
  {
    id: '1',
    type: 'Visa',
    last4: '4242',
    expiry: '12/25',
    isDefault: true,
  },
  {
    id: '2',
    type: 'Mastercard',
    last4: '8888',
    expiry: '09/24',
    isDefault: false,
  },
];

export default function PaymentMethodsScreen() {
  const colors = useThemeColors();
  const router = useRouter();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: 15,
      padding: 20,
      marginBottom: 15,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
    },
    cardInfo: {
      flex: 1,
      marginLeft: 15,
    },
    cardType: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
    },
    cardExpiry: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.gray,
      marginTop: 2,
    },
    defaultBadge: {
      backgroundColor: colors.lightAccent,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 15,
    },
    defaultText: {
      fontSize: 12,
      fontFamily: 'Inter-SemiBold',
      color: colors.accent,
    },
    cardActions: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      gap: 10,
    },
    actionButton: {
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderRadius: 20,
      backgroundColor: colors.lightAccent,
    },
    actionButtonText: {
      color: colors.accent,
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
    },
    deleteButton: {
      backgroundColor: '#FFE5E5',
    },
    deleteButtonText: {
      color: '#FF4444',
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.cardBackground,
      borderRadius: 15,
      padding: 20,
      marginBottom: 20,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: colors.border,
    },
    addButtonText: {
      marginLeft: 10,
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: colors.accent,
    },
    infoSection: {
      marginTop: 20,
      padding: 20,
      backgroundColor: colors.cardBackground,
      borderRadius: 15,
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
      lineHeight: 20,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Payment Methods" onBack={() => router.back()} />
      
      <ScrollView style={styles.content}>
        {PAYMENT_METHODS.map((method) => (
          <View key={method.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <CreditCard size={24} color={colors.accent} />
              <View style={styles.cardInfo}>
                <Text style={styles.cardType}>
                  {method.type} ending in {method.last4}
                </Text>
                <Text style={styles.cardExpiry}>Expires {method.expiry}</Text>
              </View>
              {method.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>Default</Text>
                </View>
              )}
            </View>
            
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              {!method.isDefault && (
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Set as Default</Text>
                </TouchableOpacity>
              )}
              {!method.isDefault && (
                <TouchableOpacity style={[styles.actionButton, styles.deleteButton]}>
                  <Text style={styles.deleteButtonText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addButton}>
          <Plus size={24} color={colors.accent} />
          <Text style={styles.addButtonText}>Add New Payment Method</Text>
        </TouchableOpacity>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Payment Security</Text>
          <Text style={styles.infoText}>
            Your payment information is encrypted and securely stored. We never store your full card details on our servers.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}