import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert, NativeModules } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { PermissionsAndroid } from 'react-native';
import RNImmediatePhoneCall from 'react-native-immediate-phone-call';

const BottomNav = () => {
  const navigation = useNavigation();
  const emergencyContact = '9537570585'; // Hardcoded emergency contact number
  const { PowerButton } = NativeModules;

  const requestCallPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CALL_PHONE,
          {
            title: 'Emergency Call Permission',
            message: 'SafeHer needs permission to make an emergency call.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Call Permission Error:', err);
        return false;
      }
    }
    return true; // iOS doesn't require explicit call permission
  };

  const handleEmergencyCall = async () => {
    const hasPermission = await requestCallPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Phone call permission is required for the SOS feature.');
      return;
    }

    try {
      if (RNImmediatePhoneCall) {
        console.log('Attempting direct call with RNImmediatePhoneCall');
        RNImmediatePhoneCall.immediatePhoneCall(emergencyContact);
      } else {
        console.warn('RNImmediatePhoneCall is null or undefined');
        Alert.alert('Error', 'Direct call module not available.');
      }
    } catch (error) {
      console.error('Direct Call Error:', error);
      Alert.alert('Error', 'Failed to initiate emergency call. Please try again.');
    }
  };

  useEffect(() => {
    let subscription = null;
    if (PowerButton && typeof PowerButton.addListener === 'function') {
      // Only create NativeEventEmitter if PowerButton is valid
      const eventEmitter = new (require('react-native').NativeEventEmitter)(PowerButton);
      subscription = eventEmitter.addListener('PowerButtonDoublePress', () => {
        console.log('Power button double-pressed, initiating emergency call');
        handleEmergencyCall();
      });
    } else {
      console.warn('PowerButton native module is not properly set up or unavailable');
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  const handleBottomNav = (label) => {
    if (label === 'Record') {
      navigation.navigate('RecordScreen');
    } else if (label === 'Track Me') {
      navigation.navigate('HomeScreen');
    } else if (label === 'Fake Call') {
      navigation.navigate('FakeCallScreen');
    } else if (label === 'Help') {
      navigation.navigate('HelplineScreen');
    } else if (label === 'SOS') {
      handleEmergencyCall();
    } else {
      alert(`${label} feature coming soon!`);
    }
  };

  return (
    <View style={styles.bottomNav}>
      {[
        ['location-outline', 'Track Me'],
        ['mic-outline', 'Record'],
        ['warning-outline', 'SOS', true],
        ['call-outline', 'Fake Call'],
        ['help-circle-outline', 'Help'],
      ].map(([icon, label, isSos], index) => (
        <TouchableOpacity
          key={index}
          style={[styles.navItem, isSos && styles.sosButton]}
          onPress={() => handleBottomNav(label)}
        >
          <Icon name={icon} size={26} color={isSos ? '#fff' : '#000'} />
          <Text style={[styles.navText, isSos && { color: '#fff' }]}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 1,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  navItem: { alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 10, textAlign: 'center', color: '#000', marginTop: 4 },
  sosButton: {
    backgroundColor: '#FF4B5C',
    padding: 14,
    width: 60,
    height: 60,
    borderRadius: 30,
    top: -15,
  },
});

export default BottomNav;