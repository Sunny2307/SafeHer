import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated, Alert, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { request, PERMISSIONS } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import axios from 'axios';

const RecordScreen = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [canStopRecording, setCanStopRecording] = useState(false);
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
      const existingRecordings = await AsyncStorage.getItem('recordings');
      const recordings = existingRecordings ? JSON.parse(existingRecordings) : [];
      
      recordings.push({
        uri: videoPath,
        timestamp: new Date().toISOString(),
      });

      await AsyncStorage.setItem('recordings', JSON.stringify(recordings));
    } catch (error) {
      console.error('Error saving recording to AsyncStorage:', error);
    }
  };

  const uploadToDriveAndShare = async (videoPath) => {
    try {
      const formData = new FormData();
      formData.append('video', {
        uri: videoPath,
        type: 'video/mp4',
        name: `recording_${new Date().toISOString()}.mp4`,
      });

      console.log('Uploading video to server with path:', videoPath);
      console.log('Video path exists:', !!videoPath); // Verify path

      // Retry logic with exponential backoff
      const maxRetries = 3;
      let attempt = 1;
      let response;

      while (attempt <= maxRetries) {
        try {
          console.log(`Upload attempt ${attempt} of ${maxRetries}`);
          response = await axios.post('http://192.168.240.134:3000/upload-video', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 120000, // 120 seconds
          });
          break; // Exit loop if successful
        } catch (error) {
          console.error(`Attempt ${attempt} failed:`, error.message, error.code, error.config.url, error.response ? error.response.status : 'No response');
          if (error.code === 'ECONNABORTED' || error.message.includes('Network Error')) {
            if (attempt === maxRetries) {
              throw error; // Throw error after max retries
            }
            // Exponential backoff: 2s, 4s, 8s
            const delay = Math.pow(2, attempt) * 2000;
            console.log(`Retrying after ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            attempt++;
          } else {
            throw error; // Throw non-network errors immediately

          }
        }
      }

      if (response.data.success) {
        const videoUrl = response.data.videoUrl;
        console.log('Upload successful, navigating to ShareVideoScreen with URL:', videoUrl);
        navigation.navigate('ShareVideoScreen', { videoUrl });
      } else {
 throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading to Drive:', error);
      Alert.alert(
        'Error',
        'Failed to upload video. Please ensure the server is running at 192.168.240.134:3000, both devices are on the same Wi-Fi, and port 3000 is not blocked by a firewall.'
      );
    }
  };

  const handleRecordingToggle = async () => {
    if (!cameraRef.current) {
      Alert.alert('Error', 'Camera not initialized.');
      return;
    }

    // Animate button
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

    if (!isRecording) {
      try {
        console.log('Starting recording...');
        setIsRecording(true);
        setCanStopRecording(false);

        await cameraRef.current.startRecording({
          onRecordingFinished: async (video) => {
            console.log('Recording finished - Video Object:', video);
            setIsRecording(false);
            setCanStopRecording(false);
            if (video?.path) {
              await saveRecording(video.path);
              console.log('Recording saved to history with path:', video.path);
              await uploadToDriveAndShare(video.path); // Upload to Drive and navigate to share
            } else {
              Alert.alert('Warning', 'Recording finished but no file was saved.');
            }
          },
          onRecordingError: (error) => {
            console.error('Recording error:', error);
            Alert.alert('Error', 'Recording failed: ' + error.message); // Fixed syntax
            setIsRecording(false);
            setCanStopRecording(false);
          },
          videoCodec: 'h264',
          fileType: 'mp4',
          frameProcessor: Platform.OS === 'android' ? 'yuv' : undefined, // Force frame capture on Android
        });

        // Delay allowing stop for 3 seconds (as it worked)
        setTimeout(() => {
          console.log('Recording can now be stopped');
          setCanStopRecording(true);
        }, 3000);

      } catch (error) {
        console.error('Start recording error:', error);
        Alert.alert('Error', 'Could not start recording: ' + error.message);
        setIsRecording(false);
        setCanStopRecording(false);
      }

    } else {
      if (!canStopRecording) {
        Alert.alert('Hold on', 'Please wait a few seconds before stopping the recording.');
        return;
      }

      try {
        console.log('Stopping recording...');
        await cameraRef.current.stopRecording();
      } catch (error) {
        console.error('Stop recording error:', error);
        Alert.alert('Error', 'Could not stop recording: ' + error.message);
        setIsRecording(false);
        setCanStopRecording(false);
      }
    }
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

      {/* Camera with Visible Preview (Temporary) */}
      <Camera
        ref={cameraRef}
        style={{ width: 200, height: 150, position: 'absolute', top: 20, left: 20 }} // Visible preview
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