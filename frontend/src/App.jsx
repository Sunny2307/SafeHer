import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './navigation/AppNavigator';

const App = () => {
  const [showPin, setShowPin] = useState(null); // null = loading

  useEffect(() => {
    const checkSetup = async () => {
      const setupDone = await AsyncStorage.getItem('isSetupComplete');
      setShowPin(setupDone === 'true');
    };
    checkSetup();
  }, []);

  if (showPin === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF69B4" />
      </View>
    );
  }

  // Pass initial route depending on showPin value
  return <AppNavigator initialRouteName={'HomeScreen'} />;
};

export default App;
