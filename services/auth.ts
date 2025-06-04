import * as SecureStore from 'expo-secure-store';

// Mock login function - would connect to your backend in a real app
export const login = async (email: string, password: string): Promise<boolean> => {
  // Validate input
  if (!email || !password) {
    return false;
  }
  
  try {
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Here you would normally make an API call to authenticate
    // For demo purposes, we'll accept any non-empty email/password
    
    // Mock user data
    const userData = {
      id: '12345',
      name: 'John Doe',
      email: email,
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'
    };
    
    // Store auth token and user data
    await SecureStore.setItemAsync('authToken', 'mock-jwt-token');
    await SecureStore.setItemAsync('user', JSON.stringify(userData));
    
    return true;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
};

// Logout function
export const logout = async (): Promise<void> => {
  try {
    // Remove stored credentials
    await SecureStore.deleteItemAsync('authToken');
    await SecureStore.deleteItemAsync('user');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await SecureStore.getItemAsync('authToken');
    return !!token;
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const userData = await SecureStore.getItemAsync('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
};