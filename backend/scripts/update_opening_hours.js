const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://vtysproje123:vtys323@sarslan.smmxa.mongodb.net/deneme?retryWrites=true&w=majority&appName=sarslan';

async function updateOpeningHours() {
    try {
        // MongoDB'ye bağlan
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB bağlantısı başarılı\n');

        // Places koleksiyonunu al
        const places = await mongoose.connection.collection('places').find({}).toArray();
        console.log(`Toplam ${places.length} mekan bulundu.\n`);

        // Her mekan için çalışma saatlerini güncelle
        for (const place of places) {
            const standardOpeningHours = {
                monday: { open: "09:00", close: "18:00" },
                tuesday: { open: "09:00", close: "18:00" },
                wednesday: { open: "09:00", close: "18:00" },
                thursday: { open: "09:00", close: "18:00" },
                friday: { open: "09:00", close: "18:00" },
                saturday: { open: "09:00", close: "18:00" },
                sunday: { open: "09:00", close: "18:00" }
            };

            // Mevcut opening_hours verisi varsa onu kullan, yoksa standart saatleri kullan
            const updatedHours = place.opening_hours || standardOpeningHours;

            await mongoose.connection.collection('places').updateOne(
                { _id: place._id },
                { $set: { opening_hours: updatedHours } }
            );
            console.log(`${place.name} mekanının çalışma saatleri güncellendi.`);
        }

        console.log('\nTüm çalışma saatleri başarıyla güncellendi.');

    } catch (error) {
        console.error('Hata:', error);
    } finally {
        // Bağlantıyı kapat
        await mongoose.connection.close();
        console.log('\nMongoDB bağlantısı kapatıldı');
    }
}

// Scripti çalıştır
updateOpeningHours(); 