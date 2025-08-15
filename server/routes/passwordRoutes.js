const express = require('express');
const { requireUser } = require('./middleware/auth.js');
const { Password } = require('../models');
const { encrypt, decrypt } = require('../services/encryptionService.js');

const router = express.Router();

// Create a new password entry
router.post('/', requireUser, async (req, res) => {
  try {
    const { website, username, password } = req.body;
    const masterPassword = req.headers['x-master-password'];

    if (!masterPassword) {
      return res.status(400).json({ message: 'Master password is required.' });
    }

    const { encrypted: encryptedPassword, iv, authTag, salt } = encrypt(password, masterPassword);

    const newPassword = await Password.create({
      userId: req.user.id,
      website,
      username,
      encryptedPassword,
      iv,
    authTag,
    salt,
    });

    res.status(201).json(newPassword);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all passwords for the user
router.get('/', requireUser, async (req, res) => {
  try {
        const passwords = await Password.findAll({
            where: { userId: req.user.id },
            attributes: ['id', 'website', 'username', 'createdAt', 'updatedAt']
        });
    res.json(passwords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a decrypted password
router.post('/decrypt/:id', requireUser, async (req, res) => {
    try {
        const { id } = req.params;
        const masterPassword = req.headers['x-master-password'];

        if (!masterPassword) {
            return res.status(400).json({ message: 'Master password is required.' });
        }

        const passwordDoc = await Password.findOne({ where: { id, userId: req.user.id } });

        if (!passwordDoc) {
            return res.status(404).json({ message: 'Password not found.' });
        }

        if (!passwordDoc.salt) {
            return res.status(500).json({ message: 'Missing encryption salt for this entry. Please edit and re-save the password.' });
        }
        const decryptedPassword = decrypt(
            passwordDoc.encryptedPassword,
            passwordDoc.iv,
            passwordDoc.authTag,
            passwordDoc.salt,
            masterPassword
        );
        res.json({ password: decryptedPassword });
    } catch (error) {
        res.status(500).json({ message: 'Decryption failed. Master password may be incorrect.' });
    }
});

// Delete a password
router.delete('/:id', requireUser, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Password.destroy({ where: { id, userId: req.user.id } });

        if (result === 0) {
            return res.status(404).json({ message: 'Password not found.' });
        }

        res.status(200).json({ message: 'Password deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a password
router.put('/:id', requireUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { website, username, password } = req.body;
        const masterPassword = req.headers['x-master-password'];

        if (!masterPassword) {
            return res.status(400).json({ message: 'Master password is required.' });
        }

        let updateData = { website, username };
        if (typeof password === 'string' && password.length > 0) {
            const { encrypted: encryptedPassword, iv, authTag, salt } = encrypt(password, masterPassword);
            updateData = { ...updateData, encryptedPassword, iv, authTag, salt };
        }

        const [updated] = await Password.update(updateData, {
            where: { id, userId: req.user.id }
        });

        if (updated) {
            const updatedPassword = await Password.findByPk(id);
            res.status(200).json(updatedPassword);
        } else {
            res.status(404).json({ message: 'Password not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;
