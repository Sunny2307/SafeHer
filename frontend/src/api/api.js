import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('jwtToken');
    console.log('Token in request:', token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('jwtToken');
      console.log('Token expired, please log in again');
    }
    return Promise.reject(error);
  }
);

export const checkUser = async (phoneNumber) => {
  return await api.post('/api/checkUser', { phoneNumber });
};

export const sendOTP = async (phoneNumber) => {
  return await api.post('/api/send-otp', { phoneNumber });
};

export const verifyOTP = async (sessionId, otp) => {
  return await api.post('/api/verify-otp', { sessionId, otp });
};

export const register = async (phoneNumber, password) => {
  return await api.post('/api/register', { phoneNumber, password });
};

export const login = async (phoneNumber, password) => {
  return await api.post('/api/login', { phoneNumber, password });
};

export const savePin = async (pin, confirmPin) => {
  return await api.post('/user/savePin', { pin, confirmPin });
};

export const verifyPin = async (pin) => {
  return await api.post('/user/verifyPin', { pin });
};

export const addFriend = async (phoneNumber, isSOS) => {
  return await api.post('/user/addFriend', { phoneNumber, isSOS });
};

export const getFriends = async () => {
  return await api.get('/user/getFriends');
};

export default api;
