// Global state
let currentPage = 1;
let totalPages = 1;
let currentFilters = {
    category: '',
    city: '',
    search: ''
};

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Şehirleri yükle
        await loadCities();
        
        // Mekanları yükle
        await fetchPlaces();

        // Filter form submit
        const filterForm = document.getElementById('filterForm');
        filterForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            currentPage = 1;
            await fetchPlaces();
        });

        // Kategori değişikliği
        const categoryFilter = document.getElementById('categoryFilter');
        categoryFilter?.addEventListener('change', async () => {
            currentPage = 1;
            await fetchPlaces();
        });

        // Şehir değişikliği
        const cityFilter = document.getElementById('cityFilter');
        cityFilter?.addEventListener('change', async () => {
            currentPage = 1;
            await fetchPlaces();
        });

        // Sayfalama butonları
        const prevPage = document.getElementById('prevPage');
        const nextPage = document.getElementById('nextPage');

        prevPage?.addEventListener('click', async () => {
            if (currentPage > 1) {
                currentPage--;
                await fetchPlaces();
            }
        });

        nextPage?.addEventListener('click', async () => {
            if (currentPage < totalPages) {
                currentPage++;
                await fetchPlaces();
            }
        });
    } catch (error) {
        console.error('Error loading places:', error);
        const placesList = document.getElementById('placesList');
        if (placesList) {
            placesList.innerHTML = `<div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Mekanlar yüklenirken bir hata oluştu.</p>
            </div>`;
        }
    }
});

// Şehirleri yükle
async function loadCities() {
    try {
        if (typeof API_URL === 'undefined') {
            console.error('API_URL is not defined');
            throw new Error('API bağlantısı kurulamadı');
        }

        const response = await fetch(`${API_URL}/places/cities`);
        console.log('Cities response:', response);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Cities data:', data);
        
        const cityFilter = document.getElementById('cityFilter');
        if (cityFilter && data.cities) {
            data.cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                cityFilter.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading cities:', error);
        showNotification('Şehirler yüklenirken bir hata oluştu', 'error');
    }
}

// Mekanları getir
async function fetchPlaces() {
    try {
        if (typeof API_URL === 'undefined') {
            console.error('API_URL is not defined');
            throw new Error('API bağlantısı kurulamadı');
        }

        // Filtreleri al
        const category = document.getElementById('categoryFilter')?.value || '';
        const city = document.getElementById('cityFilter')?.value || '';
        const search = document.getElementById('searchInput')?.value || '';

        // URL parametrelerini oluştur
        const params = new URLSearchParams({
            page: currentPage,
            limit: 12
        });

        if (category) params.append('category', category);
        if (city) params.append('city', city);
        if (search) params.append('search', search);

        const url = `${API_URL}/places?${params.toString()}`;
        console.log('Fetching places from URL:', url);

        // API'den mekanları getir
        const response = await fetch(url);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Places data:', data);

        // Toplam sayfa sayısını güncelle
        totalPages = Math.ceil(data.total / 12);

        // Mekanları görüntüle
        if (!data.places || data.places.length === 0) {
            const placesList = document.getElementById('placesList');
            if (placesList) {
                placesList.innerHTML = `<div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>Hiç mekan bulunamadı.</p>
                </div>`;
            }
            return;
        }

        renderPlaces(data.places);
        // Sayfalama bilgisini güncelle
        updatePagination();

    } catch (error) {
        console.error('Error fetching places:', error);
        const placesList = document.getElementById('placesList');
        if (placesList) {
            placesList.innerHTML = `<div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Mekanlar yüklenirken bir hata oluştu: ${error.message}</p>
            </div>`;
        }
    }
}

// Mekanları görüntüle
function renderPlaces(places) {
    const placesList = document.getElementById('placesList');
    if (!placesList) return;

    if (!places || places.length === 0) {
        placesList.innerHTML = `<div class="no-results">
            <i class="fas fa-search"></i>
            <p>Sonuç bulunamadı.</p>
        </div>`;
        return;
    }

    placesList.innerHTML = places.map(place => createPlaceCard(place)).join('');
}

// Mekan kartı oluştur
function createPlaceCard(place) {
    const mainImage = getMainImage(place);
    const apiKey = window.GOOGLE_MAPS_API_KEY || '';
    
    // Tüm fotoğrafları birleştir
    const allPhotos = [
        ...processPhotos(Array.isArray(place.photo) ? place.photo : [place.photo], apiKey),
        ...processPhotos(place.images, apiKey)
    ].filter(Boolean);

    return `
        <div class="place-card">
            <div class="place-image">
                <img src="${mainImage}" alt="${place.name || 'Mekan Görseli'}" 
                    onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\' viewBox=\'0 0 200 200\'%3E%3Crect width=\'200\' height=\'200\' fill=\'%23f0f0f0\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'Arial\' font-size=\'16\' fill=\'%23999\'%3EGörsel Yok%3C/text%3E%3C/svg%3E';"
                    data-photos='${JSON.stringify(allPhotos)}'>
                ${allPhotos.length > 1 ? `
                    <div class="photo-count">
                        <i class="fas fa-images"></i>
                        ${allPhotos.length} fotoğraf
                    </div>
                ` : ''}
            </div>
            <div class="place-info">
                <h3>${place.name || 'İsimsiz Mekan'}</h3>
                <div class="place-rating">
                    ${getStarRating(place.rating || 0)}
                    <span>(${place.totalRatings || 0} değerlendirme)</span>
                </div>
                <div class="place-meta">
                    <span><i class="fas fa-tag"></i> ${place.category || 'Kategori Belirtilmemiş'}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${place.city || 'Şehir Belirtilmemiş'}</span>
                </div>
                <p class="place-description">${place.description || 'Açıklama bulunmuyor'}</p>
                <div class="card-actions">
                    <a href="place-details.html?id=${place._id}" class="btn btn-primary">
                        <i class="fas fa-info-circle"></i> Detayları Gör
                    </a>
                </div>
            </div>
        </div>
    `;
}

// Yıldız değerlendirmesi oluştur
function getStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return `
        ${Array(fullStars).fill('<i class="fas fa-star"></i>').join('')}
        ${hasHalfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
        ${Array(emptyStars).fill('<i class="far fa-star"></i>').join('')}
        <span class="rating-number">${rating.toFixed(1)}</span>
    `;
}

// Sayfalama bilgisini güncelle
function updatePagination() {
    const currentPageSpan = document.getElementById('currentPage');
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');

    if (currentPageSpan) {
        currentPageSpan.textContent = `Sayfa ${currentPage}`;
    }

    if (prevButton) {
        prevButton.disabled = currentPage <= 1;
    }

    if (nextButton) {
        nextButton.disabled = currentPage >= totalPages;
    }
}

// Mekanın ana resmini belirle
function getMainImage(place) {
    const defaultImage = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\' viewBox=\'0 0 200 200\'%3E%3Crect width=\'200\' height=\'200\' fill=\'%23f0f0f0\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'Arial\' font-size=\'16\' fill=\'%23999\'%3EGörsel Yok%3C/text%3E%3C/svg%3E';
    
    let mainImage = defaultImage;

    try {
        // Önce photo alanını kontrol et
        if (place.photo) {
            if (Array.isArray(place.photo) && place.photo.length > 0) {
                mainImage = place.photo[0];
            } else if (typeof place.photo === 'string') {
                mainImage = place.photo;
            }
        }
        // Eğer photo yoksa images alanını kontrol et
        else if (place.images && Array.isArray(place.images) && place.images.length > 0) {
            mainImage = place.images[0];
        }

        // Google Maps fotoğraf URL'sini işle
        if (mainImage && typeof mainImage === 'string' && mainImage.includes('maps.googleapis.com/maps/api/place/photo')) {
            const apiKey = window.GOOGLE_MAPS_API_KEY || '';
            mainImage = `${mainImage}&key=${apiKey}`;
        }
    } catch (error) {
        console.error('Error processing image:', error);
        mainImage = defaultImage;
    }

    return mainImage;
}

// Tüm fotoğrafları işle
function processPhotos(photos, apiKey) {
    if (!photos) return [];
    
    try {
        return photos.filter(url => url).map(url => {
            if (url && typeof url === 'string' && url.includes('maps.googleapis.com/maps/api/place/photo')) {
                return `${url}&key=${apiKey || ''}`;
            }
            return url;
        });
    } catch (error) {
        console.error('Error processing photos:', error);
        return [];
    }
}

// Favori kartı oluştur
function createFavoriteCard(place) {
    const mainImage = getMainImage(place);
    
    return `
        <div class="place-card favorite-card">
            <div class="place-image">
                <img src="${mainImage}" alt="${place.name || 'Mekan Görseli'}" 
                     onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\' viewBox=\'0 0 200 200\'%3E%3Crect width=\'200\' height=\'200\' fill=\'%23f0f0f0\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'Arial\' font-size=\'16\' fill=\'%23999\'%3EGörsel Yok%3C/text%3E%3C/svg%3E';">
            </div>
            <div class="place-info">
                <h3>${place.name || 'İsimsiz Mekan'}</h3>
                <div class="place-meta">
                    <span><i class="fas fa-tag"></i> ${place.category || 'Kategori Belirtilmemiş'}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${place.city || 'Şehir Belirtilmemiş'}</span>
                </div>
                <div class="card-actions">
                    <a href="place-details.html?id=${place._id}" class="btn btn-primary">
                        <i class="fas fa-info-circle"></i> Detayları Gör
                    </a>
                    <button onclick="event.preventDefault(); event.stopPropagation(); removeFavorite('${place._id}')" class="btn btn-danger">
                        <i class="fas fa-heart-broken"></i> Favorilerden Çıkar
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Yorum kartı oluştur
function createCommentCard(comment) {
    const mainImage = getMainImage(comment.place);
    const apiKey = window.GOOGLE_MAPS_API_KEY || '';
    
    // Tüm fotoğrafları birleştir
    const allPhotos = [
        ...processPhotos(Array.isArray(comment.place.photo) ? comment.place.photo : [comment.place.photo], apiKey),
        ...processPhotos(comment.place.images, apiKey)
    ].filter(Boolean);

    return `
        <div class="comment-card">
            <div class="place-image">
                <img src="${mainImage}" alt="${comment.place.name || 'Mekan Görseli'}" 
                     onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\' viewBox=\'0 0 200 200\'%3E%3Crect width=\'200\' height=\'200\' fill=\'%23f0f0f0\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'Arial\' font-size=\'16\' fill=\'%23999\'%3EGörsel Yok%3C/text%3E%3C/svg%3E';">
                ${allPhotos.length > 1 ? `
                    <div class="photo-count">
                        <i class="fas fa-images"></i>
                        ${allPhotos.length} fotoğraf
                    </div>
                ` : ''}
            </div>
            <div class="comment-content">
                <div class="place-info">
                    <h3>${comment.place.name || 'İsimsiz Mekan'}</h3>
                    <div class="place-meta">
                        <span><i class="fas fa-tag"></i> ${comment.place.category || 'Kategori Belirtilmemiş'}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${comment.place.city || 'Şehir Belirtilmemiş'}</span>
                    </div>
                </div>
                <div class="comment-details">
                    <div class="rating">
                        ${getStarRating(comment.rating)}
                    </div>
                    <p class="comment-text">${comment.text}</p>
                    <div class="comment-date">
                        ${new Date(comment.createdAt).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </div>
                </div>
                <div class="card-actions">
                    <a href="place-details.html?id=${comment.place._id}" class="btn btn-primary">
                        <i class="fas fa-info-circle"></i> Mekanı Görüntüle
                    </a>
                    <button onclick="event.preventDefault(); event.stopPropagation(); deleteComment('${comment._id}')" class="btn btn-danger">
                        <i class="fas fa-trash"></i> Yorumu Sil
                    </button>
                </div>
            </div>
        </div>
    `;
} 