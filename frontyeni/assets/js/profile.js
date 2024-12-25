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

// Kullanıcının yorumlarını getir ve göster
async function loadUserComments() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'index.html';
            return;
        }

        const response = await fetch(`${API_URL}/profile/comments`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const comments = await response.json();

        if (!response.ok) {
            throw new Error(comments.message || 'Yorumlar getirilirken bir hata oluştu');
        }

        const commentsList = document.querySelector('#comments .comments-list');
        if (!commentsList) return;

        if (comments.length === 0) {
            commentsList.innerHTML = `
                <div class="no-comments">
                    <i class="fas fa-comments"></i>
                    <p>Henüz yorum yapmamışsınız.</p>
                </div>
            `;
            return;
        }

        commentsList.innerHTML = comments.map(comment => `
            <div class="comment-card">
                <div class="comment-header">
                    <h3>${comment.place.name}</h3>
                    <div class="rating">
                        ${getStarRating(comment.rating)}
                    </div>
                </div>
                <div class="comment-meta">
                    <span><i class="fas fa-map-marker-alt"></i> ${comment.place.city}</span>
                    <span><i class="fas fa-tag"></i> ${comment.place.category}</span>
                    <span><i class="fas fa-clock"></i> ${formatDate(comment.createdAt)}</span>
                </div>
                <p class="comment-text">${comment.text}</p>
                <div class="comment-actions">
                    <a href="place-details.html?id=${comment.place._id}" class="btn-link">
                        <i class="fas fa-external-link-alt"></i> Mekana Git
                    </a>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading user comments:', error);
        showNotification(error.message, 'error');
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
}); 