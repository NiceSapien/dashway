require("dotenv").config();
const express = require("express");
const db = require("./models");
const basicRoutes = require("./routes/index");
const authRoutes = require("./routes/authRoutes");
const passwordRoutes = require("./routes/passwordRoutes");
const secureNoteRoutes = require("./routes/secureNoteRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const personalInfoRoutes = require("./routes/personalInfoRoutes");
const securityRoutes = require("./routes/securityRoutes");
const backupRoutes = require("./routes/backupRoutes");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';
app.enable('json spaces');
app.enable('strict routing');
app.set('trust proxy', 1);

app.use(cors({}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic Routes
app.use(basicRoutes);
// Authentication Routes
app.use('/api/auth', authRoutes);
// Password Routes
app.use('/api/passwords', passwordRoutes);
// Secure Note Routes
app.use('/api/notes', secureNoteRoutes);
// Payment Routes
app.use('/api/payments', paymentRoutes);
// Personal Info Routes
app.use('/api/personalinfo', personalInfoRoutes);
// Security Routes
app.use('/api/security', securityRoutes);
app.use('/api/backup', backupRoutes);

// If no routes handled the request, it's a 404
app.use((req, res, next) => {
  res.status(404).send("Page not found.");
});

// Error handling
app.use((err, req, res, next) => {
  console.error(`Unhandled application error: ${err.message}`);
  console.error(err.stack);
  res.status(500).send("There was an error serving your request.");
});

db.sequelize.sync({ alter: true }).then(() => {
  app.listen(port, host, () => {
    const localUrl = `http://localhost:${port}`;
    console.log(`Server running on ${host}:${port} (local: ${localUrl})`);
  });
});
