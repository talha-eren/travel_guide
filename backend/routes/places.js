const express = require('express');
const router = express.Router();
const Place = require('../models/Place');
const authMiddleware = require('../middleware/auth');

// Tüm mekanları getir
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, category, city, search } = req.query;
        const query = { isActive: true };

        // Kategori filtresi
        if (category) {
            query.category = category;
        }

        // Şehir filtresi
        if (city) {
            query.city = city;
        }

        // Arama filtresi
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { city: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const places = await Place.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ rating: -1 })
            .exec();

        const count = await Place.countDocuments(query);

        res.json({
            places,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalPlaces: count
        });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// Mekan detayını getir
router.get('/:id', async (req, res) => {
    try {
        const place = await Place.findById(req.params.id);
        if (!place) {
            return res.status(404).json({ message: 'Mekan bulunamadı' });
        }
        res.json(place);
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// Yeni mekan ekle (Admin)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const place = new Place(req.body);
        await place.save();
        res.status(201).json(place);
    } catch (error) {
        res.status(400).json({ message: 'Mekan eklenemedi', error: error.message });
    }
});

// Mekan güncelle (Admin)
router.put('/:id', authMiddleware, async (req, res) => {
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
        res.status(400).json({ message: 'Mekan güncellenemedi', error: error.message });
    }
});

// Mekan sil (Admin)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const place = await Place.findByIdAndDelete(req.params.id);
        if (!place) {
            return res.status(404).json({ message: 'Mekan bulunamadı' });
        }
        res.json({ message: 'Mekan başarıyla silindi' });
    } catch (error) {
        res.status(500).json({ message: 'Mekan silinemedi', error: error.message });
    }
});

// Popüler mekanları getir
router.get('/popular', async (req, res) => {
    try {
        const places = await Place.find({ isActive: true })
            .sort({ rating: -1, totalRatings: -1 })
            .limit(10);
        res.json(places);
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

module.exports = router; 