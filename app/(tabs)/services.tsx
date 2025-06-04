import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  Switch,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Calendar, Clock, MapPin, MessageCircle, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '@/constants/Colors';
import Header from '@/components/ui/Header';
import { formatDate } from '@/utils/dateUtils';
import DateTimePickerModal from '@/components/ui/DateTimePickerModal';

// Mock data for services
const SERVICES = [
  { id: 1, name: 'Home Cleaning', selected: false },
  { id: 2, name: 'Window Cleaning', selected: false },
  { id: 3, name: 'Lawn & Garden', selected: false },
  { id: 4, name: 'Power Washing', selected: false },
  { id: 5, name: 'Solar Panel Cleaning', selected: false },
  { id: 6, name: 'Pool Maintenance', selected: false },
  { id: 7, name: 'HVAC Service', selected: false },
  { id: 8, name: 'Plumbing', selected: false },
  { id: 9, name: 'Electrical', selected: false },
];

export default function ServicesScreen() {
  const colors = useThemeColors();
  const [services, setServices] = useState(SERVICES);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const toggleService = (id) => {
    setServices(services.map(service => 
      service.id === id ? { ...service, selected: !service.selected } : service
    ));
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  const handleTimeChange = (time) => {
    setSelectedTime(time);
    setShowTimePicker(false);
  };

  const submitRequest = () => {
    const selectedServices = services.filter(service => service.selected);
    if (selectedServices.length === 0) {
      alert('Please select at least one service');
      return;
    }
    
    // Here you would send the request to your backend
    console.log({
      services: selectedServices,
      date: selectedDate,
      time: selectedTime,
      notes,
      urgent
    });
    
    // Success message
    alert('Service request submitted successfully!');
    
    // Reset form
    setServices(SERVICES);
    setSelectedDate(new Date());
    setSelectedTime(new Date());
    setNotes('');
    setUrgent(false);
  };

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
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="auto" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>Request Service</Text>
          
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
              
              <View style={styles.locationContainer}>
                <MapPin size={16} color={colors.gray} />
                <Text style={styles.locationText}>Main Residence</Text>
              </View>
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
          
          <TouchableOpacity style={styles.submitButton} onPress={submitRequest}>
            <LinearGradient
              colors={[colors.accentGradientLight, colors.accentGradientDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitButtonGradient}
            >
              <Text style={styles.submitButtonText}>Submit Request</Text>
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