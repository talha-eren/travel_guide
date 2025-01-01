const mongoose = require('mongoose');
require('dotenv').config();

async function showMaps() {
    try {
        // MongoDB'ye bağlan
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB bağlantısı başarılı\n');

        // Tüm mekanları al
        const places = await mongoose.connection.collection('places').find({}).toArray();
        console.log(`Toplam ${places.length} mekan bulundu.\n`);

        // Her mekanın harita bilgilerini göster
        places.forEach((place, index) => {
            console.log(`${index + 1}. ${place.name}`);
            console.log('-------------------------');
            console.log('Harita Bilgileri:');
            console.log(`- Map URL: ${place.map_url || 'Belirtilmemiş'}`);
            console.log(`- Google Maps URL: ${place.google_maps_url || 'Belirtilmemiş'}`);
            console.log(`- Koordinatlar: ${place.coordinates ? `${place.coordinates.lat}, ${place.coordinates.lng}` : 'Belirtilmemiş'}`);
            console.log(`- Konum: ${place.location || 'Belirtilmemiş'}`);
            console.log(`- Adres: ${place.address || 'Belirtilmemiş'}`);
            console.log(`- Şehir: ${place.city || 'Belirtilmemiş'}`);
            console.log('\n');
        });

    } catch (error) {
        console.error('MongoDB bağlantı hatası:', error);
    } finally {
        // Bağlantıyı kapat
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('MongoDB bağlantısı kapatıldı');
        }
    }
}

// Scripti çalıştır
showMaps(); 