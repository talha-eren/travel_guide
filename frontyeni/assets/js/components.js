// Header ve footer'ı yükle
async function loadComponents() {
    try {
        // Header'ı yükle
        const headerResponse = await fetch('components/header.html');
        if (headerResponse.ok) {
            const headerHtml = await headerResponse.text();
            document.getElementById('header').innerHTML = headerHtml;
            
            // Header yüklendikten sonra event tetikle
            document.dispatchEvent(new Event('headerLoaded'));
            
            // Header yüklendikten sonra auth durumunu kontrol et
            updateAuthUI();
            
            // Profil dropdown menüsünü ayarla
            setupProfileDropdown();
        }
        
        // Footer'ı yükle
        const footerResponse = await fetch('components/footer.html');
        if (footerResponse.ok) {
            const footerHtml = await footerResponse.text();
            document.getElementById('footer').innerHTML = footerHtml;
        }
    } catch (error) {
        console.error('Error loading components:', error);
    }
}

// Profil dropdown menüsünü ayarla
function setupProfileDropdown() {
    const profileButton = document.querySelector('.profile-button');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (profileButton && dropdownMenu) {
        // Tıklama olayını dinle
        profileButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Event'in yayılmasını engelle
            dropdownMenu.classList.toggle('show');
        });

        // Sayfa herhangi bir yerine tıklandığında menüyü kapat
        document.addEventListener('click', (e) => {
            if (!profileButton.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });

        // Çıkış yapma işlemini ayarla
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                try {
                    // Kullanıcı bilgilerini al
                    const user = JSON.parse(localStorage.getItem('user') || '{}');
                    const userName = user.fullName || 'Kullanıcı';

                    // Token ve kullanıcı bilgilerini sil
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');

                    // Auth durumu değişti event'ini tetikle
                    const event = new Event('authStateChanged');
                    document.dispatchEvent(event);

                    // Çıkış bildirimi göster
                    showNotification(`Görüşmek üzere, ${userName}! Başarıyla çıkış yapıldı.`, 'success');

                    // Bildirim görüldükten sonra sayfayı yenile
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } catch (error) {
                    console.error('Logout error:', error);
                    showNotification('Çıkış yapılırken bir hata oluştu', 'error');
                }
            });
        }

        // Menü öğelerine tıklama olaylarını ekle
        const menuItems = dropdownMenu.querySelectorAll('a:not(#logoutBtn)');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const href = item.getAttribute('href');
                if (href) {
                    window.location.href = href;
                }
            });
        });
    }
}

// Auth durumuna göre UI'ı güncelle
function updateAuthUI() {
    const token = localStorage.getItem('token');
    const guestMenu = document.querySelector('.guest-menu');
    const userMenu = document.querySelector('.logged-in-menu');
    
    if (token) {
        // Kullanıcı giriş yapmışsa
        if (guestMenu) guestMenu.style.display = 'none';
        if (userMenu) {
            userMenu.style.display = 'flex';
            
            // Kullanıcı bilgilerini göster
            const user = JSON.parse(localStorage.getItem('user'));
            const userNameElement = userMenu.querySelector('.user-name');
            const avatarText = userMenu.querySelector('.avatar-text');
            
            if (user && user.fullName) {
                if (userNameElement) userNameElement.textContent = user.fullName;
                if (avatarText) {
                    // İsmin baş harflerini al
                    const initials = user.fullName
                        .split(' ')
                        .map(name => name.charAt(0))
                        .join('')
                        .toUpperCase();
                    avatarText.textContent = initials;
                }
            }
        }
    } else {
        // Kullanıcı giriş yapmamışsa
        if (guestMenu) guestMenu.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
    }
}

// İsmin baş harflerini al
function getInitials(name) {
    if (!name) return '';
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase();
}

// Sayfa yüklendiğinde bileşenleri yükle
document.addEventListener('DOMContentLoaded', loadComponents);

// Auth durumu değiştiğinde UI'ı güncelle
document.addEventListener('authStateChanged', updateAuthUI);

// Dropdown menüyü aç/kapat
document.addEventListener('click', (e) => {
    const dropdownButton = e.target.closest('.profile-button');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    if (dropdownButton) {
        dropdownMenu?.classList.toggle('show');
        const chevron = dropdownButton.querySelector('.fa-chevron-down');
        if (chevron) {
            chevron.style.transform = dropdownMenu?.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0)';
        }
    } else if (!e.target.closest('.dropdown-menu')) {
        dropdownMenu?.classList.remove('show');
        const chevron = document.querySelector('.profile-button .fa-chevron-down');
        if (chevron) {
            chevron.style.transform = 'rotate(0)';
        }
    }
});

// Bildirim göster
function showNotification(message, type = 'info') {
    // Varolan bildirimi kaldır
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Yeni bildirimi oluştur
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.opacity = '0'; // Başlangıçta görünmez

    // İkon ekle
    const icon = document.createElement('i');
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
    } else if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle';
    } else if (type === 'warning') {
        icon.className = 'fas fa-exclamation-triangle';
    } else {
        icon.className = 'fas fa-info-circle';
    }
    icon.style.marginRight = '10px';

    // Mesaj container'ı
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.flex = '1';

    // Bildirimi oluştur
    notification.appendChild(icon);
    notification.appendChild(messageDiv);

    // Bildirimi ekle
    document.body.appendChild(notification);

    // Animasyon için setTimeout kullan
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 100);

    // 2 saniye sonra kaldır
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification && notification.parentElement) {
                notification.remove();
            }
        }, 500);
    }, 2000);
} 