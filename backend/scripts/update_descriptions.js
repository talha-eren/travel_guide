const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://vtysproje123:vtys323@sarslan.smmxa.mongodb.net/deneme?retryWrites=true&w=majority&appName=sarslan';

async function updateDescriptions() {
    try {
        // MongoDB'ye bağlan
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB bağlantısı başarılı\n');

        // Places koleksiyonunu al
        const places = await mongoose.connection.collection('places').find({}).toArray();
        console.log(`Toplam ${places.length} mekan bulundu.\n`);

        // Her mekan için wiki_summary'yi description olarak güncelle
        for (const place of places) {
            if (place.wiki_summary) {
                await mongoose.connection.collection('places').updateOne(
                    { _id: place._id },
                    { $set: { description: place.wiki_summary } }
                );
                console.log(`${place.name} mekanının açıklaması güncellendi.`);
            }
        }

        console.log('\nTüm açıklamalar başarıyla güncellendi.');

    } catch (error) {
        console.error('Hata:', error);
    } finally {
        // Bağlantıyı kapat
        await mongoose.connection.close();
        console.log('\nMongoDB bağlantısı kapatıldı');
    }
}

// Scripti çalıştır
updateDescriptions(); 