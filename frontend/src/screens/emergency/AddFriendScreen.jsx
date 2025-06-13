import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  SafeAreaView,
  PermissionsAndroid,
  Platform,
  ScrollView,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import Icon from 'react-native-vector-icons/Ionicons';
import { selectContactPhone } from 'react-native-select-contact';
import { addFriend } from '../api/api'; // Import the addFriend API function

const AddFriendScreen = ({ navigation }) => {
  const [countryCode, setCountryCode] = useState('IN');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSOS, setIsSOS] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddContact = async () => {
    if (isLoading) return;

    if (phoneNumber.length !== 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit phone number.');
      return;
    }

    setIsLoading(true);
    try {
      await addFriend(phoneNumber, isSOS);
      Alert.alert('Success', 'Friend added successfully!', [
        { text: 'OK', onPress: () => {
          setPhoneNumber('');
          navigation.goBack();
        }},
      ]);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to add friend';
      Alert.alert('Error', errorMessage);
      if (error.response?.status === 401) {
        navigation.navigate('SignUpLogin');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const requestContactsPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
          {
            title: 'Contacts Permission',
            message: 'SafeHer needs access to your contacts to select an SOS contact.',
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
      Alert.alert('Permission Denied', 'Contacts permission is required.');
      return;
    }

    try {
      const selection = await selectContactPhone();
      if (selection) {
        let number = selection.selectedPhone.number.replace(/[^0-9]/g, '');
        if (number.startsWith('+91')) number = number.slice(3);
        if (number.length === 10) {
          setPhoneNumber(number);
          Alert.alert('Contact Selected', `${selection.contact.name || 'Contact'} has been selected.`);
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
          <Image
            source={require('../../assets/safeher_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
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
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                maxLength={10}
              />
              <TouchableOpacity onPress={handleContactSelection} style={styles.contactIcon}>
                <Icon name="person-add-outline" size={24} color="#FF69B4" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.checkboxContainer}>
            <CheckBox
              value={isSOS}
              onValueChange={setIsSOS}
              tintColors={{ true: '#FF69B4', false: '#ccc' }}
            />
            <Text style={styles.checkboxLabel}>Make this person my SOS contact</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>👥 Who is a Friend?</Text>
            <Text style={styles.infoText}>
              Friend is someone who receives your live location when you use the Track Me feature.
            </Text>

            <Text style={styles.infoTitle}>🆘 Who is an SOS contact?</Text>
            <Text style={styles.infoText}>
              An SOS contact receives your SOS alerts during an emergency.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, (phoneNumber.length !== 10 || isLoading) && { opacity: 0.5 }]}
            disabled={phoneNumber.length !== 10 || isLoading}
            onPress={handleAddContact}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Adding...' : 'Add Contact'}
            </Text>
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
  logo: {
    width: 40,
    height: 40,
    marginRight: 8,
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
