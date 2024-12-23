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

            // Başarılı mesajı göster
            alert('Başarıyla giriş yapıldı!');

            // Sayfayı yenile
            window.location.reload();

        } catch (error) {
            console.error('Login error:', error);
            alert(error.message);
        }
    });

    // Kayıt formu submit
    registerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fullName = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm').value;

        // Şifre kontrolü
        if (password !== passwordConfirm) {
            alert('Şifreler eşleşmiyor!');
            return;
        }

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

            // Kayıt başarılı mesajı
            alert('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');

            // Kayıt modalını kapat ve giriş modalını aç
            const registerModal = document.getElementById('registerModal');
            const loginModal = document.getElementById('loginModal');
            closeModal(registerModal);
            loginModal.style.display = 'flex';

        } catch (error) {
            console.error('Register error:', error);
            alert(error.message);
        }
    });
});

// Çıkış yapma
function logout() {
    // Token ve kullanıcı bilgilerini sil
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Ana sayfaya yönlendir
    window.location.href = './index.html';
}

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

// Çıkış butonu için event listener
const logoutButton = document.querySelector('#logoutBtn');
if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
}