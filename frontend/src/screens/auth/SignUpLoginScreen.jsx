import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SignUpLoginScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const navigation = useNavigation();

  const handleContinue = () => {
    // Remove any non-digit characters and ensure the phone number is 10 digits
    const cleanedPhoneNumber = phoneNumber.replace(/\D/g, '');
    if (cleanedPhoneNumber.length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    navigation.navigate('OTPScreen', { phoneNumber: cleanedPhoneNumber });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
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
      <Text style={styles.title}>Sign Up / Log in</Text>

      {/* Input Section */}
      <Text style={styles.label}>Enter your mobile number</Text>
      <View style={styles.inputContainer}>
        <View style={styles.countryCodeContainer}>
          <Image
            source={require('../../assets/in.png')}
            style={styles.indianFlag}
          />
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

      {/* Continue Button */}
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

      {/* Separator */}
      <View style={styles.separatorContainer}>
        <View style={styles.line} />
        <Text style={styles.orText}>Or</Text>
        <View style={styles.line} />
      </View>

      {/* Google Button */}
      <TouchableOpacity style={styles.googleButton}>
        <Image
          source={require('../../assets/google_logo.png')}
          style={styles.googleIcon}
          resizeMode="contain"
        />
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </TouchableOpacity>

      {/* Terms */}
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
  logo: {
    width: 60,
    height: 60,
    marginRight: 15,
    marginTop: -15,
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
  indianFlag: {
    width: 30,
    height: 30,
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
  googleIcon: {
    width: 60,
    height: 28,
    marginRight: 10,
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