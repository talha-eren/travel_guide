// Header ve footer'ı yükle
async function loadComponents() {
    try {
        // Header'ı yükle
        const headerResponse = await fetch('components/header.html');
        if (headerResponse.ok) {
            const headerHtml = await headerResponse.text();
            document.getElementById('header').innerHTML = headerHtml;
            
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

        // Menü öğelerine tıklama olaylarını ekle
        const menuItems = dropdownMenu.querySelectorAll('a');
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
    const isLoggedIn = checkAuth();
    const guestMenu = document.querySelector('.guest-menu');
    const userMenu = document.querySelector('.logged-in-menu');
    
    if (isLoggedIn) {
        // Kullanıcı giriş yapmışsa
        if (guestMenu) guestMenu.style.display = 'none';
        if (userMenu) {
            userMenu.style.display = 'flex';
            
            // Kullanıcı bilgilerini göster
            const user = JSON.parse(localStorage.getItem('user'));
            const userNameElement = userMenu.querySelector('.user-name');
            const avatarText = userMenu.querySelector('.avatar-text');
            
            if (user) {
                if (userNameElement) userNameElement.textContent = user.fullName || 'İsimsiz Kullanıcı';
                if (avatarText) avatarText.textContent = getInitials(user.fullName || '');
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