import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, TextInput, Alert } from 'react-native';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';

const ShareVideoScreen = ({ route }) => {
  const { videoUrl } = route.params;
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleShare = () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter a phone number.');
      return;
    }

    // Format phone number for WhatsApp (e.g., +919876543210 for India)
    const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    const whatsappUrl = `whatsapp://send?phone=${formattedNumber}&text=Check out this video: ${videoUrl}`;
    
    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert('Error', 'WhatsApp is not installed or the number is invalid.');
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.mainContent}>
        <Text style={styles.title}>Video Uploaded!</Text>
        <Text style={styles.url}>Share this link: {videoUrl}</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter friend's phone number (e.g., +919876543210)"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>Share via WhatsApp</Text>
        </TouchableOpacity>
      </View>
      <BottomNav />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  mainContent: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  url: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  shareButton: {
    backgroundColor: '#25D366',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ShareVideoScreen;