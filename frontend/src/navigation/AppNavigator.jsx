// navigation/AppNavigator.jsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SignUpLoginScreen from '../../src/screens/auth/SignUpLoginScreen';
import OTPScreen from '../../src/screens/auth/OTPScreen'; 
import PinCreationScreen from '../../src/screens/auth/PinCreationScreen';
import CompleteProfileScreen from '../screens/auth/CompleteProfileScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignUpLogin">
        <Stack.Screen name="SignUpLogin"
         component={SignUpLoginScreen} 
         options={{ headerShown: false }} />
        <Stack.Screen name="OTPScreen"
         component={OTPScreen}
        options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PinCreationScreen"
          component={PinCreationScreen}
          options={{ headerShown: false }}
          
        />
        <Stack.Screen
          name="CompleteProfileScreen"
          component={CompleteProfileScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
