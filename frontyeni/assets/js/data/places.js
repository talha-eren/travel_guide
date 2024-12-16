// Mekan verileri
const places = [
    {
        id: 1,
        name: "Ayasofya-i Kebir Cami-i Şerifi",
        address: "Sultan Ahmet, Ayasofya Meydanı No:1, 34122 Fatih/İstanbul",
        city_name: "İstanbul",
        rating: 4.8,
        opening_hours: [
            "Pazartesi: 09:00–17:00",
            "Salı: Kapalı",
            "Çarşamba: 09:00–17:00",
            "Perşembe: 09:00–17:00",
            "Cuma: 09:00–17:00",
            "Cumartesi: 09:00–17:00",
            "Pazar: 09:00–17:00"
        ],
        phone_number: "(0212) 522 17 50",
        website: "https://ayasofyacamii.gov.tr/",
        photos: [
            "https://upload.wikimedia.org/wikipedia/commons/2/22/Hagia_Sophia_Mars_2013.jpg",
            "https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=AdCG2DO7BdlPrf22baFK69naieN8JEndtAf31syOXvBfIGccR5cFLn_fzjjGoBmpUuGEl66si0XgIT70-RTVdAPFqJPwdDdLram12VJA5yWeMkuBphkYZdYPaRRos9lOwYUx6dUmBphApkRDswPE22i6MTE2Sm4J0f4SxKAp-7f4FUoGEYdN&key=AIzaSyD4bmFhPmKt80nNRg3hQ2TX_Wk5W8Xmz-c",
            "https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=AdCG2DM8TQIcePZCAVVd3pJto2gX-OlhpTxFI43O8oe21GT8BxuFKE2QJ1Dl4FZI8MKuSG8kOntwl9r1Ajytv-ueYitlFYG4O6CKI3PbUJBXhw-ji-5ru10_DDQ5QVUTc0f4XmDZc9LafNujYN04HwVD1NX_4JqNJMIU5qygv0GiD5v_-OHF&key=AIzaSyD4bmFhPmKt80nNRg3hQ2TX_Wk5W8Xmz-c",
            "https://upload.wikimedia.org/wikipedia/commons/2/22/Hagia_Sophia_Mars_2013.jpg"
        ],
        map_url: "https://www.google.com/maps/place/?q=place_id:ChIJJxwBkr65yhQRrk9EN29vbiM",
        description: "Ayasofya, İstanbul'un en önemli tarihi yapılarından biridir. 537 yılında inşa edilen yapı, hem kilise hem cami olarak kullanılmış, dünya tarihinde önemli bir yere sahiptir."
    },
    {
        id: 2,
        name: "Topkapı Sarayı",
        address: "Cankurtaran, 34122 Fatih/İstanbul",
        city_name: "İstanbul",
        rating: 4.7,
        opening_hours: [
            "Pazartesi: Kapalı",
            "Salı: 09:00–17:00",
            "Çarşamba: 09:00–17:00",
            "Perşembe: 09:00–17:00",
            "Cuma: 09:00–17:00",
            "Cumartesi: 09:00–17:00",
            "Pazar: 09:00–17:00"
        ],
        phone_number: "(0212) 512 04 80",
        website: "https://www.topkapisarayi.gov.tr/",
        photos: [
            "https://upload.wikimedia.org/wikipedia/commons/2/22/Hagia_Sophia_Mars_2013.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/2/22/Hagia_Sophia_Mars_2013.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/2/22/Hagia_Sophia_Mars_2013.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/2/22/Hagia_Sophia_Mars_2013.jpg"
        ],
        map_url: "https://goo.gl/maps/5xYQJ8zX7Z9QKgxH7",
        description: "Osmanlı İmparatorluğu'nun 400 yıllık yönetim merkezi olan muhteşem saray kompleksi. Harem dairesi, hazine odası, mutfaklar ve diğer bölümleriyle Osmanlı yaşamını yansıtır."
    },
    {
        id: 3,
        name: "Deneme",
        address: "Sultan Ahmet, Ayasofya Meydanı No:1, 34122 Fatih/İstanbul",
        city_name: "Maraş",
        rating: 4.8,
        opening_hours: [
            "Pazartesi: 09:00–17:00",
            "Salı: Kapalı",
            "Çarşamba: 09:00–17:00",
            "Perşembe: 09:00–17:00",
            "Cuma: 09:00–17:00",
            "Cumartesi: 09:00–17:00",
            "Pazar: 09:00–17:00"
        ],
        phone_number: "(0212) 522 17 50",
        website: "https://ayasofyacamii.gov.tr/",
        photos: [
            "https://upload.wikimedia.org/wikipedia/commons/2/22/Hagia_Sophia_Mars_2013.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/2/22/Hagia_Sophia_Mars_2013.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/2/22/Hagia_Sophia_Mars_2013.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/2/22/Hagia_Sophia_Mars_2013.jpg"
        ],
        map_url: "https://goo.gl/maps/JXgwJZ8qYyX2QgZv6",
        description: "Ayasofya, İstanbul'un en önemli tarihi yapılarından biridir. 537 yılında inşa edilen yapı, hem kilise hem cami olarak kullanılmış, dünya tarihinde önemli bir yere sahiptir."
    },
    {
        id: 4,
        name: "İstanbul Arkeoloji Müzeleri",
        address: "Cankurtaran, 34122 Fatih/İstanbul, Türkiye",
        city_name: "İstanbul",
        rating: 4.6,
        opening_hours: [
            "Pazartesi: 09:00–17:30",
            "Salı: 09:00–17:30",
            "Çarşamba: 09:00–17:30",
            "Perşembe: 09:00–17:30",
            "Cuma: 09:00–17:30",
            "Cumartesi: 09:00–17:30",
            "Pazar: 09:00–17:30"
        ],
        phone_number: "(0212) 520 77 40",
        website: "https://muze.gov.tr/muze-detay?SectionId=IAR01&DistId=IAR",
        photos: [
            "https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=AdCG2DMZsGl_Kp1z93HXFOamfD4mF8iN3boHdfPQJKsxp456PaFNmlAgUJj4dHBJm4facuLXV1dQxqHZHCxP1ZkhMjDiMG6wddrV8j1RcIaVF3qyim7gtc3yjCLjFANu8FqwvabrGUGaa6Rv9KzgyQlEjUBENBqugOgPOsRNlv6Dff1Afatt&key=AIzaSyD4bmFhPmKt80nNRg3hQ2TX_Wk5W8Xmz-c",
            "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AdCG2DN2AHtSg5JwL_CEkQx8DwYKSWbFGdWPg2ZCJWfzDm57AGN4Jl8oT8zlfz0kLHtJtFkTK7B9knbhemKoxrsy3LCYju3Z3inBcPwk4V933FbbIgWO7YlRaB6iRqaFYYFaWENOjiy1pE9pvQXqKKQ7Fx_D-YxnM8FI-n_oyoAC5Heq9FwG&key=AIzaSyD4bmFhPmKt80nNRg3hQ2TX_Wk5W8Xmz-c"
        ],
        map_url: "https://www.google.com/maps/place/?q=place_id:ChIJQbdCWr-5yhQRKTjvSx6RF7M",
        description: "İstanbul Arkeoloji Müzesi, çeşitli kültürlere ait bir milyonu aşkın eserle, dünyanın en büyük müzeleri arasındadır. Türkiye'nin müze olarak inşa edilen en eski binasıdır. 19. yüzyılın ortalarında Maarif Nazırı Mehmed Esad Safvet Paşa tarafından Müze-i Hümâyûn adıyla 1869 yılında kurulmuştur ve 13 Haziran 1891'de ana binanın inşaatı tamamlanıp ziyarete açılmıştır."
    }
];

// Global scope'a ekle
window.places = places; 