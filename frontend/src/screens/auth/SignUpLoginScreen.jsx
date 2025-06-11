import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { checkUser, sendOTP } from '../../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const withTimeout = (promise, timeoutMs) => {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
  return Promise.race([promise, timeout]);
};

const SignUpLoginScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const handleContinue = async () => {
    if (isLoading) return;

    setIsLoading(true);

    if (!phoneNumber || typeof phoneNumber !== 'string') {
      if (Platform.OS === 'android') {
        console.log('Error: Please enter a valid mobile number');
      } else {
        Alert.alert('Error', 'Please enter a valid mobile number');
      }
      setIsLoading(false);
      return;
    }

    const cleanedPhoneNumber = phoneNumber.replace(/\D/g, '');
    if (cleanedPhoneNumber.length !== 10) {
      if (Platform.OS === 'android') {
        console.log('Error: Please enter a valid 10-digit mobile number');
      } else {
        Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      }
      setIsLoading(false);
      return;
    }

    try {
      console.log('Checking user:', cleanedPhoneNumber);
      const response = await withTimeout(checkUser(cleanedPhoneNumber), 10000);
      console.log('API response:', response);
      const { exists } = response.data;

      if (exists) {
        // Check if a valid token exists
        const token = await AsyncStorage.getItem('jwtToken');
        console.log('Token before navigating to PinLoginScreen:', token);
        if (!token) {
          throw new Error('No authentication token found. Please log in again.');
        }
        console.log('Navigating to PinLoginScreen');
        navigation.navigate('PinLoginScreen', { phoneNumber: cleanedPhoneNumber });
      } else {
        console.log('Sending OTP via 2Factor.in');
        const otpResponse = await withTimeout(sendOTP(cleanedPhoneNumber), 10000);
        console.log('OTP sent successfully:', otpResponse.data);
        navigation.navigate('OTPScreen', {
          phoneNumber: cleanedPhoneNumber,
          sessionId: otpResponse.data.sessionId,
        });
        console.log('Navigation to OTPScreen triggered');
      }
    } catch (error) {
      console.error('Error checking user or sending OTP:', {
        message: error.message,
        response: error.response
          ? {
              status: error.response.status,
              data: error.response.data,
            }
          : 'No response received',
      });
      const errorMessage = error.response?.data?.error || error.message || 'Failed to process request';
      if (Platform.OS === 'android') {
        console.log('Error:', errorMessage);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoSection}>
          <Text style={styles.logoText}>SafeHer</Text>
        </View>
      </View>

      <Text style={styles.title}>Sign Up / Log in</Text>

      <Text style={styles.label}>Enter your mobile number</Text>
      <View style={styles.inputContainer}>
        <View style={styles.countryCodeContainer}>
          <Text style={styles.countryCode}>+91</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Enter Mobile Number"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />
      </View>

      <TouchableOpacity
        style={[styles.continueButton, isLoading && styles.disabledButton]}
        onPress={handleContinue}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>{isLoading ? 'Processing...' : 'Continue'}</Text>
      </TouchableOpacity>

      <View style={styles.separatorContainer}>
        <View style={styles.line} />
        <Text style={styles.orText}>Or</Text>
        <View style={styles.line} />
      </View>

      <TouchableOpacity style={styles.googleButton}>
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </TouchableOpacity>

      <Text style={styles.termsText}>
        By continuing, you agree that you have read and accepted our T&Cs and Privacy Policy
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 25,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#FF69B4',
    marginTop: -15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 25,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 5,
  },
  countryCode: {
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  continueButton: {
    backgroundColor: '#4B1C46',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 25,
  },
  disabledButton: {
    backgroundColor: '#a9a9a9',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  orText: {
    marginHorizontal: 10,
    color: '#666',
    fontSize: 16,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 25,
  },
  googleButtonText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginVertical: 250,
    lineHeight: 18,
  },
});

export default SignUpLoginScreen;
