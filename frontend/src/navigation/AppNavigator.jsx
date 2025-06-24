import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SignUpLoginScreen from '../../src/screens/auth/SignUpLoginScreen';
import OTPScreen from '../../src/screens/auth/OTPScreen';
import PinCreationScreen from '../../src/screens/auth/PinCreationScreen';
import CompleteProfileScreen from '../screens/auth/CompleteProfileScreen';
import HomeScreen from '../screens/HomeScreen';
import PinLoginScreen from '../screens/auth/PinLoginScreen';
import AddFriendScreen from '../screens/emergency/AddFriendScreen';
import RecordScreen from '../screens/support/RecordScreen';
import RecordingHistoryScreen from '../screens/support/RecordingHistoryScreen';
import MenuScreen from '../screens/support/MenuScreen';
import HelplineScreen from '../screens/emergency/HelplineScreen';
import FakeCallScreen from '../screens/support/FakeCallScreen';
import CallerDetailsScreen from '../screens/support/CallerDetailsScreen';
import IncomingCallScreen from '../screens/support/IncomingCallScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = ({ initialRouteName }) => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRouteName || 'SignUpLogin'}>
        <Stack.Screen
          name="SignUpLogin"
          component={SignUpLoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OTPScreen"
          component={OTPScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PinCreationScreen"
          component={PinCreationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PinLoginScreen"
          component={PinLoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CompleteProfileScreen"
          component={CompleteProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddFriendScreen"
          component={AddFriendScreen}
          options={{ headerShown: false }}
        /> 
        <Stack.Screen
          name="RecordScreen"
          component={RecordScreen}
          options={{ headerShown: false }}
        /> 
        <Stack.Screen
          name="RecordingHistoryScreen"
          component={RecordingHistoryScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MenuScreen"
          component={MenuScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HelplineScreen"
          component={HelplineScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FakeCallScreen"
          component={FakeCallScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CallerDetailsScreen"
          component={CallerDetailsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="IncomingCallScreen"
          component={IncomingCallScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;