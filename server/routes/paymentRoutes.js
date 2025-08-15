const express = require('express');
const { requireUser } = require('./middleware/auth.js');
const { Payment } = require('../models');
const { encrypt, decrypt } = require('../services/encryptionService.js');

const router = express.Router();

// Create a new payment entry
router.post('/', requireUser, async (req, res) => {
  try {
    const { type, name, data } = req.body;
    const masterPassword = req.headers['x-master-password'];

    if (!masterPassword) {
      return res.status(400).json({ message: 'Master password is required.' });
    }
    if (!type || !name || !data) {
        return res.status(400).json({ message: 'Type, name, and data are required.' });
    }

    const { encrypted: encryptedData, iv, authTag } = encrypt(JSON.stringify(data), masterPassword);

    const newPayment = await Payment.create({
      userId: req.user.id,
      type,
      name,
      encryptedData,
      iv,
      authTag,
    });

    res.status(201).json(newPayment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all payments for the user
router.get('/', requireUser, async (req, res) => {
  try {
    const payments = await Payment.findAll({ 
        where: { userId: req.user.id },
        attributes: ['id', 'type', 'name', 'createdAt', 'updatedAt']
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a payment entry
router.put('/:id', requireUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { type, name, data } = req.body;
        const masterPassword = req.headers['x-master-password'];

        if (!masterPassword) {
            return res.status(400).json({ message: 'Master password is required.' });
        }
        if (!type || !name || !data) {
            return res.status(400).json({ message: 'Type, name, and data are required.' });
        }

        const { encrypted: encryptedData, iv, authTag } = encrypt(JSON.stringify(data), masterPassword);

        const [updated] = await Payment.update({
            type,
            name,
            encryptedData,
            iv,
            authTag,
        }, {
            where: { id, userId: req.user.id }
        });

        if (updated) {
            const updatedPayment = await Payment.findByPk(id);
            res.status(200).json(updatedPayment);
        } else {
            res.status(404).json({ message: 'Payment not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Delete a payment entry
router.delete('/:id', requireUser, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Payment.destroy({ where: { id, userId: req.user.id } });

        if (result === 0) {
            return res.status(404).json({ message: 'Payment not found.' });
        }

        res.status(200).json({ message: 'Payment deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Get a decrypted payment
router.post('/decrypt/:id', requireUser, async (req, res) => {
    try {
        const { id } = req.params;
        const masterPassword = req.headers['x-master-password'];

        if (!masterPassword) {
            return res.status(400).json({ message: 'Master password is required.' });
        }

        const paymentDoc = await Payment.findOne({ where: { id, userId: req.user.id } });

        if (!paymentDoc) {
            return res.status(404).json({ message: 'Payment not found.' });
        }

        const decryptedData = decrypt(paymentDoc.encryptedData, paymentDoc.iv, paymentDoc.authTag, masterPassword);
        
        res.json(JSON.parse(decryptedData));
    } catch (error) {
        res.status(500).json({ message: 'Failed to decrypt data. The master password may be incorrect.' });
    }
});

module.exports = router;
