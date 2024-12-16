// Arama işlevini başlat
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const searchBtn = document.querySelector('.search-btn');
    const sortFilter = document.getElementById('sortFilter');
    const openFilter = document.getElementById('openFilter');
    
    // Elementler yoksa hata verme, sadece uyarı ver
    if (!searchInput || !searchResults) {
        console.warn('Search elements not found, skipping search initialization');
        return;
    }

    // Filtreleme olaylarını dinle
    if (sortFilter && openFilter) {
        sortFilter.addEventListener('change', () => {
            const currentPlaces = window.currentSearchResults || [];
            displaySearchResults(currentPlaces, searchResults);
        });
        
        openFilter.addEventListener('change', () => {
            const currentPlaces = window.currentSearchResults || [];
            displaySearchResults(currentPlaces, searchResults);
        });
    }

    // Türkçe karakterleri düzgün şekilde küçük harfe çevir
    function turkishToLower(text) {
        return text.replace(/İ/g, 'i')
                  .replace(/I/g, 'ı')
                  .replace(/Ğ/g, 'ğ')
                  .replace(/Ü/g, 'ü')
                  .replace(/Ş/g, 'ş')
                  .replace(/Ö/g, 'ö')
                  .replace(/Ç/g, 'ç')
                  .toLowerCase();
    }

    // Arama fonksiyonu
    function performSearch() {
        const searchTerm = turkishToLower(searchInput.value.trim());
        
        if (searchTerm === '') {
            // Arama boşsa ana sayfaya dön
            window.history.pushState({}, '', window.location.pathname);
            searchResults.style.display = 'none';
            document.getElementById('popularPlaces').style.display = 'block';
            return;
        }

        // URL'yi güncelle
        const url = new URL(window.location);
        url.searchParams.set('search', searchTerm);
        window.history.pushState({ search: searchTerm }, '', url);

        // Mekanları sadece şehir adına göre filtrele (tam eşleşme)
        const filteredPlaces = window.places.filter(place => 
            turkishToLower(place.city_name || '') === searchTerm
        );

        // Sonuçları göster
        document.getElementById('popularPlaces').style.display = 'none';
        displaySearchResults(filteredPlaces, searchResults);
    }

    // Sayfa yüklendiğinde URL'deki aramayı kontrol et
    function checkUrlSearch() {
        const url = new URL(window.location);
        const searchTerm = url.searchParams.get('search');
        
        if (searchTerm) {
            searchInput.value = searchTerm;
            performSearch();
            document.getElementById('popularPlaces').style.display = 'none';
        } else {
            searchResults.style.display = 'none';
            document.getElementById('popularPlaces').style.display = 'block';
        }
    }

    // Tarayıcı geri/ileri butonları için olay dinleyicisi
    window.addEventListener('popstate', (event) => {
        const url = new URL(window.location);
        const detailId = url.searchParams.get('detail');
        const searchTerm = url.searchParams.get('search');
        const modal = document.getElementById('placeDetailsModal');

        // Detay modalını kontrol et
        if (modal) {
            if (!detailId) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        }

        // Arama durumunu kontrol et
        if (searchTerm) {
            searchInput.value = searchTerm;
            performSearch();
        } else {
            searchInput.value = '';
            searchResults.style.display = 'none';
            document.getElementById('popularPlaces').style.display = 'block';
        }
    });

    // Sayfa ilk yüklendiğinde URL'deki aramayı kontrol et
    checkUrlSearch();

    // Enter tuşuna basıldığında arama yap
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });

    // Arama butonuna tıklandığında arama yap
    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            performSearch();
        });
    }

    // Sayfa yüklendiğinde sonuçları gizle
    searchResults.style.display = 'none';

    // Dışarı tıklandığında sonuçları gizle
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target) && !searchBtn.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}

// Arama sonuçlarını göster
function displaySearchResults(places, container) {
    const resultsGrid = container.querySelector('#resultsGrid');
    if (!resultsGrid) return;

    if (places.length === 0) {
        container.style.display = 'flex';
        resultsGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>Aramanızla eşleşen sonuç bulunamadı.</p>
            </div>
        `;
        return;
    }

    // Filtreleme ve sıralama uygula
    const filteredAndSortedPlaces = filterAndSortPlaces(places);
    
    if (filteredAndSortedPlaces.length === 0) {
        container.style.display = 'flex';
        resultsGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>Seçili filtrelere uygun sonuç bulunamadı.</p>
            </div>
        `;
        return;
    }

    resultsGrid.innerHTML = filteredAndSortedPlaces.map(place => createPlaceCard(place)).join('');
    container.style.display = 'flex';
}

// Mekan kartı oluştur
function createPlaceCard(place) {
    // Özel karakterleri HTML entities'e çevir
    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };
    
    const placeData = {
        id: place.id,
        name: escapeHtml(place.name),
        address: escapeHtml(place.address),
        rating: place.rating,
        opening_hours: place.opening_hours,
        phone_number: escapeHtml(place.phone_number),
        website: escapeHtml(place.website),
        photos: place.photos,
        map_url: escapeHtml(place.map_url),
        description: escapeHtml(place.description)
    };
    
    // JSON'ı güvenli hale getir
    const safeJson = JSON.stringify(placeData)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    
    return `
        <div class="destination-card">
            <img src="${escapeHtml(place.photos[0])}" alt="${escapeHtml(place.name)}">
            <div class="card-content">
                <h3>${escapeHtml(place.name)}</h3>
                <div class="place-rating">
                    <i class="fas fa-star"></i>
                    <span>${place.rating}</span>
                </div>
                <p class="place-description">${escapeHtml(place.description)}</p>
                <button class="btn details-btn" onclick="event.preventDefault(); openPlaceDetails(${safeJson})">
                    Daha Fazla Bilgi
                </button>
            </div>
        </div>
    `;
}

// Popüler mekanları yükle
function loadPopularPlaces() {
    const popularPlacesContainer = document.getElementById('popularPlaces');
    
    if (!popularPlacesContainer) {
        console.warn('Popular places container not found');
        return;
    }

    // En yüksek puanlı 3 mekanı seç
    const topPlaces = [...window.places]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3);

    // Kartları yatay olarak sıralamak için bir div oluştur
    const cardsHtml = topPlaces.map(place => `
        <div style="flex: 1; min-width: 300px; margin-right: 2rem;">
            ${createPlaceCard(place)}
        </div>
    `).join('');

    // Kartları yatay container içine yerleştir
    popularPlacesContainer.innerHTML = `
        <div style="display: flex; flex-direction: row; justify-content: center; gap: 2rem; width: 100%;">
            ${cardsHtml}
        </div>
    `;
}

// Mekanın şu anda açık olup olmadığını kontrol et
function isPlaceOpen(place) {
    if (!place.opening_hours || place.opening_hours.length === 0) return true;
    
    const now = new Date();
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const currentDay = days[now.getDay()];
    
    const todayHours = place.opening_hours.find(hours => hours.startsWith(currentDay));
    if (!todayHours) return false;
    
    if (todayHours.toLowerCase().includes('kapalı')) return false;
    
    const timeMatch = todayHours.match(/(\d{2}):(\d{2})–(\d{2}):(\d{2})/);
    if (!timeMatch) return true;
    
    const [_, openHour, openMinute, closeHour, closeMinute] = timeMatch;
    const openTime = new Date();
    openTime.setHours(parseInt(openHour), parseInt(openMinute), 0);
    
    const closeTime = new Date();
    closeTime.setHours(parseInt(closeHour), parseInt(closeMinute), 0);
    
    return now >= openTime && now <= closeTime;
}

// Filtreleme ve sıralama fonksiyonu
function filterAndSortPlaces(places) {
    const sortFilter = document.getElementById('sortFilter');
    const openFilter = document.getElementById('openFilter');
    
    let filteredPlaces = [...places];
    
    // Sadece açık mekanlar filtresi
    if (openFilter.checked) {
        filteredPlaces = filteredPlaces.filter(place => isPlaceOpen(place));
    }
    
    // Sıralama filtresi
    switch (sortFilter.value) {
        case 'rating-high':
            filteredPlaces.sort((a, b) => b.rating - a.rating);
            break;
        case 'rating-low':
            filteredPlaces.sort((a, b) => a.rating - b.rating);
            break;
        case 'name-asc':
            filteredPlaces.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
            break;
        case 'name-desc':
            filteredPlaces.sort((a, b) => b.name.localeCompare(a.name, 'tr'));
            break;
        default:
            // Varsayılan sıralama (değişiklik yok)
            break;
    }
    
    return filteredPlaces;
}

// Arama işlevini güncelle
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase().trim();
    const searchResults = document.getElementById('searchResults');
    
    // URL'yi güncelle
    const url = new URL(window.location);
    if (searchTerm) {
        url.searchParams.set('search', searchTerm);
    } else {
        url.searchParams.delete('search');
    }
    window.history.pushState({ search: searchTerm }, '', url);
    
    // Arama sonuçlarını filtrele
    const results = window.places.filter(place => {
        return place.name.toLowerCase().includes(searchTerm) ||
               place.city_name.toLowerCase().includes(searchTerm) ||
               place.description.toLowerCase().includes(searchTerm);
    });
    
    // Arama sonuçlarını global değişkende sakla
    window.currentSearchResults = results;
    
    // Sonuçları göster
    displaySearchResults(results, searchResults);
    
    // Popüler mekanları gizle/göster
    const popularPlaces = document.getElementById('popularPlaces');
    if (popularPlaces) {
        popularPlaces.style.display = searchTerm ? 'none' : 'block';
    }
}

// Global scope'a ekle
window.initSearch = initSearch;
window.loadPopularPlaces = loadPopularPlaces; 