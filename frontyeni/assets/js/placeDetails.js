// Mekan detayları işlevleri
function openPlaceDetails(place) {
    const modal = document.getElementById('placeDetailsModal');
    if (!modal) {
        console.error('Modal element not found');
        return;
    }

    // URL'ye detay parametresi ekle
    const url = new URL(window.location);
    url.searchParams.set('detail', place.id);
    window.history.pushState({ detail: place.id }, '', url);

    // Mekana ait yorumları getir
    const placeComments = window.commentService.getPlaceComments(place.id);

    // Kullanıcının favori durumunu kontrol et
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const isFavorite = currentUser && window.favorites && window.favorites.some(
        fav => fav.user_id === currentUser.id && fav.place_id === place.id
    );

    // Açılış saatlerini formatla
    function formatOpeningHours(hours) {
        if (!hours || hours.length === 0) {
            return '<p class="no-hours">Çalışma saatleri bilgisi bulunmamaktadır.</p>';
        }

        return `
            <ul class="opening-hours-list">
                ${hours.map(hour => {
                    const [day, time] = hour.split(': ');
                    const isClosedDay = time.toLowerCase().includes('kapalı');
                    return `
                        <li>
                            <span class="day">${day}</span>
                            <span class="hours ${isClosedDay ? 'closed' : ''}">${time}</span>
                        </li>
                    `;
                }).join('')}
            </ul>
        `;
    }

    const modalContent = modal.querySelector('.modal-content');
    modalContent.innerHTML = `
        <div class="modal-scroll-content" onclick="event.stopPropagation()">
            <div class="place-header">
                <div>
                    <h2>${place.name}</h2>
                    <div class="place-rating">
                        <i class="fas fa-star"></i>
                        <span>${place.rating}</span>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="close" onclick="event.stopPropagation()">&times;</button>
                    ${currentUser ? `
                        <button class="favorite-btn ${isFavorite ? 'active' : ''}" onclick="toggleFavorite(${place.id})">
                            <i class="fas fa-heart"></i>
                            <span>${isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}</span>
                        </button>
                    ` : ''}
                </div>
            </div>

            <div class="photos-section">
                <div class="main-photo">
                    <img src="${place.photos[0]}" alt="${place.name}">
                </div>
                <div class="photo-gallery">
                    ${place.photos.map((photo, index) => `
                        <img src="${photo}" 
                             alt="${place.name} - Fotoğraf ${index + 1}" 
                             onclick="event.stopPropagation(); changeMainImage(this.src)">
                    `).join('')}
                </div>
            </div>

            <div class="info-section" onclick="event.stopPropagation()">
                <div class="info-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <p>${place.address}</p>
                </div>

                <div class="info-item">
                    <i class="fas fa-clock"></i>
                    <div>${formatOpeningHours(place.opening_hours)}</div>
                </div>

                <div class="info-item">
                    <i class="fas fa-phone"></i>
                    <p>${place.phone_number}</p>
                </div>

                <div class="info-item">
                    <i class="fas fa-globe"></i>
                    <a href="${place.website}" target="_blank" onclick="event.stopPropagation()">${place.website}</a>
                </div>

                <div class="info-item">
                    <i class="fas fa-info-circle"></i>
                    <p>${place.description}</p>
                </div>
            </div>

            <div class="map-section">
                <a href="${place.map_url}" target="_blank" class="map-button" onclick="event.stopPropagation()">
                    <i class="fas fa-map-marked-alt"></i>
                    Haritada Göster
                </a>
            </div>

            <div class="comments-section" onclick="event.stopPropagation()">
                <div class="comments-header">
                    <h3>Yorumlar (${placeComments.length})</h3>
                </div>

                ${renderCommentForm(place.id)}

                <div class="comments-list">
                    ${placeComments.map(comment => `
                        <div class="comment" data-comment-id="${comment.id}">
                            <div class="comment-header">
                                <div class="comment-user">
                                    <div class="user-avatar">${comment.user.avatar}</div>
                                    <span class="user-name">${comment.user.name}</span>
                                </div>
                                <span class="comment-date">${new Date(comment.date).toLocaleDateString('tr-TR')}</span>
                            </div>
                            <div class="comment-content">
                                ${comment.content}
                            </div>
                            <div class="comment-footer">
                                <div class="comment-action ${comment.liked ? 'liked' : ''}" onclick="event.stopPropagation(); toggleLike(${comment.id})">
                                    <i class="fas fa-heart"></i>
                                    <span>${comment.likes}</span>
                                </div>
                                <div class="comment-action" onclick="event.stopPropagation(); reportComment(${comment.id})">
                                    <i class="fas fa-flag"></i>
                                    <span>Bildir</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    // Modal göster
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Modal içi tıklamaları durdur
    modal.querySelector('.modal-content').addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Modal kapatma işlevleri
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = (e) => {
        e.preventDefault();
        closeModalAndUpdateUrl(modal);
    };

    // Modal dışına tıklandığında kapat
    window.onclick = (event) => {
        if (event.target === modal) {
            event.preventDefault();
            closeModalAndUpdateUrl(modal);
        }
    };

    // ESC tuşu ile kapat
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            closeModalAndUpdateUrl(modal);
        }
    });
}

// Favori ekleme/çıkarma işlevi
function toggleFavorite(placeId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showNotification('Favorilere eklemek için giriş yapmalısınız', 'error');
        return;
    }

    // Favorites dizisini kontrol et ve yoksa oluştur
    if (!window.favorites) {
        window.favorites = [];
    }

    const favoriteIndex = window.favorites.findIndex(
        fav => fav.user_id === currentUser.id && fav.place_id === placeId
    );

    const favoriteBtn = document.querySelector('.favorite-btn');
    
    if (favoriteIndex === -1) {
        // Favorilere ekle
        window.favorites.push({
            user_id: currentUser.id,
            place_id: placeId
        });
        favoriteBtn.classList.add('active');
        favoriteBtn.innerHTML = '<i class="fas fa-heart"></i><span>Favorilerden Çıkar</span>';
        showNotification('Favorilere eklendi', 'success');
    } else {
        // Favorilerden çıkar
        window.favorites.splice(favoriteIndex, 1);
        favoriteBtn.classList.remove('active');
        favoriteBtn.innerHTML = '<i class="fas fa-heart"></i><span>Favorilere Ekle</span>';
        showNotification('Favorilerden çıkarıldı', 'success');
    }

    // Profil sayfasındaki favori listesini güncelle
    if (window.loadFavorites) {
        window.loadFavorites();
    }
}

// Modal kapatma ve URL güncelleme fonksiyonu
function closeModalAndUpdateUrl(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // URL'den detay parametresini kaldır ama search parametresini koru
    const url = new URL(window.location);
    const searchTerm = url.searchParams.get('search');
    url.searchParams.delete('detail');
    
    if (searchTerm) {
        url.searchParams.set('search', searchTerm);
        window.history.pushState({ search: searchTerm }, '', url);
        const searchResults = document.getElementById('searchResults');
        if (searchResults) searchResults.style.display = 'flex';
        const popularPlaces = document.getElementById('popularPlaces');
        if (popularPlaces) popularPlaces.style.display = 'none';
    } else {
        window.history.pushState({}, '', window.location.pathname);
        const searchResults = document.getElementById('searchResults');
        if (searchResults) searchResults.style.display = 'none';
        const popularPlaces = document.getElementById('popularPlaces');
        if (popularPlaces) popularPlaces.style.display = 'block';
    }
}

// Yorum formunu kullanıcı durumuna göre göster
function renderCommentForm(placeId) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!user) {
        return `
            <div class="comment-form-message">
                <p>Yorum yapabilmek için <a href="#" onclick="showLoginModal()">giriş yapmalısınız</a>.</p>
            </div>
        `;
    }
    
    return `
        <div class="comment-form">
            <textarea class="comment-input" placeholder="Yorumunuzu yazın..."></textarea>
            <div class="comment-actions">
                <button class="comment-button comment-cancel" onclick="cancelComment()">İptal</button>
                <button class="comment-button comment-submit" onclick="submitComment(${placeId})">Yorum Yap</button>
            </div>
        </div>
    `;
}

// Ana resmi değiştir
function changeMainImage(src) {
    const mainPhotoImg = document.querySelector('#placeDetailsModal .main-photo img');
    if (mainPhotoImg) {
        mainPhotoImg.src = src;
    }
}

// Global scope'a ekle
window.toggleFavorite = toggleFavorite;
window.openPlaceDetails = openPlaceDetails;
window.changeMainImage = changeMainImage; 