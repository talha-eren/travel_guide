const express = require('express');
const router = express.Router();
const Place = require('../models/Place');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Tüm mekanları getir
router.get('/', async (req, res) => {
    try {
        const places = await Place.find();
        res.json(places);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Belirli bir mekanı getir
router.get('/:id', async (req, res) => {
    try {
        const place = await Place.findById(req.params.id);
        if (!place) {
            return res.status(404).json({ message: 'Mekan bulunamadı' });
        }
        res.json(place);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Yeni mekan ekle (sadece admin)
router.post('/', adminAuth, async (req, res) => {
    try {
        const place = new Place({
            name: req.body.name,
            category: req.body.category,
            city_name: req.body.city_name,
            address: req.body.address,
            description: req.body.description,
            website: req.body.website,
            phone_number: req.body.phone_number,
            opening_hours: req.body.opening_hours,
            images: req.body.images,
            map_link: req.body.map_link
        });

        const newPlace = await place.save();
        res.status(201).json(newPlace);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Mekan güncelle (sadece admin)
router.put('/:id', adminAuth, async (req, res) => {
    try {
        const updateData = {
            name: req.body.name,
            category: req.body.category,
            city_name: req.body.city_name,
            address: req.body.address,
            description: req.body.description,
            website: req.body.website,
            phone_number: req.body.phone_number,
            opening_hours: req.body.opening_hours,
            images: req.body.images,
            map_link: req.body.map_link
        };

        const updatedPlace = await Place.findByIdAndUpdate(
            req.params.id,
            updateData,
            { 
                new: true, 
                runValidators: true,
                lean: true
            }
        ).select('name category city_name address description website phone_number opening_hours images map_link');

        if (!updatedPlace) {
            return res.status(404).json({ message: 'Mekan bulunamadı' });
        }

        res.json(updatedPlace);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Mekan sil (sadece admin)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const place = await Place.findById(req.params.id);
        if (!place) {
            return res.status(404).json({ message: 'Mekan bulunamadı' });
        }

        await Place.findByIdAndDelete(req.params.id);
        res.json({ message: 'Mekan başarıyla silindi' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Kategori veya şehre göre mekanları filtrele
router.get('/filter', async (req, res) => {
    try {
        const { category, city } = req.query;
        const filter = {};

        if (category) filter.category = category;
        if (city) filter.city_name = city;

        const places = await Place.find(filter);
        res.json(places);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 