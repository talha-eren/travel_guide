class ChatBot {
    constructor() {
        this.button = document.getElementById('chatbotButton');
        this.container = document.getElementById('chatbotContainer');
        this.closeButton = document.getElementById('chatbotClose');
        this.messagesContainer = document.getElementById('chatbotMessages');
        this.suggestionsContainer = document.getElementById('chatbotSuggestions');
        this.input = document.getElementById('chatbotInput');
        this.sendButton = document.getElementById('chatbotSend');
        this.fullscreenButton = document.getElementById('chatbotFullscreen');
        this.isFullscreen = false;
        
        // Profil ismini al
        const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        this.userName = userProfile.fullName || localStorage.getItem('userName') || '';
        
        this.suggestions = [
            'Popüler mekanlar nelerdir?',
            'En yüksek puanlı yerler',
            'Tarihi yerler',
            'Doğal güzellikler',
            'Yeme-içme mekanları',
            'Anıtkabir\'e yönlendir',
            'Ayasofya kaç yıldızlı?',
            'Merhaba!',
            'Nasılsın?'
        ];

        // Sohbet yanıtları
        this.chatResponses = {
            'merhaba': ['Merhaba', 'Selam', 'Hoş geldin'],
            'nasılsın': ['İyiyim, teşekkür ederim! Sen nasılsın?', 'Harika! Sana nasıl yardımcı olabilirim?', 'Çok iyiyim, umarım sen de iyisindir!'],
            'iyiyim': ['Bunu duymak güzel! Sana nasıl yardımcı olabilirim?', 'Harika! Bugün hangi mekanı keşfetmek istersin?'],
            'teşekkür': ['Rica ederim!', 'Ne demek, her zaman!', 'Ben teşekkür ederim!'],
            'güle güle': ['Güle güle!', 'Tekrar görüşmek üzere!', 'İyi günler!']
        };

        // Mekan veritabanı
        this.places = {
            'anıtkabir': { 
                id: '6543f8c9c7a22f9d3bd0e3c7',
                name: 'Anıtkabir',
                rating: 4.9,
                description: 'Türkiye Cumhuriyeti\'nin kurucusu Mustafa Kemal Atatürk\'ün anıt mezarı',
                city: 'Ankara'
            },
            'ayasofya': {
                id: '6543f8c9c7a22f9d3bd0e3c8',
                name: 'Ayasofya',
                rating: 4.8,
                description: 'Bizans döneminden kalma tarihi bazilika ve müze',
                city: 'İstanbul'
            },
            'topkapı sarayı': {
                id: '6543f8c9c7a22f9d3bd0e3c9',
                name: 'Topkapı Sarayı',
                rating: 4.8,
                description: 'Osmanlı İmparatorluğu\'nun yönetim merkezi',
                city: 'İstanbul'
            },
            'peri bacaları': {
                id: '6543f8c9c7a22f9d3bd0e3ca',
                name: 'Peri Bacaları',
                rating: 4.9,
                description: 'Kapadokya\'nın simgesi olan doğal oluşumlar',
                city: 'Nevşehir'
            },
            'pamukkale': {
                id: '6543f8c9c7a22f9d3bd0e3cb',
                name: 'Pamukkale Travertenleri',
                rating: 4.7,
                description: 'Beyaz kireçtaşı terasları ve termal suları',
                city: 'Denizli'
            }
        };

        this.setupEventListeners();
        this.initialize();
    }

    initialize() {
        if (!this.userName) {
            this.askForName();
        } else {
            this.welcomeUser();
        }
        this.showSuggestions();
    }

    askForName() {
        this.addMessage('Merhaba! Ben Gezi Asistanı. Sizinle daha iyi iletişim kurabilmem için isminizi öğrenebilir miyim?', 'bot');
    }

    welcomeUser() {
        const hour = new Date().getHours();
        let greeting = '';
        
        if (hour < 12) {
            greeting = 'Günaydın';
        } else if (hour < 18) {
            greeting = 'İyi günler';
        } else {
            greeting = 'İyi akşamlar';
        }

        this.addMessage(`${greeting} ${this.userName}! Ben Gezi Asistanı. Size nasıl yardımcı olabilirim?\n\nŞunları yapabilirim:\n- Mekan önerileri\n- Mekan puanlarını gösterme\n- Mekanlara yönlendirme\n- Şehir bazlı öneriler\n- Sohbet etme`, 'bot');
    }

    setupEventListeners() {
        this.button.addEventListener('click', () => {
            this.toggleChat();
        });

        this.closeButton.addEventListener('click', () => {
            this.toggleChat();
        });

        this.sendButton.addEventListener('click', () => {
            this.handleUserInput();
        });

        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleUserInput();
            }
        });

        // Tam ekran butonu
        this.fullscreenButton.addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // Reset butonu için event listener
        const resetButton = document.getElementById('chatbotReset');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.resetChat();
            });
        }
    }

    toggleChat() {
        this.container.classList.toggle('active');
        if (this.container.classList.contains('active')) {
            this.input.focus();
        }
    }

    toggleFullscreen() {
        this.isFullscreen = !this.isFullscreen;
        
        if (this.isFullscreen) {
            // Tam ekran moduna geç
            this.container.classList.add('fullscreen');
            this.fullscreenButton.innerHTML = '<i class="fas fa-compress"></i>';
            document.body.style.overflow = 'hidden'; // Sayfa scrollunu engelle
            
            // Mobil cihazlar için ekranı döndür
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('landscape').catch(() => {
                    // Ekran kilitleme başarısız olursa sessizce devam et
                });
            }
        } else {
            // Normal moda dön
            this.container.classList.remove('fullscreen');
            this.fullscreenButton.innerHTML = '<i class="fas fa-expand"></i>';
            document.body.style.overflow = ''; // Sayfa scrollunu geri aç
            
            // Ekran kilidini kaldır
            if (screen.orientation && screen.orientation.unlock) {
                screen.orientation.unlock();
            }
        }
        
        // Mesajları görünür alana kaydır
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        
        // Input'a odaklan
        this.input.focus();
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        
        const avatar = document.createElement('div');
        avatar.className = `chat-avatar ${sender}`;
        avatar.textContent = sender === 'bot' ? 'AI' : 'U';

        const content = document.createElement('div');
        content.className = 'message-content';
        content.textContent = text;

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        
        this.messagesContainer.appendChild(messageDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    showSuggestions() {
        this.suggestionsContainer.innerHTML = '';
        this.suggestions.forEach(suggestion => {
            const chip = document.createElement('div');
            chip.className = 'suggestion-chip';
            chip.textContent = suggestion;
            chip.addEventListener('click', () => {
                this.input.value = suggestion;
                this.handleUserInput();
            });
            this.suggestionsContainer.appendChild(chip);
        });
    }

    async handleUserInput() {
        const userInput = this.input.value.trim();
        if (!userInput) return;

        // İsim sorgusu yanıtı
        if (!this.userName) {
            this.userName = userInput;
            localStorage.setItem('userName', this.userName);
            this.addMessage(userInput, 'user');
            this.welcomeUser();
            this.input.value = '';
            return;
        }

        this.addMessage(userInput, 'user');
        this.input.value = '';
        this.input.disabled = true;
        this.sendButton.disabled = true;

        try {
            const response = await this.getBotResponse(userInput);
            this.addMessage(response, 'bot');
        } catch (error) {
            console.error('Error getting bot response:', error);
            this.addMessage('Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.', 'bot');
        }

        this.input.disabled = false;
        this.sendButton.disabled = false;
        this.input.focus();
    }

    async getBotResponse(userInput) {
        const input = userInput.toLowerCase();
        
        // Sohbeti sıfırlama kontrolü
        if (input.includes('sohbeti sıfırla')) {
            this.resetChat();
            return 'Sohbet sıfırlandı. Size nasıl yardımcı olabilirim?';
        }

        // Sohbet yanıtları kontrolü
        const chatResponse = this.getChatResponse(input);
        if (chatResponse) return chatResponse;

        // Mekan yönlendirme kontrolü
        const navigationMatch = input.match(/(.+)'[eaıiuüoö] yönlendir/);
        if (navigationMatch) {
            const placeName = navigationMatch[1].trim();
            return this.navigateToPlace(placeName);
        }

        // Mekan puanı kontrolü
        const ratingMatch = input.match(/(.+) kaç yıldızlı/);
        if (ratingMatch) {
            const placeName = ratingMatch[1].trim();
            return this.getPlaceRating(placeName);
        }
        
        // Popüler mekanlar
        if (input.includes('popüler') || input.includes('en iyi')) {
            return 'Size en popüler mekanları önerebilirim:\n\n' +
                   '1. Anıtkabir (4.9 ★)\n' +
                   '2. Peri Bacaları (4.9 ★)\n' +
                   '3. Ayasofya (4.8 ★)\n' +
                   '4. Topkapı Sarayı (4.8 ★)\n' +
                   '5. Pamukkale Travertenleri (4.7 ★)\n\n' +
                   'Herhangi bir mekanın detayları için "... kaç yıldızlı" veya "...\'e yönlendir" yazabilirsiniz.';
        }
        
        // Yüksek puanlı yerler
        if (input.includes('yüksek puan') || input.includes('en yüksek')) {
            return 'En yüksek puanlı mekanlarımız:\n\n' +
                   '★ Anıtkabir - 4.9\n' +
                   '★ Peri Bacaları - 4.9\n' +
                   '★ Ayasofya - 4.8\n' +
                   '★ Topkapı Sarayı - 4.8\n' +
                   '★ Pamukkale - 4.7\n\n' +
                   'Detaylı bilgi için mekan ismi yazabilirsiniz.';
        }
        
        // Tarihi yerler
        if (input.includes('tarih') || input.includes('tarihi')) {
            return 'Türkiye\'nin önemli tarihi mekanları:\n\n' +
                   '1. Ayasofya - İstanbul\n' +
                   '2. Topkapı Sarayı - İstanbul\n' +
                   '3. Efes Antik Kenti - İzmir\n' +
                   '4. Göbeklitepe - Şanlıurfa\n' +
                   '5. Aspendos - Antalya\n\n' +
                   'Her mekan hakkında detaylı bilgi için ismini yazabilirsiniz.';
        }
        
        // Doğal güzellikler
        if (input.includes('doğa') || input.includes('doğal')) {
            return 'Doğal güzelliklerimiz:\n\n' +
                   '1. Pamukkale Travertenleri - Denizli\n' +
                   '2. Kapadokya Peri Bacaları - Nevşehir\n' +
                   '3. Saklıkent Kanyonu - Muğla\n' +
                   '4. Uzungöl - Trabzon\n' +
                   '5. Düden Şelalesi - Antalya\n\n' +
                   'Detaylı bilgi için mekan ismi yazabilirsiniz.';
        }
        
        // Yeme-içme
        if (input.includes('yemek') || input.includes('restoran') || input.includes('kafe')) {
            return 'Size yöresel lezzetler sunan mekanlar önerebilirim. Hangi şehirde olduğunuzu belirtirseniz daha detaylı önerilerde bulunabilirim.\n\nÖrnek: "İstanbul\'da yemek" veya "Ankara restoranları"';
        }

        // Şehir bazlı öneriler
        const cities = ['ankara', 'istanbul', 'izmir', 'antalya', 'nevşehir'];
        for (const city of cities) {
            if (input.includes(city)) {
                return this.getCityRecommendations(city);
            }
        }

        // Mekan araması
        for (const [placeName, placeInfo] of Object.entries(this.places)) {
            if (input.includes(placeName)) {
                return `${placeInfo.name} - ${placeInfo.city}\n` +
                       `★ ${placeInfo.rating} puan\n\n` +
                       `${placeInfo.description}\n\n` +
                       `Mekanı görüntülemek için "${placeInfo.name}'e yönlendir" yazabilirsiniz.`;
            }
        }

        return 'Size nasıl yardımcı olabilirim?\n\n' +
               '- Mekan önerileri için şehir adı veya kategori yazabilirsiniz\n' +
               '- Mekan puanı için "... kaç yıldızlı" yazabilirsiniz\n' +
               '- Mekana gitmek için "...\'e yönlendir" yazabilirsiniz\n' +
               '- Önerilen sorulardan birini seçebilirsiniz';
    }

    getChatResponse(input) {
        // Selamlaşma
        if (input.includes('merhaba') || input.includes('selam')) {
            const responses = this.chatResponses['merhaba'];
            return `${responses[Math.floor(Math.random() * responses.length)]} ${this.userName}!`;
        }

        // Nasılsın
        if (input.includes('nasılsın')) {
            const responses = this.chatResponses['nasılsın'];
            return responses[Math.floor(Math.random() * responses.length)];
        }

        // İyiyim
        if (input.includes('iyiyim') || input.includes('iyi')) {
            const responses = this.chatResponses['iyiyim'];
            return responses[Math.floor(Math.random() * responses.length)];
        }

        // Teşekkür
        if (input.includes('teşekkür') || input.includes('sağol')) {
            const responses = this.chatResponses['teşekkür'];
            return responses[Math.floor(Math.random() * responses.length)];
        }

        // Güle güle
        if (input.includes('güle güle') || input.includes('hoşça kal')) {
            const responses = this.chatResponses['güle güle'];
            return responses[Math.floor(Math.random() * responses.length)];
        }

        return null;
    }

    navigateToPlace(placeName) {
        placeName = placeName.toLowerCase().trim();
        const place = Object.values(this.places).find(p => 
            p.name.toLowerCase().includes(placeName) || 
            placeName.includes(p.name.toLowerCase())
        );
        
        if (place) {
            // Mekan detay sayfasına yönlendir
            window.location.href = `place-details.html?id=${place.id}`;
            return `Sizi ${place.name} sayfasına yönlendiriyorum...`;
        } else {
            return 'Üzgünüm, bu mekanı bulamadım. Lütfen başka bir mekan deneyin.';
        }
    }

    getPlaceRating(placeName) {
        placeName = placeName.toLowerCase().trim();
        const place = Object.values(this.places).find(p => 
            p.name.toLowerCase().includes(placeName) || 
            placeName.includes(p.name.toLowerCase())
        );
        
        if (place) {
            return `${place.name} ${place.rating} yıldıza sahip!\n\n` +
                   `${place.description}\n\n` +
                   `Mekanı görüntülemek için "${place.name}'e yönlendir" yazabilirsiniz.`;
        }

        return 'Üzgünüm, bu mekanın puanını bulamadım.';
    }

    getCityRecommendations(city) {
        const recommendations = {
            ankara: 'Ankara\'da görülmesi gereken yerler:\n\n' +
                   '1. Anıtkabir (4.9 ★)\n' +
                   '2. Ankara Kalesi (4.5 ★)\n' +
                   '3. Beypazarı (4.7 ★)\n' +
                   '4. TBMM Binası (4.6 ★)\n' +
                   '5. Hamamönü (4.4 ★)\n\n' +
                   'Detaylı bilgi için mekan ismi yazabilirsiniz.',
            istanbul: 'İstanbul\'da mutlaka görmeniz gereken yerler:\n\n' +
                     '1. Ayasofya (4.8 ★)\n' +
                     '2. Topkapı Sarayı (4.8 ★)\n' +
                     '3. Sultanahmet Camii (4.9 ★)\n' +
                     '4. Galata Kulesi (4.6 ★)\n' +
                     '5. Kapalıçarşı (4.5 ★)\n\n' +
                     'Detaylı bilgi için mekan ismi yazabilirsiniz.',
            izmir: 'İzmir\'de öne çıkan mekanlar:\n\n' +
                   '1. Saat Kulesi (4.7 ★)\n' +
                   '2. Kemeraltı Çarşısı (4.5 ★)\n' +
                   '3. Efes Antik Kenti (4.9 ★)\n' +
                   '4. Şirince Köyü (4.6 ★)\n' +
                   '5. Kordon (4.8 ★)\n\n' +
                   'Detaylı bilgi için mekan ismi yazabilirsiniz.',
            antalya: 'Antalya\'nın popüler mekanları:\n\n' +
                    '1. Kaleiçi (4.7 ★)\n' +
                    '2. Düden Şelalesi (4.6 ★)\n' +
                    '3. Aspendos (4.8 ★)\n' +
                    '4. Side Antik Kenti (4.7 ★)\n' +
                    '5. Konyaaltı Plajı (4.5 ★)\n\n' +
                    'Detaylı bilgi için mekan ismi yazabilirsiniz.',
            nevşehir: 'Nevşehir\'de görülmesi gereken yerler:\n\n' +
                     '1. Peri Bacaları (4.9 ★)\n' +
                     '2. Göreme Açık Hava Müzesi (4.8 ★)\n' +
                     '3. Derinkuyu Yeraltı Şehri (4.7 ★)\n' +
                     '4. Uçhisar Kalesi (4.6 ★)\n' +
                     '5. Paşabağı (4.7 ★)\n\n' +
                     'Detaylı bilgi için mekan ismi yazabilirsiniz.'
        };

        return recommendations[city] || 'Bu şehir için henüz özel önerilerim yok.';
    }

    // Sohbeti sıfırlama fonksiyonu
    resetChat() {
        if (confirm('Sohbeti sıfırlamak istediğinizden emin misiniz?')) {
            this.messagesContainer.innerHTML = '';
            this.initialize();
        }
    }
}

// Chatbot'u başlat
document.addEventListener('DOMContentLoaded', () => {
    new ChatBot();
}); 