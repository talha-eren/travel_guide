const mongoose = require('mongoose');
require('dotenv').config();

async function showMapInfo() {
    try {
        // MongoDB'ye bağlan
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB bağlantısı başarılı\n');

        // Places koleksiyonundan map bilgilerini al
        const places = await mongoose.connection.collection('places').find({}, {
            projection: {
                name: 1,
                map_url: 1,
                location: 1,
                coordinates: 1,
                latitude: 1,
                longitude: 1,
                _id: 0
            }
        }).toArray();

        console.log('=== MEKAN HARİTA BİLGİLERİ ===\n');
        places.forEach((place, index) => {
            console.log(`${index + 1}. Mekan: ${place.name}`);
            if (place.map_url) console.log('Harita URL:', place.map_url);
            if (place.location) console.log('Konum:', place.location);
            if (place.coordinates) console.log('Koordinatlar:', place.coordinates);
            if (place.latitude) console.log('Enlem:', place.latitude);
            if (place.longitude) console.log('Boylam:', place.longitude);
            console.log('-------------------\n');
        });

    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
}

showMapInfo(); 