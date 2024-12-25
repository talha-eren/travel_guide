require('dotenv').config();
const mongoose = require('mongoose');
const Place = require('../models/Place');

async function listPlaces() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB bağlantısı başarılı');

        const places = await Place.find({}, 'name');
        console.log('\nMekan isimleri:');
        places.forEach(place => {
            console.log(`- ${place.name}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Hata:', error);
        process.exit(1);
    }
}

listPlaces(); 