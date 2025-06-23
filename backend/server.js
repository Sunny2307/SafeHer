const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const loginRoutes = require('./routes/loginRoutes');
const userRoutes = require('./routes/userRoutes');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes.router);
app.use('/api', loginRoutes.router);
app.use('/user', userRoutes.router);

// Start server
const PORT = process.env.PORT || 3000;
const HOST = '192.168.222.18';
app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
