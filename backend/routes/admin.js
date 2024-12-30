const express = require('express');
const router = express.Router();
const Place = require('../models/Place');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Tüm mekanları getir
router.get('/places', auth, admin, async (req, res) => {
    try {
        const places = await Place.find({})
            .select('name description category city address rating totalRatings')
            .sort({ createdAt: -1 });
        res.json(places);
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// Yeni mekan ekle
router.post('/places', auth, admin, async (req, res) => {
    try {
        const place = new Place(req.body);
        await place.save();
        res.status(201).json(place);
    } catch (error) {
        res.status(400).json({ message: 'Mekan eklenirken hata oluştu', error: error.message });
    }
});

// Mekan güncelle
router.put('/places/:id', auth, admin, async (req, res) => {
    try {
        const place = await Place.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!place) {
            return res.status(404).json({ message: 'Mekan bulunamadı' });
        }
        res.json(place);
    } catch (error) {
        res.status(400).json({ message: 'Mekan güncellenirken hata oluştu', error: error.message });
    }
});

// Mekan sil
router.delete('/places/:id', auth, admin, async (req, res) => {
    try {
        const place = await Place.findByIdAndDelete(req.params.id);
        if (!place) {
            return res.status(404).json({ message: 'Mekan bulunamadı' });
        }
        res.json({ message: 'Mekan başarıyla silindi' });
    } catch (error) {
        res.status(400).json({ message: 'Mekan silinirken hata oluştu', error: error.message });
    }
});

module.exports = router; 