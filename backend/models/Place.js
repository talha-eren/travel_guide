const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['tarihi', 'dogal', 'kulturel', 'eglence', 'yeme-icme']
    },
    city: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    images: [{
        type: String
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
    openingHours: {
        monday: {
            open: String,
            close: String
        },
        tuesday: {
            open: String,
            close: String
        },
        wednesday: {
            open: String,
            close: String
        },
        thursday: {
            open: String,
            close: String
        },
        friday: {
            open: String,
            close: String
        },
        saturday: {
            open: String,
            close: String
        },
        sunday: {
            open: String,
            close: String
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Place', placeSchema); 