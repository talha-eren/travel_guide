// Profil bilgilerini getir
async function getProfile() {
    try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!token || !user) {
            window.location.href = 'index.html';
            return;
        }

        // Form alanlarını doldur
        document.getElementById('fullName').value = user.fullName || '';
        document.getElementById('email').value = user.email || '';

        // Avatar ve isim güncelle
        const avatarText = document.querySelector('.avatar-text');
        const profileName = document.querySelector('.profile-name');
        const profileEmail = document.querySelector('.profile-email');

        if (avatarText && user.fullName) {
            // İsmin baş harflerini al
            const initials = user.fullName
                .split(' ')
                .map(name => name.charAt(0))
                .join('')
                .toUpperCase();
            avatarText.textContent = initials;
        }

        if (profileName) {
            profileName.textContent = user.fullName || 'İsimsiz Kullanıcı';
        }
        if (profileEmail) {
            profileEmail.textContent = user.email || '';
        }

    } catch (error) {
        console.error('Profil bilgileri alınırken hata:', error);
        showNotification('Profil bilgileri alınamadı', 'error');
    }
}

// Profil bilgilerini güncelle
async function updateProfile(event) {
    event.preventDefault();

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'index.html';
            return;
        }

        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;

        const response = await fetch(`${API_URL}/profile/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ fullName, email })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Profil güncellenemedi');
        }

        // LocalStorage'daki kullanıcı bilgilerini güncelle
        localStorage.setItem('user', JSON.stringify(data.user));

        // Başarı mesajı göster
        showNotification('Profil bilgileri başarıyla güncellendi', 'success');

        // Sayfayı yenile
        window.location.reload();

    } catch (error) {
        console.error('Profil güncellenirken hata:', error);
        showNotification(error.message, 'error');
    }
}

// Şifre değiştirme
async function changePassword(event) {
    event.preventDefault();

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'index.html';
            return;
        }

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Şifre kontrolü
        if (newPassword !== confirmPassword) {
            throw new Error('Yeni şifreler eşleşmiyor');
        }

        if (newPassword.length < 6) {
            throw new Error('Yeni şifre en az 6 karakter olmalıdır');
        }

        const response = await fetch(`${API_URL}/profile/change-password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Şifre değiştirilemedi');
        }

        // Başarı mesajı göster
        showNotification('Şifre başarıyla değiştirildi', 'success');

        // Formu temizle
        document.getElementById('passwordForm').reset();

    } catch (error) {
        console.error('Şifre değiştirme hatası:', error);
        showNotification(error.message, 'error');
    }
}

// İsmin baş harflerini al
function getInitials(name) {
    if (!name) return '';
    return name
        .split(' ')
        .filter(word => word.length > 0) // Boş kelimeleri filtrele
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase();
}

// Tab değiştirme işlemi
function switchTab(tabId) {
    // Tüm sekmeleri gizle
    document.querySelectorAll('.profile-section').forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });

    // Tüm tab butonlarını pasif yap
    document.querySelectorAll('.profile-nav li').forEach(li => {
        li.classList.remove('active');
    });

    // Seçilen sekmeyi göster
    const selectedSection = document.getElementById(tabId);
    if (selectedSection) {
        selectedSection.style.display = 'block';
        selectedSection.classList.add('active');
    }

    // Seçilen tab butonunu aktif yap
    const selectedTab = document.querySelector(`.profile-nav li[data-tab="${tabId}"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
}

// Auth kontrolü
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return token && user;
}

// Yorum silme fonksiyonu
async function deleteComment(commentId) {
    try {
        if (!confirm('Bu yorumu silmek istediğinizden emin misiniz?')) {
            return;
        }

        const response = await fetch(`${API_URL}/profile/comments/${commentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Yorum silinirken bir hata oluştu');
        }

        // Yorumları yeniden yükle
        await loadUserComments();
        showNotification('Yorum başarıyla silindi', 'success');
    } catch (error) {
        console.error('Error deleting comment:', error);
        showNotification(error.message, 'error');
    }
}

// Kullanıcının yorumlarını yükle
async function loadUserComments() {
    try {
        // Önce tüm mekanları al
        const placesResponse = await fetch(`${API_URL}/places`);
        if (!placesResponse.ok) {
            throw new Error('Mekanlar yüklenirken bir hata oluştu');
        }
        const placesData = await placesResponse.json();
        const placesMap = new Map(placesData.places.map(place => [place._id, place]));

        // Sonra yorumları al
        const response = await fetch(`${API_URL}/profile/comments`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Yorumlar yüklenirken bir hata oluştu');
        }

        const comments = await response.json();
        const commentsContainer = document.querySelector('.comments-list');
        
        if (!comments || comments.length === 0) {
            commentsContainer.innerHTML = '<p class="no-data">Henüz yorum yapmamışsınız.</p>';
            return;
        }

        // Her yorumun place objesini ana ekrandaki mekan bilgileriyle birleştir
        const processedComments = comments.map(comment => {
            const fullPlace = placesMap.get(comment.place._id);
            return {
                ...comment,
                place: {
                    ...comment.place,
                    ...fullPlace,
                    photo: fullPlace?.photo || fullPlace?.images?.[0] || comment.place.image || comment.place.photo,
                    images: fullPlace?.images || comment.place.images || []
                }
            };
        });

        commentsContainer.innerHTML = processedComments.map(comment => createCommentCard(comment)).join('');

    } catch (error) {
        console.error('Error loading comments:', error);
        document.querySelector('.comments-list').innerHTML = 
            '<div class="error-message">Yorumlar yüklenirken bir hata oluştu</div>';
    }
}

// Kullanıcının favorilerini yükle
async function loadUserFavorites() {
    try {
        const response = await fetch(`${API_URL}/profile/favorites`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Favoriler yüklenirken bir hata oluştu');
        }

        const favorites = await response.json();
        const favoritesContainer = document.querySelector('.favorites-grid');
        
        if (!favorites || favorites.length === 0) {
            favoritesContainer.innerHTML = '<p class="no-data">Henüz favori mekanınız yok.</p>';
            return;
        }

        favoritesContainer.innerHTML = favorites.map(place => createFavoriteCard(place)).join('');

    } catch (error) {
        console.error('Error loading favorites:', error);
        document.querySelector('.favorites-grid').innerHTML = 
            '<div class="error-message">Favoriler yüklenirken bir hata oluştu</div>';
    }
}

// Favorilerden mekan çıkar
async function removeFavorite(placeId) {
    try {
        if (!confirm('Bu mekanı favorilerden çıkarmak istediğinizden emin misiniz?')) {
            return;
        }

        const response = await fetch(`${API_URL}/profile/favorites/${placeId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Favorilerden çıkarılırken bir hata oluştu');
        }

        // Favorileri yeniden yükle
        await loadUserFavorites();
        showNotification('Mekan favorilerden çıkarıldı', 'success');
    } catch (error) {
        console.error('Error removing favorite:', error);
        showNotification(error.message, 'error');
    }
}

// Tab içeriğini yükle
async function loadTabContent(tabId) {
    try {
        // Önce tab'ı aktif et
        switchTab(tabId);

        // Tab içeriğine göre veri yükle
        switch (tabId) {
            case 'profile':
                await getProfile();
                break;
            case 'favorites':
                await loadUserFavorites();
                break;
            case 'comments':
                await loadUserComments();
                break;
            case 'security':
                // Güvenlik sekmesi için özel bir işlem gerekmez
                break;
        }
    } catch (error) {
        console.error('Tab içeriği yüklenirken hata:', error);
        showNotification('İçerik yüklenirken bir hata oluştu', 'error');
    }
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', async () => {
    // Auth kontrolü
    if (!checkAuth()) {
        window.location.href = 'index.html';
        return;
    }

    // Profil bilgilerini yükle
    await getProfile();

    // Form submit event listener'ları
    const profileForm = document.getElementById('profileForm');
    const passwordForm = document.getElementById('passwordForm');

    profileForm?.addEventListener('submit', updateProfile);
    passwordForm?.addEventListener('submit', changePassword);

    // Tab değiştirme event listener'ı
    const tabButtons = document.querySelectorAll('.profile-nav li');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            if (tabId) {
                switchTab(tabId);
                loadTabContent(tabId);
            }
        });
    });

    // URL'den tab kontrolü
    const urlParams = new URLSearchParams(window.location.search);
    const activeTab = urlParams.get('tab') || 'profile';
    switchTab(activeTab);
    loadTabContent(activeTab);
}); 