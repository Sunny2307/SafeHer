const express = require('express');
const jwt = require('jsonwebtoken');
const { db } = require('../firebase');
const router = express.Router();

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userRef = db.collection('users').doc(decoded.phoneNumber);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    req.user = userDoc.data();
    req.user.phoneNumber = decoded.phoneNumber;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

router.post('/savePin', authenticate, async (req, res) => {
  const { pin, confirmPin } = req.body;

  if (!pin || !confirmPin) {
    return res.status(400).json({ error: 'PIN and confirm PIN are required' });
  }

  if (pin !== confirmPin) {
    return res.status(400).json({ error: 'PIN and confirm PIN do not match' });
  }

  try {
    const userRef = db.collection('users').doc(req.user.phoneNumber);
    await userRef.update({ pin });
    return res.status(200).json({ message: 'PIN saved successfully' });
  } catch (error) {
    console.error('Error saving PIN:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/verifyPin', authenticate, async (req, res) => {
  const { pin } = req.body;

  if (!pin) {
    return res.status(400).json({ error: 'PIN is required' });
  }

  try {
    const userRef = db.collection('users').doc(req.user.phoneNumber);
    const userDoc = await userRef.get();
    const user = userDoc.data();

    if (user.pin !== pin) {
      return res.status(401).json({ error: 'Incorrect PIN' });
    }

    return res.status(200).json({ message: 'PIN verified successfully' });
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/addFriend', authenticate, async (req, res) => {
  const { phoneNumber, isSOS } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ error: 'Friend\'s phone number is required' });
  }

  if (phoneNumber.length !== 10) {
    return res.status(400).json({ error: 'Friend\'s phone number must be 10 digits' });
  }

  try {
    const userRef = db.collection('users').doc(req.user.phoneNumber);
    const userDoc = await userRef.get();
    const user = userDoc.data();

    const friends = user.friends || [];
    const friendExists = friends.some(friend => friend.phoneNumber === phoneNumber);
    if (friendExists) {
      return res.status(400).json({ error: 'Friend already added' });
    }

    friends.push({ phoneNumber, isSOS: !!isSOS });
    await userRef.update({ friends });

    return res.status(200).json({ message: 'Friend added successfully' });
  } catch (error) {
    console.error('Error adding friend:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/getFriends', authenticate, async (req, res) => {
  try {
    const userRef = db.collection('users').doc(req.user.phoneNumber);
    const userDoc = await userRef.get();
    const user = userDoc.data();

    const friends = user.friends || [];
    return res.status(200).json({ friends });
  } catch (error) {
    console.error('Error fetching friends:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
