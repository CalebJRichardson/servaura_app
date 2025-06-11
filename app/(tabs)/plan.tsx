import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, Check, CreditCard as Edit2, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/constants/Colors';
import Header from '@/components/ui/Header';
import { usePlan } from '@/app/_layout'; // Assuming similar context pattern

// Types for better type safety
interface PlanService {
  name: string;
  frequency: string;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  billing: string;
  startDate?: string;
  services: PlanService[];
  features?: string[];
  current?: boolean;
}

interface AddOnService {
  id: number;
  name: string;
  frequency: string;
  price: string;
  selected: boolean;
}

// All available services in order
const ALL_SERVICES = [
  { id: 1, name: 'Home Cleaning', frequency: 'Weekly', price: '$29.99' },
  { id: 2, name: 'Window Cleaning', frequency: 'Quarterly', price: '$19.99' },
  { id: 3, name: 'Lawn & Garden', frequency: 'Bi-weekly', price: '$39.99' },
  { id: 4, name: 'Power Washing', frequency: 'Annual', price: '$49.99' },
  { id: 5, name: 'Solar Panel Cleaning', frequency: 'Quarterly', price: '$24.99' },
  { id: 6, name: 'Pool Cleaning', frequency: 'Weekly', price: '$34.99' },
  { id: 7, name: 'HVAC Services', frequency: 'Quarterly', price: '$44.99' },
  { id: 8, name: 'Plumbing', frequency: 'As needed', price: '$59.99' },
  { id: 9, name: 'Electrical', frequency: 'As needed', price: '$54.99' },
];

// Function to get available add-ons based on current plan
const getAvailableAddOns = (currentPlanServices: PlanService[]): AddOnService[] => {
  const includedServices = new Set<string>();
  
  currentPlanServices.forEach(service => {
    const serviceName = service.name.toLowerCase();
    
    if (serviceName.includes('cleaning') && serviceName.includes('home')) {
      includedServices.add('Home Cleaning');
    }
    if (serviceName.includes('window')) {
      includedServices.add('Window Cleaning');
    }
    if (serviceName.includes('lawn') || serviceName.includes('garden')) {
      includedServices.add('Lawn & Garden');
    }
    if (serviceName.includes('power') && serviceName.includes('washing')) {
      includedServices.add('Power Washing');
    }
    if (serviceName.includes('solar')) {
      includedServices.add('Solar Panel Cleaning');
    }
    if (serviceName.includes('pool')) {
      includedServices.add('Pool Cleaning');
    }
    if (serviceName.includes('hvac')) {
      includedServices.add('HVAC Services');
    }
    if (serviceName.includes('plumbing')) {
      includedServices.add('Plumbing');
    }
    if (serviceName.includes('electrical')) {
      includedServices.add('Electrical');
    }
  });
  
  return ALL_SERVICES
    .filter(service => !includedServices.has(service.name))
    .slice(0, 3)
    .map(service => ({
      ...service,
      selected: false
    }));
};

const getNextTierPlan = (currentPlanName: string, availablePlans: Plan[]): Plan | null => {
  const planOrder = ['Basic', 'Standard', 'Premium', 'Luxury'];
  const currentIndex = planOrder.indexOf(currentPlanName);
  
  if (currentIndex === -1 || currentIndex === planOrder.length - 1) {
    return null;
  }
  
  return availablePlans.find(plan => plan.name === planOrder[currentIndex + 1]) || null;
};

export default function PlanScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  
  // Get plan context - following the same pattern as address.tsx
  const { 
    currentPlan,
    availablePlans,
    planLoading,
    planError,
    updatePlan,
    addPlanAddOns,
    switchPlan,
    refreshPlan
  } = usePlan();

  const [showAllPlans, setShowAllPlans] = useState(false);
  const [addOns, setAddOns] = useState<AddOnService[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isPlanSwitching, setIsPlanSwitching] = useState(false);

  // Initialize add-ons when current plan loads
  useEffect(() => {
    if (currentPlan?.services) {
      const availableAddOns = getAvailableAddOns(currentPlan.services);
      setAddOns(availableAddOns);
    }
  }, [currentPlan]);

  const nextTierPlan = currentPlan && availablePlans 
    ? getNextTierPlan(currentPlan.name, availablePlans) 
    : null;
  
  const toggleAddOn = (id: number) => {
    setAddOns(addOns.map(addon => 
      addon.id === id ? { ...addon, selected: !addon.selected } : addon
    ));
  };

  const handleSaveAddOns = async () => {
    const selectedAddOns = addOns.filter(addon => addon.selected);
    
    if (selectedAddOns.length === 0) {
      Alert.alert('No Changes', 'Please select at least one add-on to save changes.');
      return;
    }

    setIsSaving(true);

    try {
      await addPlanAddOns(selectedAddOns.map(addon => ({
        serviceId: addon.id,
        name: addon.name,
        frequency: addon.frequency,
        price: addon.price
      })));
      
      Alert.alert('Success', 'Add-ons have been added to your plan successfully!');
      
      // Reset selections after successful save
      setAddOns(addOns.map(addon => ({ ...addon, selected: false })));
    } catch (error) {
      console.error('Error saving add-ons:', error);
      Alert.alert('Error', 'Failed to save add-ons. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSwitchPlan = async (planId: string) => {
    Alert.alert(
      'Switch Plan',
      'Are you sure you want to switch to this plan? Changes will take effect immediately.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Switch Plan', 
          style: 'default',
          onPress: async () => {
            setIsPlanSwitching(true);
            try {
              await switchPlan(planId);
              Alert.alert('Success', 'Your plan has been updated successfully!');
            } catch (error) {
              console.error('Error switching plan:', error);
              Alert.alert('Error', 'Failed to switch plan. Please try again.');
            } finally {
              setIsPlanSwitching(false);
            }
          }
        }
      ]
    );
  };

  const handleCustomizePlan = () => {
    router.push('/plan/customize');
  };

  const handleContactSupport = () => {
    router.push('/support');
  };

  // Show loading state
  if (planLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Header title="My Plan" />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading your plan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (planError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Header title="My Plan" />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.destructive }]}>{planError}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.accent }]}
            onPress={refreshPlan}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Show empty state if no current plan
  if (!currentPlan) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Header title="My Plan" />
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>No active plan found</Text>
          <TouchableOpacity 
            style={[styles.browsePlansButton, { backgroundColor: colors.accent }]}
            onPress={() => router.push('/plans')}
          >
            <Text style={styles.browsePlansButtonText}>Browse Plans</Text>
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
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    emptyText: {
      fontSize: 18,
      fontFamily: 'Inter-Regular',
      textAlign: 'center',
      marginBottom: 20,
    },
    browsePlansButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 10,
    },
    browsePlansButtonText: {
      color: '#fff',
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
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
    editButton: {
      borderRadius: 10,
      paddingVertical: 12,
      overflow: 'hidden',
      opacity: isPlanSwitching ? 0.7 : 1,
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
      opacity: isPlanSwitching ? 0.7 : 1,
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
      borderRadius: 10,
      paddingVertical: 15,
      paddingHorizontal: 0,
      alignItems: 'center',
      marginTop: 20,
      overflow: 'hidden',
      opacity: isSaving ? 0.7 : 1,
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
            <Text style={styles.planBadgeText}>{currentPlan.name}</Text>
          </View>
          
          <View style={styles.planDetails}>
            <Text style={styles.planPrice}>{currentPlan.price} <Text style={styles.pricePeriod}>/ {currentPlan.billing}</Text></Text>
            {currentPlan.startDate && (
              <Text style={styles.planDate}>Started on {currentPlan.startDate}</Text>
            )}
          </View>
          
          <View style={styles.planServicesContainer}>
            <Text style={styles.sectionLabel}>Included Services</Text>
            {currentPlan.services.map((service, index) => (
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
          
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleCustomizePlan}
            disabled={isPlanSwitching}
          >
            <LinearGradient
              colors={[colors.accentGradientLight, colors.accentGradientDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryActionGradient}
            >
              <Edit2 size={18} color={colors.background} />
              <Text style={styles.editButtonText}>
                {isPlanSwitching ? 'Updating...' : 'Customize Plan'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        {/* Available Add-ons Section */}
        {addOns.length > 0 && (
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
                  disabled={isSaving}
                >
                  <View style={styles.addOnContent}>
                    <Text style={styles.addOnOptionName}>{addon.name}</Text>
                    <Text style={styles.addOnOptionFrequency}>{addon.frequency}</Text>
                    <Text style={styles.addOnOptionPrice}>{addon.price}/month</Text>
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
            
            <TouchableOpacity 
              style={styles.saveChangesButton}
              onPress={handleSaveAddOns}
              disabled={isSaving}
            >
              <LinearGradient
                colors={[colors.accentGradientLight, colors.accentGradientDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryActionGradient}
              >
                <Text style={styles.saveChangesText}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Available Plans Section */}
        {availablePlans && availablePlans.length > 0 && (
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
                availablePlans.filter(plan => !plan.current).map((plan) => (
                  <TouchableOpacity 
                    key={plan.id} 
                    style={styles.planOption}
                    onPress={() => handleSwitchPlan(plan.id)}
                    disabled={isPlanSwitching}
                  >
                    <View style={styles.planOptionHeader}>
                      <Text style={styles.planOptionName}>{plan.name}</Text>
                    </View>
                    
                    <Text style={styles.planOptionPrice}>{plan.price} <Text style={styles.pricePeriod}>/ month</Text></Text>
                    
                    {plan.features && (
                      <View style={styles.planOptionFeatures}>
                        {plan.features.map((feature, idx) => (
                          <View key={idx} style={styles.featureItem}>
                            <Check size={14} color={colors.accent} />
                            <Text style={styles.featureText}>{feature}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    
                    <TouchableOpacity 
                      style={styles.selectPlanButton}
                      disabled={isPlanSwitching}
                    >
                      <LinearGradient
                        colors={[colors.accentGradientLight, colors.accentGradientDark]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.primaryActionGradient}
                      >
                        <Text style={styles.selectPlanText}>
                          {isPlanSwitching ? 'Switching...' : 'Switch Plan'}
                        </Text>
                        {!isPlanSwitching && <ArrowRight size={14} color={colors.background} />}
                      </LinearGradient>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
              ) : (
                nextTierPlan && (
                  <TouchableOpacity 
                    style={styles.planOption}
                    onPress={() => handleSwitchPlan(nextTierPlan.id)}
                    disabled={isPlanSwitching}
                  >
                    <View style={styles.planOptionHeader}>
                      <Text style={styles.planOptionName}>{nextTierPlan.name}</Text>
                    </View>
                    
                    <Text style={styles.planOptionPrice}>{nextTierPlan.price} <Text style={styles.pricePeriod}>/ month</Text></Text>
                    
                    {nextTierPlan.features && (
                      <View style={styles.planOptionFeatures}>
                        {nextTierPlan.features.map((feature, idx) => (
                          <View key={idx} style={styles.featureItem}>
                            <Check size={14} color={colors.accent} />
                            <Text style={styles.featureText}>{feature}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    
                    <TouchableOpacity 
                      style={styles.selectPlanButton}
                      disabled={isPlanSwitching}
                    >
                      <LinearGradient
                        colors={[colors.accentGradientLight, colors.accentGradientDark]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.primaryActionGradient}
                      >
                        <Text style={styles.selectPlanText}>
                          {isPlanSwitching ? 'Upgrading...' : 'Upgrade Plan'}
                        </Text>
                        {!isPlanSwitching && <ArrowRight size={14} color={colors.background} />}
                      </LinearGradient>
                    </TouchableOpacity>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>
        )}
        
        {/* Contact Support Button */}
        <TouchableOpacity 
          style={styles.contactSupportButton}
          onPress={handleContactSupport}
        >
          <Text style={styles.contactSupportText}>Contact Support for Custom Plans</Text>
        </TouchableOpacity>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}