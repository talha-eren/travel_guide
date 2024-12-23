// Profil bilgilerini getir
async function getProfile() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'index.html';
            return;
        }

        console.log('Token:', token); // Debug için

        const response = await fetch(`${API_URL}/profile/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Response:', response); // Debug için

        const data = await response.json();
        console.log('Data:', data); // Debug için

        if (!response.ok) {
            throw new Error(data.message || 'Profil bilgileri alınamadı');
        }

        // Form alanlarını doldur
        document.getElementById('fullName').value = data.user.fullName;
        document.getElementById('email').value = data.user.email;

        // Avatar ve isim güncelle
        const avatarText = document.querySelector('.avatar-text');
        const profileName = document.querySelector('.profile-name');
        const profileEmail = document.querySelector('.profile-email');

        if (avatarText) {
            avatarText.textContent = getInitials(data.user.fullName);
        }
        if (profileName) {
            profileName.textContent = data.user.fullName;
        }
        if (profileEmail) {
            profileEmail.textContent = data.user.email;
        }

    } catch (error) {
        console.error('Profil bilgileri alınırken hata:', error);
        alert(error.message);
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
        alert('Profil bilgileri başarıyla güncellendi');

        // Sayfayı yenile
        window.location.reload();

    } catch (error) {
        console.error('Profil güncellenirken hata:', error);
        alert(error.message);
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
        alert('Şifre başarıyla değiştirildi');

        // Formu temizle
        document.getElementById('passwordForm').reset();

    } catch (error) {
        console.error('Şifre değiştirme hatası:', error);
        alert(error.message);
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
            // Yorumları yükle
            break;
        case 'security':
            // Güvenlik sekmesi için özel bir işlem gerekmez
            break;
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
}

// Sayfa yüklendiğinde auth kontrolü yap
document.addEventListener('DOMContentLoaded', async function() {
    // Auth kontrolü
    if (!checkAuth()) {
        window.location.href = './index.html';
        return;
    }

    try {
        // Header ve footer'ı yükle
        await loadComponent('header', 'components/header.html');
        await loadComponent('footer', 'components/footer.html');
        
        // UI'ı güncelle
        updateUIForAuthState();

        // Auth durumunu periyodik olarak kontrol et
        setInterval(() => {
            if (!checkAuth()) {
                window.location.href = './index.html';
            }
        }, 5000); // Her 5 saniyede bir kontrol et
        
        // Aktif tab'ı belirle
        const urlParams = new URLSearchParams(window.location.search);
        const activeTab = urlParams.get('tab') || 'profile';
        
        // İlgili içeriği yükle
        loadTabContent(activeTab);
    } catch (error) {
        console.error('Error loading profile:', error);
        window.location.href = './index.html';
    }
}); 