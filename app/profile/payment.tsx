import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CreditCard, Plus } from 'lucide-react-native';
import { useThemeColors } from '@/constants/Colors';
import Header from '@/components/ui/Header';
import { usePayment } from '@/app/_layout'; // Assuming similar context structure

export default function PaymentMethodsScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Get payment context
  const { 
    paymentMethods,
    paymentMethodsLoading,
    paymentMethodsError,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    getPaymentMethodById
  } = usePayment();

  const [isProcessing, setIsProcessing] = useState(false);

  const handleSetDefault = async (methodId: string) => {
    setIsProcessing(true);
    try {
      await setDefaultPaymentMethod(methodId);
      Alert.alert('Success', 'Default payment method updated');
    } catch (error) {
      console.error('Error setting default payment method:', error);
      Alert.alert('Error', 'Failed to update default payment method');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (methodId: string) => {
    Alert.alert(
      'Remove Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setIsProcessing(true);
            try {
              await deletePaymentMethod(methodId);
              Alert.alert('Success', 'Payment method removed');
            } catch (error) {
              console.error('Error deleting payment method:', error);
              Alert.alert('Error', 'Failed to remove payment method');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleAddNew = () => {
    router.push('/settings/payment/add');
  };

  const handleEdit = (methodId: string) => {
    router.push(`/settings/payment/edit?id=${methodId}`);
  };

  // Show loading state
  if (paymentMethodsLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Header title="Payment Methods" onBack={() => router.back()} />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading payment methods...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (paymentMethodsError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Header title="Payment Methods" onBack={() => router.back()} />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.destructive }]}>{paymentMethodsError}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.accent }]}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
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
      opacity: isProcessing ? 0.7 : 1,
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
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyStateText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 20,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Payment Methods" onBack={() => router.back()} />
      
      <ScrollView style={styles.content}>
        {paymentMethods && paymentMethods.length > 0 ? (
          <>
            {paymentMethods.map((method) => (
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
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleEdit(method.id)}
                    disabled={isProcessing}
                  >
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  {!method.isDefault && (
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleSetDefault(method.id)}
                      disabled={isProcessing}
                    >
                      <Text style={styles.actionButtonText}>Set as Default</Text>
                    </TouchableOpacity>
                  )}
                  {!method.isDefault && (
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDelete(method.id)}
                      disabled={isProcessing}
                    >
                      <Text style={styles.deleteButtonText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <CreditCard size={48} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>
              No payment methods added yet.{'\n'}Add your first payment method to get started.
            </Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddNew}
          disabled={isProcessing}
        >
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