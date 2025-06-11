import { useEffect, createContext, useContext, useState, ReactNode } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/contexts/AuthContext';
import { SplashScreen } from 'expo-router';
import { useThemeColors } from '@/constants/Colors';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// =============================================================================
// CORE TYPES
// =============================================================================

interface Address {
  id: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  type?: 'home' | 'work';
  isDefault?: boolean;
}

interface PersonalInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface PaymentMethod {
  id: string;
  type: 'Visa' | 'Mastercard' | 'American Express' | 'Discover';
  last4: string;
  expiry: string;
  isDefault: boolean;
  holderName?: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  addresses: Address[];
  preferences: {
    defaultAddressId?: string;
    notifications: boolean;
    theme: 'auto' | 'light' | 'dark';
  };
}

interface ProfileSettings {
  id: string;
  userId: string;
  notificationsEnabled: boolean;
  language: string;
  };
}

// =============================================================================
// SERVICE TYPES
// =============================================================================

interface Service {
  id: number;
  name: string;
  description?: string;
  category: string;
  basePrice?: number;
  duration?: number; // in minutes
  isActive: boolean;
  selected?: boolean;
}

interface ServiceRequest {
  id: string;
  userId: string;
  services: Service[];
  scheduledDate: Date;
  scheduledTime: Date;
  notes?: string;
  urgent: boolean;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  addressId: string;
  totalAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ServiceBooking {
  id: string;
  requestId?: string;
  providerId?: string;
  type: string;
  date: string;
  time: string;
  status: 'Scheduled' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
  location: string;
  notes?: string;
  estimatedDuration?: number;
  confirmedDate?: Date;
  confirmedTime?: Date;
}

interface ServiceHistory {
  id: string;
  type: string;
  date: string;
  time: string;
  status: 'Completed' | 'Cancelled';
  rating?: number;
  review?: string;
}

// =============================================================================
// SUBSCRIPTION & PLAN TYPES
// =============================================================================

interface PlanService {
  name: string;
  frequency: string;
  included: boolean;
  price?: number;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billing: 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  status: 'active' | 'cancelled' | 'expired';
  services: PlanService[];
  features: string[];
}

interface AvailableService {
  id: string;
  name: string;
  frequency: string;
  basePrice: number;
  description?: string;
  category: string;
}

// =============================================================================
// CALENDAR TYPES
// =============================================================================

interface CalendarService {
  id: string;
  type: string;
  location: string;
  provider: string;
  time: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  date: string; // YYYY-MM-DD format
  description?: string;
  estimatedDuration?: number; // in minutes
  notes?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD format
  startTime: string;
  endTime?: string;
  type: 'service' | 'appointment' | 'reminder' | 'personal';
  location?: string;
  description?: string;
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

// =============================================================================
// SECURITY TYPES
// =============================================================================

interface TrustedDevice {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  lastUsed: string;
  ipAddress: string;
  trusted: boolean;
}

interface SecuritySettings {
  id: string;
  userId: string;
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  passwordLastChanged: string;
  loginAttempts: number;
  trustedDevices: TrustedDevice[];
}

interface LoginSession {
  id: string;
  userId: string;
  sessionToken: string;
  deviceInfo: string;
  ipAddress: string;
  loginTime: string;
  lastActivity: string;
  isActive: boolean;
}

interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// =============================================================================
// CONTEXT TYPES
// =============================================================================

interface AddressContextType {
  // User profile data
  userProfile: UserProfile | null;
  userProfileLoading: boolean;
  userProfileError: string | null;
  
  // Address management
  addresses: Address[];
  addressesLoading: boolean;
  addressesError: string | null;
  
  // Methods
  fetchUserProfile: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  
  // Address methods
  fetchAddresses: () => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  updateAddress: (id: string, updates: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  getAddressById: (id: string) => Address | undefined;
  setDefaultAddress: (id: string) => Promise<void>;
  
  refreshData: () => Promise<void>;
}

interface PersonalInfoContextType {
  personalInfo: PersonalInfo | null;
  personalInfoLoading: boolean;
  personalInfoError: string | null;
  
  // Methods
  fetchPersonalInfo: () => Promise<void>;
  updatePersonalInfo: (data: Partial<PersonalInfo>) => Promise<void>;
  updateProfileImage: (imageUri: string) => Promise<void>;
}

interface PaymentContextType {
  paymentMethods: PaymentMethod[];
  paymentMethodsLoading: boolean;
  paymentMethodsError: string | null;
  
  // Methods
  fetchPaymentMethods: () => Promise<void>;
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => Promise<void>;
  updatePaymentMethod: (id: string, updates: Partial<PaymentMethod>) => Promise<void>;
  deletePaymentMethod: (id: string) => Promise<void>;
  setDefaultPaymentMethod: (id: string) => Promise<void>;
  getPaymentMethodById: (id: string) => PaymentMethod | undefined;
}

interface ProfileContextType {
  // Profile data
  userProfile: UserProfileComplete | null;
  profileLoading: boolean;
  profileError: string | null;
  
  // Profile settings
  profileSettings: ProfileSettings | null;
  settingsLoading: boolean;
  settingsError: string | null;
  
  // Methods
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfileComplete>) => Promise<void>;
  updateProfileImage: (imageUri: string) => Promise<void>;
  
  // Settings methods
  fetchProfileSettings: () => Promise<void>;
  updateProfileSettings: (settings: Partial<ProfileSettings>) => Promise<void>;
  toggleNotifications: (enabled: boolean) => Promise<void>;
  updateTheme: (theme: 'auto' | 'light' | 'dark') => Promise<void>;
  
  refreshProfileData: () => Promise<void>;
}

interface ServicesContextType {
  // Available services
  availableServices: Service[];
  servicesLoading: boolean;
  servicesError: string | null;
  
  // Service requests
  serviceRequests: ServiceRequest[];
  requestsLoading: boolean;
  requestsError: string | null;
  
  // Service bookings
  serviceBookings: ServiceBooking[];
  bookingsLoading: boolean;
  bookingsError: string | null;
  
  // Methods
  fetchAvailableServices: () => Promise<void>;
  fetchServiceRequests: () => Promise<void>;
  fetchServiceBookings: () => Promise<void>;
  
  // Request management
  submitServiceRequest: (request: Omit<ServiceRequest, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<ServiceRequest>;
  updateServiceRequest: (id: string, updates: Partial<ServiceRequest>) => Promise<void>;
  cancelServiceRequest: (id: string) => Promise<void>;
  
  // Booking management
  confirmBooking: (requestId: string, providerId: string, confirmedDate: Date, confirmedTime: Date) => Promise<void>;
  rescheduleBooking: (bookingId: string, newDate: Date, newTime: Date) => Promise<void>;
  completeBooking: (bookingId: string, completionData: Partial<ServiceBooking>) => Promise<void>;
  
  // Utility methods
  getRequestById: (id: string) => ServiceRequest | undefined;
  getBookingById: (id: string) => ServiceBooking | undefined;
  getRequestsByStatus: (status: ServiceRequest['status']) => ServiceRequest[];
  
  refreshServicesData: () => Promise<void>;
}

interface PlansContextType {
  // Current plan
  currentPlan: SubscriptionPlan | null;
  availablePlans: SubscriptionPlan[];
  availableServices: AvailableService[];
  plansLoading: boolean;
  plansError: string | null;
  
  // Methods
  fetchCurrentPlan: () => Promise<void>;
  fetchAvailablePlans: () => Promise<void>;
  fetchAvailableServices: () => Promise<void>;
  switchPlan: (planId: string) => Promise<void>;
  addServiceToPlan: (serviceId: string) => Promise<void>;
  removeServiceFromPlan: (serviceId: string) => Promise<void>;
  cancelPlan: () => Promise<void>;
  upgradePlan: (planId: string) => Promise<void>;
  getAvailableAddOns: () => AvailableService[];
}

interface CalendarContextType {
  // Services data
  services: { [date: string]: CalendarService[] };
  servicesLoading: boolean;
  servicesError: string | null;
  
  // Events data
  events: { [date: string]: CalendarEvent[] };
  eventsLoading: boolean;
  eventsError: string | null;
  
  // Current selection
  selectedDate: string;
  currentMonth: Date;
  
  // Methods - Services
  fetchServices: (startDate?: string, endDate?: string) => Promise<void>;
  addService: (service: Omit<CalendarService, 'id'>) => Promise<void>;
  updateService: (id: string, updates: Partial<CalendarService>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  rescheduleService: (id: string, newDate: string, newTime: string) => Promise<void>;
  getServicesForDate: (date: string) => CalendarService[];
  
  // Methods - Events
  fetchEvents: (startDate?: string, endDate?: string) => Promise<void>;
  addEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  getEventsForDate: (date: string) => CalendarEvent[];
  
  // Navigation methods
  setSelectedDate: (date: string) => void;
  setCurrentMonth: (month: Date) => void;
  
  // Utility methods
  getMarkedDates: () => { [date: string]: any };
  searchServices: (query: string) => { [date: string]: CalendarService[] };
  refreshCalendarData: () => Promise<void>;
}

interface SecurityContextType {
  // Security settings
  securitySettings: SecuritySettings | null;
  securityLoading: boolean;
  securityError: string | null;
  
  // Login sessions
  loginSessions: LoginSession[];
  sessionsLoading: boolean;
  sessionsError: string | null;
  
  // Methods
  fetchSecuritySettings: () => Promise<void>;
  updateSecuritySettings: (settings: Partial<SecuritySettings>) => Promise<void>;
  enableTwoFactor: () => Promise<void>;
  disableTwoFactor: () => Promise<void>;
  enableBiometric: () => Promise<void>;
  disableBiometric: () => Promise<void>;
  changePassword: (request: PasswordChangeRequest) => Promise<void>;
  
  // Session management
  fetchLoginSessions: () => Promise<void>;
  terminateSession: (sessionId: string) => Promise<void>;
  terminateAllSessions: () => Promise<void>;
  
  // Device management
  addTrustedDevice: (device: Omit<TrustedDevice, 'id'>) => Promise<void>;
  removeTrustedDevice: (deviceId: string) => Promise<void>;
  
  refreshSecurityData: () => Promise<void>;
}

interface AuthContextType {
  // Auth state
  isAuthenticated: boolean;
  user: any; // Replace with your user type
  isLoading: boolean;
  error: string | null;
  
  // Auth methods
  login: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshToken: () => Promise<void>;
}

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  role: string;
  profileImage?: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

// =============================================================================
// CONTEXT CREATION
// =============================================================================

const AddressContext = createContext<AddressContextType | undefined>(undefined);
const PersonalInfoContext = createContext<PersonalInfoContextType | undefined>(undefined);
const PaymentContext = createContext<PaymentContextType | undefined>(undefined);
const ProfileContext = createContext<ProfileContextType | undefined>(undefined);
const ServicesContext = createContext<ServicesContextType | undefined>(undefined);
const PlansContext = createContext<PlansContextType | undefined>(undefined);
const CalendarContext = createContext<CalendarContextType | undefined>(undefined);
const SecurityContext = createContext<SecurityContextType | undefined>(undefined);
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Personal Info Provider Component
const PersonalInfoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [personalInfoLoading, setPersonalInfoLoading] = useState(true);
  const [personalInfoError, setPersonalInfoError] = useState<string | null>(null);

  const API_BASE_URL = 'https://servaura-api.onrender.com';

  // Mock data fallback
  const getMockPersonalInfo = (): PersonalInfo => ({
    id: 'user_1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    profileImage: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'
  });

  // Fetch personal info function
  const fetchPersonalInfo = async () => {
    try {
      setPersonalInfoLoading(true);
      setPersonalInfoError(null);

      const response = await fetch(`${API_BASE_URL}/api/user/personal-info`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch personal info: ${response.status}`);
      }
      
      const data = await response.json();
      setPersonalInfo(data);
    } catch (error) {
      console.error('Failed to fetch personal info:', error);
      setPersonalInfoError('Failed to fetch personal information from server');
      // Fallback to mock data
      setPersonalInfo(getMockPersonalInfo());
    } finally {
      setPersonalInfoLoading(false);
    }
  };

  // Update personal info function
  const updatePersonalInfo = async (updatedData: Partial<PersonalInfo>) => {
    try {
      setPersonalInfoLoading(true);
      setPersonalInfoError(null);

      const response = await fetch(`${API_BASE_URL}/api/user/personal-info`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update personal info: ${response.status}`);
      }
      
      const updatedInfo = await response.json();
      setPersonalInfo(updatedInfo);
    } catch (error) {
      console.error('Failed to update personal info:', error);
      setPersonalInfoError('Failed to update personal information');
      
      // Fallback: update info locally
      if (personalInfo) {
        setPersonalInfo({ ...personalInfo, ...updatedData });
      }
    } finally {
      setPersonalInfoLoading(false);
    }
  };

  // Update profile image function
  const updateProfileImage = async (imageUri: string) => {
    try {
      setPersonalInfoLoading(true);
      setPersonalInfoError(null);

      const formData = new FormData();
      formData.append('profileImage', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);

      const response = await fetch(`${API_BASE_URL}/api/user/profile-image`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update profile image: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (personalInfo) {
        setPersonalInfo({ ...personalInfo, profileImage: result.imageUrl });
      }
    } catch (error) {
      console.error('Failed to update profile image:', error);
      setPersonalInfoError('Failed to update profile image');
      
      // Fallback: update image locally
      if (personalInfo) {
        setPersonalInfo({ ...personalInfo, profileImage: imageUri });
      }
    } finally {
      setPersonalInfoLoading(false);
    }
  };

  // Initialize data on mount
  useEffect(() => {
    fetchPersonalInfo();
  }, []);

  const contextValue: PersonalInfoContextType = {
    personalInfo,
    personalInfoLoading,
    personalInfoError,
    fetchPersonalInfo,
    updatePersonalInfo,
    updateProfileImage
  };

  return (
    <PersonalInfoContext.Provider value={contextValue}>
      {children}
    </PersonalInfoContext.Provider>
  );
};

// Payment Provider Component
const PaymentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(true);
  const [paymentMethodsError, setPaymentMethodsError] = useState<string | null>(null);

  const API_BASE_URL = 'https://servaura-api.onrender.com';

  // Mock data fallback
  const getMockPaymentMethods = (): PaymentMethod[] => [
    {
      id: '1',
      type: 'Visa',
      last4: '4242',
      expiry: '12/25',
      isDefault: true,
      holderName: 'John Doe'
    },
    {
      id: '2',
      type: 'Mastercard',
      last4: '8888',
      expiry: '09/24',
      isDefault: false,
      holderName: 'John Doe'
    },
  ];

  // Fetch payment methods function
  const fetchPaymentMethods = async () => {
    try {
      setPaymentMethodsLoading(true);
      setPaymentMethodsError(null);

      const response = await fetch(`${API_BASE_URL}/api/payment-methods`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch payment methods: ${response.status}`);
      }
      
      const data = await response.json();
      setPaymentMethods(data);
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
      setPaymentMethodsError('Failed to fetch payment methods from server');
      // Fallback to mock data
      setPaymentMethods(getMockPaymentMethods());
    } finally {
      setPaymentMethodsLoading(false);
    }
  };

  // Add payment method function
  const addPaymentMethod = async (methodData: Omit<PaymentMethod, 'id'>) => {
    try {
      setPaymentMethodsLoading(true);
      setPaymentMethodsError(null);

      const response = await fetch(`${API_BASE_URL}/api/payment-methods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(methodData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to add payment method: ${response.status}`);
      }
      
      const newMethod = await response.json();
      setPaymentMethods(prev => [...prev, newMethod]);
    } catch (error) {
      console.error('Failed to add payment method:', error);
      setPaymentMethodsError('Failed to add payment method');
      
      // Fallback: add method with generated ID
      const newMethod: PaymentMethod = {
        ...methodData,
        id: `pm_${Date.now()}`
      };
      setPaymentMethods(prev => [...prev, newMethod]);
    } finally {
      setPaymentMethodsLoading(false);
    }
  };

  // Update payment method function
  const updatePaymentMethod = async (id: string, updates: Partial<PaymentMethod>) => {
    try {
      setPaymentMethodsLoading(true);
      setPaymentMethodsError(null);

      const response = await fetch(`${API_BASE_URL}/api/payment-methods/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update payment method: ${response.status}`);
      }
      
      const updatedMethod = await response.json();
      setPaymentMethods(prev => 
        prev.map(method => 
          method.id === id ? updatedMethod : method
        )
      );
    } catch (error) {
      console.error('Failed to update payment method:', error);
      setPaymentMethodsError('Failed to update payment method');
      
      // Fallback: update method locally
      setPaymentMethods(prev => 
        prev.map(method => 
          method.id === id ? { ...method, ...updates } : method
        )
      );
    } finally {
      setPaymentMethodsLoading(false);
    }
  };

  // Delete payment method function
  const deletePaymentMethod = async (id: string) => {
    try {
      setPaymentMethodsLoading(true);
      setPaymentMethodsError(null);

      const response = await fetch(`${API_BASE_URL}/api/payment-methods/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete payment method: ${response.status}`);
      }
      
      setPaymentMethods(prev => prev.filter(method => method.id !== id));
    } catch (error) {
      console.error('Failed to delete payment method:', error);
      setPaymentMethodsError('Failed to delete payment method');
      
      // Fallback: remove method locally
      setPaymentMethods(prev => prev.filter(method => method.id !== id));
    } finally {
      setPaymentMethodsLoading(false);
    }
  };

  // Set default payment method function
  const setDefaultPaymentMethod = async (id: string) => {
    try {
      setPaymentMethodsLoading(true);
      setPaymentMethodsError(null);

      const response = await fetch(`${API_BASE_URL}/api/payment-methods/${id}/set-default`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to set default payment method: ${response.status}`);
      }
      
      // Update all methods - set the selected one as default, others as false
      setPaymentMethods(prev => 
        prev.map(method => ({
          ...method,
          isDefault: method.id === id
        }))
      );
    } catch (error) {
      console.error('Failed to set default payment method:', error);
      setPaymentMethodsError('Failed to set default payment method');
      
      // Fallback: update locally
      setPaymentMethods(prev => 
        prev.map(method => ({
          ...method,
          isDefault: method.id === id
        }))
      );
    } finally {
      setPaymentMethodsLoading(false);
    }
  };

  // Get payment method by ID function
  const getPaymentMethodById = (id: string): PaymentMethod | undefined => {
    return paymentMethods.find(method => method.id === id);
  };

  // Initialize data on mount
  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const contextValue: PaymentContextType = {
    paymentMethods,
    paymentMethodsLoading,
    paymentMethodsError,
    fetchPaymentMethods,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    getPaymentMethodById
  };

  return (
    <PaymentContext.Provider value={contextValue}>
      {children}
    </PaymentContext.Provider>
  );
};

// Profile Provider Component
const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfileComplete | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  
  const [profileSettings, setProfileSettings] = useState<ProfileSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const API_BASE_URL = 'https://servaura-api.onrender.com';

  // Mock data fallbacks
  const getMockProfile = (): UserProfileComplete => ({
    id: 'user_1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    bio: 'Home service enthusiast',
    addresses: [],
    preferences: {
      notifications: true,
      theme: 'auto'
    },
    settings: {
      id: 'settings_1',
      userId: 'user_1',
      notificationsEnabled: true,
      theme: 'auto',
      language: 'en',
      timezone: 'America/New_York',
      privacySettings: {
        profileVisibility: 'private',
        showEmail: false,
        showPhone: false
      }
    }
  });

  const getMockSettings = (): ProfileSettings => ({
    id: 'settings_1',
    userId: 'user_1',
    notificationsEnabled: true,
    theme: 'auto',
    language: 'en',
    timezone: 'America/New_York',
    privacySettings: {
      profileVisibility: 'private',
      showEmail: false,
      showPhone: false
    }
  });

  // Fetch profile function
  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      setProfileError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/user/profile`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }
      
      const data = await response.json();
      setUserProfile(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setProfileError('Failed to fetch profile from server');
      // Fallback to mock data
      setUserProfile(getMockProfile());
    } finally {
      setProfileLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (updatedData: Partial<UserProfileComplete>) => {
    try {
      setProfileLoading(true);
      setProfileError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.status}`);
      }
      
      const updatedProfile = await response.json();
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setProfileError('Failed to update profile');
      
      // Fallback: update profile locally
      if (userProfile) {
        setUserProfile({ ...userProfile, ...updatedData });
      }
    } finally {
      setProfileLoading(false);
    }
  };

  // Update profile image function
  const updateProfileImage = async (imageUri: string) => {
    try {
      setProfileLoading(true);
      setProfileError(null);
      
      const formData = new FormData();
      formData.append('avatar', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      } as any);
      
      const response = await fetch(`${API_BASE_URL}/api/user/avatar`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update avatar: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (userProfile) {
        setUserProfile({ ...userProfile, avatar: result.avatarUrl });
      }
    } catch (error) {
      console.error('Failed to update avatar:', error);
      setProfileError('Failed to update profile image');
      
      // Fallback: update avatar locally
      if (userProfile) {
        setUserProfile({ ...userProfile, avatar: imageUri });
      }
    } finally {
      setProfileLoading(false);
    }
  };

  // Fetch profile settings
  const fetchProfileSettings = async () => {
    try {
      setSettingsLoading(true);
      setSettingsError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/user/settings`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.status}`);
      }
      
      const data = await response.json();
      setProfileSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setSettingsError('Failed to fetch settings from server');
      // Fallback to mock data
      setProfileSettings(getMockSettings());
    } finally {
      setSettingsLoading(false);
    }
  };

  // Update profile settings
  const updateProfileSettings = async (updatedSettings: Partial<ProfileSettings>) => {
    try {
      setSettingsLoading(true);
      setSettingsError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/user/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSettings),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update settings: ${response.status}`);
      }
      
      const updated = await response.json();
      setProfileSettings(updated);
      
      // Also update the profile if settings are embedded
      if (userProfile) {
        setUserProfile({ ...userProfile, settings: updated });
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
      setSettingsError('Failed to update settings');
      
      // Fallback: update settings locally
      if (profileSettings) {
        const newSettings = { ...profileSettings, ...updatedSettings };
        setProfileSettings(newSettings);
        if (userProfile) {
          setUserProfile({ ...userProfile, settings: newSettings });
        }
      }
    } finally {
      setSettingsLoading(false);
    }
  };

  // Toggle notifications
  const toggleNotifications = async (enabled: boolean) => {
    await updateProfileSettings({ notificationsEnabled: enabled });
  };

  // Update theme
  const updateTheme = async (theme: 'auto' | 'light' | 'dark') => {
    await updateProfileSettings({ theme });
  };

  // Refresh all profile data
  const refreshProfileData = async () => {
    await Promise.all([fetchProfile(), fetchProfileSettings()]);
  };

  // Initialize data on mount
  useEffect(() => {
    refreshProfileData();
  }, []);

  const contextValue: ProfileContextType = {
    userProfile,
    profileLoading,
    profileError,
    profileSettings,
    settingsLoading,
    settingsError,
    fetchProfile,
    updateProfile,
    updateProfileImage,
    fetchProfileSettings,
    updateProfileSettings,
    toggleNotifications,
    updateTheme,
    refreshProfileData
  };

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
};

// Services Provider Component
const ServicesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [upcomingServices, setUpcomingServices] = useState<ServiceBooking[]>([]);
  const [serviceHistory, setServiceHistory] = useState<ServiceHistory[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

  const API_BASE_URL = 'https://servaura-api.onrender.com';

  // Mock data fallbacks
  const getMockUpcomingServices = (): ServiceBooking[] => [
    {
      id: 'service_1',
      type: 'Home Cleaning',
      date: 'October 15, 2025',
      time: '10:00 AM - 12:00 PM',
      status: 'Confirmed',
      location: 'Main Residence',
      providerId: 'provider_1',
      providerName: 'CleanCorp Services',
      estimatedDuration: 120,
      price: 150
    },
    {
      id: 'service_2',
      type: 'Lawn Care',
      date: 'October 17, 2025',
      time: '2:00 PM - 4:00 PM',
      status: 'Scheduled',
      location: 'Main Residence',
      providerId: 'provider_2',
      providerName: 'GreenThumb Landscaping',
      estimatedDuration: 120,
      price: 120
    }
  ];

  const getMockServiceHistory = (): ServiceHistory[] => [
    {
      id: 'history_1',
      type: 'Home Cleaning',
      date: 'September 17, 2025',
      time: '10:00 AM - 12:00 PM',
      status: 'Completed',
      providerId: 'provider_1',
      providerName: 'CleanCorp Services',
      rating: 5,
      review: 'Excellent service, very thorough cleaning!',
      price: 150
    },
    {
      id: 'history_2',
      type: 'Window Cleaning',
      date: 'September 10, 2025',
      time: '9:00 AM - 11:00 AM',
      status: 'Completed',
      providerId: 'provider_3',
      providerName: 'Crystal Clear Windows',
      rating: 4,
      price: 80
    }
  ];

  // Fetch upcoming services
  const fetchUpcomingServices = async () => {
    try {
      setServicesLoading(true);
      setServicesError(null);

      const response = await fetch(`${API_BASE_URL}/api/services/upcoming`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch upcoming services: ${response.status}`);
      }
      
      const data = await response.json();
      setUpcomingServices(data);
    } catch (error) {
      console.error('Failed to fetch upcoming services:', error);
      setServicesError('Failed to load upcoming services');
      // Fallback to mock data
      setUpcomingServices(getMockUpcomingServices());
    } finally {
      setServicesLoading(false);
    }
  };

  // Fetch service history
  const fetchServiceHistory = async () => {
    try {
      setServicesError(null);

      const response = await fetch(`${API_BASE_URL}/api/services/history`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch service history: ${response.status}`);
      }
      
      const data = await response.json();
      setServiceHistory(data);
    } catch (error) {
      console.error('Failed to fetch service history:', error);
      setServicesError('Failed to load service history');
      // Fallback to mock data
      setServiceHistory(getMockServiceHistory());
    }
  };

  // Book a new service
  const bookService = async (service: Omit<ServiceBooking, 'id'>) => {
    try {
      setServicesLoading(true);
      setServicesError(null);

      const response = await fetch(`${API_BASE_URL}/api/services/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(service),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to book service: ${response.status}`);
      }
      
      const newService = await response.json();
      setUpcomingServices(prev => [...prev, newService]);
    } catch (error) {
      console.error('Failed to book service:', error);
      setServicesError('Failed to book service');
      
      // Fallback: add service locally with generated ID
      const newService: ServiceBooking = {
        ...service,
        id: `service_${Date.now()}`
      };
      setUpcomingServices(prev => [...prev, newService]);
    } finally {
      setServicesLoading(false);
    }
  };

  // Cancel a service
  const cancelService = async (id: string) => {
    try {
      setServicesLoading(true);
      setServicesError(null);

      const response = await fetch(`${API_BASE_URL}/api/services/${id}/cancel`, {
        method: 'PUT',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to cancel service: ${response.status}`);
      }
      
      setUpcomingServices(prev => prev.filter(service => service.id !== id));
    } catch (error) {
      console.error('Failed to cancel service:', error);
      setServicesError('Failed to cancel service');
      
      // Fallback: remove service locally
      setUpcomingServices(prev => prev.filter(service => service.id !== id));
    } finally {
      setServicesLoading(false);
    }
  };

  // Reschedule a service
  const rescheduleService = async (id: string, newDate: string, newTime: string) => {
    try {
      setServicesLoading(true);
      setServicesError(null);

      const response = await fetch(`${API_BASE_URL}/api/services/${id}/reschedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: newDate, time: newTime }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to reschedule service: ${response.status}`);
      }
      
      const updatedService = await response.json();
      setUpcomingServices(prev => 
        prev.map(service => service.id === id ? updatedService : service)
      );
    } catch (error) {
      console.error('Failed to reschedule service:', error);
      setServicesError('Failed to reschedule service');
      
      // Fallback: update service locally
      setUpcomingServices(prev => 
        prev.map(service => 
          service.id === id 
            ? { ...service, date: newDate, time: newTime }
            : service
        )
      );
    } finally {
      setServicesLoading(false);
    }
  };

  // Rate a completed service
  const rateService = async (id: string, rating: number, review?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/services/${id}/rate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating, review }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to rate service: ${response.status}`);
      }
      
      const updatedService = await response.json();
      setServiceHistory(prev => 
        prev.map(service => service.id === id ? updatedService : service)
      );
    } catch (error) {
      console.error('Failed to rate service:', error);
      
      // Fallback: update service locally
      setServiceHistory(prev => 
        prev.map(service => 
          service.id === id 
            ? { ...service, rating, review }
            : service
        )
      );
    }
  };

  // Get next upcoming service
  const getNextService = (): ServiceBooking | null => {
    if (upcomingServices.length === 0) return null;
    
    const sortedServices = [...upcomingServices].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    return sortedServices[0];
  };

  // Get service by ID
  const getServiceById = (id: string): ServiceBooking | undefined => {
    return upcomingServices.find(service => service.id === id);
  };

  // Initialize data on mount
  useEffect(() => {
    fetchUpcomingServices();
    fetchServiceHistory();
  }, []);

  const contextValue: ServicesContextType = {
    upcomingServices,
    serviceHistory,
    servicesLoading,
    servicesError,
    fetchUpcomingServices,
    fetchServiceHistory,
    bookService,
    cancelService,
    rescheduleService,
    rateService,
    getNextService,
    getServiceById
  };

  return (
    <ServicesContext.Provider value={contextValue}>
      {children}
    </ServicesContext.Provider>
  );
};

// Security Provider Component
const SecurityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);
  const [securitySettingsLoading, setSecuritySettingsLoading] = useState(true);
  const [securitySettingsError, setSecuritySettingsError] = useState<string | null>(null);
  
  const [activeSessions, setActiveSessions] = useState<LoginSession[]>([]);
  const [activeSessionsLoading, setActiveSessionsLoading] = useState(false);
  const [activeSessionsError, setActiveSessionsError] = useState<string | null>(null);

  const API_BASE_URL = 'https://servaura-api.onrender.com';

  // Mock data fallback
  const getMockSecuritySettings = (): SecuritySettings => ({
    id: 'security_1',
    userId: 'user_1',
    twoFactorEnabled: false,
    biometricEnabled: true,
    passwordLastChanged: new Date().toISOString(),
    loginAttempts: 0,
    accountLocked: false,
    trustedDevices: []
  });

  // Fetch security settings
  const fetchSecuritySettings = async () => {
    try {
      setSecuritySettingsLoading(true);
      setSecuritySettingsError(null);

      const response = await fetch(`${API_BASE_URL}/api/user/security-settings`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch security settings: ${response.status}`);
      }
      
      const data = await response.json();
      setSecuritySettings(data);
    } catch (error) {
      console.error('Failed to fetch security settings:', error);
      setSecuritySettingsError('Failed to fetch security settings from server');
      // Fallback to mock data
      setSecuritySettings(getMockSecuritySettings());
    } finally {
      setSecuritySettingsLoading(false);
    }
  };

  // Update security settings
  const updateSecuritySettings = async (updates: Partial<SecuritySettings>) => {
    try {
      setSecuritySettingsLoading(true);
      setSecuritySettingsError(null);

      const response = await fetch(`${API_BASE_URL}/api/user/security-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update security settings: ${response.status}`);
      }
      
      const updatedSettings = await response.json();
      setSecuritySettings(updatedSettings);
    } catch (error) {
      console.error('Failed to update security settings:', error);
      setSecuritySettingsError('Failed to update security settings');
      
      // Fallback: update settings locally
      if (securitySettings) {
        setSecuritySettings({ ...securitySettings, ...updates });
      }
    } finally {
      setSecuritySettingsLoading(false);
    }
  };

  // Change password
  const changePassword = async (request: PasswordChangeRequest): Promise<boolean> => {
    try {
      if (request.newPassword !== request.confirmPassword) {
        throw new Error('New passwords do not match');
      }

      const response = await fetch(`${API_BASE_URL}/api/user/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: request.currentPassword,
          newPassword: request.newPassword,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }
      
      // Update password last changed date
      if (securitySettings) {
        setSecuritySettings({
          ...securitySettings,
          passwordLastChanged: new Date().toISOString()
        });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to change password:', error);
      setSecuritySettingsError(error instanceof Error ? error.message : 'Failed to change password');
      return false;
    }
  };

  // Validate current password
  const validateCurrentPassword = async (password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/validate-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      
      if (!response.ok) {
        return false;
      }
      
      const result = await response.json();
      return result.valid;
    } catch (error) {
      console.error('Failed to validate password:', error);
      return false;
    }
  };

  // Enable two-factor authentication
  const enableTwoFactor = async (): Promise<{ qrCode: string; backupCodes: string[] }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/enable-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to enable two-factor authentication');
      }
      
      const result = await response.json();
      
      // Update security settings
      if (securitySettings) {
        setSecuritySettings({
          ...securitySettings,
          twoFactorEnabled: true
        });
      }
      
      return result;
    } catch (error) {
      console.error('Failed to enable 2FA:', error);
      throw error;
    }
  };

  // Disable two-factor authentication
  const disableTwoFactor = async (code: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/disable-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      
      if (!response.ok) {
        return false;
      }
      
      // Update security settings
      if (securitySettings) {
        setSecuritySettings({
          ...securitySettings,
          twoFactorEnabled: false
        });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to disable 2FA:', error);
      return false;
    }
  };

  // Verify two-factor code
  const verifyTwoFactorCode = async (code: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/verify-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      
      if (!response.ok) {
        return false;
      }
      
      const result = await response.json();
      return result.valid;
    } catch (error) {
      console.error('Failed to verify 2FA code:', error);
      return false;
    }
  };

  // Enable biometric authentication
  const enableBiometric = async (): Promise<boolean> => {
    try {
      // Check if biometric is available on device
      const response = await fetch(`${API_BASE_URL}/api/user/enable-biometric`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        return false;
      }
      
      // Update security settings
      if (securitySettings) {
        setSecuritySettings({
          ...securitySettings,
          biometricEnabled: true
        });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to enable biometric:', error);
      return false;
    }
  };

  // Disable biometric authentication
  const disableBiometric = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/disable-biometric`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        return false;
      }
      
      // Update security settings
      if (securitySettings) {
        setSecuritySettings({
          ...securitySettings,
          biometricEnabled: false
        });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to disable biometric:', error);
      return false;
    }
  };

  // Verify biometric authentication
  const verifyBiometric = async (): Promise<boolean> => {
    try {
      // This would integrate with device biometric APIs
      // For now, return mock success
      return true;
    } catch (error) {
      console.error('Failed to verify biometric:', error);
      return false;
    }
  };

  // Fetch active sessions
  const fetchActiveSessions = async () => {
    try {
      setActiveSessionsLoading(true);
      setActiveSessionsError(null);

      const response = await fetch(`${API_BASE_URL}/api/user/active-sessions`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch active sessions');
      }
      
      const data = await response.json();
      setActiveSessions(data);
    } catch (error) {
      console.error('Failed to fetch active sessions:', error);
      setActiveSessionsError('Failed to fetch active sessions');
      // Mock data fallback
      setActiveSessions([]);
    } finally {
      setActiveSessionsLoading(false);
    }
  };

  // Terminate specific session
  const terminateSession = async (sessionId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to terminate session');
      }
      
      // Remove session from local state
      setActiveSessions(prev => prev.filter(session => session.id !== sessionId));
    } catch (error) {
      console.error('Failed to terminate session:', error);
      setActiveSessionsError('Failed to terminate session');
    }
  };

  // Terminate all sessions
  const terminateAllSessions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/sessions`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to terminate all sessions');
      }
      
      setActiveSessions([]);
    } catch (error) {
      console.error('Failed to terminate all sessions:', error);
      setActiveSessionsError('Failed to terminate all sessions');
    }
  };

  // Add trusted device
  const addTrustedDevice = async (deviceInfo: Omit<TrustedDevice, 'id'>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/trusted-devices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deviceInfo),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add trusted device');
      }
      
      const newDevice = await response.json();
      
      // Update security settings with new trusted device
      if (securitySettings) {
        setSecuritySettings({
          ...securitySettings,
          trustedDevices: [...securitySettings.trustedDevices, newDevice]
        });
      }
    } catch (error) {
      console.error('Failed to add trusted device:', error);
      setSecuritySettingsError('Failed to add trusted device');
    }
  };

  // Remove trusted device
  const removeTrustedDevice = async (deviceId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/trusted-devices/${deviceId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove trusted device');
      }
      
      // Update security settings by removing the device
      if (securitySettings) {
        setSecuritySettings({
          ...securitySettings,
          trustedDevices: securitySettings.trustedDevices.filter(device => device.id !== deviceId)
        });
      }
    } catch (error) {
      console.error('Failed to remove trusted device:', error);
      setSecuritySettingsError('Failed to remove trusted device');
    }
  };

  // Refresh all security data
  const refreshSecurityData = async () => {
    await Promise.all([
      fetchSecuritySettings(),
      fetchActiveSessions()
    ]);
  };

  // Initialize data on mount
  useEffect(() => {
    fetchSecuritySettings();
    fetchActiveSessions();
  }, []);

  const contextValue: SecurityContextType = {
    securitySettings,
    securitySettingsLoading,
    securitySettingsError,
    activeSessions,
    activeSessionsLoading,
    activeSessionsError,
    fetchSecuritySettings,
    updateSecuritySettings,
    changePassword,
    validateCurrentPassword,
    enableTwoFactor,
    disableTwoFactor,
    verifyTwoFactorCode,
    enableBiometric,
    disableBiometric,
    verifyBiometric,
    fetchActiveSessions,
    terminateSession,
    terminateAllSessions,
    addTrustedDevice,
    removeTrustedDevice,
    refreshSecurityData
  };

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  );
};

// Auth Provider Component
const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<LoginSession | null>(null);

  const API_BASE_URL = 'https://servaura-api.onrender.com';

  // Login function
  const login = async (email: string, password: string, twoFactorCode?: string): Promise<boolean> => {
    try {
      setAuthLoading(true);
      setAuthError(null);

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, twoFactorCode }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      const result = await response.json();
      
      setIsAuthenticated(true);
      setUser(result.user);
      setCurrentSession(result.session);
      
      // Store session token securely
      // In production, use secure storage
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      setAuthError(error instanceof Error ? error.message : 'Login failed');
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setAuthLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        console.error('Logout request failed');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setCurrentSession(null);
      setAuthLoading(false);
      // Clear stored session token
    }
  };

  // Register function
  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setAuthLoading(true);
      setAuthError(null);

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      setAuthError(error instanceof Error ? error.message : 'Registration failed');
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  // Request password reset
  const requestPasswordReset = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/request-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Password reset request failed:', error);
      return false;
    }
  };

  // Reset password
  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });
      
      if (!response.ok) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Password reset failed:', error);
      return false;
    }
  };

  // Verify account
  const verifyAccount = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      
      if (!response.ok) {
        return false;
      }
      
      // Update user verification status
      if (user) {
        setUser({ ...user, isVerified: true });
      }
      
      return true;
    } catch (error) {
      console.error('Account verification failed:', error);
      return false;
    }
  };

  // Resend verification email
  const resendVerificationEmail = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Resend verification failed:', error);
      return false;
    }
  };

  // Refresh session
  const refreshSession = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh-session`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        return false;
      }
      
      const result = await response.json();
      setCurrentSession(result.session);
      
      return true;
    } catch (error) {
      console.error('Session refresh failed:', error);
      return false;
    }
  };

  // Validate session
  const validateSession = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/validate-session`);
      
      if (!response.ok) {
        return false;
      }
      
      const result = await response.json();
      
      if (result.valid) {
        setIsAuthenticated(true);
        setUser(result.user);
        setCurrentSession(result.session);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setCurrentSession(null);
      }
      
      return result.valid;
    } catch (error) {
      console.error('Session validation failed:', error);
      return false;
    }
  };

  // Clear auth error
  const clearAuthError = () => {
    setAuthError(null);
  };

  // Initialize auth state on mount
  useEffect(() => {
    validateSession().finally(() => {
      setAuthLoading(false);
    });
  }, []);

  const contextValue: AuthContextType = {
    isAuthenticated,
    user,
    authLoading,
    authError,
    currentSession,
    login,
    logout,
    register,
    requestPasswordReset,
    resetPassword,
    verifyAccount,
    resendVerificationEmail,
    refreshSession,
    validateSession,
    clearAuthError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Services Provider Component
const ServicesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);
  
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  
  const [serviceBookings, setServiceBookings] = useState<ServiceBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  const API_BASE_URL = 'https://servaura-api.onrender.com';

  // Mock data fallbacks
  const getMockServices = (): Service[] => [
    { id: 1, name: 'Home Cleaning', category: 'Cleaning', basePrice: 120, duration: 180, isActive: true, selected: false },
    { id: 2, name: 'Window Cleaning', category: 'Cleaning', basePrice: 80, duration: 120, isActive: true, selected: false },
    { id: 3, name: 'Lawn & Garden', category: 'Outdoor', basePrice: 100, duration: 240, isActive: true, selected: false },
    { id: 4, name: 'Power Washing', category: 'Outdoor', basePrice: 150, duration: 180, isActive: true, selected: false },
    { id: 5, name: 'Solar Panel Cleaning', category: 'Maintenance', basePrice: 200, duration: 120, isActive: true, selected: false },
    { id: 6, name: 'Pool Maintenance', category: 'Outdoor', basePrice: 90, duration: 90, isActive: true, selected: false },
    { id: 7, name: 'HVAC Service', category: 'Technical', basePrice: 180, duration: 120, isActive: true, selected: false },
    { id: 8, name: 'Plumbing', category: 'Technical', basePrice: 160, duration: 180, isActive: true, selected: false },
    { id: 9, name: 'Electrical', category: 'Technical', basePrice: 170, duration: 120, isActive: true, selected: false },
  ];

  // Fetch available services
  const fetchAvailableServices = async () => {
    try {
      setServicesLoading(true);
      setServicesError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/services`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch services: ${response.status}`);
      }
      
      const data = await response.json();
      setAvailableServices(data);
    } catch (error) {
      console.error('Failed to fetch services:', error);
      setServicesError('Failed to fetch services from server');
      // Fallback to mock data
      setAvailableServices(getMockServices());
    } finally {
      setServicesLoading(false);
    }
  };

  // Fetch service requests
  const fetchServiceRequests = async () => {
    try {
      setRequestsLoading(true);
      setRequestsError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/service-requests`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch service requests: ${response.status}`);
      }
      
      const data = await response.json();
      setServiceRequests(data);
    } catch (error) {
      console.error('Failed to fetch service requests:', error);
      setRequestsError('Failed to fetch service requests from server');
      // Fallback to empty array
      setServiceRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  };

  // Fetch service bookings
  const fetchServiceBookings = async () => {
    try {
      setBookingsLoading(true);
      setBookingsError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/service-bookings`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch service bookings: ${response.status}`);
      }
      
      const data = await response.json();
      setServiceBookings(data);
    } catch (error) {
      console.error('Failed to fetch service bookings:', error);
      setBookingsError('Failed to fetch service bookings from server');
      // Fallback to empty array
      setServiceBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  // Submit service request
  const submitServiceRequest = async (requestData: Omit<ServiceRequest, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>): Promise<ServiceRequest> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/service-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to submit service request: ${response.status}`);
      }
      
      const newRequest = await response.json();
      setServiceRequests(prev => [...prev, newRequest]);
      return newRequest;
    } catch (error) {
      console.error('Failed to submit service request:', error);
      
      // Fallback: create mock request
      const mockRequest: ServiceRequest = {
        id: `req_${Date.now()}`,
        userId: 'user_1',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...requestData
      };
      
      setServiceRequests(prev => [...prev, mockRequest]);
      return mockRequest;
    }
  };

  // Update service request
  const updateServiceRequest = async (id: string, updates: Partial<ServiceRequest>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/service-requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update service request: ${response.status}`);
      }
      
      const updatedRequest = await response.json();
      setServiceRequests(prev => 
        prev.map(req => req.id === id ? updatedRequest : req)
      );
    } catch (error) {
      console.error('Failed to update service request:', error);
      
      // Fallback: update locally
      setServiceRequests(prev => 
        prev.map(req => req.id === id ? { ...req, ...updates, updatedAt: new Date() } : req)
      );
    }
  };

  // Cancel service request
  const cancelServiceRequest = async (id: string) => {
    await updateServiceRequest(id, { status: 'cancelled' });
  };

  // Confirm booking
  const confirmBooking = async (requestId: string, providerId: string, confirmedDate: Date, confirmedTime: Date) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/service-bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          providerId,
          confirmedDate,
          confirmedTime
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to confirm booking: ${response.status}`);
      }
      
      const newBooking = await response.json();
      setServiceBookings(prev => [...prev, newBooking]);
      
      // Update request status
      await updateServiceRequest(requestId, { status: 'confirmed' });
    } catch (error) {
      console.error('Failed to confirm booking:', error);
      
      // Fallback: create mock booking
      const mockBooking: ServiceBooking = {
        id: `booking_${Date.now()}`,
        requestId,
        providerId,
        confirmedDate,
        confirmedTime
      };
      
      setServiceBookings(prev => [...prev, mockBooking]);
      setServiceRequests(prev => 
        prev.map(req => req.id === requestId ? { ...req, status: 'confirmed' } : req)
      );
    }
  };

  // Reschedule booking
  const rescheduleBooking = async (bookingId: string, newDate: Date, newTime: Date) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/service-bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmedDate: newDate,
          confirmedTime: newTime
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to reschedule booking: ${response.status}`);
      }
      
      const updatedBooking = await response.json();
      setServiceBookings(prev => 
        prev.map(booking => booking.id === bookingId ? updatedBooking : booking)
      );
    } catch (error) {
      console.error('Failed to reschedule booking:', error);
      
      // Fallback: update locally
      setServiceBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, confirmedDate: newDate, confirmedTime: newTime }
            : booking
        )
      );
    }
  };

  // Complete booking
  const completeBooking = async (bookingId: string, completionData: Partial<ServiceBooking>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/service-bookings/${bookingId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completionData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to complete booking: ${response.status}`);
      }
      
      const completedBooking = await response.json();
      setServiceBookings(prev => 
        prev.map(booking => booking.id === bookingId ? completedBooking : booking)
      );
      
      // Update corresponding request status
      const booking = serviceBookings.find(b => b.id === bookingId);
      if (booking) {
        await updateServiceRequest(booking.requestId, { status: 'completed' });
      }
    } catch (error) {
      console.error('Failed to complete booking:', error);
      
      // Fallback: update locally
      setServiceBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, ...completionData }
            : booking
        )
      );
    }
  };

  // Utility methods
  const getRequestById = (id: string) => {
    return serviceRequests.find(request => request.id === id);
  };

  const getBookingById = (id: string) => {
    return serviceBookings.find(booking => booking.id === id);
  };

  const getRequestsByStatus = (status: ServiceRequest['status']) => {
    return serviceRequests.filter(request => request.status === status);
  };

  // Refresh all services data
  const refreshServicesData = async () => {
    await Promise.all([
      fetchAvailableServices(),
      fetchServiceRequests(),
      fetchServiceBookings()
    ]);
  };

  // Initialize data on mount
  useEffect(() => {
    refreshServicesData();
  }, []);

  const contextValue: ServicesContextType = {
    availableServices,
    servicesLoading,
    servicesError,
    serviceRequests,
    requestsLoading,
    requestsError,
    serviceBookings,
    bookingsLoading,
    bookingsError,
    fetchAvailableServices,
    fetchServiceRequests,
    fetchServiceBookings,
    submitServiceRequest,
    updateServiceRequest,
    cancelServiceRequest,
    confirmBooking,
    rescheduleBooking,
    completeBooking,
    getRequestById,
    getBookingById,
    getRequestsByStatus,
    refreshServicesData
  };

  return (
    <ServicesContext.Provider value={contextValue}>
      {children}
    </ServicesContext.Provider>
  );
};

// Plans Provider Component
const PlansProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [availableServices, setAvailableServices] = useState<AvailableService[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);

  const API_BASE_URL = 'https://servaura-api.onrender.com';

  // Mock data fallbacks
  const getMockCurrentPlan = (): SubscriptionPlan => ({
    id: 'plan_premium',
    name: 'Premium',
    price: 249.99,
    billing: 'monthly',
    startDate: 'July 15, 2025',
    status: 'active',
    services: [
      { name: 'Weekly home cleaning', frequency: 'Every Monday', included: true },
      { name: 'Bi-weekly lawn care', frequency: '1st and 3rd Wednesday', included: true },
      { name: 'Quarterly HVAC service', frequency: 'Jan, Apr, Jul, Oct', included: true },
      { name: 'Quarterly window washing', frequency: 'Jan, Apr, Jul, Oct', included: true },
      { name: 'Annual power washing', frequency: 'April', included: true },
    ],
    features: [
      'Weekly home cleaning',
      'Bi-weekly lawn care',
      'Quarterly HVAC service',
      'Quarterly window washing',
      'Annual power washing',
      'Two service contractor visits',
    ]
  });

  const getMockAvailablePlans = (): SubscriptionPlan[] => [
    {
      id: 'plan_basic',
      name: 'Basic',
      price: 149.99,
      billing: 'monthly',
      startDate: '',
      status: 'active',
      services: [],
      features: [
        'Monthly home cleaning',
        'Quarterly lawn maintenance',
        'Annual HVAC inspection',
      ],
    },
    {
      id: 'plan_standard',
      name: 'Standard',
      price: 199.99,
      billing: 'monthly',
      startDate: '',
      status: 'active',
      services: [],
      features: [
        'Bi-weekly home cleaning',
        'Monthly lawn maintenance',
        'Quarterly HVAC service',
        'Annual window washing',
        'One service contractor visit',
      ],
    },
    {
      id: 'plan_luxury',
      name: 'Luxury',
      price: 399.99,
      billing: 'monthly',
      startDate: '',
      status: 'active',
      services: [],
      features: [
        'Twice weekly home cleaning',
        'Weekly lawn and garden care',
        'Quarterly HVAC service',
        'Monthly window washing',
        'Quarterly power washing',
        'Unlimited service contractor visits',
      ],
    }
  ];

  const getMockAvailableServices = (): AvailableService[] => [
    { id: 'service_1', name: 'Home Cleaning', frequency: 'Weekly', basePrice: 75, category: 'Cleaning' },
    { id: 'service_2', name: 'Window Cleaning', frequency: 'Quarterly', basePrice: 80, category: 'Cleaning' },
    { id: 'service_3', name: 'Lawn & Garden', frequency: 'Bi-weekly', basePrice: 60, category: 'Landscaping' },
    { id: 'service_4', name: 'Power Washing', frequency: 'Annual', basePrice: 200, category: 'Cleaning' },
    { id: 'service_5', name: 'Solar Panel Cleaning', frequency: 'Quarterly', basePrice: 120, category: 'Maintenance' },
    { id: 'service_6', name: 'Pool Cleaning', frequency: 'Weekly', basePrice: 85, category: 'Maintenance' },
    { id: 'service_7', name: 'HVAC Services', frequency: 'Quarterly', basePrice: 150, category: 'Maintenance' },
    { id: 'service_8', name: 'Plumbing', frequency: 'As needed', basePrice: 100, category: 'Repairs' },
    { id: 'service_9', name: 'Electrical', frequency: 'As needed', basePrice: 110, category: 'Repairs' },
  ];

  // Fetch current plan
  const fetchCurrentPlan = async () => {
    try {
      setPlansLoading(true);
      setPlansError(null);

      const response = await fetch(`${API_BASE_URL}/api/plans/current`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch current plan: ${response.status}`);
      }
      
      const data = await response.json();
      setCurrentPlan(data);
    } catch (error) {
      console.error('Failed to fetch current plan:', error);
      setPlansError('Failed to load current plan');
      // Fallback to mock data
      setCurrentPlan(getMockCurrentPlan());
    } finally {
      setPlansLoading(false);
    }
  };

  // Fetch available plans
  const fetchAvailablePlans = async () => {
    try {
      setPlansError(null);

      const response = await fetch(`${API_BASE_URL}/api/plans/available`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch available plans: ${response.status}`);
      }
      
      const data = await response.json();
      setAvailablePlans(data);
    } catch (error) {
      console.error('Failed to fetch available plans:', error);
      setPlansError('Failed to load available plans');
      // Fallback to mock data
      setAvailablePlans(getMockAvailablePlans());
    }
  };

  // Fetch available services
  const fetchAvailableServices = async () => {
    try {
      setPlansError(null);

      const response = await fetch(`${API_BASE_URL}/api/services/available`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch available services: ${response.status}`);
      }
      
      const data = await response.json();
      setAvailableServices(data);
    } catch (error) {
      console.error('Failed to fetch available services:', error);
      setPlansError('Failed to load available services');
      // Fallback to mock data
      setAvailableServices(getMockAvailableServices());
    }
  };

  // Switch to a different plan
  const switchPlan = async (planId: string) => {
    try {
      setPlansLoading(true);
      setPlansError(null);

      const response = await fetch(`${API_BASE_URL}/api/plans/switch`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to switch plan: ${response.status}`);
      }
      
      const updatedPlan = await response.json();
      setCurrentPlan(updatedPlan);
    } catch (error) {
      console.error('Failed to switch plan:', error);
      setPlansError('Failed to switch plan');
      
      // Fallback: find plan and set it locally
      const newPlan = availablePlans.find(plan => plan.id === planId);
      if (newPlan) {
        setCurrentPlan({ ...newPlan, status: 'active', startDate: new Date().toISOString() });
      }
    } finally {
      setPlansLoading(false);
    }
  };

  // Add service to current plan
  const addServiceToPlan = async (serviceId: string) => {
    try {
      setPlansLoading(true);
      setPlansError(null);

      const response = await fetch(`${API_BASE_URL}/api/plans/add-service`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serviceId }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to add service to plan: ${response.status}`);
      }
      
      const updatedPlan = await response.json();
      setCurrentPlan(updatedPlan);
    } catch (error) {
      console.error('Failed to add service to plan:', error);
      setPlansError('Failed to add service to plan');
      
      // Fallback: add service locally
      const service = availableServices.find(s => s.id === serviceId);
      if (currentPlan && service) {
        const newPlanService: PlanService = {
          name: service.name,
          frequency: service.frequency,
          included: true,
          price: service.basePrice
        };
        setCurrentPlan({
          ...currentPlan,
          services: [...currentPlan.services, newPlanService]
        });
      }
    } finally {
      setPlansLoading(false);
    }
  };

  // Remove service from current plan
  const removeServiceFromPlan = async (serviceId: string) => {
    try {
      setPlansLoading(true);
      setPlansError(null);

      const response = await fetch(`${API_BASE_URL}/api/plans/remove-service`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serviceId }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to remove service from plan: ${response.status}`);
      }
      
      const updatedPlan = await response.json();
      setCurrentPlan(updatedPlan);
    } catch (error) {
      console.error('Failed to remove service from plan:', error);
      setPlansError('Failed to remove service from plan');
      
      // Fallback: remove service locally
      if (currentPlan) {
        const service = availableServices.find(s => s.id === serviceId);
        if (service) {
          setCurrentPlan({
            ...currentPlan,
            services: currentPlan.services.filter(s => s.name !== service.name)
          });
        }
      }
    } finally {
      setPlansLoading(false);
    }
  };

  // Cancel current plan
  const cancelPlan = async () => {
    try {
      setPlansLoading(true);
      setPlansError(null);

      const response = await fetch(`${API_BASE_URL}/api/plans/cancel`, {
        method: 'PUT',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to cancel plan: ${response.status}`);
      }
      
      if (currentPlan) {
        setCurrentPlan({ ...currentPlan, status: 'cancelled' });
      }
    } catch (error) {
      console.error('Failed to cancel plan:', error);
      setPlansError('Failed to cancel plan');
      
      // Fallback: update plan status locally
      if (currentPlan) {
        setCurrentPlan({ ...currentPlan, status: 'cancelled' });
      }
    } finally {
      setPlansLoading(false);
    }
  };

  // Upgrade to a higher tier plan
  const upgradePlan = async (planId: string) => {
    return switchPlan(planId);
  };

  // Get available add-ons based on current plan
  const getAvailableAddOns = (): AvailableService[] => {
    if (!currentPlan) return availableServices;
    
    const includedServiceNames = new Set(
      currentPlan.services.map(service => service.name.toLowerCase())
    );
    
    return availableServices.filter(service => {
      const serviceName = service.name.toLowerCase();
      return !includedServiceNames.has(serviceName);
    });
  };

  // Initialize data on mount
  useEffect(() => {
    fetchCurrentPlan();
    fetchAvailablePlans();
    fetchAvailableServices();
  }, []);

  const contextValue: PlansContextType = {
    currentPlan,
    availablePlans,
    availableServices,
    plansLoading,
    plansError,
    fetchCurrentPlan,
    fetchAvailablePlans,
    fetchAvailableServices,
    switchPlan,
    addServiceToPlan,
    removeServiceFromPlan,
    cancelPlan,
    upgradePlan,
    getAvailableAddOns
  };

  return (
    <PlansContext.Provider value={contextValue}>
      {children}
    </PlansContext.Provider>
  );
};

// Custom hooks for using the contexts
export const useServices = (): ServicesContextType => {
  const context = useContext(ServicesContext);
  if (context === undefined) {
    throw new Error('useServices must be used within a ServicesProvider');
  }
  return context;
};

export const usePlans = (): PlansContextType => {
  const context = useContext(PlansContext);
  if (context === undefined) {
    throw new Error('usePlans must be used within a PlansProvider');
  }
  return context;
};

// Address Provider Component (updated with API base URL)
const API_BASE_URL = 'https://servaura-api.onrender.com';

const AddressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // User profile state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userProfileLoading, setUserProfileLoading] = useState(true);
  const [userProfileError, setUserProfileError] = useState<string | null>(null);

  // Addresses state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [addressesError, setAddressesError] = useState<string | null>(null);

  // Mock data fallbacks
  const getMockUserProfile = (): UserProfile => ({
    id: 'user_1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    addresses: [],
    preferences: {
      defaultAddressId: 'addr_1',
      notifications: true,
      theme: 'auto'
    }
  });

  const getMockAddresses = (): Address[] => [
    {
      id: 'addr_1',
      street: '123 Main St',
      apartment: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      type: 'home',
      isDefault: true
    },
    {
      id: 'addr_2',
      street: '456 Business Ave',
      apartment: 'Suite 200',
      city: 'New York',
      state: 'NY',
      zipCode: '10002',
      type: 'work',
      isDefault: false
    }
  ];

  // Fetch user profile function
  const fetchUserProfile = async () => {
    try {
      setUserProfileLoading(true);
      setUserProfileError(null);

      const response = await fetch(`${API_BASE_URL}/api/user/profile`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.status}`);
      }
      
      const data = await response.json();
      setUserProfile(data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setUserProfileError('Failed to fetch user profile from server');
      // Fallback to mock data
      setUserProfile(getMockUserProfile());
    } finally {
      setUserProfileLoading(false);
    }
  };

  // Update user profile function
  const updateUserProfile = async (updatedData: Partial<UserProfile>) => {
    try {
      setUserProfileLoading(true);
      setUserProfileError(null);

      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update user profile: ${response.status}`);
      }
      
      const updatedProfile = await response.json();
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Failed to update user profile:', error);
      setUserProfileError('Failed to update user profile');
      
      // Fallback: update profile locally
      if (userProfile) {
        setUserProfile({ ...userProfile, ...updatedData });
      }
    } finally {
      setUserProfileLoading(false);
    }
  };

  // Fetch addresses function
  const fetchAddresses = async () => {
    try {
      setAddressesLoading(true);
      setAddressesError(null);

      const response = await fetch(`${API_BASE_URL}/api/addresses`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch addresses: ${response.status}`);
      }
      
      const data = await response.json();
      setAddresses(data);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      setAddressesError('Failed to fetch addresses from server');
      // Fallback to mock data
      setAddresses(getMockAddresses());
    } finally {
      setAddressesLoading(false);
    }
  };

  // Add address function
  const addAddress = async (addressData: Omit<Address, 'id'>) => {
    try {
      setAddressesLoading(true);
      setAddressesError(null);

      const response = await fetch(`${API_BASE_URL}/api/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to add address: ${response.status}`);
      }
      
      const newAddress = await response.json();
      setAddresses(prev => [...prev, newAddress]);
    } catch (error) {
      console.error('Failed to add address:', error);
      setAddressesError('Failed to add address');
      
      // Fallback: add address with generated ID
      const newAddress: Address = {
        ...addressData,
        id: `addr_${Date.now()}`
      };
      setAddresses(prev => [...prev, newAddress]);
    } finally {
      setAddressesLoading(false);
    }
  };

  // Update address function
  const updateAddress = async (id: string, updates: Partial<Address>) => {
    try {
      setAddressesLoading(true);
      setAddressesError(null);

      const response = await fetch(`${API_BASE_URL}/api/addresses/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update address: ${response.status}`);
      }
      
      const updatedAddress = await response.json();
      setAddresses(prev => 
        prev.map(address => 
          address.id === id ? updatedAddress : address
        )
      );
    } catch (error) {
      console.error('Failed to update address:', error);
      setAddressesError('Failed to update address');
      
      // Fallback: update address locally
      setAddresses(prev => 
        prev.map(address => 
          address.id === id ? { ...address, ...updates } : address
        )
      );
    } finally {
      setAddressesLoading(false);
    }
  };

  // Delete address function
  const deleteAddress = async (id: string) => {
    try {
      setAddressesLoading(true);
      setAddressesError(null);

      const response = await fetch(`${API_BASE_URL}/api/addresses/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete address: ${response.status}`);
      }
      
      setAddresses(prev => prev.filter(address => address.id !== id));
    } catch (error) {
      console.error('Failed to delete address:', error);
      setAddressesError('Failed to delete address');
      
      // Fallback: remove address locally
      setAddresses(prev => prev.filter(address => address.id !== id));
    } finally {
      setAddressesLoading(false);
    }
  };

  // Get address by ID function
  const getAddressById = (id: string): Address | undefined => {
    return addresses.find(address => address.id === id);
  };

  // Set default address function
  const setDefaultAddress = async (id: string) => {
    try {
      setAddressesLoading(true);
      setAddressesError(null);

      const response = await fetch(`${API_BASE_URL}/api/addresses/${id}/set-default`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to set default address: ${response.status}`);
      }
      
      // Update all addresses - set the selected one as default, others as false
      setAddresses(prev => 
        prev.map(address => ({
          ...address,
          isDefault: address.id === id
        }))
      );

      // Update user profile default address
      if (userProfile) {
        setUserProfile(prev => prev ? {
          ...prev,
          preferences: {
            ...prev.preferences,
            defaultAddressId: id
          }
        } : null);
      }
    } catch (error) {
      console.error('Failed to set default address:', error);
      setAddressesError('Failed to set default address');
      
      // Fallback: update locally
      setAddresses(prev => 
        prev.map(address => ({
          ...address,
          isDefault: address.id === id
        }))
      );
    } finally {
      setAddressesLoading(false);
    }
  };

  // Refresh all data function
  const refreshData = async () => {
    await Promise.all([
      fetchUserProfile(),
      fetchAddresses()
    ]);
  };

  // Initialize data on mount
  useEffect(() => {
    fetchUserProfile();
    fetchAddresses();
  }, []);

  const contextValue: AddressContextType = {
    userProfile,
    userProfileLoading,
    userProfileError,
    addresses,
    addressesLoading,
    addressesError,
    fetchUserProfile,
    updateUserProfile,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    getAddressById,
    setDefaultAddress,
    refreshData
  };

  return (
    <AddressContext.Provider value={contextValue}>
      {children}
    </AddressContext.Provider>
  );
};

// Calendar Provider Component (updated with API base URL)
const API_BASE_URL = 'https://servaura-api.onrender.com';

const CalendarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<{ [date: string]: CalendarService[] }>({});
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);
  
  const [events, setEvents] = useState<{ [date: string]: CalendarEvent[] }>({});
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Mock data fallback for services
  const getMockServices = (): { [date: string]: CalendarService[] } => ({
    '2025-06-05': [
      {
        id: '1',
        type: 'Home Cleaning',
        location: 'Main Residence',
        provider: 'Jane Smith',
        time: '10:00',
        status: 'confirmed',
        date: '2025-06-05',
        description: 'Deep cleaning service',
        estimatedDuration: 180,
        price: 150
      },
      {
        id: '2',
        type: 'Maintenance Check',
        location: 'Main Residence',
        provider: 'Tech Solutions',
        time: '14:30',
        status: 'confirmed',
        date: '2025-06-05',
        description: 'HVAC system maintenance',
        estimatedDuration: 120,
        price: 200
      }
    ],
    '2025-06-10': [
      {
        id: '3',
        type: 'Lawn Maintenance',
        location: 'Main Residence',
        provider: 'Green Landscaping',
        time: '08:00',
        status: 'confirmed',
        date: '2025-06-10',
        description: 'Weekly lawn care service',
        estimatedDuration: 90,
        price: 75
      }
    ],
    '2025-06-15': [
      {
        id: '4',
        type: 'Window Cleaning',
        location: 'Main Residence',
        provider: 'Crystal Clear Services',
        time: '11:00',
        status: 'confirmed',
        date: '2025-06-15',
        description: 'Interior and exterior window cleaning',
        estimatedDuration: 120,
        price: 125
      }
    ],
    '2025-06-20': [
      {
        id: '5',
        type: 'Pool Maintenance',
        location: 'Main Residence',
        provider: 'AquaCare Pool Service',
        time: '09:30',
        status: 'pending',
        date: '2025-06-20',
        description: 'Chemical balancing and cleaning',
        estimatedDuration: 60,
        price: 85
      }
    ]
  });

  // Mock data fallback for events
  const getMockEvents = (): { [date: string]: CalendarEvent[] } => ({
    '2025-06-08': [
      {
        id: 'evt_1',
        title: 'Property Inspection',
        date: '2025-06-08',
        startTime: '10:00',
        endTime: '11:00',
        type: 'appointment',
        location: 'Main Residence',
        description: 'Annual property safety inspection'
      }
    ],
    '2025-06-12': [
      {
        id: 'evt_2',
        title: 'Service Contract Renewal',
        date: '2025-06-12',
        startTime: '14:00',
        type: 'reminder',
        description: 'Review and renew annual service contracts'
      }
    ]
  });

  // Fetch services function
  const fetchServices = async (startDate?: string, endDate?: string) => {
    try {
      setServicesLoading(true);
      setServicesError(null);

      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`${API_BASE_URL}/api/calendar/services?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch services: ${response.status}`);
      }
      
      const data = await response.json();
      setServices(data.services || {});
    } catch (error) {
      console.error('Failed to fetch services:', error);
      setServicesError('Failed to fetch services from server');
      // Fallback to mock data
      setServices(getMockServices());
    } finally {
      setServicesLoading(false);
    }
  };

  // Fetch events function
  const fetchEvents = async (startDate?: string, endDate?: string) => {
    try {
      setEventsLoading(true);
      setEventsError(null);

      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`${API_BASE_URL}/api/calendar/events?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.status}`);
      }
      
      const data = await response.json();
      setEvents(data.events || {});
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setEventsError('Failed to fetch events from server');
      // Fallback to mock data
      setEvents(getMockEvents());
    } finally {
      setEventsLoading(false);
    }
  };

  // Add service function
  const addService = async (serviceData: Omit<CalendarService, 'id'>) => {
    try {
      setServicesLoading(true);
      setServicesError(null);

      const response = await fetch(`${API_BASE_URL}/api/calendar/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to add service: ${response.status}`);
      }
      
      const newService = await response.json();
      
      // Update local state
      setServices(prevServices => {
        const date = serviceData.date;
        const existingServices = prevServices[date] || [];
        return {
          ...prevServices,
          [date]: [...existingServices, newService]
        };
      });
    } catch (error) {
      console.error('Failed to add service:', error);
      setServicesError('Failed to add service');
      
      // Fallback: add service locally with generated ID
      const newService: CalendarService = {
        ...serviceData,
        id: `service_${Date.now()}`
      };
      
      setServices(prevServices => {
        const date = serviceData.date;
        const existingServices = prevServices[date] || [];
        return {
          ...prevServices,
          [date]: [...existingServices, newService]
        };
      });
    } finally {
      setServicesLoading(false);
    }
  };

  // Update service function
  const updateService = async (id: string, updates: Partial<CalendarService>) => {
    try {
      setServicesLoading(true);
      setServicesError(null);

      const response = await fetch(`${API_BASE_URL}/api/calendar/services/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update service: ${response.status}`);
      }
      
      const updatedService = await response.json();
      
      // Update local state
      setServices(prevServices => {
        const newServices = { ...prevServices };
        
        // Find and update the service
        Object.keys(newServices).forEach(date => {
          const serviceIndex = newServices[date].findIndex(s => s.id === id);
          if (serviceIndex !== -1) {
            newServices[date][serviceIndex] = updatedService;
          }
        });
        
        return newServices;
      });
    } catch (error) {
      console.error('Failed to update service:', error);
      setServicesError('Failed to update service');
      
      // Fallback: update service locally
      setServices(prevServices => {
        const newServices = { ...prevServices };
        
        Object.keys(newServices).forEach(date => {
          const serviceIndex = newServices[date].findIndex(s => s.id === id);
          if (serviceIndex !== -1) {
            newServices[date][serviceIndex] = {
              ...newServices[date][serviceIndex],
              ...updates
            };
          }
        });
        
        return newServices;
      });
    } finally {
      setServicesLoading(false);
    }
  };

  // Delete service function
  const deleteService = async (id: string) => {
    try {
      setServicesLoading(true);
      setServicesError(null);

      const response = await fetch(`${API_BASE_URL}/api/calendar/services/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete service: ${response.status}`);
      }
      
      // Update local state
      setServices(prevServices => {
        const newServices = { ...prevServices };
        
        Object.keys(newServices).forEach(date => {
          newServices[date] = newServices[date].filter(s => s.id !== id);
          if (newServices[date].length === 0) {
            delete newServices[date];
          }
        });
        
        return newServices;
      });
    } catch (error) {
      console.error('Failed to delete service:', error);
      setServicesError('Failed to delete service');
      
      // Fallback: delete service locally
      setServices(prevServices => {
        const newServices = { ...prevServices };
        
        Object.keys(newServices).forEach(date => {
          newServices[date] = newServices[date].filter(s => s.id !== id);
          if (newServices[date].length === 0) {
            delete newServices[date];
          }
        });
        
        return newServices;
      });
    } finally {
      setServicesLoading(false);
    }
  };

  // Reschedule service function
  const rescheduleService = async (id: string, newDate: string, newTime: string) => {
    try {
      setServicesLoading(true);
      setServicesError(null);

      const response = await fetch(`${API_BASE_URL}/api/calendar/services/${id}/reschedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: newDate, time: newTime }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to reschedule service: ${response.status}`);
      }
      
      const updatedService = await response.json();
      
      // Update local state - move service to new date
      setServices(prevServices => {
        const newServices = { ...prevServices };
        let movedService: CalendarService | null = null;
        
        // Find and remove service from old date
        Object.keys(newServices).forEach(date => {
          const serviceIndex = newServices[date].findIndex(s => s.id === id);
          if (serviceIndex !== -1) {
            movedService = newServices[date][serviceIndex];
            newServices[date].splice(serviceIndex, 1);
            if (newServices[date].length === 0) {
              delete newServices[date];
            }
          }
        });
        
        // Add service to new date
        if (movedService) {
          const updatedMovedService = { ...movedService, date: newDate, time: newTime };
          const existingServices = newServices[newDate] || [];
          newServices[newDate] = [...existingServices, updatedMovedService];
        }
        
        return newServices;
      });
    } catch (error) {
      console.error('Failed to reschedule service:', error);
      setServicesError('Failed to reschedule service');
      
      // Fallback: reschedule service locally
      await updateService(id, { date: newDate, time: newTime });
    } finally {
      setServicesLoading(false);
    }
  };

  // Add event function
  const addEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
    try {
      setEventsLoading(true);
      setEventsError(null);

      const response = await fetch(`${API_BASE_URL}/api/calendar/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to add event: ${response.status}`);
      }
      
      const newEvent = await response.json();
      
      // Update local state
      setEvents(prevEvents => {
        const date = eventData.date;
        const existingEvents = prevEvents[date] || [];
        return {
          ...prevEvents,
          [date]: [...existingEvents, newEvent]
        };
      });
    } catch (error) {
      console.error('Failed to add event:', error);
      setEventsError('Failed to add event');
      
      // Fallback: add event locally
      const newEvent: CalendarEvent = {
        ...eventData,
        id: `event_${Date.now()}`
      };
      
      setEvents(prevEvents => {
        const date = eventData.date;
        const existingEvents = prevEvents[date] || [];
        return {
          ...prevEvents,
          [date]: [...existingEvents, newEvent]
        };
      });
    } finally {
      setEventsLoading(false);
    }
  };

  // Update event function
  const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    try {
      setEventsLoading(true);
      setEventsError(null);

      const response = await fetch(`${API_BASE_URL}/api/calendar/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update event: ${response.status}`);
      }
      
      const updatedEvent = await response.json();
      
      // Update local state
      setEvents(prevEvents => {
        const newEvents = { ...prevEvents };
        
        Object.keys(newEvents).forEach(date => {
          const eventIndex = newEvents[date].findIndex(e => e.id === id);
          if (eventIndex !== -1) {
            newEvents[date][eventIndex] = updatedEvent;
          }
        });
        
        return newEvents;
      });
    } catch (error) {
      console.error('Failed to update event:', error);
      setEventsError('Failed to update event');
      
      // Fallback: update event locally
      setEvents(prevEvents => {
        const newEvents = { ...prevEvents };
        
        Object.keys(newEvents).forEach(date => {
          const eventIndex = newEvents[date].findIndex(e => e.id === id);
          if (eventIndex !== -1) {
            newEvents[date][eventIndex] = {
              ...newEvents[date][eventIndex],
              ...updates
            };
          }
        });
        
        return newEvents;
      });
    } finally {
      setEventsLoading(false);
    }
  };

  // Delete event function
  const deleteEvent = async (id: string) => {
    try {
      setEventsLoading(true);
      setEventsError(null);

      const response = await fetch(`${API_BASE_URL}/api/calendar/events/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete event: ${response.status}`);
      }
      
      // Update local state
      setEvents(prevEvents => {
        const newEvents = { ...prevEvents };
        
        Object.keys(newEvents).forEach(date => {
          newEvents[date] = newEvents[date].filter(e => e.id !== id);
          if (newEvents[date].length === 0) {
            delete newEvents[date];
          }
        });
        
        return newEvents;
      });
    } catch (error) {
      console.error('Failed to delete event:', error);
      setEventsError('Failed to delete event');
      
      // Fallback: delete event locally
      setEvents(prevEvents => {
        const newEvents = { ...prevEvents };
        
        Object.keys(newEvents).forEach(date => {
          newEvents[date] = newEvents[date].filter(e => e.id !== id);
          if (newEvents[date].length === 0) {
            delete newEvents[date];
          }
        });
        
        return newEvents;
      });
    } finally {
      setEventsLoading(false);
    }
  };

  // Utility functions
  const getServicesForDate = (date: string): CalendarService[] => {
    return services[date] || [];
  };

  const getEventsForDate = (date: string): CalendarEvent[] => {
    return events[date] || [];
  };

  const getMarkedDates = () => {
    const marked: { [date: string]: any } = {};
    
    // Mark dates with services
    Object.keys(services).forEach(date => {
      if (services[date].length > 0) {
        marked[date] = { marked: true, dotColor: '#007AFF' };
      }
    });
    
    // Mark dates with events
    Object.keys(events).forEach(date => {
      if (events[date].length > 0) {
        marked[date] = {
          ...marked[date],
          marked: true,
          dotColor: marked[date]?.dotColor || '#34C759'
        };
      }
    });
    
    return marked;
  };

  const searchServices = (query: string): { [date: string]: CalendarService[] } => {
    if (!query.trim()) return {};
    
    const filtered: { [date: string]: CalendarService[] } = {};
    const lowerQuery = query.toLowerCase();
    
    Object.keys(services).forEach(date => {
      const matchingServices = services[date].filter(service =>
        service.type.toLowerCase().includes(lowerQuery) ||
        service.provider.toLowerCase().includes(lowerQuery) ||
        service.location.toLowerCase().includes(lowerQuery) ||
        service.description?.toLowerCase().includes(lowerQuery)
      );
      
      if (matchingServices.length > 0) {
        filtered[date] = matchingServices;
      }
    });
    
    return filtered;
  };

  const refreshCalendarData = async () => {
    await Promise.all([
      fetchServices(),
      fetchEvents()
    ]);
  };

  // Initialize data on mount
  useEffect(() => {
    const initializeCalendar = async () => {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      await Promise.all([
        fetchServices(startOfMonth.toISOString().split('T')[0], endOfMonth.toISOString().split('T')[0]),
        fetchEvents(startOfMonth.toISOString().split('T')[0], endOfMonth.toISOString().split('T')[0])
      ]);
    };
    
    initializeCalendar();
  }, []);

  const contextValue: CalendarContextType = {
    // Services data
    services,
    servicesLoading,
    servicesError,
    
    // Events data
    events,
    eventsLoading,
    eventsError,
    
    // Current selection
    selectedDate,
    currentMonth,
    
    // Methods - Services
    fetchServices,
    addService,
    updateService,
    deleteService,
    rescheduleService,
    getServicesForDate,
    
    // Methods - Events
    fetchEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsForDate,
    
    // Navigation methods
    setSelectedDate,
    setCurrentMonth,
    
    // Utility methods
    getMarkedDates,
    searchServices,
    refreshCalendarData
  };

  return (
    <CalendarContext.Provider value={contextValue}>
      {children}
    </CalendarContext.Provider>
  );
};

// Custom hooks to use contexts
export const useAddress = () => {
  const context = useContext(AddressContext);
  if (context === undefined) {
    throw new Error('useAddress must be used within an AddressProvider');
  }
  return context;
};

export const usePlans = () => {
  const context = useContext(PlansContext);
  if (context === undefined) {
    throw new Error('usePlans must be used within a PlansProvider');
  }
  return context;
};

export const useCalendar = (): CalendarContextType => {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};

export const usePersonalInfo = () => {
  const context = useContext(PersonalInfoContext);
  if (context === undefined) {
    throw new Error('usePersonalInfo must be used within a PersonalInfoProvider');
  }
  return context;
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export const useServices = () => {
  const context = useContext(ServicesContext);
  if (context === undefined) {
    throw new Error('useServices must be used within a ServicesProvider');
  }
  return context;
};

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurityContext must be used within a SecurityProvider');
  }
  return context;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

// Export types for use in other components
export type { 
  Address, 
  UserProfile, 
  AddressContextType, 
  PersonalInfo, 
  PersonalInfoContextType,
  PaymentMethod,
  PaymentContextType
};

function RootLayoutContent() {
  const colors = useThemeColors();
  
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { 
          backgroundColor: colors.background
        }
      }}
    >
      <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
      <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
    </Stack>
  );
}

export default function RootLayout() {
  useFrameworkReady();
  const colorScheme = useColorScheme();
  const colors = useThemeColors();
  const isReady = useFrameworkReady();
  
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the splash screen once fonts are loaded or if there's an error
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Return null to keep splash screen visible while fonts load
  if (!fontsLoaded && !fontError) {
    return null;
  }

return (
  <SafeAreaProvider>
    <AuthProvider>
      <SecurityProvider>
        <PersonalInfoProvider>
          <AddressProvider>
            <PaymentProvider>
              <ProfileProvider>
                <ServicesProvider>
                  <PlansProvider>
                    <CalendarProvider>
                      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
                      <RootLayoutContent />
                    </CalendarProvider>
                  </PlansProvider>
                </ServicesProvider>
              </ProfileProvider>
            </PaymentProvider>
          </AddressProvider>
        </PersonalInfoProvider>
      </SecurityProvider>
    </AuthProvider>
  </SafeAreaProvider>
);