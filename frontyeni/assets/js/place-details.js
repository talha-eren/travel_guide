// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // URL'den mekan ID'sini al
        const urlParams = new URLSearchParams(window.location.search);
        const placeId = urlParams.get('id');
        
        if (!placeId) {
            showError('Geçersiz mekan ID\'si');
            return;
        }

        // Mekan detaylarını getir
        const response = await fetch(`${API_URL}/places/${placeId}`);
        if (!response.ok) {
            throw new Error(`Mekan bilgileri alınamadı (${response.status})`);
        }

        const place = await response.json();
        if (!place) {
            throw new Error('Mekan bulunamadı');
        }

        // Sayfa başlığını güncelle
        document.title = `${place.name || 'Mekan Detayı'} - Gezi Rehberi`;

        // Mekan bilgilerini doldur
        fillPlaceDetails(place);

        // Yorumları getir
        await loadComments(placeId);

        // Diğer işlevleri ayarla
        setupFavoriteButton(placeId);
        setupShareButton(place);
        setupCommentForm(placeId);

    } catch (error) {
        console.error('Error loading place details:', error);
        showError(error.message || 'Mekan bilgileri yüklenirken bir hata oluştu');
    }
});

// Hata gösterme fonksiyonu
function showError(message) {
    const container = document.querySelector('.place-details-page .container');
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
                <a href="index.html" class="btn">Ana Sayfaya Dön</a>
            </div>
        `;
    }
}

// Mekan bilgilerini doldur
function fillPlaceDetails(place) {
    try {
        // Temel bilgileri doldur
        document.getElementById('placeName').textContent = place.name || 'İsimsiz Mekan';
        document.getElementById('placeCategory').textContent = place.category || 'Kategori Belirtilmemiş';
        document.getElementById('placeCity').textContent = place.city || 'Şehir Belirtilmemiş';
        document.getElementById('placeDescription').textContent = place.description || 'Açıklama bulunmuyor';
        document.getElementById('placeAddress').textContent = place.address || 'Adres belirtilmemiş';
        document.getElementById('placeTotalRatings').textContent = place.totalRatings || 0;
        
        // Yıldızları güncelle
        const ratingDiv = document.getElementById('placeRating');
        if (ratingDiv) {
            ratingDiv.innerHTML = getStarRating(place.rating || 0);
        }

        // Resim galerisini ayarla
        setupImageGallery(place.images || []);

        // Çalışma saatlerini ayarla
        setupOpeningHours(place.openingHours || null);

    } catch (error) {
        console.error('Error filling place details:', error);
    }
}

// Resim galerisini ayarla
function setupImageGallery(images) {
    console.log('Setting up image gallery with images:', images); // Debug log

    const mainImage = document.getElementById('mainImage');
    const gallery = document.getElementById('imageGallery');
    
    // Varsayılan resim
    const defaultImage = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\' viewBox=\'0 0 200 200\'%3E%3Crect width=\'200\' height=\'200\' fill=\'%23f0f0f0\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'Arial\' font-size=\'16\' fill=\'%23999\'%3EGörsel Yok%3C/text%3E%3C/svg%3E';
    
    // Eğer hiç resim yoksa varsayılan resmi göster
    if (!images || !Array.isArray(images) || images.length === 0) {
        console.log('No images found, showing default image'); // Debug log
        mainImage.src = defaultImage;
        mainImage.alt = 'Görsel Yok';
        gallery.innerHTML = '';
        return;
    }
    
    // Geçerli resimleri filtrele
    const validImages = images.filter(img => img && typeof img === 'string' && img.startsWith('http'));
    console.log('Valid images:', validImages); // Debug log

    if (validImages.length === 0) {
        console.log('No valid images found, showing default'); // Debug log
        mainImage.src = defaultImage;
        mainImage.alt = 'Görsel Yok';
        gallery.innerHTML = '';
        return;
    }
    
    // Ana resmi ayarla
    console.log('Setting main image:', validImages[0]); // Debug log
    const img = new Image();
    img.onload = () => {
        mainImage.src = validImages[0];
        mainImage.alt = 'Mekan Görseli';
    };
    img.onerror = () => {
        console.log('Error loading main image, showing default'); // Debug log
        mainImage.src = defaultImage;
        mainImage.alt = 'Görsel Yüklenemedi';
    };
    img.src = validImages[0];

    // Küçük resimleri ekle
    gallery.innerHTML = validImages.map((image, index) => {
        console.log(`Adding thumbnail ${index + 1}:`, image); // Debug log
        const escapedImage = image.replace(/'/g, "\\'"); // URL'deki tırnak işaretlerini escape et
        return `
            <div class="thumbnail${index === 0 ? ' active' : ''}" onclick="changeMainImage('${escapedImage}', this)">
                <img src="${image}" alt="Mekan Görseli ${index + 1}" 
                     onerror="this.src='${defaultImage}'; this.alt='Görsel Yüklenemedi';">
            </div>
        `;
    }).join('');
}

// Ana resmi değiştir
function changeMainImage(src, thumbnail) {
    console.log('Changing main image to:', src); // Debug log
    const mainImage = document.getElementById('mainImage');
    const defaultImage = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\' viewBox=\'0 0 200 200\'%3E%3Crect width=\'200\' height=\'200\' fill=\'%23f0f0f0\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'Arial\' font-size=\'16\' fill=\'%23999\'%3EGörsel Yok%3C/text%3E%3C/svg%3E';
    
    // Resmi yükle
    const img = new Image();
    img.onload = () => {
        mainImage.src = src;
        mainImage.alt = 'Mekan Görseli';
    };
    img.onerror = () => {
        console.log('Error loading changed image, showing default'); // Debug log
        mainImage.src = defaultImage;
        mainImage.alt = 'Görsel Yüklenemedi';
    };
    img.src = src;
    
    // Aktif thumbnail'i güncelle
    document.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.classList.remove('active');
    });
    thumbnail.classList.add('active');
}

// Çalışma saatlerini ayarla
function setupOpeningHours(hours) {
    const container = document.getElementById('openingHours');
    if (!container) return;

    const days = {
        monday: 'Pazartesi',
        tuesday: 'Salı',
        wednesday: 'Çarşamba',
        thursday: 'Perşembe',
        friday: 'Cuma',
        saturday: 'Cumartesi',
        sunday: 'Pazar'
    };

    // Eğer çalışma saatleri yoksa bilgi mesajı göster
    if (!hours) {
        container.innerHTML = '<div class="hours-row"><span class="day">Çalışma saatleri belirtilmemiş</span></div>';
        return;
    }

    container.innerHTML = Object.entries(days).map(([key, day]) => {
        const time = hours[key];
        const timeText = time && time.open && time.close 
            ? `${time.open} - ${time.close}`
            : 'Kapalı';
        const isOpen = time && time.open && time.close;

        return `
            <div class="hours-row">
                <span class="day">${day}</span>
                <span class="time ${isOpen ? 'open' : 'closed'}">${timeText}</span>
            </div>
        `;
    }).join('');
}

// Favori butonunu ayarla
async function setupFavoriteButton(placeId) {
    const favoriteBtn = document.getElementById('favoriteBtn');
    const isLoggedIn = checkAuth();
    
    if (!isLoggedIn) {
        favoriteBtn.addEventListener('click', () => {
            showLoginModal();
        });
        return;
    }

    try {
        // Favori durumunu kontrol et
        const response = await fetch(`${API_URL}/profile/favorites`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Favori durumu kontrol edilirken bir hata oluştu');
        }

        const favorites = await response.json();
        const isFavorite = favorites.some(fav => fav._id === placeId);
        updateFavoriteButton(favoriteBtn, isFavorite);

        // Favori butonuna tıklama olayı ekle
        favoriteBtn.addEventListener('click', async () => {
            try {
                const method = isFavorite ? 'DELETE' : 'POST';
                const response = await fetch(`${API_URL}/profile/favorites/${placeId}`, {
                    method,
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('İşlem başarısız');
                }

                const data = await response.json();
                showNotification(data.message, 'success');
                updateFavoriteButton(favoriteBtn, !isFavorite);

            } catch (error) {
                console.error('Favorite error:', error);
                showNotification('İşlem sırasında bir hata oluştu', 'error');
            }
        });

    } catch (error) {
        console.error('Error setting up favorite button:', error);
        showNotification('Favori durumu kontrol edilirken bir hata oluştu', 'error');
    }
}

// Favori butonunu güncelle
function updateFavoriteButton(button, isFavorite) {
    if (isFavorite) {
        button.classList.add('active');
        button.innerHTML = '<i class="fas fa-heart"></i> Favorilerden Çıkar';
    } else {
        button.classList.remove('active');
        button.innerHTML = '<i class="far fa-heart"></i> Favorilere Ekle';
    }
}

// Paylaş butonunu ayarla
function setupShareButton(place) {
    const shareBtn = document.getElementById('shareBtn');
    
    shareBtn.addEventListener('click', () => {
        if (navigator.share) {
            navigator.share({
                title: place.name,
                text: place.description,
                url: window.location.href
            });
        } else {
            // Kopyala-yapıştır alternatifi
            const dummy = document.createElement('input');
            document.body.appendChild(dummy);
            dummy.value = window.location.href;
            dummy.select();
            document.execCommand('copy');
            document.body.removeChild(dummy);
            alert('Bağlantı kopyalandı!');
        }
    });
}

// Yorum formunu ayarla
function setupCommentForm(placeId) {
    const formContainer = document.getElementById('commentFormContainer');
    const isLoggedIn = checkAuth();
    
    if (isLoggedIn) {
        // Giriş yapmış kullanıcılar için yorum formu
        formContainer.innerHTML = `
            <div class="add-comment">
                <h3>Yorum Yap</h3>
                <form id="commentForm">
                    <div class="rating-input">
                        <label>Puanınız:</label>
                        <div class="star-rating">
                            <i class="far fa-star" data-rating="1"></i>
                            <i class="far fa-star" data-rating="2"></i>
                            <i class="far fa-star" data-rating="3"></i>
                            <i class="far fa-star" data-rating="4"></i>
                            <i class="far fa-star" data-rating="5"></i>
                        </div>
                    </div>
                    <textarea id="commentText" placeholder="Deneyiminizi paylaşın..." required></textarea>
                    <button type="submit" class="btn-submit">Yorum Yap</button>
                </form>
            </div>
        `;
        
        // Yıldız derecelendirme sistemini ayarla
        setupRatingSystem();
        
        // Form gönderme işlemini ayarla
        const form = document.getElementById('commentForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const rating = document.querySelectorAll('.star-rating .fas').length;
            const comment = document.getElementById('commentText').value;
            
            if (rating === 0) {
                showNotification('Lütfen bir puan verin', 'error');
                return;
            }
            
            try {
                const response = await fetch(`${API_URL}/places/${placeId}/comments`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ rating, comment })
                });

                const result = await response.json();

                if (!response.ok && !result.success) {
                    throw new Error(result.message || 'Yorum eklenirken bir hata oluştu');
                }

                // Formu temizle
                form.reset();
                document.querySelectorAll('.star-rating i').forEach(star => {
                    star.className = 'far fa-star';
                });
                
                // Yorumları yeniden yükle
                await loadComments(placeId);
                
                // Başarı mesajı göster
                showNotification(result.message || 'Yorumunuz başarıyla eklendi', 'success');

            } catch (error) {
                console.error('Comment error:', error);
                showNotification(error.message || 'Yorum eklenirken bir hata oluştu', 'error');
            }
        });
    } else {
        // Giriş yapmamış kullanıcılar için bilgi mesajı
        formContainer.innerHTML = `
            <div class="login-prompt">
                <p>Yorum yapabilmek için lütfen <a href="#" onclick="showLoginModal(); return false;">giriş yapın</a> veya <a href="#" onclick="showRegisterModal(); return false;">kayıt olun</a>.</p>
            </div>
        `;
    }
}

// Puanlama sistemini ayarla
function setupRatingSystem() {
    const stars = document.querySelectorAll('.star-rating i');
    let selectedRating = 0;

    stars.forEach(star => {
        // Hover efekti
        star.addEventListener('mouseover', () => {
            const rating = parseInt(star.dataset.rating);
            highlightStars(stars, rating);
        });

        // Hover dışına çıkma
        star.addEventListener('mouseout', () => {
            highlightStars(stars, selectedRating);
        });

        // Tıklama
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.rating);
            highlightStars(stars, selectedRating);
        });
    });
}

// Yıldızları vurgula
function highlightStars(stars, rating) {
    stars.forEach(star => {
        const starRating = parseInt(star.dataset.rating);
        if (starRating <= rating) {
            star.className = 'fas fa-star';
        } else {
            star.className = 'far fa-star';
        }
    });
}

// Yorumları yükle
async function loadComments(placeId) {
    try {
        const response = await fetch(`${API_URL}/places/${placeId}/comments`);
        if (!response.ok) {
            throw new Error('Yorumlar yüklenemedi');
        }

        const comments = await response.json();
        const commentsList = document.getElementById('commentsList');
        
        if (!comments || comments.length === 0) {
            commentsList.innerHTML = '<div class="no-comments">Henüz yorum yapılmamış</div>';
            return;
        }

        commentsList.innerHTML = comments.map(comment => `
            <div class="comment">
                <div class="comment-header">
                    <div class="comment-user">
                        <div class="user-avatar">${getInitials(comment.user?.fullName || 'Anonim')}</div>
                        <div>
                            <div class="user-name">${comment.user?.fullName || 'Anonim'}</div>
                            <div class="comment-date">${formatDate(comment.createdAt)}</div>
                        </div>
                    </div>
                    <div class="comment-rating">
                        ${getStarRating(comment.rating)}
                    </div>
                </div>
                <div class="comment-content">${comment.text}</div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading comments:', error);
        document.getElementById('commentsList').innerHTML = 
            '<div class="error-message">Yorumlar yüklenirken bir hata oluştu</div>';
    }
}

// Yardımcı fonksiyonlar
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

function getInitials(name) {
    if (!name) return 'U'; // Eğer isim yoksa 'U' (Unknown) döndür
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
} 