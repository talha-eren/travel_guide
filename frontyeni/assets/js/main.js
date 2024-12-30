// API URL'yi tanımla
window.API_URL = 'http://localhost:5000/api';

// Notification sistemi
function showNotification(message, type = 'info') {
    // Varsa eski notification'ı kaldır
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Yeni notification oluştur
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Body'nin en üstüne ekle
    document.body.insertBefore(notification, document.body.firstChild);

    // 3 saniye sonra kaldır
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Yıldız derecelendirme fonksiyonu
function getStarRating(rating) {
    const fullStar = '<i class="fas fa-star"></i>';
    const halfStar = '<i class="fas fa-star-half-alt"></i>';
    const emptyStar = '<i class="far fa-star"></i>';
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars.push(fullStar);
        } else if (i === fullStars && hasHalfStar) {
            stars.push(halfStar);
        } else {
            stars.push(emptyStar);
        }
    }
    
    return stars.join('');
}

// Tarih formatı fonksiyonu
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
}

// Auth kontrolü
function checkAuth() {
    return !!localStorage.getItem('token');
}

// Load components
async function loadComponent(elementId, componentPath) {
    try {
        const response = await fetch(componentPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html;
            // Component yüklendikten sonra UI'ı güncelle
            if (elementId === 'header') {
                updateUIForAuthState();
                initModals();
            }
            return true;
        }
        return false;
    } catch (error) {
        console.error(`Error loading component ${componentPath}:`, error);
        return false;
    }
}

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    }
});

// Smooth scroll for navigation links
function initSmoothScroll() {
    document.querySelectorAll('a[href*="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            // Eğer link başka bir sayfaya yönlendiriyorsa, normal davranışı devam ettir
            if (!this.getAttribute('href').startsWith('#') && 
                !this.getAttribute('href').includes(window.location.pathname)) {
                return;
            }

            e.preventDefault();
            const targetId = this.getAttribute('href').split('#')[1];
            const target = document.getElementById(targetId);
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Modal işlemleri
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modal) {
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Modal'ları başlat
function initModals() {
    // Modal'ları kapat
    document.querySelectorAll('.modal').forEach(modal => {
        // Dışarı tıklandığında kapat
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });

        // Kapatma butonuna tıklandığında kapat
        const closeBtn = modal.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => closeModal(modal));
        }
    });
}

// UI'ı auth durumuna göre güncelle
function updateUIForAuthState() {
    const isLoggedIn = checkAuth();
    const guestMenu = document.querySelector('.guest-menu');
    const userMenu = document.querySelector('.user-menu');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    
    if (isLoggedIn) {
        if (guestMenu) guestMenu.style.display = 'none';
        if (userMenu) userMenu.style.display = 'flex';
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        
        // Kullanıcı bilgilerini güncelle
        const user = JSON.parse(localStorage.getItem('user'));
        const userNameElement = document.querySelector('.user-name');
        const avatarText = document.querySelector('.avatar-text');
        if (user && userNameElement) userNameElement.textContent = user.fullName;
        if (user && avatarText) avatarText.textContent = getInitials(user.fullName);
    } else {
        if (guestMenu) guestMenu.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
        if (loginBtn) loginBtn.style.display = 'block';
        if (registerBtn) registerBtn.style.display = 'block';
    }
}

// İsmin baş harflerini alma
function getInitials(name) {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase();
}

// Korumalı sayfalara yönlendirme kontrolü
function handleProtectedRoute(e) {
    const link = e.target.closest('a');
    if (!link) return true;

    const href = link.getAttribute('href');
    if (!href) return true;

    // Profil sayfası için auth kontrolü
    if (href.includes('profile.html')) {
        if (!checkAuth()) {
            e.preventDefault();
            const loginModal = document.getElementById('loginModal');
            if (loginModal) {
                loginModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
            return false;
        }
    }

    return true;
}

// Initialize all components
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Header ve footer'ı yükle
        await loadComponent('header', 'components/header.html');
        await loadComponent('footer', 'components/footer.html');
        
        // Auth durumunu kontrol et
        const isLoggedIn = checkAuth();
        const currentPath = window.location.pathname;
        
        // Eğer ana sayfadaysak ve giriş yapılmamışsa, giriş sayfasını göster
        if (currentPath.endsWith('/') || currentPath.endsWith('index.html')) {
            // Modal ve auth işlemlerini başlat
            initModals();
            
            // UI'ı güncelle
            updateUIForAuthState();
            
            // Smooth scroll'u başlat
            initSmoothScroll();
        }
        // Eğer profil sayfasındaysak ve giriş yapılmamışsa, ana sayfaya yönlendir
        else if (currentPath.includes('profile.html') && !isLoggedIn) {
            window.location.href = 'index.html';
            return;
        }

        // Global click event listener
        document.addEventListener('click', async (e) => {
            // Çıkış butonu
            const logoutBtn = e.target.closest('#logoutBtn');
            if (logoutBtn) {
                e.preventDefault();
                // Token ve kullanıcı bilgilerini sil
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // UI'ı güncelle
                updateUIForAuthState();
                // Ana sayfaya yönlendir
                window.location.href = 'index.html';
                return;
            }

            // Giriş butonu
            const loginBtn = e.target.closest('#loginBtn');
            if (loginBtn) {
                e.preventDefault();
                const loginModal = document.getElementById('loginModal');
                if (loginModal) {
                    loginModal.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                }
                return;
            }

            // Kayıt butonu
            const registerBtn = e.target.closest('#registerBtn');
            if (registerBtn) {
                e.preventDefault();
                const registerModal = document.getElementById('registerModal');
                if (registerModal) {
                    registerModal.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                }
                return;
            }
        });
    } catch (error) {
        console.error('Error initializing components:', error);
    }
});

// Export functions
window.showNotification = showNotification;
window.openModal = openModal;
window.closeModal = closeModal;
window.checkAuth = checkAuth; 