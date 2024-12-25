require('dotenv').config();
const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const Place = require('../models/Place');
const User = require('../models/User');

async function addSampleComment() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB bağlantısı başarılı');

        // Ayasofya'yı bul
        const place = await Place.findOne({ name: 'Ayasofya Camii' });
        if (!place) {
            console.log('Ayasofya bulunamadı!');
            process.exit(1);
        }

        // İlk kullanıcıyı bul
        const user = await User.findOne();
        if (!user) {
            console.log('Hiç kullanıcı bulunamadı!');
            process.exit(1);
        }

        // Örnek yorum oluştur
        const comment = new Comment({
            place: place._id,
            user: user._id,
            rating: 5,
            text: 'Muhteşem bir tarihi yapı. Mutlaka görülmeli!'
        });

        await comment.save();
        console.log('Örnek yorum başarıyla eklendi!');

        // Mekanın ortalama puanını güncelle
        const comments = await Comment.find({ place: place._id });
        const totalRating = comments.reduce((sum, comment) => sum + comment.rating, 0);
        place.rating = totalRating / comments.length;
        place.totalRatings = comments.length;
        await place.save();
        console.log('Mekan puanı güncellendi!');

        process.exit(0);
    } catch (error) {
        console.error('Hata:', error);
        process.exit(1);
    }
}

addSampleComment(); 