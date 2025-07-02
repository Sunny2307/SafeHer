import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  PermissionsAndroid,
  Platform,
  Alert,
  Modal,
  FlatList,
  Linking,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { getUser, getFriends } from '../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const HomeScreen = () => {
  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [debugMessage, setDebugMessage] = useState('Initializing...');
  const [modalVisible, setModalVisible] = useState(false);
  const [friends, setFriends] = useState([]);
  const [userData, setUserData] = useState(null);
  const watchIdRef = useRef(null);
  const navigation = useNavigation();

  const requestLocationPermission = async () => {
    try {
      let permissionStatus;
      if (Platform.OS === 'android') {
        permissionStatus = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      } else if (Platform.OS === 'ios') {
        permissionStatus = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      }
      return permissionStatus === RESULTS.GRANTED;
    } catch (err) {
      console.warn('Permission Error:', err);
      setDebugMessage('Permission error');
      return false;
    }
  };

  const startLiveLocationTracking = async () => {
    setDebugMessage('Requesting location permission...');
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Location permission is required to use this feature.');
      setDebugMessage('Location permission denied');
      setLoadingLocation(false);
      return;
    }

    setDebugMessage('Starting location fetch...');
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setDebugMessage(`Initial: ${latitude}, ${longitude}`);
        setLoadingLocation(false);

        watchIdRef.current = Geolocation.watchPosition(
          (newPosition) => {
            const { latitude, longitude } = newPosition.coords;
            setLocation({ latitude, longitude });
            setDebugMessage(`Live: ${latitude}, ${longitude}`);
          },
          (error) => {
            console.error('Watch Error:', error);
            setDebugMessage(`Watch error: ${error.message}`);
            Alert.alert('Location Tracking Error', error.message);
          },
          {
            enableHighAccuracy: true,
            distanceFilter: 10,
            interval: 5000,
            fastestInterval: 2000,
            showsBackgroundLocationIndicator: true,
            timeout: 20000,
            maximumAge: 1000,
          },
        );
      },
      (error) => {
        console.error('Initial Location Error:', error);
        setDebugMessage(`Initial error: ${error.message}`);
        Alert.alert('Location Error', 'Unable to fetch initial location. Please ensure location services are enabled.');
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
      },
    );
  };

  const fetchUserData = async () => {
    try {
      const response = await getUser();
      setUserData(response.data);
    } catch (error) {
      console.error('Fetch User Error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to fetch user data';
      Alert.alert('Error', errorMessage);
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await getFriends();
      console.log('Fetched Friends:', response.data);
      setFriends(Array.isArray(response.data.friends) ? response.data.friends : []);
    } catch (error) {
      console.error('Fetch Friends Error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to fetch friends';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('jwtToken');
      navigation.navigate('SignUpLoginScreen');
    } catch (error) {
      console.error('Logout Error:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
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

  useFocusEffect(
    useCallback(() => {
      fetchFriends();
    }, [])
  );

  const handleAddFriend = () => navigation.navigate('AddFriendScreen');

  const handleTrackMe = () => {
    if (!location) {
      Alert.alert('Location Unavailable', 'Please wait until your location is fetched.');
      return;
    }
    if (friends.length === 0) {
      Alert.alert('No Friends', 'Please add a friend to share your location with.', [
        { text: 'OK', onPress: () => navigation.navigate('AddFriendScreen') },
      ]);
      return;
    }
    setModalVisible(true);
  };

  const handleShareLocation = async (friendPhoneNumber) => {
    if (!friendPhoneNumber) {
      Alert.alert('Error', 'Please select a friend to share your location with.');
      return;
    }

    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(friendPhoneNumber.replace('+91', ''))) {
      Alert.alert('Invalid Number', 'The selected friend has an invalid 10-digit Indian mobile number.');
      return;
    }

    const formattedNumber = friendPhoneNumber.startsWith('+91') ? friendPhoneNumber : `+91${friendPhoneNumber}`;
    const mapUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    const message = `Here is my live location: ${mapUrl}`;
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;

    try {
      await Linking.openURL(whatsappUrl);
      setModalVisible(false);
    } catch (error) {
      console.error('WhatsApp Error:', error);
      Alert.alert('Error', 'Unable to open WhatsApp. Please make sure it is installed.');
    }
  };

  const renderFriendItem = ({ item }) => (
    <TouchableOpacity
      style={styles.friendItem}
      onPress={() => handleShareLocation(item.phoneNumber)}
    >
      <Text style={styles.friendText}>
        {item.name || item.phoneNumber} {item.isSOS ? '(SOS)' : ''}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <Text style={styles.pageTitle}>Track me</Text>
      <Text style={styles.subTitle}>Share live location with your friends</Text>
      <View style={styles.friendSection}>
        <Text style={styles.addFriendText}>Add a friend to use SOS and Track me</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddFriend}>
          <Text style={styles.addButtonText}>Add friends</Text>
        </TouchableOpacity>
      </View>
      {friends.length > 0 ? (
        <View style={styles.friendsListContainer}>
          <Text style={styles.friendsListTitle}>Your Friends</Text>
          <FlatList
            data={friends}
            renderItem={renderFriendItem}
            keyExtractor={(item) => item.phoneNumber}
            style={styles.friendsList}
          />
        </View>
      ) : null}
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
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Share Your Location</Text>
            <Text style={styles.modalSubtitle}>Select a friend to share your location with:</Text>
            <FlatList
              data={friends}
              renderItem={renderFriendItem}
              keyExtractor={(item) => item.phoneNumber}
              style={styles.friendsList}
              ListEmptyComponent={<Text>No friends available.</Text>}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <BottomNav />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
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
  friendsListContainer: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  friendsListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  friendsList: {
    maxHeight: 150,
  },
  friendItem: {
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 5,
  },
  friendText: {
    fontSize: 14,
    color: '#333',
  },
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
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    width: 100,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default HomeScreen;