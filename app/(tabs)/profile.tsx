import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Alert, Switch, useColorScheme, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { User, Chrome as Home, CreditCard, Lock, Bell, CircleHelp as HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext'; // Assuming this exists
import { useSettings } from '@/contexts/SettingsContext'; // Assuming this exists
import Header from '@/components/ui/Header';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = useThemeColors();
  
  // Data integration contexts
  const { 
    profile,
    profileLoading,
    profileError,
    refreshProfile,
    updateProfileSettings
  } = useProfile();
  
  const {
    settings,
    settingsLoading,
    settingsError,
    updateSettings,
    refreshSettings
  } = useSettings();

  // Local state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    settings?.notifications?.enabled ?? true
  );

  // Load initial data and sync settings
  useEffect(() => {
    if (settings?.notifications) {
      setNotificationsEnabled(settings.notifications.enabled);
    }
  }, [settings]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refreshProfile(),
        refreshSettings()
      ]);
    } catch (error) {
      console.error('Error refreshing profile data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const toggleNotifications = async () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    
    try {
      await updateSettings({
        notifications: {
          ...settings?.notifications,
          enabled: newValue
        }
      });
    } catch (error) {
      // Revert on error
      setNotificationsEnabled(!newValue);
      Alert.alert('Error', 'Failed to update notification settings');
      console.error('Error updating notifications:', error);
    }
  };
  
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Logout", 
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const navigateToSection = (route: string) => {
    router.push(route);
  };

  // Show loading state
  if (profileLoading && !profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Header title="My Profile" />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (profileError && !profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Header title="My Profile" />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.destructive }]}>{profileError}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.accent }]}
            onPress={handleRefresh}
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
    scrollView: {
      flex: 1,
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
    profileHeader: {
      alignItems: 'center',
      paddingVertical: 30,
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    profileImageContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      overflow: 'hidden',
      borderWidth: 3,
      borderColor: colors.accent,
      marginBottom: 20,
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    profileImage: {
      width: '100%',
      height: '100%',
    },
    profileName: {
      fontSize: 28,
      fontFamily: 'Inter-Bold',
      color: colors.accent,
      marginBottom: 8,
      textAlign: 'center',
    },
    profileEmail: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: colors.gray,
      marginBottom: 20,
      textAlign: 'center',
    },
    editProfileButton: {
      borderRadius: 25,
      overflow: 'hidden',
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    editProfileGradient: {
      paddingVertical: 12,
      paddingHorizontal: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    editProfileText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: colors.background,
    },
    section: {
      paddingHorizontal: 20,
      marginBottom: 25,
    },
    sectionTitle: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: colors.text,
      marginBottom: 15,
    },
    settingsContainer: {
      backgroundColor: colors.cardBackground,
      borderRadius: 20,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 18,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    lastSettingItem: {
      borderBottomWidth: 0,
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    iconContainer: {
      width: 45,
      height: 45,
      borderRadius: 22.5,
      marginRight: 15,
      overflow: 'hidden',
    },
    iconGradient: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    settingText: {
      fontSize: 16,
      fontFamily: 'Inter-Medium',
      color: colors.text,
      flex: 1,
    },
    logoutText: {
      fontSize: 16,
      fontFamily: 'Inter-Medium',
      color: '#FF6B6B',
    },
    versionContainer: {
      alignItems: 'center',
      marginTop: 30,
      marginBottom: 40,
    },
    versionText: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.gray,
    },
  });

  const settingsData = [
    {
      icon: User,
      title: 'Personal Information',
      route: '/profile/personal',
      color: colors.accent,
      backgroundColor: `${colors.accent}20`,
    },
    {
      icon: Home,
      title: 'Address Information',
      route: '/profile/address',
      color: '#A2D2FF',
      backgroundColor: '#A2D2FF20',
    },
    {
      icon: CreditCard,
      title: 'Payment Methods',
      route: '/profile/payment',
      color: '#FFD6A5',
      backgroundColor: '#FFD6A520',
    },
    {
      icon: Lock,
      title: 'Security Settings',
      route: '/profile/security',
      color: '#CAFFBF',
      backgroundColor: '#CAFFBF20',
    },
  ];

  const appSettingsData = [
    {
      icon: Bell,
      title: 'Notifications',
      color: '#FF8FA3',
      backgroundColor: '#FF8FA320',
      hasSwitch: true,
      isLoading: settingsLoading,
    },
  ];

  const supportData = [
    {
      icon: HelpCircle,
      title: 'Help & Support',
      color: '#9896F1',
      backgroundColor: '#9896F120',
    },
    {
      icon: LogOut,
      title: 'Logout',
      color: '#FF6B6B',
      backgroundColor: '#FF6B6B20',
      isLogout: true,
    },
  ];

  const renderSettingItem = (item: any, index: number, isLast: boolean = false) => (
    <TouchableOpacity 
      key={index}
      style={[styles.settingItem, isLast && styles.lastSettingItem]}
      onPress={item.isLogout ? handleLogout : () => item.route && navigateToSection(item.route)}
      disabled={item.isLoading}
    >
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={[colors.accentGradientLight, colors.accentGradientDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <item.icon size={22} color={colors.background} />
          </LinearGradient>
        </View>
        <Text style={[styles.settingText, item.isLogout && { color: item.color }]}>
          {item.title}
        </Text>
      </View>
      {item.hasSwitch ? (
        <Switch
          value={notificationsEnabled}
          onValueChange={toggleNotifications}
          trackColor={{ false: colors.border, true: `${colors.accent}40` }}
          thumbColor={notificationsEnabled ? colors.accent : colors.gray}
          disabled={item.isLoading}
        />
      ) : (
        <ChevronRight size={20} color={colors.gray} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Header title="My Profile" />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image 
              source={{ uri: profile?.avatar || user?.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg' }} 
              style={styles.profileImage} 
            />
          </View>
          <Text style={styles.profileName}>
            {profile?.name || user?.name || 'John Doe'}
          </Text>
          <Text style={styles.profileEmail}>
            {profile?.email || user?.email || 'john.doe@example.com'}
          </Text>
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => navigateToSection('/profile/personal')}
          >
            <LinearGradient
              colors={[colors.accentGradientLight, colors.accentGradientDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.editProfileGradient}
            >
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.settingsContainer}>
            {settingsData.map((item, index) => 
              renderSettingItem(item, index, index === settingsData.length - 1)
            )}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <View style={styles.settingsContainer}>
            {appSettingsData.map((item, index) => 
              renderSettingItem(item, index, index === appSettingsData.length - 1)
            )}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.settingsContainer}>
            {supportData.map((item, index) => 
              renderSettingItem(item, index, index === supportData.length - 1)
            )}
          </View>
        </View>
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}