import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useThemeColors } from '@/constants/Colors';

interface DateTimePickerModalProps {
  isVisible: boolean;
  date: Date;
  mode: 'date' | 'time';
  onConfirm: (date: Date) => void;
  onCancel: () => void;
}

export default function DateTimePickerModal({
  isVisible,
  date,
  mode,
  onConfirm,
  onCancel,
}: DateTimePickerModalProps) {
  const colors = useThemeColors();
  const [tempDate, setTempDate] = React.useState(date);

  React.useEffect(() => {
    setTempDate(date);
  }, [date]);

  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      if (event.type === 'set') {
        onConfirm(selectedDate || date);
      } else {
        onCancel();
      }
      return;
    }
    
    // For iOS
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    pickerContainer: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
    },
    headerButton: {
      fontSize: 16,
      color: colors.accent,
      fontFamily: 'Inter-SemiBold',
    },
    confirmButton: {
      fontFamily: 'Inter-Bold',
    },
    picker: {
      height: 200,
    },
  });

  if (Platform.OS === 'android') {
    if (!isVisible) return null;
    
    return (
      <DateTimePicker
        value={tempDate}
        mode={mode}
        display="default"
        onChange={handleChange}
      />
    );
  }

  // iOS uses modal
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.modalContainer}>
        <View style={styles.pickerContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onCancel}>
              <Text style={styles.headerButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {mode === 'date' ? 'Select Date' : 'Select Time'}
            </Text>
            <TouchableOpacity onPress={() => onConfirm(tempDate)}>
              <Text style={[styles.headerButton, styles.confirmButton]}>Confirm</Text>
            </TouchableOpacity>
          </View>
          
          <DateTimePicker
            value={tempDate}
            mode={mode}
            display="spinner"
            onChange={handleChange}
            style={styles.picker}
          />
        </View>
      </View>
    </Modal>
  );
}