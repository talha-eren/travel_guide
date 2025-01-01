const mongoose = require('mongoose');

// MongoDB Atlas bağlantı URL'i
const MONGODB_URI = 'mongodb+srv://talhaaeren:Talha123@cluster0.iqhzskb.mongodb.net/deneme?retryWrites=true&w=majority';

async function showLocations() {
    try {
        // MongoDB'ye bağlan
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB Atlas bağlantısı başarılı\n');

        // Tüm mekanları al
        const places = await mongoose.connection.collection('places').find({}).toArray();
        console.log(`Toplam ${places.length} mekan bulundu.\n`);

        // Her mekanın konum bilgilerini göster
        places.forEach((place, index) => {
            console.log(`${index + 1}. ${place.name}`);
            console.log('-------------------------');
            console.log(`Şehir: ${place.city || 'Belirtilmemiş'}`);
            console.log(`Adres: ${place.address || 'Belirtilmemiş'}`);
            console.log(`Konum: ${place.location || 'Belirtilmemiş'}`);
            if (place.coordinates) {
                console.log(`Koordinatlar: ${place.coordinates.lat}, ${place.coordinates.lng}`);
            } else {
                console.log('Koordinatlar: Belirtilmemiş');
            }
            console.log(`Harita URL: ${place.map_url || 'Belirtilmemiş'}`);
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
showLocations(); 