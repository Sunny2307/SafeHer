import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigationRef } from '../navigation/AppNavigator';

const BASE_URL = 'http://192.168.222.18:3000'; // Replace with your machine’s IP address

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add an interceptor to include the JWT in every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add an interceptor to handle 401 errors (token expiration)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('jwtToken');
      console.log('Token expired, redirecting to login');
      // Redirect to SignUpLogin screen
      navigationRef.current?.navigate('SignUpLogin');
    }
    return Promise.reject(error);
  }
);

export const login = (phoneNumber, password) =>
  api.post('/api/login', { phoneNumber, password });

export const register = (phoneNumber, password) =>
  api.post('/api/register', { phoneNumber, password });

export const saveName = (name) =>
  api.post('/user/saveName', { name });

export const savePin = (pin, confirmPin) =>
  api.post('/user/savePin', { pin, confirmPin });

export const getUser = () =>
  api.get('/auth/getUser');

export const verifyPin = (pin) =>
  api.post('/user/verifyPin', { pin });

export const checkUser = (phoneNumber) =>
  api.post('/api/checkUser', { phoneNumber });

export const sendOTP = (phoneNumber) =>
  api.post('/api/send-otp', { phoneNumber });

export const verifyOTP = (sessionId, otp) =>
  api.post('/api/verify-otp', { sessionId, otp });

export const addFriend = (phoneNumber, isSOS) =>
  api.post('/user/addFriend', { phoneNumber, isSOS });

export const getFriends = () =>
  api.get('/user/getFriends');

export default api;
