const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Place = require('../models/Place');
const Comment = require('../models/Comment');

// Profil bilgilerini güncelle
router.put('/update', auth, async (req, res) => {
    try {
        const { fullName, email } = req.body;

        // Email kontrolü
        if (email) {
            const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
            if (existingUser) {
                return res.status(400).json({ message: 'Bu email adresi başka bir kullanıcı tarafından kullanılıyor.' });
            }
        }

        // Kullanıcıyı güncelle
        const user = await User.findById(req.user.id);
        if (fullName) user.fullName = fullName;
        if (email) user.email = email;
        await user.save();

        res.json({
            message: 'Profil başarıyla güncellendi',
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Profil güncellenirken bir hata oluştu' });
    }
});

// Şifre değiştir
router.put('/change-password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Kullanıcıyı bul
        const user = await User.findById(req.user.id);
        
        // Mevcut şifreyi kontrol et
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mevcut şifre hatalı.' });
        }

        // Yeni şifreyi kaydet
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Şifre başarıyla değiştirildi' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Şifre değiştirilirken bir hata oluştu' });
    }
});

// Favori mekanları getir
router.get('/favorites', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('favorites');
        res.json(user.favorites);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ message: 'Favoriler getirilirken bir hata oluştu' });
    }
});

// Favorilere mekan ekle
router.post('/favorites/:placeId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user.favorites.includes(req.params.placeId)) {
            user.favorites.push(req.params.placeId);
            await user.save();
        }
        res.json({ message: 'Mekan favorilere eklendi' });
    } catch (error) {
        console.error('Error adding to favorites:', error);
        res.status(500).json({ message: 'Favorilere eklenirken bir hata oluştu' });
    }
});

// Favorilerden mekan çıkar
router.delete('/favorites/:placeId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.favorites = user.favorites.filter(id => id.toString() !== req.params.placeId);
        await user.save();
        res.json({ message: 'Mekan favorilerden çıkarıldı' });
    } catch (error) {
        console.error('Error removing from favorites:', error);
        res.status(500).json({ message: 'Favorilerden çıkarılırken bir hata oluştu' });
    }
});

// Kullanıcının yorumlarını getir
router.get('/comments', auth, async (req, res) => {
    try {
        const comments = await Comment.find({ user: req.user.id })
            .populate('place', 'name city category images')
            .sort({ createdAt: -1 });

        const formattedComments = comments
            .filter(comment => comment.place !== null)
            .map(comment => ({
                _id: comment._id,
                text: comment.text,
                rating: comment.rating,
                createdAt: comment.createdAt,
                place: {
                    _id: comment.place._id,
                    name: comment.place.name || 'Silinmiş Mekan',
                    city: comment.place.city || 'Belirtilmemiş',
                    category: comment.place.category || 'Belirtilmemiş',
                    image: comment.place.images?.[0] || null
                }
            }));

        res.json(formattedComments);
    } catch (error) {
        console.error('Error fetching user comments:', error);
        res.status(500).json({ message: 'Yorumlar getirilirken bir hata oluştu' });
    }
});

// Kullanıcının yorumunu sil
router.delete('/comments/:commentId', auth, async (req, res) => {
    try {
        const comment = await Comment.findOne({
            _id: req.params.commentId,
            user: req.user.id
        });

        if (!comment) {
            return res.status(404).json({ message: 'Yorum bulunamadı' });
        }

        const placeId = comment.place;

        // Yorumu sil
        await comment.deleteOne();

        try {
            // Mekanın ortalama puanını güncelle
            const place = await Place.findById(placeId);
            if (place) {
                const comments = await Comment.find({ place: placeId });
                if (comments.length > 0) {
                    const totalRating = comments.reduce((sum, c) => sum + c.rating, 0);
                    place.rating = Number((totalRating / comments.length).toFixed(1));
                } else {
                    place.rating = 0;
                }
                place.totalRatings = comments.length;
                await place.save();
            }
        } catch (updateError) {
            console.error('Error updating place rating:', updateError);
            // Puan güncelleme hatası yorum silme işlemini etkilemesin
        }

        res.json({ message: 'Yorum başarıyla silindi' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Yorum silinirken bir hata oluştu' });
    }
});

module.exports = router; 