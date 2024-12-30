const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['historical', 'nature', 'cultural', 'other'],
        default: 'other'
    },
    city_name: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    website: {
        type: String,
        trim: true
    },
    phone_number: {
        type: String,
        trim: true
    },
    opening_hours: [{
        type: String,
        trim: true
    }],
    images: [{
        type: String,
        trim: true
    }],
    map_link: {
        type: String,
        trim: true
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

// Güncelleme öncesi updated_at alanını güncelle
placeSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

placeSchema.pre('findOneAndUpdate', function(next) {
    this._update.updated_at = Date.now();
    next();
});

module.exports = mongoose.model('Place', placeSchema); 