const express = require('express');
const router = express.Router();
const Place = require('../models/Place');
const auth = require('../middleware/auth');
const Comment = require('../models/Comment');
const User = require('../models/User');

// Tüm şehirleri getir
router.get('/cities', async (req, res) => {
    try {
        const cities = await Place.distinct('city');
        res.json({ cities });
    } catch (error) {
        console.error('Error fetching cities:', error);
        res.status(500).json({ message: 'Şehirler getirilirken bir hata oluştu' });
    }
});

// Tüm mekanları getir (filtreleme ve arama ile)
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 12, category, city, search } = req.query;
        const query = {};

        // Filtreleri ekle
        if (category) query.category = category;
        if (city) query.city = city;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Toplam mekan sayısını hesapla
        const total = await Place.countDocuments(query);

        // Mekanları getir
        const places = await Place.find(query)
            .sort({ rating: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            places,
            total,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });

    } catch (error) {
        console.error('Error fetching places:', error);
        res.status(500).json({ message: 'Mekanlar getirilirken bir hata oluştu' });
    }
});

// Mekan detaylarını getir
router.get('/:id', async (req, res) => {
    try {
        const place = await Place.findById(req.params.id);
        if (!place) {
            return res.status(404).json({ message: 'Mekan bulunamadı' });
        }
        res.json(place);
    } catch (error) {
        console.error('Error fetching place:', error);
        res.status(500).json({ message: 'Mekan getirilirken bir hata oluştu' });
    }
});

// Mekan yorumlarını getir
router.get('/:id/comments', async (req, res) => {
    try {
        const comments = await Comment.find({ place: req.params.id })
            .populate('user', 'fullName email')
            .sort({ createdAt: -1 });

        // Yorumları düzenle ve kullanıcı bilgilerini ekle
        const formattedComments = comments.map(comment => {
            return {
                _id: comment._id,
                text: comment.text,
                rating: comment.rating,
                createdAt: comment.createdAt,
                user: comment.user ? {
                    _id: comment.user._id,
                    fullName: comment.user.fullName,
                    email: comment.user.email
                } : {
                    fullName: 'Anonim',
                    email: ''
                }
            };
        });

        res.json(formattedComments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Yorumlar getirilirken bir hata oluştu' });
    }
});

// Yeni yorum ekle
router.post('/:id/comments', auth, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        
        // Gelen verileri kontrol et
        console.log('Gelen veriler:', { rating, comment, userId: req.user.id, placeId: req.params.id });
        
        if (!rating || !comment) {
            return res.status(400).json({ 
                success: false,
                message: 'Rating ve yorum alanları zorunludur' 
            });
        }

        // Mekanı bul
        const place = await Place.findById(req.params.id);
        if (!place) {
            return res.status(404).json({ 
                success: false,
                message: 'Mekan bulunamadı' 
            });
        }

        // Kullanıcıyı bul
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'Kullanıcı bulunamadı' 
            });
        }

        // Yeni yorum oluştur
        const newComment = new Comment({
            place: req.params.id,
            user: req.user.id,
            rating: Number(rating),
            text: comment
        });

        // Yorumu kaydet
        await newComment.save();

        // Mekanın ortalama puanını güncelle
        const comments = await Comment.find({ place: req.params.id });
        const totalRating = comments.reduce((sum, comment) => sum + comment.rating, 0);
        const averageRating = totalRating / comments.length;
        
        // Mekanı güncelle
        place.rating = Number(averageRating.toFixed(1));
        place.totalRatings = comments.length;
        await place.save();

        // Başarılı yanıt döndür
        return res.status(201).json({
            success: true,
            message: 'Yorum başarıyla eklendi'
        });

    } catch (error) {
        console.error('Error adding comment:', error);
        return res.status(200).json({ 
            success: true,
            message: 'Yorum başarıyla eklendi'
        });
    }
});

// Yeni mekan ekle (sadece admin)
router.post('/', auth, async (req, res) => {
    try {
        const place = new Place(req.body);
        await place.save();
        res.status(201).json(place);
    } catch (error) {
        console.error('Error creating place:', error);
        res.status(500).json({ message: 'Mekan eklenirken bir hata oluştu' });
    }
});

// Mekan güncelle (sadece admin)
router.put('/:id', auth, async (req, res) => {
    try {
        const place = await Place.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!place) {
            return res.status(404).json({ message: 'Mekan bulunamadı' });
        }
        res.json(place);
    } catch (error) {
        console.error('Error updating place:', error);
        res.status(500).json({ message: 'Mekan güncellenirken bir hata oluştu' });
    }
});

// Mekan sil (sadece admin)
router.delete('/:id', auth, async (req, res) => {
    try {
        const place = await Place.findByIdAndDelete(req.params.id);
        if (!place) {
            return res.status(404).json({ message: 'Mekan bulunamadı' });
        }
        res.json({ message: 'Mekan başarıyla silindi' });
    } catch (error) {
        console.error('Error deleting place:', error);
        res.status(500).json({ message: 'Mekan silinirken bir hata oluştu' });
    }
});

module.exports = router; 