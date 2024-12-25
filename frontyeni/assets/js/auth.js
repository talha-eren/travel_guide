// API URL'yi tanımla
const API_URL = 'http://localhost:5000/api';

// Auth durumu değiştiğinde event tetikle
function triggerAuthStateChange() {
    const event = new Event('authStateChanged');
    document.dispatchEvent(event);
}

// Form submit işlemleri
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Giriş formu submit
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Giriş yapılırken bir hata oluştu');
            }

            // Token ve kullanıcı bilgilerini kaydet
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Modalı kapat
            const loginModal = document.getElementById('loginModal');
            closeModal(loginModal);

            // Auth durumu değişti event'ini tetikle
            triggerAuthStateChange();

            // Başarılı mesajı göster
            showNotification('Başarıyla giriş yapıldı!', 'success');

        } catch (error) {
            console.error('Login error:', error);
            showNotification(error.message, 'error');
        }
    });

    // Kayıt formu submit
    registerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const registerFullName = document.getElementById('registerFullName');
        const registerEmail = document.getElementById('registerEmail');
        const registerPassword = document.getElementById('registerPassword');

        if (!registerFullName || !registerEmail || !registerPassword) {
            showNotification('Form alanları bulunamadı', 'error');
            return;
        }

        const fullName = registerFullName.value;
        const email = registerEmail.value;
        const password = registerPassword.value;

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fullName, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Kayıt olurken bir hata oluştu');
            }

            // Token ve kullanıcı bilgilerini kaydet
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Modalı kapat
            const registerModal = document.getElementById('registerModal');
            closeModal(registerModal);

            // UI'ı güncelle
            updateUIForAuthState();

            // Başarılı mesajı göster
            showNotification('Başarıyla kayıt oldunuz!', 'success');

        } catch (error) {
            console.error('Register error:', error);
            showNotification(error.message, 'error');
        }
    });

    // Çıkış yapma işlemi
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn?.addEventListener('click', () => {
        // Token ve kullanıcı bilgilerini sil
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Auth durumu değişti event'ini tetikle
        triggerAuthStateChange();

        // Ana sayfaya yönlendir
        window.location.href = 'index.html';
    });
});

// Menüyü güncelle
function updateMenu() {
    const token = localStorage.getItem('token');
    const guestMenu = document.querySelector('.guest-menu');
    const loggedInMenu = document.querySelector('.logged-in-menu');
    
    if (token) {
        if (guestMenu) guestMenu.style.display = 'none';
        if (loggedInMenu) {
            loggedInMenu.style.display = 'flex';
            // Kullanıcı bilgilerini güncelle
            const user = JSON.parse(localStorage.getItem('user'));
            if (user) {
                const avatarText = loggedInMenu.querySelector('.avatar-text');
                const userName = loggedInMenu.querySelector('.user-name');
                if (avatarText) avatarText.textContent = getInitials(user.fullName);
                if (userName) userName.textContent = user.fullName;
            }
        }
    } else {
        if (guestMenu) guestMenu.style.display = 'flex';
        if (loggedInMenu) loggedInMenu.style.display = 'none';
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