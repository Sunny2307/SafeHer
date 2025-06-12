import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Header from '../../components/Header'; // Adjust the path as needed
import BottomNav from '../../components/BottomNav'; // Adjust the path as needed

const FakeCallScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // State to store caller details
  const [callerName, setCallerName] = useState('');
  const [callerNumber, setCallerNumber] = useState('');

  // Update state when new params are received
  useEffect(() => {
    if (route.params?.callerName) {
      setCallerName(route.params.callerName);
    }
    if (route.params?.callerNumber) {
      setCallerNumber(route.params.callerNumber);
    }
  }, [route.params]);

  const handleGetCall = () => {
    // Placeholder for fake call functionality
    alert('Initiating a fake call...');
  };

  const handleSetCallerDetails = () => {
    navigation.navigate('CallerDetailsScreen');
  };

  return (
    <View style={styles.container}>
      <Header showBack={false} />
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Icon name="call-outline" size={28} color="#FF69B4" style={styles.titleIcon} />
          <Text style={styles.title}>Fake Call</Text>
        </View>
        <Text style={styles.subtitle}>
          Place a fake phone call and pretend you are talking to someone.
        </Text>
        <TouchableOpacity style={styles.callerDetailsContainer} onPress={handleSetCallerDetails}>
          <Image
            source={{ uri: 'https://via.placeholder.com/40' }}
            style={styles.avatar}
          />
          <View style={styles.callerInfo}>
            <Text style={styles.callerDetailsText}>Caller Details</Text>
            {callerName && callerNumber ? (
              <>
                <Text style={styles.callerName}>{callerName}</Text>
                <Text style={styles.callerNumber}>{callerNumber}</Text>
              </>
            ) : (
              <Text style={styles.callerDetailsSubtitle}>Set caller</Text>
            )}
          </View>
          <Icon name="pencil-outline" size={20} color="#FF69B4" style={styles.editIcon} />
        </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.getCallButton}
          onPress={handleGetCall}
          activeOpacity={0.9}
        >
          <Text style={styles.getCallButtonText}>Get a call</Text>
        </TouchableOpacity>
      </View>
      <BottomNav />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    justifyContent: 'flex-start',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  titleIcon: {
    marginRight: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#2A2A2A',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#5A5A5A',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '400',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  callerDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  callerInfo: {
    flex: 1,
  },
  callerDetailsText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2A2A2A',
  },
  callerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2A2A2A',
    marginTop: 2,
  },
  callerNumber: {
    fontSize: 14,
    color: '#5A5A5A',
    fontWeight: '400',
  },
  callerDetailsSubtitle: {
    fontSize: 14,
    color: '#5A5A5A',
    fontWeight: '400',
    marginTop: 2,
  },
  editIcon: {
    padding: 5,
    backgroundColor: 'rgba(255, 105, 180, 0.1)',
    borderRadius: 15,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  getCallButton: {
    backgroundColor: '#FF69B4',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  getCallButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default FakeCallScreen;