const express = require('express');
const jwt = require('jsonwebtoken');
const { db } = require('../firebase'); // Import db from firebase.js

const router = express.Router();

router.post('/login', async (req, res) => {
  const { phoneNumber, password } = req.body;

  try {
    // Find the user in Firestore
    const userRef = db.collection('users').doc(phoneNumber);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(401).json({ error: 'Invalid phone number or password' });
    }

    const user = userDoc.data();
    // Check password (in production, use bcrypt to hash passwords)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid phone number or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: userDoc.id, phoneNumber: user.phoneNumber },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({ token });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;