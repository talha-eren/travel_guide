// API URL
const API_URL = 'http://localhost:5000/api';

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
function initModals() {
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const closeBtns = document.querySelectorAll('.close');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');

    // Modal açma işlevleri
    loginBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        if (loginModal) {
            loginModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    });

    registerBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        if (registerModal) {
            registerModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    });

    // Modal geçişleri
    switchToRegister?.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(loginModal);
        if (registerModal) {
            registerModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    });

    switchToLogin?.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(registerModal);
        if (loginModal) {
            loginModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    });

    // X butonuyla kapatma
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(loginModal);
            closeModal(registerModal);
        });
    });

    // Dışarı tıklayarak kapatma
    window.addEventListener('click', (e) => {
        if (e.target === loginModal || e.target === registerModal) {
            closeModal(loginModal);
            closeModal(registerModal);
        }
    });

    // ESC tuşu ile kapatma
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal(loginModal);
            closeModal(registerModal);
        }
    });
}

// UI'ı auth durumuna göre güncelle
function updateUIForAuthState() {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userMenu = document.querySelector('.user-menu');
    
    if (token && user) {
        // Giriş yapmış kullanıcı UI'ı
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (userMenu) {
            userMenu.style.display = 'flex';
            const avatarText = userMenu.querySelector('.avatar-text');
            const userName = userMenu.querySelector('.user-name');
            if (avatarText) avatarText.textContent = getInitials(user.fullName);
            if (userName) userName.textContent = user.fullName;
        }
    } else {
        // Giriş yapmamış kullanıcı UI'ı
        if (loginBtn) loginBtn.style.display = 'block';
        if (registerBtn) registerBtn.style.display = 'block';
        if (userMenu) userMenu.style.display = 'none';
    }
}

// Modal kapatma yardımcı fonksiyonu
function closeModal(modal) {
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
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

// Auth kontrolü
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return token && user;
}

// Korumalı sayfalara yönlendirme kontrolü
function handleProtectedRoute(e) {
    const link = e.target.closest('a');
    if (!link) return true;

    const href = link.getAttribute('href');
    if (!href) return true;

    // Sadece profil sayfası için kontrol yap
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

    // Diğer tüm sayfalara serbest erişim
    return true;
}

// Initialize all components
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Header ve footer'ı yükle
        await loadComponent('header', 'components/header.html');
        await loadComponent('footer', 'components/footer.html');
        
        // Profil sayfasında olup olmadığımızı kontrol et
        const isProfilePage = window.location.pathname.includes('profile.html');
        const isLoggedIn = checkAuth();
        
        // Sadece profil sayfası için auth kontrolü yap
        if (isProfilePage && !isLoggedIn) {
            window.location.href = './index.html';
            return;
        }
        
        // Modal ve auth işlemlerini başlat
        initModals();
        updateUIForAuthState();
        
        // Smooth scroll'u başlat
        initSmoothScroll();

        // Korumalı sayfa linklerini dinle
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link) {
                handleProtectedRoute(e);
            }
        });
        
        // Global click event listener
        document.addEventListener('click', async (e) => {
            // Çıkış butonu
            const logoutBtn = e.target.closest('#logoutBtn');
            if (logoutBtn) {
                e.preventDefault();
                // Token ve kullanıcı bilgilerini sil
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Ana sayfaya yönlendir
                window.location.href = './index.html';
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

            // Modal geçiş butonları
            const switchToRegister = e.target.closest('#switchToRegister');
            if (switchToRegister) {
                e.preventDefault();
                const loginModal = document.getElementById('loginModal');
                const registerModal = document.getElementById('registerModal');
                closeModal(loginModal);
                if (registerModal) {
                    registerModal.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                }
                return;
            }

            const switchToLogin = e.target.closest('#switchToLogin');
            if (switchToLogin) {
                e.preventDefault();
                const registerModal = document.getElementById('registerModal');
                const loginModal = document.getElementById('loginModal');
                closeModal(registerModal);
                if (loginModal) {
                    loginModal.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                }
                return;
            }

            // Modal kapatma butonları
            const closeBtn = e.target.closest('.close');
            if (closeBtn) {
                const modal = closeBtn.closest('.modal');
                closeModal(modal);
                return;
            }

            // Modal dışına tıklama
            if (e.target.classList.contains('modal')) {
                closeModal(e.target);
            }
        });

        // ESC tuşu ile modal kapatma
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.modal');
                modals.forEach(modal => closeModal(modal));
            }
        });

    } catch (error) {
        console.error('Error initializing components:', error);
    }
}); 