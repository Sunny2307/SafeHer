import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { verifyOTP, sendOTP } from '../../api/api';
import Header from '../../components/Header'; // Adjust the path as needed

const { width } = Dimensions.get('window');
const OTPScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { phoneNumber, sessionId } = route.params;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const inputRefs = useRef([]);

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleFocus = (index) => {
    setFocusedIndex(index);
  };

  const handleBlur = () => {
    setFocusedIndex(null);
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
      <Header showBack={true} />
      <Text style={styles.title}>Enter OTP</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code received on +91 {phoneNumber}
      </Text>
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={[
              styles.otpInput,
              focusedIndex === index && styles.otpInputFocused,
            ]}
            value={digit}
            onChangeText={(text) => handleOtpChange(text, index)}
            onFocus={() => handleFocus(index)}
            onBlur={handleBlur}
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
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#F5F7FA',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
    color: '#2A2A2A',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#5A5A5A',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  otpInput: {
    width: (width - 60) / 6 - 10,
    height: 50,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    marginHorizontal: 5,
    fontSize: 22,
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    color: '#2A2A2A',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  otpInputFocused: {
    borderColor: '#FF69B4', // Matching the header's logo color
    borderWidth: 2,
  },
  verifyButton: {
    backgroundColor: '#FF69B4', // Matching the header's logo color
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  resendText: {
    fontSize: 16,
    color: '#FF69B4', // Matching the header's logo color
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontWeight: '500',
    marginVertical: 10,
  },
});

export default OTPScreen;