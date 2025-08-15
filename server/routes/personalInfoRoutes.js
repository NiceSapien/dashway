const express = require('express');
const { requireUser } = require('./middleware/auth.js');
const { PersonalInfo } = require('../models');
const { encrypt, decrypt } = require('../services/encryptionService.js');

const router = express.Router();

// Create a new personal info entry
router.post('/', requireUser, async (req, res) => {
  try {
    const { name, data } = req.body;
    const masterPassword = req.headers['x-master-password'];

    if (!masterPassword) {
      return res.status(400).json({ message: 'Master password is required.' });
    }
    if (!name || !data) {
        return res.status(400).json({ message: 'Name and data are required.' });
    }

    const { encrypted: encryptedData, iv, authTag } = encrypt(JSON.stringify(data), masterPassword);

    const newInfo = await PersonalInfo.create({
      userId: req.user.id,
      name,
      encryptedData,
      iv,
      authTag,
    });

    res.status(201).json(newInfo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all personal info for the user
router.get('/', requireUser, async (req, res) => {
  try {
    const infos = await PersonalInfo.findAll({ 
        where: { userId: req.user.id },
        attributes: ['id', 'name', 'createdAt', 'updatedAt']
    });
    res.json(infos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a personal info entry
router.put('/:id', requireUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, data } = req.body;
        const masterPassword = req.headers['x-master-password'];

        if (!masterPassword) {
            return res.status(400).json({ message: 'Master password is required.' });
        }
        if (!name || !data) {
            return res.status(400).json({ message: 'Name and data are required.' });
        }

        const { encrypted: encryptedData, iv, authTag } = encrypt(JSON.stringify(data), masterPassword);

        const [updated] = await PersonalInfo.update({
            name,
            encryptedData,
            iv,
            authTag,
        }, {
            where: { id, userId: req.user.id }
        });

        if (updated) {
            const updatedInfo = await PersonalInfo.findByPk(id);
            res.status(200).json(updatedInfo);
        } else {
            res.status(404).json({ message: 'Personal info not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a personal info entry
router.delete('/:id', requireUser, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await PersonalInfo.destroy({ where: { id, userId: req.user.id } });

        if (result === 0) {
            return res.status(404).json({ message: 'Personal info not found.' });
        }

        res.status(200).json({ message: 'Personal info deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get decrypted personal info
router.post('/decrypt/:id', requireUser, async (req, res) => {
    try {
        const { id } = req.params;
        const masterPassword = req.headers['x-master-password'];

        if (!masterPassword) {
            return res.status(400).json({ message: 'Master password is required.' });
        }

        const infoDoc = await PersonalInfo.findOne({ where: { id, userId: req.user.id } });

        if (!infoDoc) {
            return res.status(404).json({ message: 'Personal info not found.' });
        }

        const decryptedData = decrypt(infoDoc.encryptedData, infoDoc.iv, infoDoc.authTag, masterPassword);
        
        res.json(JSON.parse(decryptedData));
    } catch (error) {
        res.status(500).json({ message: 'Failed to decrypt data. The master password may be incorrect.' });
    }
});

module.exports = router;
