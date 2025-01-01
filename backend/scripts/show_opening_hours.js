const mongoose = require('mongoose');
require('dotenv').config();

async function updateDescriptionsFromWikiSummary() {
    try {
        // MongoDB'ye bağlan
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB bağlantısı başarılı\n');

        // Places koleksiyonunu al
        const places = await mongoose.connection.collection('places').find({}).toArray();
        console.log(`Toplam ${places.length} mekan bulundu.\n`);

        // Her mekan için wiki_summary'yi description'a aktar
        for (const place of places) {
            if (place.wiki_summary) {
                await mongoose.connection.collection('places').updateOne(
                    { _id: place._id },
                    { $set: { description: place.wiki_summary } }
                );
                console.log(`${place.name} mekanının açıklaması güncellendi.`);
            } else {
                console.log(`${place.name} mekanı için wiki özeti bulunamadı.`);
            }
        }

        console.log('\nİşlem tamamlandı.');

    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB bağlantısı kapatıldı');
    }
}

// Scripti çalıştır
updateDescriptionsFromWikiSummary(); 