import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import * as Keychain from 'react-native-keychain';
import { useNavigation } from '@react-navigation/native';
import { getUser } from '../api/api';

const PinLoginScreen = () => {
  const [pin, setPin] = useState(['', '', '', '']);
  const pinInputRefs = useRef([]);
  const navigation = useNavigation();

  useEffect(() => {
    checkBiometricAuth();
  }, []);

  const checkBiometricAuth = async () => {
    const rnBiometrics = new ReactNativeBiometrics();
    try {
      const { available } = await rnBiometrics.isSensorAvailable();
      if (available) {
        const credentials = await Keychain.getGenericPassword({
          authenticationPrompt: { title: 'Authenticate to access SafeHer' },
        });
        if (credentials) {
          // Verify PIN with backend
          try {
            const response = await getUser();
            const userPin = response.data.pin;
            if (userPin === credentials.password) {
              Alert.alert('Success', 'Authenticated with biometrics!');
              navigation.navigate('CompleteProfileScreen');
            } else {
              Alert.alert('Error', 'PIN does not match backend. Please enter your PIN manually.');
            }
          } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to verify PIN with backend';
            Alert.alert('Error', errorMessage);
            if (error.response?.status === 401) {
              navigation.navigate('SignUpLoginScreen');
            }
          }
        }
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      Alert.alert('Error', 'Biometric authentication failed. Please enter your PIN.');
    }
  };

  const handlePinChange = (text, index) => {
    const newPin = [...pin];
    newPin[index] = text;
    setPin(newPin);
    if (text && index < 3) {
      pinInputRefs.current[index + 1].focus();
    }
  };

  const handleSubmit = async () => {
    const enteredPin = pin.join('');
    if (enteredPin.length !== 4) {
      Alert.alert('Error', 'Please enter a 4-digit PIN');
      return;
    }

    try {
      // Verify PIN with backend
      const response = await getUser();
      const userPin = response.data.pin;
      if (userPin === enteredPin) {
        // Verify with Keychain for local consistency
        const credentials = await Keychain.getGenericPassword();
        if (credentials && credentials.password === enteredPin) {
          Alert.alert('Success', 'PIN verified successfully!');
          navigation.navigate('CompleteProfileScreen');
        } else {
          Alert.alert('Error', 'Local PIN does not match. Please reset your PIN.');
        }
      } else {
        Alert.alert('Error', 'Invalid PIN. Please try again.');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to verify PIN';
      Alert.alert('Error', errorMessage);
      if (error.response?.status === 401) {
        navigation.navigate('SignUpLoginScreen');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Your PIN</Text>
      <Text style={styles.subtitle}>Please enter your 4-digit PIN to access SafeHer</Text>

      <View style={styles.pinContainer}>
        {pin.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (pinInputRefs.current[index] = ref)}
            style={styles.pinInput}
            value={digit}
            onChangeText={(text) => jadePinChange(text, index)}
            keyboardType="numeric"
            maxLength={1}
            textAlign="center"
            secureTextEntry={true}
            onSubmitEditing={() => {
              if (index < 3) pinInputRefs.current[index + 1].focus();
            }}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.biometricButton} onPress={checkBiometricAuth}>
        <Text style={styles.biometricText}>Use Biometrics</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
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
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '70%',
    marginBottom: 40,
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
    width: '80%',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  biometricButton: {
    backgroundColor: '#FF69B4',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    width: '80%',
  },
  biometricText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PinLoginScreen;