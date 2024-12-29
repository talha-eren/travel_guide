const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    try {
        const places = await mongoose.connection.collection('places').find({}, {
            projection: {
                images: 1,
                name: 1,
                _id: 0
            }
        }).toArray();
        
        places.forEach(place => {
            console.log('\nMekan:', place.name);
            if (place.images && place.images.length > 0) {
                console.log('Görseller:');
                place.images.forEach(img => console.log('-', img));
            } else {
                console.log('Görsel yok');
            }
        });
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}); 