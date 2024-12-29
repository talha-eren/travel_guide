const mongoose = require('mongoose');
require('dotenv').config();

async function showLocations() {
    try {
        // MongoDB'ye bağlan
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB bağlantısı başarılı\n');

        // Places koleksiyonundan sadece konum bilgilerini al
        const places = await mongoose.connection.collection('places').find({}, {
            projection: {
                name: 1,
                city: 1,
                address: 1,
                _id: 0
            }
        }).toArray();

        console.log('=== MEKAN KONUM BİLGİLERİ ===\n');
        places.forEach((place, index) => {
            console.log(`${index + 1}. Mekan: ${place.name}`);
            console.log('Şehir:', place.city || 'Belirtilmemiş');
            console.log('Adres:', place.address || 'Belirtilmemiş');
            console.log('-------------------\n');
        });

    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
}

showLocations(); 