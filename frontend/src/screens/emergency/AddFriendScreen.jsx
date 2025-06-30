import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  PermissionsAndroid,
  Platform,
  ScrollView,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import Icon from 'react-native-vector-icons/Ionicons';
import { selectContactPhone } from 'react-native-select-contact';
import { addFriend } from '../../api/api';

const AddFriendScreen = ({ navigation }) => {
  const [countryCode, setCountryCode] = useState('IN');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [friendName, setFriendName] = useState('');
  const [isSOS, setIsSOS] = useState(true);

  // Sanitize phone number input to allow only digits
  const handlePhoneNumberChange = (text) => {
    const sanitizedNumber = text.replace(/[^0-9]/g, '');
    console.log('Sanitized Number:', sanitizedNumber, 'Length:', sanitizedNumber.length);
    setPhoneNumber(sanitizedNumber);
  };

  // Sanitize friend name to allow only letters, spaces, and hyphens
  const handleFriendNameChange = (text) => {
    const sanitizedName = text.replace(/[^a-zA-Z\s-]/g, '');
    console.log('Sanitized Name:', sanitizedName);
    setFriendName(sanitizedName);
  };

  const handleAddContact = async () => {
    const trimmedPhoneNumber = phoneNumber.trim();
    const trimmedFriendName = friendName.trim();
    const fullPhoneNumber = `+91${trimmedPhoneNumber}`;
    console.log('handleAddContact - Full Phone Number:', fullPhoneNumber, 'Trimmed Phone Number:', trimmedPhoneNumber, 'isSOS:', isSOS, 'Length:', trimmedPhoneNumber.length);

    if (trimmedPhoneNumber.length !== 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit phone number.');
      return;
    }
    if (!trimmedFriendName || trimmedFriendName.length < 2) {
      Alert.alert('Invalid Name', 'Please enter a valid friend name (at least 2 characters, letters, spaces, or hyphens only).');
      return;
    }

    const payload = { phoneNumber: trimmedPhoneNumber, isSOS, name: trimmedFriendName };
    console.log('Sending to addFriend API:', payload);

    try {
      await addFriend(trimmedPhoneNumber, isSOS, trimmedFriendName);
      Alert.alert('Success', 'Friend added successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setPhoneNumber('');
            setFriendName('');
            setIsSOS(true);
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error('Add Friend Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        requestData: payload,
      });
      let errorMessage = error.response?.data?.error || 'Failed to add friend. Please try again.';
      if (error.response?.status === 404) {
        errorMessage = 'Friend add endpoint not found. Please ensure the server is running and the /user/addFriend route is implemented.';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check your internet connection and ensure the server is reachable at http://192.168.243.160:3000.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.error || 'Invalid request. Please check the name and phone number.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later or contact support.';
      }
      Alert.alert('Error', errorMessage);
    }
  };

  const requestContactsPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
          {
            title: 'Contacts Permission',
            message: 'SafeHer needs access to your contacts to select a friend.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Permission Error:', err);
        return false;
      }
    } else {
      return true;
    }
  };

  const handleContactSelection = async () => {
    const hasPermission = await requestContactsPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Contacts permission is required to select a friend.');
      return;
    }

    try {
      const selection = await selectContactPhone();
      console.log('Selected Contact:', selection);
      if (selection) {
        let number = selection.selectedPhone.number.replace(/[^0-9]/g, '');
        if (number.startsWith('+91')) number = number.slice(3);
        if (number.length === 10) {
          setPhoneNumber(number);
          const contactName = selection.contact.name || '';
          setFriendName(contactName.replace(/[^a-zA-Z\s-]/g, ''));
          Alert.alert('Contact Selected', `${contactName || 'Contact'} has been selected.`);
        } else {
          Alert.alert('Invalid Number', 'The selected number is not a valid 10-digit Indian number.');
        }
      } else {
        Alert.alert('No Contact Selected', 'No contact was selected.');
      }
    } catch (error) {
      console.error('Contact Selection Error:', error);
      Alert.alert('Error', 'Unable to select contact. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back-outline" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.logoSection}>
          <Text style={styles.logoText}>SafeHer</Text>
        </View>
        <View style={styles.iconContainer}>
          <Icon name="person-outline" size={24} color="#000" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.centeredContent}>
          <Text style={styles.title}>Add Friend</Text>

          <View style={styles.inputRow}>
            <Text style={styles.countryCode}>🇮🇳 +91</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.phoneInput}
                placeholder="Enter phone number"
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={phoneNumber}
                onChangeText={handlePhoneNumberChange}
                maxLength={10}
                autoCorrect={false}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={handleContactSelection} style={styles.contactIcon}>
                <Icon name="person-add-outline" size={24} color="#FF69B4" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.nameInput}
                placeholder="Enter friend name"
                placeholderTextColor="#888"
                value={friendName}
                onChangeText={handleFriendNameChange}
                autoCorrect={false}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.checkboxContainer}>
            <CheckBox
              value={isSOS}
              onValueChange={setIsSOS}
              tintColors={{ true: '#FF69B4', false: '#ccc' }}
            />
            <Text style={styles.checkboxLabel}>Set as SOS contact</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>👥 What is a Friend?</Text>
            <Text style={styles.infoText}>
              A friend is someone who receives your live location when you use the Track Me feature.
            </Text>

            <Text style={styles.infoTitle}>🆘 What is an SOS Contact?</Text>
            <Text style={styles.infoText}>
              An SOS contact receives your SOS alerts during an emergency.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, (phoneNumber?.length !== 10 || !friendName?.trim() || friendName.trim().length < 2) && { opacity: 0.5 }]}
            disabled={phoneNumber?.length !== 10 || !friendName?.trim() || friendName.trim().length < 2}
            onPress={handleAddContact}
          >
            <Text style={styles.buttonText}>Add Friend</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F5FF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF69B4',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  centeredContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  countryCode: {
    fontSize: 24,
    color: '#333',
    marginRight: 10,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  nameInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  contactIcon: {
    marginLeft: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
    width: '100%',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#444',
    marginLeft: 10,
    fontWeight: '500',
  },
  infoBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 15,
    marginVertical: 20,
    width: '100%',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontWeight: '600',
    color: '#FF69B4',
    marginTop: 10,
    fontSize: 16,
  },
  infoText: {
    color: '#555',
    fontSize: 14,
    marginTop: 5,
    lineHeight: 20,
  },
  button: {
    width: '100%',
    backgroundColor: '#FF69B4',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddFriendScreen;