// routes/loginRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { db } = require('../firebase'); // Firestore instance
require('dotenv').config();

const router = express.Router();

const TWO_FACTOR_API_KEY = process.env.TWO_FACTOR_API_KEY;
const TWO_FACTOR_BASE_URL = 'https://2factor.in/API/V1';

// Check if user exists
router.post('/checkUser', async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  try {
    const userRef = db.collection('users').doc(phoneNumber);
    const userDoc = await userRef.get();

    return res.status(200).json({ exists: userDoc.exists });
  } catch (error) {
    console.error('Check user error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Send OTP using 2Factor.in
router.post('/send-otp', async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber || phoneNumber.length !== 10) {
    return res.status(400).json({ error: 'Invalid phone number' });
  }

  const fullPhoneNumber = `+91${phoneNumber}`;

  try {
    const response = await axios.get(
      `${TWO_FACTOR_BASE_URL}/${TWO_FACTOR_API_KEY}/SMS/${fullPhoneNumber}/AUTOGEN`
    );

    if (response.data.Status === 'Success') {
      const sessionId = response.data.Details; // Session ID for OTP verification
      res.status(200).json({ sessionId });
    } else {
      throw new Error('Failed to send OTP');
    }
  } catch (error) {
    console.error('Error sending OTP:', error.message);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP using 2Factor.in
router.post('/verify-otp', async (req, res) => {
  const { sessionId, otp } = req.body;

  if (!sessionId || !otp) {
    return res.status(400).json({ error: 'Session ID and OTP are required' });
  }

  try {
    const response = await axios.get(
      `${TWO_FACTOR_BASE_URL}/${TWO_FACTOR_API_KEY}/SMS/VERIFY/${sessionId}/${otp}`
    );

    if (response.data.Status === 'Success') {
      res.status(200).json({ message: 'OTP verified successfully' });
    } else {
      throw new Error('Invalid OTP');
    }
  } catch (error) {
    console.error('Error verifying OTP:', error.message);
    res.status(400).json({ error: 'Invalid OTP' });
  }
});

// Register route
router.post('/register', async (req, res) => {
  const { phoneNumber, password } = req.body;

  if (!phoneNumber || !password) {
    return res.status(400).json({ error: 'Phone number and password are required' });
  }

  try {
    const userRef = db.collection('users').doc(phoneNumber);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // In production, hash the password with bcrypt
    await userRef.set({
      phoneNumber,
      password, // Replace with hashed password in production
      createdAt: new Date().toISOString(),
    });

    const token = jwt.sign(
      { userId: phoneNumber, phoneNumber },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { phoneNumber, password } = req.body;

  try {
    const userRef = db.collection('users').doc(phoneNumber);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(401).json({ error: 'Invalid phone number or password' });
    }

    const user = userDoc.data();

    // In production, compare hashed passwords with bcrypt
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid phone number or password' });
    }

    const token = jwt.sign(
      { userId: userDoc.id, phoneNumber: user.phoneNumber },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({ token });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;