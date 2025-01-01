const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB bağlantısı başarılı');
        
        // Places koleksiyonunu kontrol et
        const places = await mongoose.connection.collection('places').find({}).toArray();
        console.log('\nMekanlar:', JSON.stringify(places, null, 2));
        
    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
}

testConnection(); 