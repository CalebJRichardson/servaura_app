import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeColors } from '@/constants/Colors';
import Header from '@/components/ui/Header';
import { useAddress } from '@/app/_layout';

export default function AddressScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Get address context
  const { 
    addresses,
    addressesLoading,
    addressesError,
    addAddress,
    updateAddress,
    getAddressById
  } = useAddress();

  // Determine if we're editing an existing address
  const addressId = params.id as string;
  const isEditing = !!addressId;
  const existingAddress = isEditing ? getAddressById(addressId) : null;

  const [address, setAddress] = useState({
    street: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    type: 'home' as 'home' | 'work' | 'billing' | 'shipping',
    isDefault: false,
  });

  const [isSaving, setIsSaving] = useState(false);

  // Load existing address data if editing
  useEffect(() => {
    if (isEditing && existingAddress) {
      setAddress({
        street: existingAddress.street,
        apartment: existingAddress.apartment || '',
        city: existingAddress.city,
        state: existingAddress.state,
        zipCode: existingAddress.zipCode,
        type: existingAddress.type || 'home',
        isDefault: existingAddress.isDefault || false,
      });
    }
  }, [isEditing, existingAddress]);

  const handleSave = async () => {
    // Basic validation
    if (!address.street.trim() || !address.city.trim() || !address.state.trim() || !address.zipCode.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsSaving(true);

    try {
      if (isEditing && addressId) {
        // Update existing address
        await updateAddress(addressId, address);
        Alert.alert('Success', 'Address updated successfully');
      } else {
        // Add new address
        await addAddress(address);
        Alert.alert('Success', 'Address added successfully');
      }
      
      router.back();
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'Failed to save address. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading state
  if (addressesLoading && isEditing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Header title="Address Information" onBack={() => router.back()} />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading address...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (addressesError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Header title="Address Information" onBack={() => router.back()} />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.destructive }]}>{addressesError}</Text>
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
    formGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.cardBackground,
      borderRadius: 10,
      padding: 15,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    saveButton: {
      backgroundColor: colors.accent,
      borderRadius: 10,
      padding: 15,
      alignItems: 'center',
      marginTop: 20,
      opacity: isSaving ? 0.7 : 1,
    },
    saveButtonText: {
      color: '#fff',
      fontSize: 16,
      fontFamily: 'Inter-Bold',
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
    typeSelector: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    typeButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginHorizontal: 4,
      borderWidth: 1,
      alignItems: 'center',
    },
    typeButtonText: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
    },
    defaultToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 15,
      paddingHorizontal: 15,
      backgroundColor: colors.cardBackground,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 20,
    },
    defaultToggleText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: colors.text,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkmark: {
      color: '#fff',
      fontSize: 12,
      fontFamily: 'Inter-Bold',
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header 
        title={isEditing ? "Edit Address" : "Add Address"} 
        onBack={() => router.back()} 
      />
      
      <ScrollView style={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Street Address *</Text>
          <TextInput
            style={styles.input}
            value={address.street}
            onChangeText={(text) => setAddress({ ...address, street: text })}
            placeholder="Enter street address"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Apartment/Suite</Text>
          <TextInput
            style={styles.input}
            value={address.apartment}
            onChangeText={(text) => setAddress({ ...address, apartment: text })}
            placeholder="Enter apartment or suite number"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>City *</Text>
          <TextInput
            style={styles.input}
            value={address.city}
            onChangeText={(text) => setAddress({ ...address, city: text })}
            placeholder="Enter city"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>State *</Text>
            <TextInput
              style={styles.input}
              value={address.state}
              onChangeText={(text) => setAddress({ ...address, state: text })}
              placeholder="State"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>ZIP Code *</Text>
            <TextInput
              style={styles.input}
              value={address.zipCode}
              onChangeText={(text) => setAddress({ ...address, zipCode: text })}
              placeholder="ZIP code"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Address Type Selector */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Address Type</Text>
          <View style={styles.typeSelector}>
            {(['home', 'work', 'billing', 'shipping'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: address.type === type ? colors.accent : colors.cardBackground,
                    borderColor: address.type === type ? colors.accent : colors.border,
                  }
                ]}
                onPress={() => setAddress({ ...address, type })}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    {
                      color: address.type === type ? '#fff' : colors.text,
                    }
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Make Default Toggle */}
        <TouchableOpacity
          style={styles.defaultToggle}
          onPress={() => setAddress({ ...address, isDefault: !address.isDefault })}
        >
          <Text style={styles.defaultToggleText}>Set as default address</Text>
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

        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : isEditing ? 'Update Address' : 'Save Address'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}