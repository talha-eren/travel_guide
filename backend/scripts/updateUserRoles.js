const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

async function updateUserRoles() {
    try {
        // MongoDB'ye bağlan
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB\'ye bağlanıldı');

        // Role alanı olmayan kullanıcıları bul ve güncelle
        const result = await User.updateMany(
            { role: { $exists: false } },
            { $set: { role: 'user' } }
        );

        console.log(`${result.modifiedCount} kullanıcı güncellendi`);
        console.log('Migration tamamlandı');

    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB bağlantısı kapatıldı');
    }
}

updateUserRoles(); 