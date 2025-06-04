import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, Check, CreditCard as Edit2, Plus } from 'lucide-react-native';
import { useThemeColors } from '@/constants/Colors';
import Header from '@/components/ui/Header';

// Mock data for user's current plan
const CURRENT_PLAN = {
  name: 'Premium',
  price: '$249.99',
  billing: 'monthly',
  startDate: 'July 15, 2025',
  services: [
    { name: 'Weekly home cleaning', frequency: 'Every Monday' },
    { name: 'Bi-weekly lawn care', frequency: '1st and 3rd Wednesday' },
    { name: 'Quarterly HVAC service', frequency: 'Jan, Apr, Jul, Oct' },
    { name: 'Quarterly window washing', frequency: 'Jan, Apr, Jul, Oct' },
    { name: 'Annual power washing', frequency: 'April' },
  ],
};

// Mock data for available plans
const AVAILABLE_PLANS = [
  {
    name: 'Basic',
    price: '$149.99',
    features: [
      'Monthly home cleaning',
      'Quarterly lawn maintenance',
      'Annual HVAC inspection',
    ],
  },
  {
    name: 'Standard',
    price: '$199.99',
    features: [
      'Bi-weekly home cleaning',
      'Monthly lawn maintenance',
      'Quarterly HVAC service',
      'Annual window washing',
      'One service contractor visit',
    ],
  },
  {
    name: 'Premium',
    price: '$249.99',
    features: [
      'Weekly home cleaning',
      'Bi-weekly lawn care',
      'Quarterly HVAC service',
      'Quarterly window washing',
      'Annual power washing',
      'Two service contractor visits',
    ],
    current: true,
  },
  {
    name: 'Luxury',
    price: '$399.99',
    features: [
      'Twice weekly home cleaning',
      'Weekly lawn and garden care',
      'Quarterly HVAC service',
      'Monthly window washing',
      'Quarterly power washing',
      'Unlimited service contractor visits',
    ],
  },
];

// All available services in order
const ALL_SERVICES = [
  { id: 1, name: 'Home Cleaning', frequency: 'Weekly' },
  { id: 2, name: 'Window Cleaning', frequency: 'Quarterly' },
  { id: 3, name: 'Lawn & Garden', frequency: 'Bi-weekly' },
  { id: 4, name: 'Power Washing', frequency: 'Annual' },
  { id: 5, name: 'Solar Panel Cleaning', frequency: 'Quarterly' },
  { id: 6, name: 'Pool Cleaning', frequency: 'Weekly' },
  { id: 7, name: 'HVAC Services', frequency: 'Quarterly' },
  { id: 8, name: 'Plumbing', frequency: 'As needed' },
  { id: 9, name: 'Electrical', frequency: 'As needed' },
];

// Function to get available add-ons based on current plan
const getAvailableAddOns = (currentPlanServices) => {
  console.log('Input services:', currentPlanServices);
  
  // Get service names that are already included in current plan
  const includedServices = new Set();
  
  currentPlanServices.forEach(service => {
    const serviceName = service.name.toLowerCase();
    console.log('Processing service:', serviceName);
    
    // Check each service name and mark corresponding services as included
    if (serviceName.includes('cleaning') && serviceName.includes('home')) {
      console.log('Found home cleaning, excluding Home Cleaning');
      includedServices.add('Home Cleaning');
    }
    if (serviceName.includes('window')) {
      console.log('Found window service, excluding Window Cleaning');
      includedServices.add('Window Cleaning');
    }
    if (serviceName.includes('lawn') || serviceName.includes('garden')) {
      console.log('Found lawn/garden service, excluding Lawn & Garden');
      includedServices.add('Lawn & Garden');
    }
    if (serviceName.includes('power') && serviceName.includes('washing')) {
      console.log('Found power washing, excluding Power Washing');
      includedServices.add('Power Washing');
    }
    if (serviceName.includes('solar')) {
      includedServices.add('Solar Panel Cleaning');
    }
    if (serviceName.includes('pool')) {
      includedServices.add('Pool Cleaning');
    }
    if (serviceName.includes('hvac')) {
      console.log('Found HVAC service, excluding HVAC Services');
      includedServices.add('HVAC Services');
    }
    if (serviceName.includes('plumbing')) {
      includedServices.add('Plumbing');
    }
    if (serviceName.includes('electrical')) {
      includedServices.add('Electrical');
    }
  });
  
  console.log('Services to exclude:', Array.from(includedServices));
  
  // Filter out services that are already included
  const filtered = ALL_SERVICES
    .filter(service => {
      const shouldInclude = !includedServices.has(service.name);
      console.log(`Service "${service.name}": ${shouldInclude ? 'INCLUDE' : 'EXCLUDE'}`);
      return shouldInclude;
    })
    .slice(0, 3)
    .map((service, index) => ({
      ...service,
      selected: false
    }));
    
  console.log('Final filtered services:', filtered);
  return filtered;
};

const getNextTierPlan = (currentPlanName) => {
  const planOrder = ['Basic', 'Standard', 'Premium', 'Luxury'];
  const currentIndex = planOrder.indexOf(currentPlanName);
  
  if (currentIndex === -1 || currentIndex === planOrder.length - 1) {
    return null; // No next tier available
  }
  
  return AVAILABLE_PLANS.find(plan => plan.name === planOrder[currentIndex + 1]);
};

export default function PlanScreen() {
  const colors = useThemeColors();
  const [showAllPlans, setShowAllPlans] = useState(false);
  
  // Debug: Let's see what services we're working with
  console.log('CURRENT_PLAN.services:', CURRENT_PLAN.services);
  const availableAddOns = getAvailableAddOns(CURRENT_PLAN.services);
  console.log('Available add-ons:', availableAddOns);
  
  const [addOns, setAddOns] = useState(availableAddOns);
  
  const nextTierPlan = getNextTierPlan(CURRENT_PLAN.name);
  
  const toggleAddOn = (id) => {
    setAddOns(addOns.map(addon => 
      addon.id === id ? { ...addon, selected: !addon.selected } : addon
    ));
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
    currentPlanCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 15,
      padding: 20,
      marginTop: 20,
      marginBottom: 20,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    planBadge: {
      backgroundColor: colors.accent,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      alignSelf: 'flex-start',
      marginBottom: 15,
    },
    planBadgeText: {
      color: colors.background,
      fontSize: 12,
      fontFamily: 'Inter-Bold',
      textTransform: 'uppercase',
    },
    planDetails: {
      marginBottom: 20,
    },
    planPrice: {
      fontSize: 26,
      fontFamily: 'Inter-Bold',
      color: colors.text,
    },
    pricePeriod: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.gray,
    },
    planDate: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.gray,
      marginTop: 5,
    },
    planServicesContainer: {
      marginBottom: 20,
    },
    sectionLabel: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginBottom: 10,
    },
    serviceItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    serviceIconGradient: {
      width: 16,
      height: 16,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    serviceTextContainer: {
      flex: 1,
      marginLeft: 10,
    },
    serviceName: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
    },
    serviceFrequency: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: colors.gray,
      marginTop: 2,
    },
    planAddOnsContainer: {
      marginBottom: 20,
    },
    addOnItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    addOnTextContainer: {
      flex: 1,
    },
    addOnName: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
    },
    addOnFrequency: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: colors.gray,
    },
    addOnPrice: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: colors.accent,
    },
    editButton: {
      borderRadius: 10,
      paddingVertical: 12,
      overflow: 'hidden',
    },
    primaryActionGradient: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
      flex: 1,
    },
    editButtonText: {
      color: colors.background,
      fontSize: 14,
      fontFamily: 'Inter-Bold',
      marginLeft: 10,
    },
    section: {
      marginBottom: 25,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      color: colors.text,
    },
    seeAllText: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: colors.accent,
    },
    plansContainer: {
      gap: 15,
    },
    planOption: {
      backgroundColor: colors.cardBackground,
      borderRadius: 15,
      padding: 15,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    currentPlanOption: {
      borderWidth: 2,
      borderColor: colors.accent,
    },
    planOptionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    planOptionName: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      color: colors.text,
    },
    currentLabel: {
      backgroundColor: colors.lightAccent,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 15,
    },
    currentLabelText: {
      fontSize: 12,
      fontFamily: 'Inter-SemiBold',
      color: colors.accent,
    },
    planOptionPrice: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: colors.text,
      marginBottom: 10,
    },
    planOptionFeatures: {
      marginBottom: 15,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    featureText: {
      marginLeft: 8,
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.text,
    },
    selectPlanButton: {
      borderRadius: 8,
      paddingVertical: 10,
      overflow: 'hidden',
    },
    selectPlanText: {
      color: colors.background,
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
    },
    addOnsContainer: {
      gap: 12,
      marginTop: 5,
    },
    addOnOption: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      borderRadius: 10,
      padding: 15,
      borderWidth: 1,
      borderColor: colors.border,
    },
    addOnSelected: {
      borderColor: colors.accent,
      backgroundColor: colors.lightAccent,
    },
    addOnContent: {
      flex: 1,
    },
    addOnOptionName: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
    },
    addOnOptionFrequency: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.gray,
      marginTop: 2,
    },
    addOnOptionPrice: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: colors.accent,
      marginTop: 5,
    },
    addOnCheckbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addOnCheckboxSelected: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    saveChangesButton: {
      borderRadius: 0,
      paddingVertical: 15,
      paddingHorizontal: 0,
      alignItems: 'center',
      marginTop: 20,
      overflow: 'hidden',
    },
    saveChangesText: {
      color: colors.background,
      fontSize: 16,
      fontFamily: 'Inter-Bold',
    },
    contactSupportButton: {
      paddingVertical: 15,
      alignItems: 'center',
      marginTop: 10,
    },
    contactSupportText: {
      color: colors.accent,
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      textDecorationLine: 'underline',
    },
    bottomPadding: {
      height: 30,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="My Plan" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Current Plan Section */}
        <View style={styles.currentPlanCard}>
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>{CURRENT_PLAN.name}</Text>
          </View>
          
          <View style={styles.planDetails}>
            <Text style={styles.planPrice}>{CURRENT_PLAN.price} <Text style={styles.pricePeriod}>/ month</Text></Text>
            <Text style={styles.planDate}>Started on {CURRENT_PLAN.startDate}</Text>
          </View>
          
          <View style={styles.planServicesContainer}>
            <Text style={styles.sectionLabel}>Included Services</Text>
            {CURRENT_PLAN.services.map((service, index) => (
              <View key={index} style={styles.serviceItem}>
                <LinearGradient
                  colors={[colors.accentGradientLight, colors.accentGradientDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.serviceIconGradient}
                >
                  <Check size={16} color={colors.background} />
                </LinearGradient>
                <View style={styles.serviceTextContainer}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceFrequency}>{service.frequency}</Text>
                </View>
              </View>
            ))}
          </View>
          
          <TouchableOpacity style={styles.editButton}>
            <LinearGradient
              colors={[colors.accentGradientLight, colors.accentGradientDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryActionGradient}
            >
              <Edit2 size={18} color={colors.background} />
              <Text style={styles.editButtonText}>Customize Plan</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        {/* Available Add-ons Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Add-ons</Text>
          
          <View style={styles.addOnsContainer}>
            {addOns.map((addon) => (
              <TouchableOpacity 
                key={addon.id}
                style={[
                  styles.addOnOption,
                  addon.selected && styles.addOnSelected
                ]}
                onPress={() => toggleAddOn(addon.id)}
              >
                <View style={styles.addOnContent}>
                  <Text style={styles.addOnOptionName}>{addon.name}</Text>
                  <Text style={styles.addOnOptionFrequency}>{addon.frequency}</Text>
                </View>
                
                <View style={[
                  styles.addOnCheckbox,
                  addon.selected && styles.addOnCheckboxSelected
                ]}>
                  {addon.selected && <Check size={14} color={colors.background} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity style={styles.saveChangesButton}>
            <LinearGradient
              colors={[colors.accentGradientLight, colors.accentGradientDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryActionGradient}
            >
              <Text style={styles.saveChangesText}>Save Changes</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        {/* Available Plans Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Plans</Text>
            <TouchableOpacity onPress={() => setShowAllPlans(!showAllPlans)}>
              <Text style={styles.seeAllText}>
                {showAllPlans ? 'Hide' : 'See all'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.plansContainer}>
            {showAllPlans ? (
              AVAILABLE_PLANS.filter(plan => !plan.current).map((plan, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.planOption}
                >
                  <View style={styles.planOptionHeader}>
                    <Text style={styles.planOptionName}>{plan.name}</Text>
                  </View>
                  
                  <Text style={styles.planOptionPrice}>{plan.price} <Text style={styles.pricePeriod}>/ month</Text></Text>
                  
                  <View style={styles.planOptionFeatures}>
                    {plan.features.map((feature, idx) => (
                      <View key={idx} style={styles.featureItem}>
                        <Check size={14} color={colors.accent} />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                  
                  <TouchableOpacity style={styles.selectPlanButton}>
                    <LinearGradient
                      colors={[colors.accentGradientLight, colors.accentGradientDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.primaryActionGradient}
                    >
                      <Text style={styles.selectPlanText}>Switch Plan</Text>
                      <ArrowRight size={14} color={colors.background} />
                    </LinearGradient>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            ) : (
              nextTierPlan && (
                <TouchableOpacity style={styles.planOption}>
                  <View style={styles.planOptionHeader}>
                    <Text style={styles.planOptionName}>{nextTierPlan.name}</Text>
                  </View>
                  
                  <Text style={styles.planOptionPrice}>{nextTierPlan.price} <Text style={styles.pricePeriod}>/ month</Text></Text>
                  
                  <View style={styles.planOptionFeatures}>
                    {nextTierPlan.features.map((feature, idx) => (
                      <View key={idx} style={styles.featureItem}>
                        <Check size={14} color={colors.accent} />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                  
                  <TouchableOpacity style={styles.selectPlanButton}>
                    <LinearGradient
                      colors={[colors.accentGradientLight, colors.accentGradientDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.primaryActionGradient}
                    >
                      <Text style={styles.selectPlanText}>Upgrade Plan</Text>
                      <ArrowRight size={14} color={colors.background} />
                    </LinearGradient>
                  </TouchableOpacity>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>
        
        {/* Contact Support Button */}
        <TouchableOpacity style={styles.contactSupportButton}>
          <Text style={styles.contactSupportText}>Contact Support for Custom Plans</Text>
        </TouchableOpacity>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}