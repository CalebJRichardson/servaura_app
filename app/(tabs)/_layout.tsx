import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, Image } from 'react-native';
import { Calendar, Chrome as Home, Settings, ClipboardList, Clock } from 'lucide-react-native';
import { useThemeColors } from '@/constants/Colors';

export default function TabLayout() {
  const colors = useThemeColors();

  const styles = StyleSheet.create({
    tabBar: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      height: 80,
      paddingBottom: 20,
      paddingTop: 5,
      backgroundColor: colors.background,
      elevation: 5,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    tabBarLabel: {
      fontSize: 10,
      fontFamily: 'Inter-SemiBold',
    },
  });

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.gray,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('@/assets/images/logo1.png')}
              style={{
                width: size,
                height: size,
                tintColor: color
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Services',
          tabBarIcon: ({ color, size }) => <ClipboardList size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'My Plan',
          tabBarIcon: ({ color, size }) => <Clock size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}