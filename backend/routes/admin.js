const express = require('express');
const router = express.Router();
const User = require('../models/User');
const adminAuth = require('../middleware/adminAuth');
const jwt = require('jsonwebtoken');

// Admin girişi
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kullanıcıyı bul
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Giriş başarısız');
        }

        // Şifreyi kontrol et
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new Error('Giriş başarısız');
        }

        // Admin rolünü kontrol et
        if (user.role !== 'admin') {
            throw new Error('Bu işlem için admin yetkisi gerekiyor');
        }

        // Token oluştur
        const token = jwt.sign(
            { userId: user._id.toString() },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            user: {
                _id: user._id,
                email: user.email,
                fullName: user.fullName,
                role: user.role
            },
            token
        });
    } catch (error) {
        res.status(401).json({ message: error.message || 'Giriş başarısız' });
    }
});

// Admin çıkışı
router.post('/logout', adminAuth, async (req, res) => {
    try {
        res.json({ message: 'Çıkış başarılı' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin bilgilerini getir
router.get('/me', adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin şifresini güncelle
router.patch('/me/password', adminAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // Mevcut şifreyi kontrol et
        const isMatch = await req.user.comparePassword(currentPassword);
        if (!isMatch) {
            throw new Error('Mevcut şifre yanlış');
        }
        
        // Yeni şifreyi güncelle
        req.user.password = newPassword;
        await req.user.save();
        
        res.json({ message: 'Şifre başarıyla güncellendi' });
    } catch (error) {
        res.status(400).json({ message: error.message || 'Şifre güncellenemedi' });
    }
});

module.exports = router; 