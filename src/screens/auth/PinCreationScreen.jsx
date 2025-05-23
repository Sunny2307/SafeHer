import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // For the eye icon
import { useNavigation } from '@react-navigation/native';

const PinCreationScreen = () => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [showPin, setShowPin] = useState(false);
  const pinInputRefs = useRef([]);
  const confirmPinInputRefs = useRef([]);
  const navigation = useNavigation();

  // Handle PIN input change and auto-focus next input
  const handlePinChange = (text, index) => {
    const newPin = [...pin];
    newPin[index] = text;
    setPin(newPin);
    if (text && index < 3) {
      pinInputRefs.current[index + 1].focus();
    }
  };

  // Handle Confirm PIN input change and auto-focus next input
  const handleConfirmPinChange = (text, index) => {
    const newConfirmPin = [...confirmPin];
    newConfirmPin[index] = text;
    setConfirmPin(newConfirmPin);
    if (text && index < 3) {
      confirmPinInputRefs.current[index + 1].focus();
    }
  };

  // Handle Show PIN toggle
  const toggleShowPin = () => {
    setShowPin(!showPin);
  };

  // Handle Submit button press
  const handleSubmit = () => {
    const enteredPin = pin.join('');
    const enteredConfirmPin = confirmPin.join('');
    if (enteredPin.length !== 4 || enteredConfirmPin.length !== 4) {
      alert('Please enter a 4-digit PIN in both fields');
      return;
    }
    if (enteredPin !== enteredConfirmPin) {
      alert('PINs do not match. Please try again.');
      return;
    }
    alert('PIN Created Successfully: ' + enteredPin);
    navigation.navigate('CompleteProfileScreen'); // Navigate to CompleteProfileScreen
  };

  return (
    <View style={styles.container}>
      {/* Header - Same as OTPScreen with Logo */}
      <View style={styles.header}>
        <View style={styles.logoSection}>
          <Image
            source={require('../../assets/safeher_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>SafeHer</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>Create a New PIN</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Please create a 4-digit PIN that will be used to access your account
      </Text>

      {/* Enter PIN Section */}
      <Text style={styles.sectionTitle}>Enter PIN</Text>
      <View style={styles.inputSection}>
        <View style={styles.pinContainer}>
          {pin.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (pinInputRefs.current[index] = ref)}
              style={styles.pinInput}
              value={digit}
              onChangeText={(text) => handlePinChange(text, index)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
              secureTextEntry={!showPin}
              onSubmitEditing={() => {
                if (index < 3) pinInputRefs.current[index + 1].focus();
              }}
            />
          ))}
        </View>
        <TouchableOpacity onPress={toggleShowPin}>
          <Icon
            name={showPin ? 'visibility' : 'visibility-off'}
            size={24}
            color="#4B1C46"
          />
        </TouchableOpacity>
      </View>

      {/* Confirm PIN Section */}
      <Text style={styles.sectionTitle}>Confirm PIN</Text>
      <View style={styles.inputSection}>
        <View style={styles.pinContainer}>
          {confirmPin.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (confirmPinInputRefs.current[index] = ref)}
              style={styles.pinInput}
              value={digit}
              onChangeText={(text) => handleConfirmPinChange(text, index)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
              secureTextEntry={!showPin}
              onSubmitEditing={() => {
                if (index < 3) confirmPinInputRefs.current[index + 1].focus();
              }}
            />
          ))}
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
  },
  header: {
    marginBottom: 25,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 15,
    marginTop: -30,
  },
  logoText: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#FF69B4',
    marginTop: -30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  inputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '70%',
  },
  pinInput: {
    width: 56,
    height: 56,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    fontSize: 24,
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#4B1C46',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PinCreationScreen;