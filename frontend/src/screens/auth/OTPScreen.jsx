// OTPScreen.js
import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { verifyOTP, sendOTP } from '../../api/api';

const OTPScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { phoneNumber, sessionId } = route.params;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      Alert.alert('Error', 'Please enter a 6-digit OTP');
      return;
    }

    try {
      const verifyResponse = await verifyOTP(sessionId, enteredOtp);
      console.log('OTP verified:', verifyResponse.data);
      Alert.alert('Success', 'OTP verified successfully!');
      navigation.navigate('PinCreationScreen', { phoneNumber });
    } catch (error) {
      console.error('OTP verification error:', {
        message: error.message,
        response: error.response
          ? {
              status: error.response.status,
              data: error.response.data,
            }
          : 'No response received',
      });
      const errorMessage = error.response?.data?.error || 'Failed to verify OTP';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleResend = async () => {
    try {
      const otpResponse = await sendOTP(phoneNumber);
      Alert.alert('Success', `OTP resent to +91 ${phoneNumber}`);
      console.log('New OTP sent with session ID:', otpResponse.data.sessionId);
      route.params.sessionId = otpResponse.data.sessionId;
    } catch (error) {
      console.error('Error resending OTP:', error);
      const errorMessage = error.response?.data?.error || 'Failed to resend OTP';
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoSection}>
          <Text style={styles.logoText}>SafeHer</Text>
        </View>
      </View>
      <Text style={styles.title}>Enter OTP</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code received on +91 {phoneNumber}
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
              if (index < 5) inputRefs.current[index + 1].focus();
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
    paddingHorizontal: 25,
    paddingVertical: 20,
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
    marginHorizontal: 5,
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
    fontSize: 18,
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