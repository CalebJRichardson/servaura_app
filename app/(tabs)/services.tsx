import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Calendar, Clock, MapPin, MessageCircle, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '@/constants/Colors';
import Header from '@/components/ui/Header';
import { formatDate } from '@/utils/dateUtils';
import DateTimePickerModal from '@/components/ui/DateTimePickerModal';
import { useServices } from '@/app/_layout'; // Assuming you have a services context
import { useAddress } from '@/app/_layout';

// Service type definition
interface Service {
  id: string;
  name: string;
  category: string;
  price?: number;
  duration?: number;
  selected: boolean;
}

interface ServiceRequest {
  services: string[];
  date: Date;
  time: Date;
  addressId: string;
  notes: string;
  urgent: boolean;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export default function ServicesScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Get services and address contexts
  const { 
    services: availableServices,
    servicesLoading,
    servicesError,
    createServiceRequest,
    updateServiceRequest,
    getServiceRequestById
  } = useServices();

  const {
    addresses,
    addressesLoading,
    addressesError,
    getDefaultAddress
  } = useAddress();

  // Determine if we're editing an existing service request
  const requestId = params.id as string;
  const isEditing = !!requestId;
  const existingRequest = isEditing ? getServiceRequestById(requestId) : null;

  // State management
  const [services, setServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load available services and set up initial state
  useEffect(() => {
    if (availableServices && availableServices.length > 0) {
      setServices(availableServices.map(service => ({
        ...service,
        selected: false
      })));
    }
  }, [availableServices]);

  // Load existing service request data if editing
  useEffect(() => {
    if (isEditing && existingRequest) {
      setSelectedDate(new Date(existingRequest.date));
      setSelectedTime(new Date(existingRequest.time));
      setSelectedAddressId(existingRequest.addressId);
      setNotes(existingRequest.notes);
      setUrgent(existingRequest.urgent);
      
      // Update selected services
      setServices(prev => prev.map(service => ({
        ...service,
        selected: existingRequest.services.includes(service.id)
      })));
    }
  }, [isEditing, existingRequest]);

  // Set default address if not editing
  useEffect(() => {
    if (!isEditing && addresses && addresses.length > 0) {
      const defaultAddress = getDefaultAddress() || addresses[0];
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    }
  }, [isEditing, addresses, getDefaultAddress]);
  
  const toggleService = (id: string) => {
    setServices(prev => prev.map(service => 
      service.id === id ? { ...service, selected: !service.selected } : service
    ));
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  const handleTimeChange = (time: Date) => {
    setSelectedTime(time);
    setShowTimePicker(false);
  };

  const validateForm = (): boolean => {
    const selectedServices = services.filter(service => service.selected);
    
    if (selectedServices.length === 0) {
      Alert.alert('Error', 'Please select at least one service');
      return false;
    }

    if (!selectedAddressId) {
      Alert.alert('Error', 'Please select a service address');
      return false;
    }

    const now = new Date();
    const selectedDateTime = new Date(selectedDate);
    selectedDateTime.setHours(selectedTime.getHours(), selectedTime.getMinutes());

    if (selectedDateTime <= now) {
      Alert.alert('Error', 'Please select a future date and time');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      const selectedServiceIds = services
        .filter(service => service.selected)
        .map(service => service.id);

      const serviceRequestData: Omit<ServiceRequest, 'status'> = {
        services: selectedServiceIds,
        date: selectedDate,
        time: selectedTime,
        addressId: selectedAddressId,
        notes: notes.trim(),
        urgent
      };

      if (isEditing && requestId) {
        await updateServiceRequest(requestId, serviceRequestData);
        Alert.alert('Success', 'Service request updated successfully');
      } else {
        await createServiceRequest(serviceRequestData);
        Alert.alert('Success', 'Service request submitted successfully');
      }
      
      router.back();
    } catch (error) {
      console.error('Error saving service request:', error);
      Alert.alert('Error', 'Failed to save service request. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading state
  if (servicesLoading || addressesLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Header 
          title={isEditing ? "Edit Service Request" : "Request Service"} 
          onBack={() => router.back()} 
        />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading services...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (servicesError || addressesError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Header 
          title={isEditing ? "Edit Service Request" : "Request Service"} 
          onBack={() => router.back()} 
        />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.destructive }]}>
            {servicesError || addressesError}
          </Text>
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

  const selectedAddress = addresses?.find(addr => addr.id === selectedAddressId);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: 20,
    },
    pageTitle: {
      fontSize: 32,
      fontFamily: 'Inter-Bold',
      color: colors.accent,
      marginBottom: 30,
      marginTop: 20,
    },
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 22,
      fontFamily: 'Inter-Bold',
      color: colors.text,
      marginBottom: 20,
    },
    servicesContainer: {
      backgroundColor: colors.cardBackground,
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
    },
    servicesGrid: {
      gap: 12,
    },
    serviceItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    serviceItemDefault: {
      backgroundColor: colors.secondary,
    },
    serviceItemSelected: {
      overflow: 'hidden',
      borderColor: colors.accent,
    },
    serviceItemGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    serviceItemText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      zIndex: 1,
    },
    serviceItemTextSelected: {
      color: colors.background,
    },
    checkIcon: {
      opacity: 0,
      zIndex: 1,
    },
    checkIconVisible: {
      opacity: 1,
    },
    addressSelector: {
      backgroundColor: colors.cardBackground,
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
    },
    addressItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.secondary,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    addressText: {
      marginLeft: 12,
      fontSize: 16,
      fontFamily: 'Inter-Medium',
      color: colors.text,
      flex: 1,
    },
    addressSubText: {
      marginLeft: 12,
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.gray,
    },
    dateTimeContainer: {
      backgroundColor: colors.cardBackground,
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
    },
    dateTimeSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.secondary,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    dateTimeIcon: {
      marginRight: 12,
    },
    dateTimeText: {
      fontSize: 16,
      fontFamily: 'Inter-Medium',
      color: colors.text,
      flex: 1,
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 8,
    },
    locationText: {
      marginLeft: 12,
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.gray,
    },
    detailsContainer: {
      backgroundColor: colors.cardBackground,
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
    },
    textAreaContainer: {
      backgroundColor: colors.secondary,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      minHeight: 120,
    },
    textArea: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: colors.text,
      textAlignVertical: 'top',
      flex: 1,
    },
    urgentContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.secondary,
      borderRadius: 12,
      padding: 16,
    },
    urgentLabel: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
    },
    urgentDescription: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.gray,
      marginTop: 2,
    },
    urgentRight: {
      alignItems: 'flex-end',
    },
    submitButton: {
      borderRadius: 20,
      overflow: 'hidden',
      marginTop: 10,
      marginBottom: 40,
      opacity: isSaving ? 0.7 : 1,
    },
    submitButtonGradient: {
      padding: 20,
      alignItems: 'center',
    },
    submitButtonText: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      color: colors.background,
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
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="auto" />
      <Header 
        title={isEditing ? "Edit Service Request" : "Request Service"} 
        onBack={() => router.back()} 
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>
            {isEditing ? "Edit Request" : "Request Service"}
          </Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Services</Text>
            <View style={styles.servicesContainer}>
              <View style={styles.servicesGrid}>
                {services.map(service => (
                  <TouchableOpacity
                    key={service.id}
                    style={[
                      styles.serviceItem,
                      service.selected ? styles.serviceItemSelected : styles.serviceItemDefault
                    ]}
                    onPress={() => toggleService(service.id)}
                  >
                    {service.selected && (
                      <LinearGradient
                        colors={[colors.accentGradientLight, colors.accentGradientDark]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.serviceItemGradient}
                      />
                    )}
                    <Text style={[
                      styles.serviceItemText,
                      service.selected && styles.serviceItemTextSelected
                    ]}>
                      {service.name}
                    </Text>
                    <View style={[
                      styles.checkIcon,
                      service.selected && styles.checkIconVisible
                    ]}>
                      <Check 
                        size={20} 
                        color={service.selected ? colors.background : colors.text} 
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Address Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Address</Text>
            <View style={styles.addressSelector}>
              {selectedAddress && (
                <View style={styles.addressItem}>
                  <MapPin size={20} color={colors.accent} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.addressText}>
                      {selectedAddress.street}
                      {selectedAddress.apartment && `, ${selectedAddress.apartment}`}
                    </Text>
                    <Text style={styles.addressSubText}>
                      {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipCode}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Schedule</Text>
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity 
                style={styles.dateTimeSelector}
                onPress={() => setShowDatePicker(true)}
              >
                <Calendar size={20} color={colors.accent} style={styles.dateTimeIcon} />
                <Text style={styles.dateTimeText}>
                  {formatDate(selectedDate, 'MMMM d, yyyy')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.dateTimeSelector}
                onPress={() => setShowTimePicker(true)}
              >
                <Clock size={20} color={colors.accent} style={styles.dateTimeIcon} />
                <Text style={styles.dateTimeText}>
                  {formatDate(selectedTime, 'h:mm a')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Details</Text>
            <View style={styles.detailsContainer}>
              <View style={styles.textAreaContainer}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Specific requests or details about the service needed..."
                  placeholderTextColor={colors.lightGray}
                  multiline
                  value={notes}
                  onChangeText={setNotes}
                />
              </View>
              
              <View style={styles.urgentContainer}>
                <View>
                  <Text style={styles.urgentLabel}>Urgent Request</Text>
                  <Text style={styles.urgentDescription}>Priority scheduling</Text>
                </View>
                <View style={styles.urgentRight}>
                  <Switch
                    value={urgent}
                    onValueChange={setUrgent}
                    trackColor={{ false: colors.border, true: colors.lightAccent }}
                    thumbColor={urgent ? colors.accent : colors.lightGray}
                  />
                </View>
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleSubmit}
            disabled={isSaving}
          >
            <LinearGradient
              colors={[colors.accentGradientLight, colors.accentGradientDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitButtonGradient}
            >
              <Text style={styles.submitButtonText}>
                {isSaving 
                  ? 'Saving...' 
                  : isEditing 
                    ? 'Update Request' 
                    : 'Submit Request'
                }
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={handleDateChange}
        onCancel={() => setShowDatePicker(false)}
        date={selectedDate}
      />
      
      <DateTimePickerModal
        isVisible={showTimePicker}
        mode="time"
        onConfirm={handleTimeChange}
        onCancel={() => setShowTimePicker(false)}
        date={selectedTime}
      />
    </SafeAreaView>
  );
}