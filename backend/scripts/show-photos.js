const mongoose = require('mongoose');
require('dotenv').config();

async function showPhotos() {
    try {
        // MongoDB'ye bağlan
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB bağlantısı başarılı\n');

        // Places koleksiyonundan sadece name ve images alanlarını al
        const places = await mongoose.connection.collection('places').find({}, {
            projection: {
                name: 1,
                images: 1,
                photo: 1
            }
        }).toArray();

        console.log('=== MEKAN FOTOĞRAFLARI ===\n');
        places.forEach((place, index) => {
            console.log(`${index + 1}. Mekan: ${place.name}`);
            
            // photo alanını kontrol et
            if (place.photo) {
                if (Array.isArray(place.photo)) {
                    console.log('Photo URLs:');
                    place.photo.forEach(url => console.log('- ' + url));
                } else {
                    console.log('Photo URL:', place.photo);
                }
            }
            
            // images alanını kontrol et
            if (place.images && place.images.length > 0) {
                console.log('Images URLs:');
                place.images.forEach(url => console.log('- ' + url));
            }
            
            if (!place.photo && (!place.images || place.images.length === 0)) {
                console.log('Fotoğraf bulunamadı');
            }
            
            console.log('-------------------\n');
        });

    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
}

showPhotos(); 