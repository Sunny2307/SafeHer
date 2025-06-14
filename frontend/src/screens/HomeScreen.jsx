import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  PermissionsAndroid,
  Platform,
  Alert,
  Linking, // Keep Linking for WhatsApp integration
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { getUser, getFriends } from '../api/api'; // Added getFriends import
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const HomeScreen = () => {
  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [debugMessage, setDebugMessage] = useState('Initializing...');
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

  const handleTrackMe = async () => {
    if (!location) {
      Alert.alert('Location Unavailable', 'Wait until location is fetched.');
      return;
    }

    try {
      // Fetch the list of friends
      const response = await getFriends();
      const friends = response.data.friends || [];
      if (friends.length === 0) {
        throw new Error('No friends added. Please add a friend first.');
      }

      // Prioritize SOS contact; if none, use the first friend
      let friendNumber = null;
      const sosContact = friends.find(friend => friend.isSOS);
      if (sosContact) {
        friendNumber = sosContact.phoneNumber;
      } else {
        friendNumber = friends[0].phoneNumber;
      }

      // Create a Google Maps link with the user's location
      const mapUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
      const message = `Here is my live location: ${mapUrl}`;

      // Create WhatsApp URL
      const whatsappUrl = `https://wa.me/+91${friendNumber}?text=${encodeURIComponent(message)}`;

      // Open WhatsApp
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        throw new Error('WhatsApp is not installed on this device.');
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to share location';
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header />

      {/* Profile Section */}
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
      )}

      {/* Title */}
      <Text style={states.pageTitle}>Track me</Text>
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

      {/* Bottom Navigation */}
      <BottomNav />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
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
});

export default HomeScreen;
