import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ChevronRight, Clock, Calendar as CalendarIcon, CreditCard, RotateCcw, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/ui/Header';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const colors = useThemeColors();
  
  // Upcoming service (mock data)
  const upcomingService = {
    type: 'Home Cleaning',
    date: 'October 15, 2025',
    time: '10:00 AM - 12:00 PM',
    status: 'Confirmed',
  };

  const handleServiceCardPress = (route: string) => {
    router.push(route);
  };

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
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="auto" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
                <Text style={styles.serviceLocation}>Main Residence</Text>
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
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{upcomingService.status}</Text>
            </View>
          </View>
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