const mongoose = require('mongoose');
require('dotenv').config();

async function showDatabaseData() {
    try {
        // MongoDB'ye bağlan
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB bağlantısı başarılı\n');

        // Places koleksiyonunu kontrol et
        console.log('=== PLACES KOLEKSİYONU ===');
        const places = await mongoose.connection.collection('places').find({}).toArray();
        console.log(`Toplam ${places.length} mekan bulundu:\n`);
        places.forEach((place, index) => {
            console.log(`${index + 1}. Mekan:`);
            console.log('İsim:', place.name);
            console.log('Şehir:', place.city);
            console.log('Kategori:', place.category);
            console.log('Adres:', place.address);
            console.log('Açıklama:', place.description);
            console.log('Puan:', place.rating);
            console.log('Toplam Değerlendirme:', place.totalRatings);
            console.log('Fotoğraf Sayısı:', place.images ? place.images.length : 0);
            if (place.images && place.images.length > 0) {
                console.log('Fotoğraf URLs:');
                place.images.forEach(img => console.log('- ' + img));
            }
            console.log('-------------------\n');
        });

        // Users koleksiyonunu kontrol et
        console.log('\n=== USERS KOLEKSİYONU ===');
        const users = await mongoose.connection.collection('users').find({}).toArray();
        console.log(`Toplam ${users.length} kullanıcı bulundu:\n`);
        users.forEach((user, index) => {
            console.log(`${index + 1}. Kullanıcı:`);
            console.log('Ad Soyad:', user.fullName);
            console.log('Email:', user.email);
            console.log('Kayıt Tarihi:', user.createdAt);
            console.log('Favori Mekan Sayısı:', user.favorites ? user.favorites.length : 0);
            console.log('-------------------\n');
        });

        // Comments koleksiyonunu kontrol et
        console.log('\n=== COMMENTS KOLEKSİYONU ===');
        const comments = await mongoose.connection.collection('comments').find({}).toArray();
        console.log(`Toplam ${comments.length} yorum bulundu:\n`);
        comments.forEach((comment, index) => {
            console.log(`${index + 1}. Yorum:`);
            console.log('Mekan ID:', comment.place);
            console.log('Kullanıcı ID:', comment.user);
            console.log('Puan:', comment.rating);
            console.log('Yorum:', comment.text);
            console.log('Tarih:', comment.createdAt);
            console.log('-------------------\n');
        });

    } catch (error) {
        console.error('Hata:', error);
    } finally {
        // Bağlantıyı kapat
        await mongoose.connection.close();
    }
}

// Scripti çalıştır
showDatabaseData(); 