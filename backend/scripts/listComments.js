require('dotenv').config();
const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const Place = require('../models/Place');
const User = require('../models/User');

async function listComments() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB bağlantısı başarılı');

        const comments = await Comment.find()
            .populate('place', 'name')
            .populate('user', 'name');

        console.log('\nYorumlar:');
        if (comments.length === 0) {
            console.log('Henüz hiç yorum yapılmamış.');
        } else {
            comments.forEach(comment => {
                console.log(`\nMekan: ${comment.place?.name || 'Silinmiş Mekan'}`);
                console.log(`Kullanıcı: ${comment.user?.name || 'Silinmiş Kullanıcı'}`);
                console.log(`Puan: ${comment.rating}`);
                console.log(`Yorum: ${comment.text}`);
                console.log(`Tarih: ${comment.createdAt}`);
                console.log('------------------------');
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('Hata:', error);
        process.exit(1);
    }
}

listComments(); 