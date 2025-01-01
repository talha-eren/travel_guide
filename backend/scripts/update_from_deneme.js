const mongoose = require('mongoose');
require('dotenv').config();

async function updateFromDeneme() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB bağlantısı başarılı\n');

        // deneme.places koleksiyonundan verileri al
        const denemePlaces = await mongoose.connection
            .useDb('deneme')
            .collection('places')
            .find({})
            .toArray();

        console.log(`deneme.places koleksiyonunda ${denemePlaces.length} mekan bulundu.\n`);

        // Her bir mekan için güncelleme yap
        for (const denemePlace of denemePlaces) {
            // Mevcut mekanı bul
            const existingPlace = await mongoose.connection
                .collection('places')
                .findOne({ name: denemePlace.name });

            if (existingPlace) {
                // Sadece wiki_summary ve opening_hours alanlarını güncelle
                const updateData = {};
                
                if (denemePlace.wiki_summary) {
                    updateData.wiki_summary = denemePlace.wiki_summary;
                }
                
                if (denemePlace.opening_hours) {
                    updateData.opening_hours = denemePlace.opening_hours;
                }

                if (Object.keys(updateData).length > 0) {
                    await mongoose.connection
                        .collection('places')
                        .updateOne(
                            { _id: existingPlace._id },
                            { $set: updateData }
                        );
                    console.log(`${denemePlace.name} güncellendi.`);
                }
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

updateFromDeneme(); 