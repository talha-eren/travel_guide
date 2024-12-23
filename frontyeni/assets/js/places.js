// Değişkenler
let currentPage = 1;
let totalPages = 1;
let currentFilters = {
    category: '',
    city: '',
    search: ''
};

// Mekanları getir
async function getPlaces() {
    try {
        const queryParams = new URLSearchParams({
            page: currentPage,
            limit: 12,
            ...currentFilters
        });

        console.log('Fetching places with params:', queryParams.toString()); // Debug için log

        const response = await fetch(`${API_URL}/places?${queryParams}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Mekanlar getirilemedi');
        }

        const data = await response.json();
        console.log('Response data:', data); // Debug için log

        if (data.places && Array.isArray(data.places)) {
            displayPlaces(data.places);
            updatePagination(data.currentPage || 1, data.totalPages || 1);
        } else {
            throw new Error('Geçersiz veri formatı');
        }
        
    } catch (error) {
        console.error('Mekanlar getirilirken hata:', error);
        // Hata mesajını göster ama alert kullanma
        const placesGrid = document.getElementById('placesList');
        if (placesGrid) {
            placesGrid.innerHTML = '<div class="error-message">Mekanlar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</div>';
        }
    }
}

// Mekanları görüntüle
function displayPlaces(places) {
    const placesGrid = document.getElementById('placesList');
    placesGrid.innerHTML = '';

    places.forEach(place => {
        const placeCard = createPlaceCard(place);
        placesGrid.appendChild(placeCard);
    });
}

// Mekan kartı oluştur
function createPlaceCard(place) {
    const card = document.createElement('div');
    card.className = 'place-card';
    
    const image = place.images && place.images.length > 0 ? place.images[0] : 'assets/images/placeholder.jpg';
    
    card.innerHTML = `
        <div class="place-image">
            <img src="${image}" alt="${place.name}">
            <div class="place-category">${place.category}</div>
        </div>
        <div class="place-info">
            <h3>${place.name}</h3>
            <p class="place-city"><i class="fas fa-map-marker-alt"></i> ${place.city}</p>
            <div class="place-rating">
                <span class="stars">${getStarRating(place.rating)}</span>
                <span class="rating-count">(${place.totalRatings})</span>
            </div>
            <button onclick="viewPlaceDetails('${place._id}')" class="btn-details">
                Detayları Gör
            </button>
        </div>
    `;

    return card;
}

// Yıldız değerlendirmesi oluştur
function getStarRating(rating) {
    const fullStar = '<i class="fas fa-star"></i>';
    const halfStar = '<i class="fas fa-star-half-alt"></i>';
    const emptyStar = '<i class="far fa-star"></i>';
    
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
        stars += fullStar;
    }
    
    if (hasHalfStar) {
        stars += halfStar;
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
        stars += emptyStar;
    }

    return stars;
}

// Sayfalama güncelle
function updatePagination(currentPage, totalPages) {
    document.getElementById('currentPage').textContent = `Sayfa ${currentPage}`;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
}

// Mekan detaylarını görüntüle
function viewPlaceDetails(placeId) {
    window.location.href = `place-details.html?id=${placeId}`;
}

// Şehirleri getir ve filtreye ekle
async function loadCities() {
    try {
        const response = await fetch(`${API_URL}/places`);
        const data = await response.json();

        const cities = [...new Set(data.places.map(place => place.city))].sort();
        const cityFilter = document.getElementById('cityFilter');
        
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            cityFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Şehirler yüklenirken hata:', error);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Sayfa yüklendiğinde mekanları getir
    getPlaces();
    loadCities();

    // Filtre formunu dinle
    const filterForm = document.getElementById('filterForm');
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const cityFilter = document.getElementById('cityFilter');

    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        currentFilters = {
            search: searchInput.value.trim(),
            category: categoryFilter.value,
            city: cityFilter.value
        };
        currentPage = 1;
        getPlaces();
    });

    // Filtre değişikliklerini dinle
    categoryFilter.addEventListener('change', () => {
        filterForm.dispatchEvent(new Event('submit'));
    });
    
    cityFilter.addEventListener('change', () => {
        filterForm.dispatchEvent(new Event('submit'));
    });
    
    // Sayfalama
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            getPlaces();
        }
    });
    
    document.getElementById('nextPage').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            getPlaces();
        }
    });
}); 