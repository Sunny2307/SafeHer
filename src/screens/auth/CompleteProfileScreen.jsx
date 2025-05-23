import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';

const CompleteProfileScreen = () => {
  const [name, setName] = useState('');

  const handleContinue = () => {
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }
    alert('Profile Completed: Welcome, ' + name);
    // Navigate to the next screen (e.g., HomeScreen) or save the name to storage
    // navigation.navigate('HomeScreen');
  };

  return (
    <View style={styles.container}>
      {/* Header - Same as PinCreationScreen with Logo */}
      <View style={styles.header}>
        <View style={styles.logoSection}>
          <Image
            source={require('../../assets/safeher_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>SafeHer</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>Enter your name</Text>

      {/* Name Input */}
      <TextInput
        style={styles.input}
        placeholder="Your Name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />

      {/* Continue Button */}
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
  },
  header: {
    marginBottom: 25,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 15,
    marginTop: -30,
  },
  logoText: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#FF69B4',
    marginTop: -30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 24,
    color: '#333',
  },
  continueButton: {
    backgroundColor: '#4B1C46',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CompleteProfileScreen;