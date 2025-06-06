import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '../../api/api';
import axios from 'axios';

const OTPScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { phoneNumber } = route.params;

  const [otp, setOtp] = useState(['', '', '', '']);
  const inputRefs = useRef([]);

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 4) {
      alert('Please enter a 4-digit OTP');
      return;
    }

    try {
      const loginResponse = await login(phoneNumber, 'test123');
      const { token } = loginResponse.data;

      // Save JWT token in AsyncStorage
      await AsyncStorage.setItem('jwtToken', token);

      navigation.navigate('PinCreationScreen');
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          await axios.post('http://192.168.56.102:3000/api/register', {
            phoneNumber,
            password: 'test123',
          });

          const loginResponse = await login(phoneNumber, 'test123');
          const { token } = loginResponse.data;

          // Save JWT token after registration and login
          await AsyncStorage.setItem('jwtToken', token);

          navigation.navigate('PinCreationScreen');
        } catch (registerError) {
          console.log('Register error details:', registerError.response);
          const errorMessage = registerError.response?.data?.error || JSON.stringify(registerError.response?.data) || 'Failed to register';
          alert(errorMessage);
        }
      } else {
        const errorMessage = error.response?.data?.error || 'Failed to verify OTP';
        alert(errorMessage);
      }
    }
  };

  const handleResend = () => {
    alert('OTP Resent to +91 ' + phoneNumber);
  };

  return (
    <View style={styles.container}>
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

      <Text style={styles.title}>Enter OTP</Text>
      <Text style={styles.subtitle}>
        Enter the 4-digit code sent to +91 {phoneNumber}
      </Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={styles.otpInput}
            value={digit}
            onChangeText={(text) => handleOtpChange(text, index)}
            keyboardType="numeric"
            maxLength={1}
            textAlign="center"
            onSubmitEditing={() => {
              if (index < 3) inputRefs.current[index + 1].focus();
            }}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
        <Text style={styles.buttonText}>Verify</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleResend}>
        <Text style={styles.resendText}>Resend OTP</Text>
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  otpInput: {
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
  verifyButton: {
    backgroundColor: '#4B1C46',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendText: {
    fontSize: 16,
    color: '#4B1C46',
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginVertical: 16,
  },
});

export default OTPScreen;
