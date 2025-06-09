import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { request, PERMISSIONS } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';

const RecordScreen = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const navigation = useNavigation();
  const cameraRef = useRef(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const historyScaleAnim = useRef(new Animated.Value(1)).current;

  // Use back camera
  const device = useCameraDevice('back');

  // Request camera and microphone permissions
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const cameraStatus = await request(
          Platform.OS === 'ios'
            ? PERMISSIONS.IOS.CAMERA
            : PERMISSIONS.ANDROID.CAMERA
        );
        const micStatus = await request(
          Platform.OS === 'ios'
            ? PERMISSIONS.IOS.MICROPHONE
            : PERMISSIONS.ANDROID.RECORD_AUDIO
        );

        if (cameraStatus === 'granted' && micStatus === 'granted') {
          setHasPermission(true);
        } else {
          Alert.alert(
            'Permissions Denied',
            'Camera and microphone permissions are required to record videos.'
          );
        }
      } catch (error) {
        console.error('Permission request error:', error);
      }
    };

    requestPermissions();
  }, []);

  const saveRecording = async (videoPath) => {
    try {
      // Get existing recordings from AsyncStorage
      const existingRecordings = await AsyncStorage.getItem('recordings');
      const recordings = existingRecordings ? JSON.parse(existingRecordings) : [];
      
      // Add new recording with timestamp
      recordings.push({
        uri: videoPath,
        timestamp: new Date().toISOString(),
      });

      // Save updated recordings back to AsyncStorage
      await AsyncStorage.setItem('recordings', JSON.stringify(recordings));
    } catch (error) {
      console.error('Error saving recording to AsyncStorage:', error);
    }
  };

  const handleRecordingToggle = async () => {
    if (!cameraRef.current) return;

    if (isRecording) {
      // Stop recording
      try {
        await cameraRef.current.stopRecording();
        setIsRecording(false);
      } catch (error) {
        console.error('Error stopping recording:', error);
        Alert.alert('Error', 'Failed to stop recording.');
      }
    } else {
      // Start recording
      try {
        await cameraRef.current.startRecording({
          onRecordingFinished: async (video) => {
            await saveRecording(video.path); // Save the recording
            setIsRecording(false);
          },
          onRecordingError: (error) => {
            console.error('Recording error:', error);
            Alert.alert('Error', 'Failed to record video.');
            setIsRecording(false);
          },
          videoCodec: 'h264',
          fileType: 'mp4',
        });
        setIsRecording(true);
      } catch (error) {
        console.error('Error starting recording:', error);
        Alert.alert('Error', 'Failed to start recording.');
      }
    }

    // Animate button on press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleHistoryTap = () => {
    // Navigate to history screen
    navigation.navigate('RecordingHistoryScreen');

    // Animate history section on press
    Animated.sequence([
      Animated.timing(historyScaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(historyScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>No back camera available on this device.</Text>
      </SafeAreaView>
    );
  }

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Waiting for camera and microphone permissions...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Overlay for Aesthetic */}
      <View style={styles.backgroundOverlay} />

      {/* Camera (Not Visible in UI) */}
      <Camera
        ref={cameraRef}
        style={{ position: 'absolute', width: 0, height: 0 }} // Hidden from view
        device={device}
        isActive={true}
        video={true}
        audio={true}
        location={false} // Ensure no location metadata for anonymity
      />

      {/* Header */}
      <Header />

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* History Section */}
        <Animated.View style={{ transform: [{ scale: historyScaleAnim }] }}>
          <TouchableOpacity style={styles.historySection} onPress={handleHistoryTap}>
            <Icon name="mic-circle" size={24} color="#FF69B4" style={styles.historyIcon} />
            <Text style={styles.historyText}>Recording: Tap to see history</Text>
            <Icon name="chevron-forward" size={20} color="#555" />
          </TouchableOpacity>
        </Animated.View>

        {/* Spacer to push the recording button to the bottom */}
        <View style={styles.spacer} />

        {/* Recording Button Section */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity style={styles.recordButtonContainer} onPress={handleRecordingToggle}>
            <View
              style={[
                styles.recordButton,
                {
                  backgroundColor: isRecording ? '#FF4B5C' : '#FF69B4',
                  borderColor: isRecording ? '#FF69B4' : '#FF4B5C',
                },
              ]}
            >
              <Icon
                name={isRecording ? 'stop-circle' : 'mic-circle'}
                size={40}
                color="#fff"
                style={styles.recordIcon}
              />
              <Text style={styles.recordButtonText}>
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Bottom Navigation */}
      <BottomNav />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 105, 180, 0.05)',
  },
  mainContent: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  historySection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    borderWidth: 1,
    borderColor: '#FF69B4',
  },
  historyIcon: {
    marginRight: 12,
  },
  historyText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  spacer: {
    flex: 1,
  },
  recordButtonContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
    borderWidth: 2,
  },
  recordIcon: {
    marginRight: 15,
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default RecordScreen;