const express = require('express');
const { requireUser } = require('./middleware/auth.js');
const { SecureNote } = require('../models');
const { encrypt, decrypt } = require('../services/encryptionService.js');

const router = express.Router();

// Create a new secure note
router.post('/', requireUser, async (req, res) => {
  try {
    const { title, content } = req.body;
    const masterPassword = req.headers['x-master-password'];

    if (!masterPassword) {
      return res.status(400).json({ message: 'Master password is required.' });
    }

    const { encrypted: encryptedContent, iv, authTag } = encrypt(content, masterPassword);

    const newNote = await SecureNote.create({
      userId: req.user.id,
      title,
      encryptedContent,
      iv,
      authTag,
    });

    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all secure notes for the user
router.get('/', requireUser, async (req, res) => {
  try {
    const notes = await SecureNote.findAll({ where: { userId: req.user.id } });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a decrypted secure note
router.post('/decrypt/:id', requireUser, async (req, res) => {
    try {
        const { id } = req.params;
        const masterPassword = req.headers['x-master-password'];

        if (!masterPassword) {
            return res.status(400).json({ message: 'Master password is required.' });
        }

        const noteDoc = await SecureNote.findOne({ where: { id, userId: req.user.id } });

        if (!noteDoc) {
            return res.status(404).json({ message: 'Note not found.' });
        }

        const decryptedContent = decrypt(noteDoc.encryptedContent, noteDoc.iv, noteDoc.authTag, masterPassword);
        res.json({ content: decryptedContent });
    } catch (error) {
        res.status(500).json({ message: 'Decryption failed. Master password may be incorrect.' });
    }
});

// Delete a secure note
router.delete('/:id', requireUser, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await SecureNote.destroy({ where: { id, userId: req.user.id } });

        if (result === 0) {
            return res.status(404).json({ message: 'Note not found.' });
        }

        res.status(200).json({ message: 'Note deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a secure note
router.put('/:id', requireUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const masterPassword = req.headers['x-master-password'];

        if (!masterPassword) {
            return res.status(400).json({ message: 'Master password is required.' });
        }

        const { encrypted: encryptedContent, iv, authTag } = encrypt(content, masterPassword);

        const [updated] = await SecureNote.update({
            title,
            encryptedContent,
            iv,
            authTag,
        }, {
            where: { id, userId: req.user.id }
        });

        if (updated) {
            const updatedNote = await SecureNote.findByPk(id);
            res.status(200).json(updatedNote);
        } else {
            res.status(404).json({ message: 'Note not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
