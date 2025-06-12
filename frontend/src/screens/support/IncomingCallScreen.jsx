import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';

const IncomingCallScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { callerName } = route.params || {};

  const [callDuration, setCallDuration] = useState(0);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleEndCall = () => {
    navigation.goBack();
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <View style={styles.container}>
      <View style={styles.callerInfo}>
        <Image
          source={{ uri: 'https://via.placeholder.com/100' }}
          style={styles.avatar}
        />
        <Text style={styles.callerName}>{callerName || 'Unknown Caller'}</Text>
        <Text style={styles.callStatus}>Calling...</Text>
        <Text style={styles.callDuration}>{formatDuration(callDuration)}</Text>
      </View>

      <View style={styles.callControls}>
        <TouchableOpacity
          style={[styles.controlButton, isMuted && styles.controlButtonActive]}
          onPress={toggleMute}
        >
          <Icon
            name={isMuted ? 'mic-off' : 'mic'}
            size={30}
            color={isMuted ? '#FFF' : '#2A2A2A'}
          />
          <Text style={[styles.controlText, isMuted && styles.controlTextActive]}>
            Mute
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlButton, isSpeakerOn && styles.controlButtonActive]}
          onPress={toggleSpeaker}
        >
          <Icon
            name={isSpeakerOn ? 'volume-high' : 'volume-low'}
            size={30}
            color={isSpeakerOn ? '#FFF' : '#2A2A2A'}
          />
          <Text style={[styles.controlText, isSpeakerOn && styles.controlTextActive]}>
            Speaker
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
        <Icon name="call-outline" size={30} color="#FFF" />
        <Text style={styles.endCallText}>End Call</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C2526',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  callerInfo: {
    alignItems: 'center',
    marginTop: 50,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  callerName: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 10,
  },
  callStatus: {
    fontSize: 18,
    color: '#A9A9A9',
    marginBottom: 10,
  },
  callDuration: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '500',
  },
  callControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  controlButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    padding: 15,
    marginHorizontal: 20,
  },
  controlButtonActive: {
    backgroundColor: '#FF69B4',
  },
  controlText: {
    fontSize: 14,
    color: '#2A2A2A',
    marginTop: 5,
  },
  controlTextActive: {
    color: '#FFF',
  },
  endCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    borderRadius: 50,
    paddingVertical: 15,
    marginHorizontal: 50,
  },
  endCallText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 10,
  },
});

export default IncomingCallScreen;