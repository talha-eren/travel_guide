// Sayfa yüklendiğinde auth durumunu kontrol et
document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
    initAuth();
});

// Auth başlatma
function initAuth() {
    // Modal elementlerini al
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const closeBtns = document.querySelectorAll('.close');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');

    // Login/Register form submit
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
    
    // Modal açma işlevleri
    loginBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });

    registerBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        registerModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });

    // Modal geçişleri
    switchToRegister?.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(loginModal);
        registerModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });

    switchToLogin?.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(registerModal);
        loginModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
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

// Auth durumunu kontrol et
function checkAuthState() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        // Kullanıcı giriş yapmış
        updateUIForAuthState(true, user);
    } else {
        // Kullanıcı giriş yapmamış
        updateUIForAuthState(false, null);
    }
}

// UI'ı auth durumuna göre güncelle
function updateUIForAuthState(isLoggedIn, user) {
    const guestMenu = document.querySelector('.guest-menu');
    const loggedInMenu = document.querySelector('.logged-in-menu');
    
    if (isLoggedIn && user) {
        // Giriş yapmış kullanıcı UI'ı
        if (guestMenu) guestMenu.style.display = 'none';
        if (loggedInMenu) {
            loggedInMenu.style.display = 'block';
            // Avatar ve kullanıcı adını güncelle
            const avatarText = loggedInMenu.querySelector('.avatar-text');
            const userName = loggedInMenu.querySelector('.user-name');
            if (avatarText) avatarText.textContent = getInitials(user.name);
            if (userName) userName.textContent = user.name;
        }
    } else {
        // Giriş yapmamış kullanıcı UI'ı
        if (guestMenu) guestMenu.style.display = 'block';
        if (loggedInMenu) loggedInMenu.style.display = 'none';
    }
}

// Çıkış işlemi
function handleLogout() {
    // localStorage'dan kullanıcı bilgilerini sil
    localStorage.removeItem('currentUser');
    
    // Bildirim göster
    alert('Başarıyla çıkış yaptınız');

    // Sayfayı yenile
    window.location.reload();
}

// Giriş işlemi
async function handleLogin(e) {
    e.preventDefault();
    
    // Form verilerini al
    const email = document.querySelector('#loginForm input[type="email"]').value;
    const password = document.querySelector('#loginForm input[type="password"]').value;

    try {
        // Test için örnek kullanıcı
        const user = {
            id: 1,
            name: "John Smith",
            email: email,
            isVerified: true
        };

        // Kullanıcı bilgilerini kaydet
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // UI'ı güncelle
        updateUIForAuthState(true, user);
        
        // Modal'ı kapat ve scroll'u düzelt
        closeModal(document.getElementById('loginModal'));
        
        showNotification('Başarıyla giriş yaptınız!', 'success');
    } catch (error) {
        console.error('Giriş hatası:', error);
        showNotification('Giriş yapılırken bir hata oluştu', 'error');
    }
}

// Kayıt işlemi
async function handleRegister(e) {
    e.preventDefault();
    
    // Form verilerini al
    const name = document.querySelector('#registerForm input[type="text"]').value;
    const email = document.querySelector('#registerForm input[type="email"]').value;
    const password = document.querySelector('#registerForm input[type="password"]').value;

    try {
        // Test için örnek kullanıcı
        const user = {
            id: 1,
            name: name,
            email: email,
            isVerified: false
        };

        // Kullanıcı bilgilerini kaydet
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // UI'ı güncelle
        updateUIForAuthState(true, user);
        
        // Modal'ı kapat ve scroll'u düzelt
        closeModal(document.getElementById('registerModal'));
        
        showNotification('Başarıyla kayıt oldunuz!', 'success');
    } catch (error) {
        console.error('Kayıt hatası:', error);
        showNotification('Kayıt olurken bir hata oluştu', 'error');
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

// Yardımcı fonksiyonlar
function getInitials(name) {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase();
}

function showNotification(message, type = 'info') {
    alert(message); // Şimdilik basit bir alert
}

// Header'ı yeniden yükle
async function loadComponent(elementId, componentPath) {
    try {
        const response = await fetch(componentPath);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
        return true;
    } catch (error) {
        console.error(`Error loading component ${componentPath}:`, error);
        return false;
    }
} 