import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Camera } from 'lucide-react-native';
import { useThemeColors } from '@/constants/Colors';
import Header from '@/components/ui/Header';
import { useProfile } from '@/app/_layout'; // Assuming similar context structure

export default function PersonalInformationScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  
  // Get profile context
  const { 
    profile,
    profileLoading,
    profileError,
    updateProfile,
    updateProfileImage
  } = useProfile();

  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profileImage: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Load profile data
  useEffect(() => {
    if (profile) {
      setPersonalInfo({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        profileImage: profile.profileImage || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    // Basic validation
    if (!personalInfo.firstName.trim() || !personalInfo.lastName.trim() || !personalInfo.email.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(personalInfo.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsSaving(true);

    try {
      await updateProfile({
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        email: personalInfo.email,
        phone: personalInfo.phone,
      });
      
      Alert.alert('Success', 'Personal information updated successfully');
      router.back();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update personal information. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async () => {
    // Note: In a real app, you'd use ImagePicker or similar
    Alert.alert(
      'Change Profile Photo',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: () => handleImageAction('camera') },
        { text: 'Choose from Gallery', onPress: () => handleImageAction('gallery') },
      ]
    );
  };

  const handleImageAction = async (source: 'camera' | 'gallery') => {
    setIsUploadingImage(true);
    
    try {
      // This would typically use ImagePicker
      // const result = await ImagePicker.launchImageLibraryAsync({...});
      // if (!result.canceled) {
      //   const imageUri = result.assets[0].uri;
      //   await updateProfileImage(imageUri);
      //   setPersonalInfo({ ...personalInfo, profileImage: imageUri });
      // }
      
      // For now, just show a placeholder success
      Alert.alert('Success', 'Profile photo updated successfully');
    } catch (error) {
      console.error('Error updating profile image:', error);
      Alert.alert('Error', 'Failed to update profile photo. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Show loading state
  if (profileLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Header title="Personal Information" onBack={() => router.back()} />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (profileError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Header title="Personal Information" onBack={() => router.back()} />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.destructive }]}>{profileError}</Text>
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
    profileImageSection: {
      alignItems: 'center',
      marginBottom: 30,
    },
    profileImageContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      position: 'relative',
      opacity: isUploadingImage ? 0.7 : 1,
    },
    profileImage: {
      width: '100%',
      height: '100%',
      borderRadius: 50,
    },
    profileImagePlaceholder: {
      width: '100%',
      height: '100%',
      borderRadius: 50,
      backgroundColor: colors.cardBackground,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.border,
    },
    placeholderText: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: colors.textSecondary,
    },
    cameraButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: colors.accent,
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: colors.background,
    },
    changePhotoText: {
      marginTop: 10,
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: colors.accent,
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
    privacyNote: {
      marginTop: 20,
      padding: 15,
      backgroundColor: colors.cardBackground,
      borderRadius: 10,
    },
    privacyText: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.gray,
      textAlign: 'center',
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
    requiredText: {
      color: colors.destructive,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Personal Information" onBack={() => router.back()} />
      
      <ScrollView style={styles.content}>
        <View style={styles.profileImageSection}>
          <TouchableOpacity 
            style={styles.profileImageContainer}
            onPress={handleImageUpload}
            disabled={isUploadingImage}
          >
            {personalInfo.profileImage ? (
              <Image
                source={{ uri: personalInfo.profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.placeholderText}>
                  {personalInfo.firstName.charAt(0)}{personalInfo.lastName.charAt(0)}
                </Text>
              </View>
            )}
            <View style={styles.cameraButton}>
              <Camera size={20} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>
            {isUploadingImage ? 'Uploading...' : 'Change Profile Photo'}
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            First Name <Text style={styles.requiredText}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={personalInfo.firstName}
            onChangeText={(text) => setPersonalInfo({ ...personalInfo, firstName: text })}
            placeholder="Enter first name"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Last Name <Text style={styles.requiredText}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={personalInfo.lastName}
            onChangeText={(text) => setPersonalInfo({ ...personalInfo, lastName: text })}
            placeholder="Enter last name"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Email Address <Text style={styles.requiredText}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={personalInfo.email}
            onChangeText={(text) => setPersonalInfo({ ...personalInfo, email: text })}
            placeholder="Enter email address"
            placeholderTextColor={colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={personalInfo.phone}
            onChangeText={(text) => setPersonalInfo({ ...personalInfo, phone: text })}
            placeholder="Enter phone number"
            placeholderTextColor={colors.textSecondary}
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>

        <View style={styles.privacyNote}>
          <Text style={styles.privacyText}>
            Your personal information is protected and will only be used to improve your service experience.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}