const express = require('express');
const { authenticate } = require('./authRoutes');
const { db } = require('../firebase');
const admin = require('firebase-admin'); // Add this line to import admin

const router = express.Router();

router.post('/saveName', authenticate, async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  if (!req.user.phoneNumber) {
    return res.status(400).json({ error: 'User phone number not found in token' });
  }

  try {
    await db.collection('users').doc(req.user.phoneNumber).set(
      {
        name,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(), // This should now work
      },
      { merge: true }
    );
    return res.status(200).json({ message: 'Name saved successfully' });
  } catch (error) {
    console.error('Error in /user/saveName:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/savePin', authenticate, async (req, res) => {
  const { pin, confirmPin } = req.body;

  if (!pin || !confirmPin) {
    return res.status(400).json({ error: 'PIN and confirmation PIN are required' });
  }

  if (pin !== confirmPin) {
    return res.status(400).json({ error: 'PINs do not match' });
  }

  if (!/^\d{4}$/.test(pin)) {
    return res.status(400).json({ error: 'PIN must be a 4-digit number' });
  }

  try {
    await db.collection('users').doc(req.user.phoneNumber).set(
      {
        pin,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(), // Ensure this works too
      },
      { merge: true }
    );
    return res.status(200).json({ message: 'PIN saved successfully' });
  } catch (error) {
    console.error('Error in /user/savePin:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// In userRoutes.js
router.post('/verifyPin', authenticate, async (req, res) => {
  const { pin } = req.body;

  if (!pin) {
    return res.status(400).json({ error: 'PIN is required' });
  }

  if (!/^\d{4}$/.test(pin)) {
    return res.status(400).json({ error: 'PIN must be a 4-digit number' });
  }

  try {
    const userRef = db.collection('users').doc(req.user.phoneNumber);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userDoc.data();
    if (user.pin !== pin) {
      return res.status(401).json({ error: 'Incorrect PIN' });
    }

    return res.status(200).json({ message: 'PIN verified successfully' });
  } catch (error) {
    console.error('Error in /user/verifyPin:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;