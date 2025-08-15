const express = require('express');
const router = express.Router();
const { requireUser } = require('./middleware/auth');
const { Password } = require('../models');
const { decrypt } = require('../services/encryptionService');

// @route   GET api/security/analyze
// @desc    Analyze user's password security
// @access  Private
router.get('/analyze', requireUser, async (req, res) => {
    try {
        const masterPassword = req.headers['x-master-password'];
        if (!masterPassword) {
            return res.status(400).json({ msg: 'Master password is required' });
        }

        const passwords = await Password.findAll({ where: { userId: req.user.id } });

        let weakCount = 0;
        let reusedCount = 0;
        let oldPasswordCount = 0;
        const passwordMap = new Map();
        const decryptedPasswords = [];

        for (const p of passwords) {
            try {
                if (!p.salt) {
                    continue; // skip entries without salt
                }
                const decryptedPassword = decrypt(p.encryptedPassword, p.iv, p.authTag, p.salt, masterPassword);

                // Strength check (simple length check for now)
                if (decryptedPassword.length < 8) {
                    weakCount++;
                }

                // Reuse check
                if (passwordMap.has(decryptedPassword)) {
                    reusedCount++;
                }
                passwordMap.set(decryptedPassword, (passwordMap.get(decryptedPassword) || 0) + 1);

                // Age check (e.g., older than 1 year)
                const oneYearAgo = new Date();
                oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                if (new Date(p.updatedAt) < oneYearAgo) {
                    oldPasswordCount++;
                }
                
                decryptedPasswords.push({
                    ...p.toJSON(),
                    password: decryptedPassword,
                    isWeak: decryptedPassword.length < 8,
                    isReused: passwordMap.get(decryptedPassword) > 1,
                    isOld: new Date(p.updatedAt) < oneYearAgo
                });

            } catch (e) {
                console.error(`Could not decrypt password ${p.id}`);
            }
        }
        
        const totalPasswords = passwords.length;
        const overallScore = totalPasswords > 0 ? Math.round(((totalPasswords - weakCount - reusedCount) / totalPasswords) * 100) : 100;

        res.json({
            overallScore,
            totalPasswords,
            weakCount,
            reusedCount,
            oldPasswordCount,
            passwords: decryptedPasswords,
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
