import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Calendar, RefreshCw, ClipboardList, CreditCard } from 'lucide-react-native';
import { useThemeColors } from '@/constants/Colors';

interface ServiceCardProps {
  icon: 'calendar' | 'refresh-cw' | 'clipboard-list' | 'credit-card';
  title: string;
  color: string;
  onPress: () => void;
}

export default function ServiceCard({ icon, title, color, onPress }: ServiceCardProps) {
  const colors = useThemeColors();

  const renderIcon = () => {
    switch (icon) {
      case 'calendar':
        return <Calendar size={24} color={color} />;
      case 'refresh-cw':
        return <RefreshCw size={24} color={color} />;
      case 'clipboard-list':
        return <ClipboardList size={24} color={color} />;
      case 'credit-card':
        return <CreditCard size={24} color={color} />;
      default:
        return null;
    }
  };

  const styles = StyleSheet.create({
    card: {
      width: '48%',
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 15,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 15,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 5,
      elevation: 2,
    },
    iconContainer: {
      width: 50,
      height: 50,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    title: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      textAlign: 'center',
      color: colors.text,
    },
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        {renderIcon()}
      </View>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
}