const router = require('express').Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Auth middleware
const authMiddleware = async (req, res, next) => {
    try {
        // Token'ı header'dan al
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'Yetkilendirme hatası' });
        }

        // Token'ı doğrula
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Kullanıcıyı bul
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        // Kullanıcıyı request'e ekle
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Yetkilendirme hatası', error: error.message });
    }
};

// Profil bilgilerini getir
router.get('/me', authMiddleware, async (req, res) => {
    try {
        // Şifreyi hariç tut
        const user = req.user.toObject();
        delete user.password;
        
        res.json({
            message: 'Profil bilgileri başarıyla getirildi',
            user
        });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// Profil bilgilerini güncelle
router.put('/update', authMiddleware, async (req, res) => {
    try {
        const { fullName, email } = req.body;
        const user = req.user;

        // Email değişmişse, yeni email'in kullanılıp kullanılmadığını kontrol et
        if (email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Bu email adresi zaten kullanılıyor.' });
            }
            user.email = email;
        }

        user.fullName = fullName;
        await user.save();

        // Şifreyi hariç tut
        const updatedUser = user.toObject();
        delete updatedUser.password;

        res.json({
            message: 'Profil bilgileri başarıyla güncellendi',
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// Şifre değiştirme
router.put('/change-password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = req.user;

        // Mevcut şifreyi kontrol et
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mevcut şifre yanlış.' });
        }

        // Yeni şifreyi kaydet
        user.password = newPassword;
        await user.save();

        res.json({
            message: 'Şifre başarıyla değiştirildi'
        });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

module.exports = router; 