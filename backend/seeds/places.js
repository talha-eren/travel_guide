const mongoose = require('mongoose');
const Place = require('../models/Place');

const places = [
    {
        name: "Ayasofya Camii",
        description: "Bizans İmparatorluğu'nun en önemli kilisesi olan, Osmanlı döneminde camiye çevrilen ve günümüzde de cami olarak hizmet veren tarihi yapı.",
        city: "İstanbul",
        address: "Sultan Ahmet Mahallesi, Ayasofya Meydanı No:1",
        category: "Tarihi",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/2/22/Hagia_Sophia_Mars_2013.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/e/e7/Hagia_Sophia_interior_2.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/1/1f/Hagia_Sophia_Interior_2007.jpg"
        ],
        rating: 4.8,
        totalRatings: 1250,
        coordinates: {
            latitude: 41.008583,
            longitude: 28.980175
        },
        openingHours: {
            monday: "24 saat açık",
            tuesday: "24 saat açık",
            wednesday: "24 saat açık",
            thursday: "24 saat açık",
            friday: "24 saat açık",
            saturday: "24 saat açık",
            sunday: "24 saat açık"
        },
        isActive: true
    },
    {
        name: "Topkapı Sarayı",
        description: "Osmanlı İmparatorluğu'nun 400 yılı aşkın süre boyunca yönetim merkezi olan muhteşem saray kompleksi.",
        city: "İstanbul",
        address: "Cankurtaran Mahallesi, Topkapı Sarayı",
        category: "Tarihi",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/8/8d/Topkapi_Palace_Istanbul_2007.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/4/4b/Istanbul_-_Palazzo_Topkapi_-_Terza_corte_-_Biblioteca_di_Ahmet_III_-_Foto_G._Dall%27Orto_27-5-2006.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/2/2a/Topkapi_Palace_Harem_Istanbul_2007_001.jpg"
        ],
        rating: 4.7,
        totalRatings: 980,
        coordinates: {
            latitude: 41.011667,
            longitude: 28.983333
        },
        openingHours: {
            monday: "Kapalı",
            tuesday: "09:00-17:00",
            wednesday: "09:00-17:00",
            thursday: "09:00-17:00",
            friday: "09:00-17:00",
            saturday: "09:00-17:00",
            sunday: "09:00-17:00"
        },
        isActive: true
    },
    {
        name: "Kapadokya",
        description: "Peri bacaları, yeraltı şehirleri ve sıcak hava balonlarıyla ünlü, eşsiz doğal güzelliklere sahip bölge.",
        city: "Nevşehir",
        address: "Göreme, Nevşehir",
        category: "Doğal",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/6/65/Cappadocia_Ballooning.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/5/5c/Cappadocia_balloons.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/4/4f/G%C3%B6reme_Cappadocia.jpg"
        ],
        rating: 4.9,
        totalRatings: 2150,
        coordinates: {
            latitude: 38.643056,
            longitude: 34.828889
        },
        openingHours: {
            monday: "24 saat açık",
            tuesday: "24 saat açık",
            wednesday: "24 saat açık",
            thursday: "24 saat açık",
            friday: "24 saat açık",
            saturday: "24 saat açık",
            sunday: "24 saat açık"
        },
        isActive: true
    }
];

async function seedPlaces() {
    try {
        // Mevcut mekanları temizle
        await Place.deleteMany({});
        
        // Yeni mekanları ekle
        await Place.insertMany(places);
        
        console.log('Mekanlar başarıyla eklendi!');
        process.exit(0);
    } catch (error) {
        console.error('Mekan eklenirken hata oluştu:', error);
        process.exit(1);
    }
}

// MongoDB bağlantısı
mongoose.connect('mongodb://localhost:27017/travel_guide', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('MongoDB bağlantısı başarılı');
    seedPlaces();
})
.catch((error) => {
    console.error('MongoDB bağlantı hatası:', error);
    process.exit(1);
}); 