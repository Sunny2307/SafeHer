import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import * as Keychain from 'react-native-keychain';
import { savePin } from '../api/api';

const PinCreationScreen = () => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [showPin, setShowPin] = useState(false);
  const pinInputRefs = useRef([]);
  const confirmPinInputRefs = useRef([]);
  const navigation = useNavigation();

  const handlePinChange = (text, index) => {
    const newPin = [...pin];
    newPin[index] = text;
    setPin(newPin);
    if (text && index < 3) {
      pinInputRefs.current[index + 1].focus();
    }
  };

  const handleConfirmPinChange = (text, index) => {
    const newConfirmPin = [...confirmPin];
    newConfirmPin[index] = text;
    setConfirmPin(newConfirmPin);
    if (text && index < 3) {
      confirmPinInputRefs.current[index + 1].focus();
    }
  };

  const toggleShowPin = () => {
    setShowPin(!showPin);
  };

  const enableBiometricAuth = async (enteredPin) => {
    const rnBiometrics = new ReactNativeBiometrics();
    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      let biometricLabel = '';
      if (available) {
        if (biometryType === BiometryTypes.TouchID) {
          biometricLabel = 'Touch ID';
        } else if (biometryType === BiometryTypes.FaceID) {
          biometricLabel = 'Face ID';
        } else if (biometryType === BiometryTypes.Biometrics) {
          biometricLabel = 'Biometrics';
        }

        Alert.alert(
          `${biometricLabel} Authentication`,
          `Would you like to enable ${biometricLabel} authentication for future logins?`,
          [
            {
              text: 'Yes',
              onPress: async () => {
                await Keychain.setGenericPassword('userPin', enteredPin, {
                  accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
                  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
                });
                Alert.alert('Success', `${biometricLabel} authentication enabled successfully!`);
                navigation.navigate('PinLoginScreen');
              },
            },
            {
              text: 'No',
              onPress: () => {
                Keychain.setGenericPassword('userPin', enteredPin);
                navigation.navigate('PinLoginScreen');
              },
              style: 'cancel',
            },
          ],
        );
      } else {
        await Keychain.setGenericPassword('userPin', enteredPin);
        Alert.alert('Biometrics Not Supported', 'This device does not support biometric authentication.');
        navigation.navigate('PinLoginScreen');
      }
    } catch (error) {
      console.error('Error enabling biometrics:', error);
      Alert.alert('Error', 'Failed to enable biometric authentication. Proceeding without it.');
      await Keychain.setGenericPassword('userPin', enteredPin);
      navigation.navigate('PinLoginScreen');
    }
  };

  const handleSubmit = async () => {
    const enteredPin = pin.join('');
    const enteredConfirmPin = confirmPin.join('');
    if (enteredPin.length !== 4 || enteredConfirmPin.length !== 4) {
      Alert.alert('Error', 'Please enter a 4-digit PIN in both fields');
      return;
    }
    if (enteredPin !== enteredConfirmPin) {
      Alert.alert('Error', 'PINs do not match. Please try again.');
      return;
    }

    try {
      // Save the PIN to the backend
      await savePin(enteredPin, enteredConfirmPin);
      Alert.alert('Success', 'PIN Created Successfully: ' + enteredPin);
      await enableBiometricAuth(enteredPin);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to save PIN';
      Alert.alert('Error', errorMessage);
      if (error.response?.status === 401) {
        // Token expired, redirect to SignUpLoginScreen
        navigation.navigate('SignUpLoginScreen');
      }
    }
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

      <Text style={styles.title}>Create a New PIN</Text>
      <Text style={styles.subtitle}>
        Please create a 4-digit PIN that will be used to access your account
      </Text>

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