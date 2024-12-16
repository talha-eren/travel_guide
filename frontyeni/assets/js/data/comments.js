// Yorum verileri
const comments = [
    {
        id: 1,
        place_id: 1, // Ayasofya'ya ait yorum
        user_id: 1,
        user: {
            id: 1,
            name: "Ahmet Yılmaz",
            avatar: "A"
        },
        date: "2024-02-11",
        content: "Harika bir yer, mutlaka görülmeli!",
        likes: 12,
        liked: false
    },
    {
        id: 2,
        place_id: 1, // Ayasofya'ya ait yorum
        user_id: 2,
        user: {
            id: 2,
            name: "Ayşe Demir",
            avatar: "A"
        },
        date: "2024-02-10",
        content: "Tarihi dokusu muhteşem, çok etkileyici.",
        likes: 8,
        liked: true
    },
    {
        id: 3,
        place_id: 2, // Topkapı Sarayı'na ait yorum
        user_id: 1,
        user: {
            id: 1,
            name: "Ahmet Yılmaz",
            avatar: "A"
        },
        date: "2024-02-09",
        content: "Osmanlı tarihini yakından hissetmek için muhteşem bir mekan.",
        likes: 15,
        liked: false
    },
    {
        id: 4,
        place_id: 3, // Denemeye ait yorum
        user_id: 1,
        user: {
            id: 1,
            name: "s",
            avatar: "A"
        },
        date: "2024-02-09",
        content: "Deneme.",
        likes: 15,
        liked: false
    }
];

// Global scope'a ekle
window.comments = comments; 