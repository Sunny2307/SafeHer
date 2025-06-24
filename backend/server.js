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
app.use('/auth', authRoutes.router); // Correct as is
app.use('/api', loginRoutes); // Use directly
app.use('/user', userRoutes.router); // Use .router since it exports { router }

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});