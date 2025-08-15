const express = require('express');
const router = express.Router();

// Importing route handlers
const secureNoteRoutes = require('./secureNoteRoutes');
const paymentRoutes = require('./paymentRoutes');
const personalInfoRoutes = require('./personalInfoRoutes');
const securityRoutes = require('./securityRoutes');

// Root path response
router.get("/", (req, res) => {
  res.status(200).send("Welcome to Your Website!");
});

router.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

// Setting up routes
router.use('/api/notes', secureNoteRoutes);
router.use('/api/payments', paymentRoutes);
router.use('/api/personal-info', personalInfoRoutes);
router.use('/api/security', securityRoutes);

module.exports = router;
