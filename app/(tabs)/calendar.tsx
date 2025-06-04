import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar as CalendarComponent } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, User, Clock, MoreHorizontal, ChevronLeft, ChevronRight, Search, X } from 'lucide-react-native';
import { useThemeColors } from '@/constants/Colors';
import { formatDate } from '@/utils/dateUtils';

const { width } = Dimensions.get('window');

// Mock data for scheduled services
const MOCK_SERVICES = {
  '2025-05-23': [
    {
      id: '1',
      type: 'Home Cleaning',
      location: 'Main Residence',
      provider: 'Jane Smith',
      time: '10:00',
      status: 'confirmed',
    },
    {
      id: '2',
      type: 'Maintenance Check',
      location: 'Main Residence',
      provider: 'Tech Solutions',
      time: '14:30',
      status: 'confirmed',
    }
  ],
  '2025-05-15': [
    {
      id: '3',
      type: 'Home Cleaning',
      location: 'Main Residence',
      provider: 'Jane Smith',
      time: '09:00',
      status: 'confirmed',
    }
  ],
  '2025-05-20': [
    {
      id: '4',
      type: 'Lawn Maintenance',
      location: 'Main Residence',
      provider: 'Green Landscaping',
      time: '08:00',
      status: 'confirmed',
    }
  ],
  '2025-05-28': [
    {
      id: '5',
      type: 'Window Cleaning',
      location: 'Main Residence',
      provider: 'Crystal Clear Services',
      time: '11:00',
      status: 'confirmed',
    }
  ]
};

export default function CalendarScreen() {
  const colors = useThemeColors();
  
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Create markedDates dynamically to always use current theme colors
  const markedDates = React.useMemo(() => {
    const dates = {};
    
    // Mark dates that have services
    Object.keys(MOCK_SERVICES).forEach(date => {
      dates[date] = { marked: true, dotColor: colors.accent };
    });
    
    // Mark selected date
    dates[selectedDate] = {
      ...dates[selectedDate],
      selected: true,
      selectedColor: colors.accent,
      selectedTextColor: colors.background,
    };
    
    return dates;
  }, [colors.accent, colors.background, selectedDate]);

  const handleDateSelect = (day) => {
    const selected = day.dateString;    
    setSelectedDate(selected);
  };

  const eventsForSelectedDate = MOCK_SERVICES[selectedDate] || [];
  const isToday = selectedDate === formatDate(new Date());
  
  const handleReschedule = (serviceId) => {
    console.log(`Reschedule service ${serviceId}`);
  };

  const getCurrentMonth = () => {
    return currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
  };

  const getDisplayTitle = () => {
    if (isToday) {
      return 'TODAY';
    }
    // Parse the date string properly to avoid timezone issues
    const [year, month, day] = selectedDate.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    }).toUpperCase();
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const getFilteredServices = () => {
    if (!searchQuery) return eventsForSelectedDate;
    
    return eventsForSelectedDate.filter(service =>
      service.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getAllServices = () => {
    if (!searchQuery) return {};
    
    const filtered = {};
    Object.keys(MOCK_SERVICES).forEach(date => {
      const services = MOCK_SERVICES[date].filter(service =>
        service.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (services.length > 0) {
        filtered[date] = services;
      }
    });
    return filtered;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    gradientContainer: {
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      borderBottomLeftRadius: 25,
      borderBottomRightRadius: 25,
      borderWidth: 2,
      overflow: 'hidden',
      marginHorizontal: 10,
      marginTop: 10,
      backgroundColor: colors.background,
    },
    gradientBorder: {
      padding: 2,
      borderRadius: 25,
    },
    gradientInner: {
      borderRadius: 23,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 10,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    monthNavigation: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    monthTitle: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      color: colors.accent,
      marginHorizontal: 15,
    },
    navButton: {
      padding: 5,
    },
    searchButton: {
      padding: 5,
    },
    calendarContainer: {
      paddingHorizontal: 10,
      paddingBottom: 20,
    },
    bottomSection: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 20,
    },
    todaySection: {
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    todayHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    todayTitle: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: colors.accent,
    },
    activityCount: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: colors.gray,
      marginTop: 2,
    },
    seeAllText: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.gray,
    },
    serviceCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 20,
      marginBottom: 12,
      marginHorizontal: 20,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    serviceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    serviceLeft: {
      flex: 1,
    },
    serviceType: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: colors.accent,
      marginBottom: 4,
    },
    serviceTime: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    serviceIconGradient: {
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    timeText: {
      fontSize: 14,
      color: colors.gray,
      fontFamily: 'Inter-Regular',
      marginLeft: 8,
    },
    serviceDetail: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    serviceDetailText: {
      marginLeft: 8,
      fontSize: 14,
      color: colors.gray,
      fontFamily: 'Inter-Regular',
    },
    moreButton: {
      padding: 4,
    },
    progressBar: {
      height: 4,
      backgroundColor: colors.lightGray,
      borderRadius: 2,
      marginTop: 12,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 2,
    },
    noServicesContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    noServicesText: {
      fontSize: 16,
      color: colors.gray,
      fontFamily: 'Inter-Regular',
      textAlign: 'center',
    },
    // Search Modal Styles
    searchOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-start',
      paddingTop: 100,
    },
    searchModal: {
      backgroundColor: colors.background,
      margin: 20,
      borderRadius: 20,
      maxHeight: '80%',
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 25,
      elevation: 10,
    },
    searchHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.lightGray,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: colors.text,
      paddingVertical: 10,
      paddingHorizontal: 15,
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
    },
    closeButton: {
      marginLeft: 15,
      padding: 5,
    },
    searchResults: {
      maxHeight: 400,
    },
    searchDateHeader: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: colors.accent,
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: colors.lightGray,
    },
    searchResultItem: {
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.lightGray,
    },
    searchResultType: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginBottom: 4,
    },
    searchResultDetail: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.gray,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[colors.accentGradientLight, colors.accentGradientDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradientBorder, { marginHorizontal: 10, marginTop: 10, borderRadius: 25 }]}
      >
        <View style={styles.gradientInner}>
          <View style={styles.header}>
            <View style={styles.monthNavigation}>
              <TouchableOpacity 
                style={styles.navButton}
                onPress={() => navigateMonth(-1)}
              >
                <ChevronLeft size={24} color={colors.accent} />
              </TouchableOpacity>
              <Text style={styles.monthTitle}>{getCurrentMonth()}</Text>
              <TouchableOpacity 
                style={styles.navButton}
                onPress={() => navigateMonth(1)}
              >
                <ChevronRight size={24} color={colors.accent} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.headerRight}>
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}></Text>
              </View>
              <TouchableOpacity 
                style={styles.searchButton}
                onPress={() => setSearchVisible(true)}
              >
                <Search size={24} color={colors.accent} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.calendarContainer}>
            <CalendarComponent
              key={`${currentMonth.getFullYear()}-${currentMonth.getMonth()}-${colors.accent}-${colors.background}`}
              current={currentMonth.toISOString().split('T')[0]}
              markedDates={markedDates}
              onDayPress={handleDateSelect}
              onMonthChange={(month) => {
                const [year, monthNum, day] = month.dateString.split('-').map(Number);
                setCurrentMonth(new Date(year, monthNum - 1, day));
              }}
              hideExtraDays={true}
              firstDay={0}
              theme={{
                calendarBackground: 'transparent',
                textSectionTitleColor: colors.text,
                textSectionTitleDisabledColor: colors.gray,
                selectedDayBackgroundColor: colors.accent,
                selectedDayTextColor: colors.background,
                todayTextColor: colors.accent,
                dayTextColor: colors.text,
                textDisabledColor: colors.gray,
                dotColor: colors.accent,
                selectedDotColor: colors.background,
                arrowColor: colors.accent,
                disabledArrowColor: colors.gray,
                monthTextColor: colors.text,
                indicatorColor: colors.accent,
                textDayFontFamily: 'Inter-Regular',
                textMonthFontFamily: 'Inter-Bold',
                textDayHeaderFontFamily: 'Inter-SemiBold',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 12,
              }}
            />
          </View>
        </View>
      </LinearGradient>
      
      <View style={styles.bottomSection}>
        <View style={styles.todaySection}>
          <View style={styles.todayHeader}>
            <View>
              <Text style={styles.todayTitle}>
                {getDisplayTitle()}
              </Text>
              <Text style={styles.activityCount}>
                {eventsForSelectedDate.length} {eventsForSelectedDate.length === 1 ? 'Activity' : 'Activities'}
              </Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          {getFilteredServices().length > 0 ? (
            getFilteredServices().map((service, index) => (
              <View key={service.id} style={styles.serviceCard}>
                <View style={styles.serviceHeader}>
                  <View style={styles.serviceLeft}>
                    <Text style={styles.serviceType}>{service.type}</Text>
                    
                    <View style={styles.serviceTime}>
                      <LinearGradient
                        colors={[colors.accentGradientLight, colors.accentGradientDark]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.serviceIconGradient}
                      >
                        <Clock size={16} color={colors.background} />
                      </LinearGradient>
                      <Text style={styles.timeText}>{service.time}</Text>
                    </View>
                    
                    <View style={styles.serviceDetail}>
                      <Text style={styles.serviceDetailText}>{service.location}</Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity style={styles.moreButton}>
                    <MoreHorizontal size={20} color={colors.gray} />
                  </TouchableOpacity>
                </View>
                
                <View style={[styles.progressBar, { backgroundColor: colors.lightAccent }]}>
                  <View style={[styles.progressFill, { backgroundColor: colors.accent, width: '100%' }]} />
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noServicesContainer}>
              <Text style={styles.noServicesText}>
                {searchQuery ? 'No services found matching your search' : 'No services scheduled for this date'}
              </Text>
            </View>
          )}
        </ScrollView>
        
        {/* Search Modal */}
        <Modal
          visible={searchVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {
            setSearchVisible(false);
            setSearchQuery('');
          }}
        >
          <View style={styles.searchOverlay}>
            <View style={styles.searchModal}>
              <View style={styles.searchHeader}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search services..."
                  placeholderTextColor={colors.gray}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus={true}
                />
                <TouchableOpacity 
                  onPress={() => {
                    setSearchVisible(false);
                    setSearchQuery('');
                  }}
                  style={styles.closeButton}
                >
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.searchResults}>
                {searchQuery ? (
                  Object.keys(getAllServices()).length > 0 ? (
                    Object.keys(getAllServices()).map(date => (
                      <View key={date}>
                        <Text style={styles.searchDateHeader}>
                          {new Date(date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </Text>
                        {getAllServices()[date].map(service => (
                          <TouchableOpacity
                            key={service.id}
                            style={styles.searchResultItem}
                            onPress={() => {
                              // Parse date properly to avoid timezone issues
                              const [year, month, day] = date.split('-').map(Number);
                              const properDate = new Date(year, month - 1, day);
                              setSelectedDate(date);
                              handleDateSelect({ dateString: date });
                              setSearchVisible(false);
                              setSearchQuery('');
                            }}
                          >
                            <Text style={styles.searchResultType}>{service.type}</Text>
                            <Text style={styles.searchResultDetail}>{service.provider} • {service.time}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ))
                  ) : (
                    <View style={styles.noServicesContainer}>
                      <Text style={styles.noServicesText}>No services found matching "{searchQuery}"</Text>
                    </View>
                  )
                ) : (
                  <View style={styles.noServicesContainer}>
                    <Text style={styles.noServicesText}>Start typing to search services...</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}