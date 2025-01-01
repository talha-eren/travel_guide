require('dotenv').config();
const mongoose = require('mongoose');
const Place = require('../models/Place');

const placeUpdates = [
    {
        name: "Ayasofya Camii",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/2/22/Hagia_Sophia_Mars_2013.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/e/e7/Hagia_Sophia_interior_2.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/8/82/Hagia_Sophia_Dome.JPG",
            "https://upload.wikimedia.org/wikipedia/commons/5/5c/Hagia_Sophia_at_night.jpg"
        ]
    },
    {
        name: "Topkapı Sarayı",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/9/9c/Istanbul_-_Topkapi_palace_-_Courtyard_-_01.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/4/4b/Imperial_Gate_Topkapi_Palace.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/3/3c/Topkapi_Palace_Harem.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/7/7d/Topkapi_Palace_Museum_Istanbul_Turkey.jpg"
        ]
    },
    {
        name: "Kapadokya",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/6/65/Hot_air_balloons_over_Cappadocia.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/d/d2/Goreme_Cappadocia.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/8/84/Cappadocia_Underground_City.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/3/36/Cappadocia_Chimneys.jpg"
        ]
    }
];

async function updatePlaceImages() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB bağlantısı başarılı');

        // Her mekan için güncelleme yap
        for (const update of placeUpdates) {
            // Önce mekanı bul ve ismini kontrol et
            const place = await Place.findOne({ name: update.name });
            if (!place) {
                console.log(`${update.name} bulunamadı!`);
                continue;
            }
            
            console.log(`${update.name} bulundu, ID: ${place._id}`);
            
            const result = await Place.updateOne(
                { name: update.name },
                { $set: { images: update.images } }
            );
            
            console.log(`${update.name} güncellendi:`, result);
        }

        console.log('İşlem tamamlandı');
        process.exit(0);
    } catch (error) {
        console.error('Hata:', error);
        process.exit(1);
    }
}

updatePlaceImages(); 