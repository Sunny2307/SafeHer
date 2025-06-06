// HomeScreen.jsx

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  PermissionsAndroid,
  Platform,
  Alert,
  Modal,
  TextInput,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { getUser } from '../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [debugMessage, setDebugMessage] = useState('Initializing...');
  const [modalVisible, setModalVisible] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [userData, setUserData] = useState(null);
  const watchIdRef = useRef(null);
  const navigation = useNavigation();

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission Required',
            message: 'SafeHer needs access to your location.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    } catch (err) {
      console.warn('Permission Error:', err);
      return false;
    }
  };

  const startLiveLocationTracking = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Location permission is required to use this feature.');
      setLoadingLocation(false);
      return;
    }

    const permissionStatus = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    if (!permissionStatus) {
      Alert.alert('Permission Issue', 'Failed to verify location permission.');
      setLoadingLocation(false);
      return;
    }

    const locationServiceStatus = await check(
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    );
    if (locationServiceStatus !== RESULTS.GRANTED) {
      Alert.alert('Location Services Disabled', 'Please enable location services.');
      setLoadingLocation(false);
      return;
    }

    watchIdRef.current = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setDebugMessage(`Live: ${latitude}, ${longitude}`);
        setLoadingLocation(false);
      },
      (error) => {
        console.error('Location Error:', error);
        setDebugMessage(`Error: ${error.message}`);
        Alert.alert('Location Error', error.message);
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 5000,
        fastestInterval: 2000,
        showsBackgroundLocationIndicator: true,
      },
    );
  };

  const fetchUserData = async () => {
    try {
      const response = await getUser();
      setUserData(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch user data';
      Alert.alert('Error', errorMessage);
      if (error.response?.status === 401) {
        navigation.navigate('SignUpLoginScreen');
      }
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('jwtToken');
    navigation.navigate('SignUpLoginScreen');
  };

  useEffect(() => {
    startLiveLocationTracking();
    fetchUserData();

    return () => {
      if (watchIdRef.current !== null) {
        Geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const handleAddFriend = () => navigation.navigate('AddFriendScreen');

  const handleTrackMe = () => {
    if (!location) {
      Alert.alert('Location Unavailable', 'Wait until location is fetched.');
      return;
    }
    setModalVisible(true);
  };

  const handleShareLocation = async () => {
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobileNumber)) {
      Alert.alert('Invalid Number', 'Enter valid 10-digit Indian mobile number.');
      return;
    }

    const formattedNumber = mobileNumber.startsWith('+') ? mobileNumber : `+91${mobileNumber}`;
    const mapUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    const message = `Here is my live location: ${mapUrl}`;
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;

    try {
      await Linking.openURL(whatsappUrl);
      setModalVisible(false);
      setMobileNumber('');
    } catch (error) {
      console.error('WhatsApp Error:', error);
      Alert.alert('Error', 'Unable to open WhatsApp. Make sure it is installed.');
    }
  };

  const handleBottomNav = (label) => alert(`${label} feature coming soon!`);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoSection}>
          <Image
            source={require('../assets/safeher_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>SafeHer</Text>
        </View>
        <View style={styles.iconContainer}>
          <Icon name="notifications-outline" size={24} color="#000" />
          <Icon name="menu-outline" size={28} color="#000" />
        </View>
      </View>

      {/* Profile Section
      {userData ? (
        <View style={styles.profileSection}>
          <Text style={styles.profileText}>Welcome, {userData.name || 'User'}</Text>
          <Text style={styles.profileText}>Phone: {userData.phoneNumber}</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text>Loading profile...</Text>
      )} */}

      {/* Title */}
      <Text style={styles.pageTitle}>Track me</Text>
      <Text style={styles.subTitle}>Share live location with your friends</Text>

      {/* Add Friend */}
      <View style={styles.friendSection}>
        <Text style={styles.addFriendText}>Add a friend to use SOS and Track me</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddFriend}>
          <Text style={styles.addButtonText}>Add friends</Text>
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        {location && !loadingLocation ? (
          <MapView
            style={styles.map}
            region={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker coordinate={location} />
          </MapView>
        ) : (
          <View style={styles.loadingMap}>
            <Text>{debugMessage}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.trackButton} onPress={handleTrackMe}>
          <Text style={styles.trackButtonText}>Track me</Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Share Your Location</Text>
            <Text style={styles.modalSubtitle}>Enter mobile number:</Text>
            <TextInput
              style={styles.input}
              placeholder="10-digit number"
              keyboardType="phone-pad"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              maxLength={10}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => {
                setModalVisible(false);
                setMobileNumber('');
              }}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.shareButton]} onPress={handleShareLocation}>
                <Text style={styles.modalButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  logoSection: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 50, height: 50, marginRight: 10 },
  logoText: { fontSize: 28, fontWeight: 'bold', color: '#FF69B4' },
  iconContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileSection: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f8f8f8',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  profileText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  logoutButton: {
    backgroundColor: '#FF4B5C',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  pageTitle: { fontSize: 20, fontWeight: 'bold', paddingHorizontal: 16, marginTop: 8, color: '#000' },
  subTitle: { fontSize: 14, paddingHorizontal: 16, color: '#555', marginBottom: 10 },
  friendSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  addFriendText: { fontSize: 14, color: '#333', flex: 1 },
  addButton: {
    backgroundColor: '#4B1C46',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginLeft: 10,
  },
  addButtonText: { color: '#fff', fontWeight: '600' },
  mapContainer: { flex: 1, position: 'relative' },
  map: { ...StyleSheet.absoluteFillObject },
  loadingMap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#FF69B4',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  trackButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
    color: '#000',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  shareButton: {
    backgroundColor: '#FF69B4',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default HomeScreen;
