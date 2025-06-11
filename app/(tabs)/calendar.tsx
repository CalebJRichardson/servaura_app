import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeColors } from '@/constants/Colors';
import Header from '@/components/ui/Header';

// Mock data for addresses - following calendar.tsx pattern
const MOCK_ADDRESSES = {
  '1': {
    id: '1',
    street: '123 Main Street',
    apartment: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    type: 'home',
    isDefault: true,
  },
  '2': {
    id: '2',
    street: '456 Business Ave',
    apartment: 'Suite 200',
    city: 'New York',
    state: 'NY',
    zipCode: '10002',
    type: 'work',
    isDefault: false,
  },
  '3': {
    id: '3',
    street: '789 Commerce Blvd',
    apartment: '',
    city: 'Brooklyn',
    state: 'NY',
    zipCode: '11201',
    type: 'billing',
    isDefault: false,
  }
};

// Address types configuration
const ADDRESS_TYPES = [
  { key: 'home', label: 'Home', icon: '🏠' },
  { key: 'work', label: 'Work', icon: '🏢' },
  { key: 'billing', label: 'Billing', icon: '💳' },
  { key: 'shipping', label: 'Shipping', icon: '📦' }
] as const;

// Validation utilities
const validateAddress = (address: any) => {
  const errors = [];
  
  if (!address.street?.trim()) {
    errors.push('Street address is required');
  }
  
  if (!address.city?.trim()) {
    errors.push('City is required');
  }
  
  if (!address.state?.trim()) {
    errors.push('State is required');
  }
  
  if (!address.zipCode?.trim()) {
    errors.push('ZIP code is required');
  } else if (!/^\d{5}(-\d{4})?$/.test(address.zipCode.trim())) {
    errors.push('Invalid ZIP code format');
  }
  
  return errors;
};

// Format address for display
const formatAddressPreview = (address: any) => {
  const parts = [
    address.street,
    address.apartment,
    `${address.city}, ${address.state} ${address.zipCode}`
  ].filter(Boolean);
  
  return parts.join('\n');
};

// Simulate API calls with proper error handling
const addressAPI = {
  getById: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    if (Math.random() < 0.1) { // 10% chance of error for testing
      throw new Error('Failed to load address');
    }
    
    const address = MOCK_ADDRESSES[id];
    if (!address) {
      throw new Error('Address not found');
    }
    
    return address;
  },
  
  create: async (addressData: any) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (Math.random() < 0.05) { // 5% chance of error
      throw new Error('Failed to create address');
    }
    
    const newId = String(Date.now());
    const newAddress = { ...addressData, id: newId };
    
    // In real app, this would persist to backend
    console.log('Created address:', newAddress);
    return newAddress;
  },
  
  update: async (id: string, addressData: any) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (Math.random() < 0.05) { // 5% chance of error
      throw new Error('Failed to update address');
    }
    
    const updatedAddress = { ...addressData, id };
    
    // In real app, this would persist to backend
    console.log('Updated address:', updatedAddress);
    return updatedAddress;
  }
};

export default function AddressScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Determine if we're editing an existing address
  const addressId = params.id as string;
  const isEditing = !!addressId;

  // State management following calendar.tsx pattern
  const [address, setAddress] = useState({
    street: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    type: 'home' as 'home' | 'work' | 'billing' | 'shipping',
    isDefault: false,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Load existing address data if editing
  useEffect(() => {
    if (isEditing && addressId) {
      loadAddress();
    }
  }, [isEditing, addressId]);

  const loadAddress = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const existingAddress = await addressAPI.getById(addressId);
      setAddress({
        street: existingAddress.street,
        apartment: existingAddress.apartment || '',
        city: existingAddress.city,
        state: existingAddress.state,
        zipCode: existingAddress.zipCode,
        type: existingAddress.type || 'home',
        isDefault: existingAddress.isDefault || false,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load address';
      setError(errorMessage);
      console.error('Error loading address:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Clear previous validation errors
    setValidationErrors([]);
    
    // Validate address data
    const errors = validateAddress(address);
    if (errors.length > 0) {
      setValidationErrors(errors);
      Alert.alert('Validation Error', errors.join('\n'));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (isEditing && addressId) {
        await addressAPI.update(addressId, address);
        Alert.alert('Success', 'Address updated successfully', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        await addressAPI.create(address);
        Alert.alert('Success', 'Address added successfully', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save address';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      console.error('Error saving address:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleRetry = () => {
    if (isEditing) {
      loadAddress();
    } else {
      setError(null);
    }
  };

  const updateAddress = (field: string, value: any) => {
    setAddress(prev => ({ ...prev, [field]: value }));
    
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Header title="Address Information" onBack={() => router.back()} />
        <View style={styles.centerContainer}>
          <Text style={[styles.statusText, { color: colors.text }]}>Loading address...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error && !saving) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Header title="Address Information" onBack={() => router.back()} />
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.accent }]}
            onPress={handleRetry}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.secondaryButton, { borderColor: colors.border }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Go Back</Text>
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
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    statusText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      textAlign: 'center',
    },
    errorText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      textAlign: 'center',
      marginBottom: 20,
    },
    retryButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      marginBottom: 12,
    },
    retryButtonText: {
      color: '#fff',
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    secondaryButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1,
    },
    secondaryButtonText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    formSection: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      color: colors.text,
      marginBottom: 16,
    },
    formGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginBottom: 8,
    },
    requiredLabel: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 52,
    },
    inputError: {
      borderColor: colors.destructive,
      borderWidth: 2,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    halfWidth: {
      flex: 1,
    },
    typeSelector: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 8,
    },
    typeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 10,
      borderWidth: 1,
      minWidth: 80,
      justifyContent: 'center',
    },
    typeButtonText: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      marginLeft: 4,
    },
    defaultToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 16,
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    defaultToggleText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: colors.text,
    },
    defaultToggleSubtext: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
      marginTop: 2,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 6,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkmark: {
      color: '#fff',
      fontSize: 14,
      fontFamily: 'Inter-Bold',
    },
    addressPreview: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: 8,
    },
    previewTitle: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginBottom: 8,
    },
    previewText: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
      lineHeight: 20,
    },
    validationErrors: {
      backgroundColor: colors.destructive + '10',
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.destructive + '30',
    },
    validationErrorText: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.destructive,
      marginBottom: 4,
    },
    saveButton: {
      backgroundColor: colors.accent,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 24,
      marginBottom: 24,
      opacity: saving ? 0.7 : 1,
      minHeight: 52,
      justifyContent: 'center',
    },
    saveButtonText: {
      color: '#fff',
      fontSize: 16,
      fontFamily: 'Inter-Bold',
    },
  });

  const addressPreview = formatAddressPreview(address);
  const hasRequiredFields = address.street.trim() && address.city.trim() && 
                           address.state.trim() && address.zipCode.trim();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header 
        title={isEditing ? "Edit Address" : "Add Address"} 
        onBack={() => router.back()} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <View style={styles.validationErrors}>
            {validationErrors.map((error, index) => (
              <Text key={index} style={styles.validationErrorText}>• {error}</Text>
            ))}
          </View>
        )}

        {/* Address Information Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Address Information</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.requiredLabel}>Street Address *</Text>
            <TextInput
              style={[
                styles.input,
                validationErrors.some(e => e.includes('Street')) && styles.inputError
              ]}
              value={address.street}
              onChangeText={(text) => updateAddress('street', text)}
              placeholder="Enter street address"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Apartment/Suite</Text>
            <TextInput
              style={styles.input}
              value={address.apartment}
              onChangeText={(text) => updateAddress('apartment', text)}
              placeholder="Enter apartment or suite number (optional)"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.requiredLabel}>City *</Text>
            <TextInput
              style={[
                styles.input,
                validationErrors.some(e => e.includes('City')) && styles.inputError
              ]}
              value={address.city}
              onChangeText={(text) => updateAddress('city', text)}
              placeholder="Enter city"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.requiredLabel}>State *</Text>
              <TextInput
                style={[
                  styles.input,
                  validationErrors.some(e => e.includes('State')) && styles.inputError
                ]}
                value={address.state}
                onChangeText={(text) => updateAddress('state', text.toUpperCase())}
                placeholder="State"
                placeholderTextColor={colors.textSecondary}
                maxLength={2}
                autoCapitalize="characters"
              />
            </View>

            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.requiredLabel}>ZIP Code *</Text>
              <TextInput
                style={[
                  styles.input,
                  validationErrors.some(e => e.includes('ZIP')) && styles.inputError
                ]}
                value={address.zipCode}
                onChangeText={(text) => updateAddress('zipCode', text)}
                placeholder="ZIP code"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
          </View>
        </View>

        {/* Address Type Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Address Type</Text>
          <View style={styles.typeSelector}>
            {ADDRESS_TYPES.map((type) => (
              <TouchableOpacity
                key={type.key}
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: address.type === type.key ? colors.accent : colors.cardBackground,
                    borderColor: address.type === type.key ? colors.accent : colors.border,
                  }
                ]}
                onPress={() => updateAddress('type', type.key)}
              >
                <Text style={{ fontSize: 16 }}>{type.icon}</Text>
                <Text
                  style={[
                    styles.typeButtonText,
                    {
                      color: address.type === type.key ? '#fff' : colors.text,
                    }
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Default Address Toggle */}
        <View style={styles.formSection}>
          <TouchableOpacity
            style={styles.defaultToggle}
            onPress={() => updateAddress('isDefault', !address.isDefault)}
          >
            <View>
              <Text style={styles.defaultToggleText}>Set as default address</Text>
              <Text style={styles.defaultToggleSubtext}>
                Use this address as the primary option
              </Text>
            </View>
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: address.isDefault ? colors.accent : 'transparent',
                  borderColor: address.isDefault ? colors.accent : colors.border,
                }
              ]}
            >
              {address.isDefault && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>
        </View>

        {/* Address Preview */}
        {hasRequiredFields && (
          <View style={styles.formSection}>
            <View style={styles.addressPreview}>
              <Text style={styles.previewTitle}>Address Preview</Text>
              <Text style={styles.previewText}>{addressPreview}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
          disabled={saving || !hasRequiredFields}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : isEditing ? 'Update Address' : 'Save Address'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}