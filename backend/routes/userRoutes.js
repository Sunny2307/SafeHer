const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { db } = require('../firebase');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.userId = decoded.userId;
    next();
  });
};

// Save user's name
router.post('/saveName', verifyToken, async (req, res) => {
  const { name } = req.body;

  if (!name) return res.status(400).json({ error: 'Name is required' });

  try {
    await db.collection('users').doc(req.userId).update({ name });
    res.json({ message: 'Name saved successfully' });
  } catch (error) {
    console.error('Error saving name:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save user's PIN
router.post('/savePin', verifyToken, async (req, res) => {
  const { pin, confirmPin } = req.body;

  if (pin !== confirmPin) return res.status(400).json({ error: 'PINs do not match' });
  if (!pin || pin.length !== 4 || isNaN(pin)) {
    return res.status(400).json({ error: 'PIN must be a 4-digit number' });
  }

  try {
    await db.collection('users').doc(req.userId).update({ pin });
    res.json({ message: 'PIN saved successfully' });
  } catch (error) {
    console.error('Error saving PIN:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify user's PIN
router.post('/verifyPin', verifyToken, async (req, res) => {
  const { pin } = req.body;

  try {
    const userDoc = await db.collection('users').doc(req.userId).get();
    if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });

    const userData = userDoc.data();
    if (userData.pin !== pin) {
      return res.status(401).json({ error: 'Incorrect PIN' });
    }

    res.json({ message: 'PIN verified successfully' });
  } catch (error) {
    console.error('Error verifying PIN:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a friend
router.post('/addFriend', verifyToken, async (req, res) => {
  const { phoneNumber, isSOS } = req.body;

  if (!phoneNumber || phoneNumber.length !== 10 || isNaN(phoneNumber)) {
    return res.status(400).json({ error: 'Invalid phone number. Must be a 10-digit number' });
  }

  try {
    const userDoc = await db.collection('users').doc(req.userId).get();
    if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });

    const userData = userDoc.data();
    const friends = userData.friends || [];

    if (friends.some(friend => friend.phoneNumber === phoneNumber)) {
      return res.status(400).json({ error: 'Friend already added' });
    }

    friends.push({ phoneNumber, isSOS: !!isSOS });
    await db.collection('users').doc(req.userId).update({ friends });

    res.json({ message: 'Friend added successfully' });
  } catch (error) {
    console.error('Error adding friend:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get friends
router.get('/getFriends', verifyToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.userId).get();
    if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });

    const userData = userDoc.data();
    const friends = userData.friends || [];

    res.json({ friends });
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = { router };
