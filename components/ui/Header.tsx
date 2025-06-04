import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useThemeColors } from '@/constants/Colors';

interface HeaderProps {
  title: string;
  showNotification?: boolean;
  onBack?: () => void;
}

export default function Header({ title, showNotification = false, onBack }: HeaderProps) {
  const colors = useThemeColors();

  const styles = StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
      ...Platform.select({
        ios: {
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      marginRight: 10,
    },
    backText: {
      fontSize: 24,
      color: colors.text,
    },
    title: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: '#E6D592',
    },
    notificationButton: {
      padding: 5,
      position: 'relative',
    },
    notificationBadge: {
      position: 'absolute',
      top: 5,
      right: 5,
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: 'red',
      borderWidth: 1,
      borderColor: colors.background,
    },
  });

  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      
      {showNotification && (
        <TouchableOpacity style={styles.notificationButton}>
          <Bell size={24} color={colors.text} />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      )}
    </View>
  );
}