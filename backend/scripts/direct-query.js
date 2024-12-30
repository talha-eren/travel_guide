const { MongoClient } = require('mongodb');
require('dotenv').config();

async function showPlacePhotos() {
    const client = new MongoClient(process.env.MONGODB_URI);

    try {
        await client.connect();
        console.log('MongoDB bağlantısı başarılı\n');

        const db = client.db('deneme');
        const places = await db.collection('places').find({}, {
            projection: {
                name: 1,
                photo: 1,
                _id: 0
            }
        }).toArray();

        console.log('=== MEKAN FOTOĞRAFLARI ===\n');
        places.forEach((place, index) => {
            console.log(`${index + 1}. Mekan: ${place.name}`);
            if (place.photo) {
                if (Array.isArray(place.photo)) {
                    console.log('Fotoğraf URLs:');
                    place.photo.forEach(url => console.log('- ' + url));
                } else {
                    console.log('Fotoğraf URL:', place.photo);
                }
            } else {
                console.log('Fotoğraf bulunamadı');
            }
            console.log('-------------------\n');
        });

    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await client.close();
    }
}

showPlacePhotos(); 