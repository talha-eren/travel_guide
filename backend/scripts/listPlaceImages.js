require('dotenv').config();
const mongoose = require('mongoose');
const Place = require('../models/Place');

async function listPlaceImages() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB bağlantısı başarılı');

        const places = await Place.find({}, 'name images');
        console.log('\nMekan Resimleri:');
        places.forEach(place => {
            console.log(`\n${place.name}:`);
            if (place.images && place.images.length > 0) {
                place.images.forEach((image, index) => {
                    console.log(`${index + 1}. ${image}`);
                });
            } else {
                console.log('Resim bulunamadı');
            }
        });

        process.exit(0);
    } catch (error) {
        console.error('Hata:', error);
        process.exit(1);
    }
}

listPlaceImages(); 