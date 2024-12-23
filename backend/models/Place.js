const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Tarihi', 'Doğal', 'Kültürel', 'Eğlence', 'Yeme-İçme']
    },
    images: [{
        type: String // URL olarak saklanacak
    }],
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalRatings: {
        type: Number,
        default: 0
    },
    coordinates: {
        latitude: Number,
        longitude: Number
    },
    openingHours: {
        monday: { open: String, close: String },
        tuesday: { open: String, close: String },
        wednesday: { open: String, close: String },
        thursday: { open: String, close: String },
        friday: { open: String, close: String },
        saturday: { open: String, close: String },
        sunday: { open: String, close: String }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Güncelleme tarihini otomatik güncelle
placeSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Mekan adı ve şehir için arama indeksi
placeSchema.index({ name: 'text', city: 'text' });

const Place = mongoose.model('Place', placeSchema);

module.exports = Place; 