import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ChevronRight, Clock, Calendar as CalendarIcon, CreditCard, RotateCcw, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/ui/Header';
import { LinearGradient } from 'expo-linear-gradient';

// Assuming these context hooks exist - follow the same pattern as useAddress
import { useServices } from '@/contexts/ServicesContext';
import { useBookings } from '@/contexts/BookingsContext';

interface UpcomingService {
  id: string;
  type: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  location: string;
  serviceProvider?: string;
}

export default function HomeScreen() {
  const { user, userLoading, userError } = useAuth();
  const router = useRouter();
  const colors = useThemeColors();
  
  // Get services and bookings context - following address.tsx pattern
  const { 
    services,
    servicesLoading,
    servicesError,
    getServices
  } = useServices();

  const { 
    bookings,
    bookingsLoading,
    bookingsError,
    getUpcomingBookings,
    cancelBooking
  } = useBookings();

  const [refreshing, setRefreshing] = useState(false);
  const [upcomingService, setUpcomingService] = useState<UpcomingService | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Process upcoming services when bookings change
  useEffect(() => {
    if (bookings && bookings.length > 0) {
      // Get the next upcoming service
      const nextService = bookings
        .filter(booking => booking.status === 'confirmed' && new Date(booking.date) > new Date())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
      
      setUpcomingService(nextService || null);
    }
  }, [bookings]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        getServices(),
        getUpcomingBookings()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadInitialData();
    } catch (error) {
      console.error('Error refreshing data:', error);
      Alert.alert('Error', 'Failed to refresh data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleServiceCardPress = (route: string) => {
    router.push(route);
  };

  const handleCancelService = async () => {
    if (!upcomingService) return;

    Alert.alert(
      'Cancel Service',
      'Are you sure you want to cancel this service?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelBooking(upcomingService.id);
              Alert.alert('Success', 'Service cancelled successfully');
            } catch (error) {
              console.error('Error cancelling service:', error);
              Alert.alert('Error', 'Failed to cancel service. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Show loading state
  if (userLoading || (servicesLoading && bookingsLoading)) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <StatusBar style="auto" />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (userError || servicesError || bookingsError) {
    const errorMessage = userError || servicesError || bookingsError;
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <StatusBar style="auto" />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.destructive }]}>{errorMessage}</Text>
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
      paddingHorizontal: 20,
    },
    welcomeSection: {
      marginTop: 20,
      marginBottom: 40,
    },
    welcomeText: {
      fontSize: 24,
      color: colors.gray,
      fontFamily: 'Inter-Regular',
      marginBottom: 8,
    },
    userName: {
      fontSize: 36,
      fontFamily: 'Inter-Bold',
      color: colors.accent,
    },
    section: {
      marginBottom: 40,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 22,
      fontFamily: 'Inter-Bold',
      color: colors.text,
    },
    seeAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    seeAllText: {
      fontSize: 14,
      color: colors.accent,
      fontFamily: 'Inter-SemiBold',
      marginRight: 5,
    },
    upcomingServiceCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 20,
      padding: 24,
      position: 'relative',
    },
    serviceHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    serviceIconContainer: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
      overflow: 'hidden',
    },
    serviceIconGradient: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    serviceInfo: {
      flex: 1,
    },
    serviceType: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: colors.text,
      marginBottom: 4,
    },
    serviceLocation: {
      fontSize: 14,
      color: colors.gray,
      fontFamily: 'Inter-Regular',
    },
    serviceDetails: {
      marginBottom: 20,
    },
    serviceDetailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    serviceDetailText: {
      fontSize: 16,
      color: colors.text,
      fontFamily: 'Inter-Medium',
      marginLeft: 12,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#4CAF50',
      marginRight: 8,
    },
    statusText: {
      fontSize: 14,
      color: '#4CAF50',
      fontFamily: 'Inter-SemiBold',
    },
    quickActionsContainer: {
      gap: 16,
    },
    primaryActionButton: {
      borderRadius: 20,
      overflow: 'hidden',
    },
    primaryActionGradient: {
      padding: 24,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    primaryActionText: {
      color: colors.background,
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      marginLeft: 8,
    },
    secondaryActionsContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    secondaryActionButton: {
      flex: 1,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryActionText: {
      color: colors.text,
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      marginLeft: 8,
    },
    bottomPadding: {
      height: 40,
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
    noServiceCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 20,
      padding: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
    },
    noServiceText: {
      fontSize: 16,
      color: colors.textSecondary,
      fontFamily: 'Inter-Regular',
      textAlign: 'center',
      marginBottom: 16,
    },
    scheduleButton: {
      backgroundColor: colors.accent,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    scheduleButtonText: {
      color: '#fff',
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="auto" />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
      >
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Service</Text>
            <TouchableOpacity style={styles.seeAllButton} onPress={() => router.push('/calendar')}>
              <Text style={styles.seeAllText}>See all</Text>
              <ChevronRight size={16} color={colors.accent} />
            </TouchableOpacity>
          </View>

          {upcomingService ? (
            <View style={styles.upcomingServiceCard}>
              <View style={styles.serviceHeader}>
                <View style={styles.serviceIconContainer}>
                  <LinearGradient
                    colors={[colors.accentGradientLight, colors.accentGradientDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.serviceIconGradient}
                  >
                    <Clock size={24} color="#1a1a1a" />
                  </LinearGradient>
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceType}>{upcomingService.type}</Text>
                  <Text style={styles.serviceLocation}>{upcomingService.location}</Text>
                </View>
              </View>
              
              <View style={styles.serviceDetails}>
                <View style={styles.serviceDetailRow}>
                  <CalendarIcon size={18} color={colors.accent} />
                  <Text style={styles.serviceDetailText}>{upcomingService.date}</Text>
                </View>
                <View style={styles.serviceDetailRow}>
                  <Clock size={18} color={colors.accent} />
                  <Text style={styles.serviceDetailText}>{upcomingService.time}</Text>
                </View>
              </View>

              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { 
                  backgroundColor: upcomingService.status === 'confirmed' ? '#4CAF50' : 
                                 upcomingService.status === 'pending' ? '#FF9800' : '#F44336' 
                }]} />
                <Text style={[styles.statusText, { 
                  color: upcomingService.status === 'confirmed' ? '#4CAF50' : 
                         upcomingService.status === 'pending' ? '#FF9800' : '#F44336' 
                }]}>
                  {upcomingService.status.charAt(0).toUpperCase() + upcomingService.status.slice(1)}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.noServiceCard}>
              <Text style={styles.noServiceText}>No upcoming services scheduled</Text>
              <TouchableOpacity 
                style={styles.scheduleButton}
                onPress={() => handleServiceCardPress('/services')}
              >
                <Text style={styles.scheduleButtonText}>Schedule Service</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity 
              style={styles.primaryActionButton}
              onPress={() => handleServiceCardPress('/services')}
            >
              <LinearGradient
                colors={[colors.accentGradientLight, colors.accentGradientDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryActionGradient}
              >
                <Plus size={20} color={colors.background} />
                <Text style={styles.primaryActionText}>Request Service</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <View style={styles.secondaryActionsContainer}>
              <TouchableOpacity 
                style={styles.secondaryActionButton}
                onPress={() => handleServiceCardPress('/calendar')}
              >
                <RotateCcw size={18} color={colors.text} />
                <Text style={styles.secondaryActionText}>Reschedule</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryActionButton}
                onPress={() => handleServiceCardPress('/profile/payment')}
              >
                <CreditCard size={18} color={colors.text} />
                <Text style={styles.secondaryActionText}>Billing</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}