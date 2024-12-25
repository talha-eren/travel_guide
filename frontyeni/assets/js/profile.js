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
        document.getElementById('fullName').value = user.fullName;
        document.getElementById('email').value = user.email;

        // Avatar ve isim güncelle
        const avatarText = document.querySelector('.avatar-text');
        const profileName = document.querySelector('.profile-name');
        const profileEmail = document.querySelector('.profile-email');

        if (avatarText) {
            avatarText.textContent = getInitials(user.fullName);
        }
        if (profileName) {
            profileName.textContent = user.fullName;
        }
        if (profileEmail) {
            profileEmail.textContent = user.email;
        }

    } catch (error) {
        console.error('Profil bilgileri alınırken hata:', error);
        showNotification(error.message, 'error');
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
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase();
}

// Tab değiştirme işlemi
function switchTab(tabId) {
    // Tüm sekmeleri gizle
    document.querySelectorAll('.profile-section').forEach(section => {
        section.classList.remove('active');
    });

    // Tüm tab butonlarını pasif yap
    document.querySelectorAll('.profile-nav li').forEach(li => {
        li.classList.remove('active');
    });

    // Seçilen sekmeyi göster
    const selectedSection = document.getElementById(tabId);
    if (selectedSection) {
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

        commentsContainer.innerHTML = comments.map(comment => `
            <div class="comment-card">
                <div class="comment-place">
                    <div class="place-image">
                        <img src="${comment.place.image || 'assets/images/placeholder.jpg'}" alt="${comment.place.name}">
                    </div>
                    <div class="place-info">
                        <h3>${comment.place.name}</h3>
                        <p>${comment.place.city} - ${comment.place.category}</p>
                    </div>
                </div>
                <div class="comment-content">
                    <div class="comment-rating">
                        ${getStarRating(comment.rating)}
                    </div>
                    <p class="comment-text">${comment.text}</p>
                    <div class="comment-footer">
                        <p class="comment-date">${formatDate(comment.createdAt)}</p>
                        <button onclick="deleteComment('${comment._id}')" class="btn-delete">
                            <i class="fas fa-trash"></i> Yorumu Sil
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading comments:', error);
        document.querySelector('.comments-list').innerHTML = 
            '<div class="error-message">Yorumlar yüklenirken bir hata oluştu</div>';
    }
}

// Tab içeriğini yükle
async function loadTabContent(tabId) {
    // Önce tab'ı aktif et
    switchTab(tabId);

    // Tab içeriğine göre veri yükle
    switch (tabId) {
        case 'profile':
            await getProfile();
            break;
        case 'favorites':
            // Favorileri yükle
            break;
        case 'comments':
            await loadUserComments();
            break;
        case 'security':
            // Güvenlik sekmesi için özel bir işlem gerekmez
            break;
    }
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', async function() {
    // Auth kontrolü
    if (!checkAuth()) {
        window.location.href = 'index.html';
        return;
    }

    // Form event listener'larını ekle
    const profileForm = document.getElementById('profileForm');
    const passwordForm = document.getElementById('passwordForm');

    if (profileForm) {
        profileForm.addEventListener('submit', updateProfile);
    }

    if (passwordForm) {
        passwordForm.addEventListener('submit', changePassword);
    }

    // Tab değiştirme işlemleri için event listener
    const profileNav = document.querySelector('.profile-nav');
    if (profileNav) {
        profileNav.addEventListener('click', (e) => {
            const tabButton = e.target.closest('li');
            if (!tabButton) return;

            const newTabId = tabButton.dataset.tab;
            if (newTabId) {
                // URL'i güncelle
                const url = new URL(window.location);
                url.searchParams.set('tab', newTabId);
                window.history.pushState({}, '', url);
                
                // Tab içeriğini yükle
                loadTabContent(newTabId);
            }
        });
    }

    // İlk yüklemede aktif tab'ı belirle
    const urlParams = new URLSearchParams(window.location.search);
    const activeTab = urlParams.get('tab') || 'profile';
    await loadTabContent(activeTab);

    // Sayfa yüklendiğinde yorumları yükle
    loadUserComments();
}); 