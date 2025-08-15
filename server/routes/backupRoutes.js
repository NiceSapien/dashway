const express = require('express');
const { requireUser } = require('./middleware/auth');
const { Password, SecureNote, Payment, PersonalInfo } = require('../models');
const s3 = require('../services/s3Service');

const router = express.Router();

// Export encrypted payloads as JSON to S3
router.post('/export', requireUser, async (req, res) => {
  try {
    if (!s3.isEnabled()) return res.status(400).json({ message: 'S3 not enabled' });
    const userId = req.user.id;
    const [passwords, notes, payments, infos] = await Promise.all([
      Password.findAll({ where: { userId } }),
      SecureNote.findAll({ where: { userId } }),
      Payment.findAll({ where: { userId } }),
      PersonalInfo.findAll({ where: { userId } }),
    ]);

    const snapshot = { passwords, notes, payments, infos, createdAt: new Date().toISOString() };
    const key = `snapshots/${userId}/${Date.now()}.json`;
    await s3.uploadJSON(key, snapshot);
    return res.json({ message: 'Exported', key });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

// Upload SQLite file to S3
router.post('/sqlite/upload', requireUser, async (req, res) => {
  try {
    if (!s3.isEnabled()) return res.status(400).json({ message: 'S3 not enabled' });
    const key = `sqlite/${req.user.id}/prod.sqlite3`;
    await s3.uploadFile(key, './server/prod.sqlite3');
    return res.json({ message: 'Uploaded', key });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

// Get a signed URL to download the SQLite backup
router.get('/sqlite/download', requireUser, async (req, res) => {
  try {
    if (!s3.isEnabled()) return res.status(400).json({ message: 'S3 not enabled' });
    const key = `sqlite/${req.user.id}/prod.sqlite3`;
    const url = await s3.getSignedUrl(key, 300);
    return res.json({ url });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

module.exports = router;
