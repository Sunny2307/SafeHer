import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const CallerDetailsScreen = () => {
  const navigation = useNavigation();
  const [callerName, setCallerName] = useState('');
  const [callerNumber, setCallerNumber] = useState('');
  const [selectedTime, setSelectedTime] = useState('5 sec');

  const handleSave = () => {
    // Pass callerName and callerNumber back to FakeCallScreen
    navigation.navigate('FakeCallScreen', { callerName, callerNumber });
  };

  const timerOptions = ['5 sec', '10 sec', '1 min', '5 min'];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={28} color="#FF69B4" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Caller Details</Text>
        <Text style={styles.subtitle}>Specify time and caller details to schedule a fake call.</Text>

        <Text style={styles.sectionLabel}>Set up caller image</Text>
        <View style={styles.imageRow}>
          <View style={styles.imageOptions}>
            <TouchableOpacity style={styles.imageOption}>
              <Icon name="image-outline" size={24} color="#FF69B4" />
              <Text style={styles.imageText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.imageOption}>
              <Icon name="person-circle-outline" size={24} color="#FF69B4" />
              <Text style={styles.imageText}>Preset</Text>
            </TouchableOpacity>
          </View>
          <Image
            source={{ uri: 'https://via.placeholder.com/64' }}
            style={styles.avatar}
          />
        </View>

        <Text style={styles.sectionLabel}>Set up a fake caller</Text>
        <View style={styles.inputContainer}>
          <View style={styles.inputColumn}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter name"
                placeholderTextColor="#A9A9A9"
                value={callerName}
                onChangeText={setCallerName}
              />
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter number"
                placeholderTextColor="#A9A9A9"
                value={callerNumber}
                onChangeText={setCallerNumber}
                keyboardType="phone-pad"
              />
            </View>
          </View>
          <View style={styles.iconContainer}>
            <TouchableOpacity style={styles.contactIcon}>
              <Icon name="person-outline" size={24} color="#FF69B4" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Pre-set timer</Text>
        <View style={styles.timerRow}>
          {timerOptions.map((time) => (
            <TouchableOpacity
              key={time}
              style={[styles.timerButton, selectedTime === time && styles.timerButtonSelected]}
              onPress={() => setSelectedTime(time)}
              activeOpacity={0.9}
            >
              <Text
                style={selectedTime === time ? styles.timerTextSelected : styles.timerText}
              >
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.9}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
    padding: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#2A2A2A',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#5A5A5A',
    textAlign: 'center',
    marginBottom: 30,
    fontStyle: 'italic',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2A2A2A',
    marginBottom: 10,
  },
  imageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  imageOptions: {
    flexDirection: 'row',
    gap: 20,
  },
  imageOption: {
    alignItems: 'center',
    marginRight: 20,
  },
  imageText: {
    fontSize: 12,
    color: '#5A5A5A',
    marginTop: 4,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  inputColumn: {
    flex: 1,
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    elevation: 2,
    marginBottom: 12,
  },
  input: {
    fontSize: 16,
    color: '#2A2A2A',
  },
  iconContainer: {
    justifyContent: 'center',
    marginLeft: 10,
  },
  contactIcon: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 12,
    elevation: 2,
  },
  timerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timerButton: {
    flexBasis: '48%',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  timerButtonSelected: {
    backgroundColor: '#FF69B4',
    borderColor: '#FF69B4',
  },
  timerText: {
    fontSize: 14,
    color: '#2A2A2A',
  },
  timerTextSelected: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  saveButton: {
    backgroundColor: '#FF69B4',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 3,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CallerDetailsScreen;