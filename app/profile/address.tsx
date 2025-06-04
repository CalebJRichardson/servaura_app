import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/constants/Colors';
import Header from '@/components/ui/Header';

export default function AddressScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const [address, setAddress] = useState({
    street: '123 Main St',
    apartment: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
  });

  const handleSave = () => {
    // Save address logic here
    router.back();
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
    },
    saveButtonText: {
      color: '#fff',
      fontSize: 16,
      fontFamily: 'Inter-Bold',
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Address Information" onBack={() => router.back()} />
      
      <ScrollView style={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Street Address</Text>
          <TextInput
            style={styles.input}
            value={address.street}
            onChangeText={(text) => setAddress({ ...address, street: text })}
            placeholder="Enter street address"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Apartment/Suite</Text>
          <TextInput
            style={styles.input}
            value={address.apartment}
            onChangeText={(text) => setAddress({ ...address, apartment: text })}
            placeholder="Enter apartment or suite number"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            value={address.city}
            onChangeText={(text) => setAddress({ ...address, city: text })}
            placeholder="Enter city"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>State</Text>
            <TextInput
              style={styles.input}
              value={address.state}
              onChangeText={(text) => setAddress({ ...address, state: text })}
              placeholder="State"
            />
          </View>

          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>ZIP Code</Text>
            <TextInput
              style={styles.input}
              value={address.zipCode}
              onChangeText={(text) => setAddress({ ...address, zipCode: text })}
              placeholder="ZIP code"
              keyboardType="numeric"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}