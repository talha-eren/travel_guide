const mongoose = require('mongoose');
const Place = require('../models/Place');
require('dotenv').config();

const places = [
    {
        name: "Ayasofya Camii",
        description: "İstanbul'un en önemli tarihi yapılarından biri olan Ayasofya, hem müze hem de cami olarak hizmet vermiştir.",
        city: "İstanbul",
        address: "Sultan Ahmet, Ayasofya Meydanı No:1",
        category: "Tarihi",
        images: [
            "https://example.com/ayasofya1.jpg",
            "https://example.com/ayasofya2.jpg"
        ],
        rating: 4.8,
        totalRatings: 1250,
        coordinates: {
            latitude: 41.008583,
            longitude: 28.980175
        },
        openingHours: {
            monday: { open: "09:00", close: "17:00" },
            tuesday: { open: "09:00", close: "17:00" },
            wednesday: { open: "09:00", close: "17:00" },
            thursday: { open: "09:00", close: "17:00" },
            friday: { open: "09:00", close: "17:00" },
            saturday: { open: "09:00", close: "17:00" },
            sunday: { open: "09:00", close: "17:00" }
        }
    },
    {
        name: "Topkapı Sarayı",
        description: "Osmanlı İmparatorluğu'nun 400 yıl boyunca yönetim merkezi olan saray müzesi.",
        city: "İstanbul",
        address: "Cankurtaran, Topkapı Sarayı",
        category: "Tarihi",
        images: [
            "https://example.com/topkapi1.jpg",
            "https://example.com/topkapi2.jpg"
        ],
        rating: 4.7,
        totalRatings: 980,
        coordinates: {
            latitude: 41.011667,
            longitude: 28.983333
        },
        openingHours: {
            monday: { open: "09:00", close: "17:00" },
            tuesday: { open: "09:00", close: "17:00" },
            wednesday: { open: "09:00", close: "17:00" },
            thursday: { open: "09:00", close: "17:00" },
            friday: { open: "09:00", close: "17:00" },
            saturday: { open: "09:00", close: "17:00" },
            sunday: { open: "09:00", close: "17:00" }
        }
    },
    {
        name: "Kapadokya",
        description: "Eşsiz peri bacaları ve sıcak hava balonlarıyla ünlü doğal güzellik.",
        city: "Nevşehir",
        address: "Göreme, Nevşehir",
        category: "Doğal",
        images: [
            "https://example.com/kapadokya1.jpg",
            "https://example.com/kapadokya2.jpg"
        ],
        rating: 4.9,
        totalRatings: 2100,
        coordinates: {
            latitude: 38.643056,
            longitude: 34.828889
        },
        openingHours: {
            monday: { open: "00:00", close: "23:59" },
            tuesday: { open: "00:00", close: "23:59" },
            wednesday: { open: "00:00", close: "23:59" },
            thursday: { open: "00:00", close: "23:59" },
            friday: { open: "00:00", close: "23:59" },
            saturday: { open: "00:00", close: "23:59" },
            sunday: { open: "00:00", close: "23:59" }
        }
    }
];

async function seedPlaces() {
    try {
        // MongoDB'ye bağlan
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB bağlantısı başarılı');

        // Mevcut mekanları temizle
        await Place.deleteMany({});
        console.log('Mevcut mekanlar temizlendi');

        // Yeni mekanları ekle
        await Place.insertMany(places);
        console.log('Örnek mekanlar eklendi');

        // Bağlantıyı kapat
        await mongoose.connection.close();
        console.log('MongoDB bağlantısı kapatıldı');
    } catch (error) {
        console.error('Hata:', error);
        process.exit(1);
    }
}

// Seed işlemini başlat
seedPlaces(); 