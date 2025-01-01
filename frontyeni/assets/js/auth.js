// Modal kapatma fonksiyonu
function closeModal(modalElement) {
    if (!modalElement) return;
    
    // Önce Bootstrap modal'ı kapatmayı dene
    try {
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
            modalInstance.hide();
            return;
        }
    } catch (error) {
        console.log('Bootstrap modal not available');
    }

    // Bootstrap çalışmazsa manuel kapat
    modalElement.classList.remove('show');
    
    // Geçiş animasyonu bittikten sonra
    setTimeout(() => {
        modalElement.style.display = 'none';
        // Eğer başka açık modal yoksa body'den modal-open class'ını kaldır
        const openModals = document.querySelectorAll('.modal.show');
        if (openModals.length === 0) {
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }
    }, 300); // CSS transition süresiyle eşleşmeli
}

// Modal açma fonksiyonu
function openModal(modalElement) {
    if (!modalElement) return;
    
    // Scroll pozisyonunu kaydet
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    modalElement.style.display = 'flex';
    document.body.classList.add('modal-open');
    
    // Scrollbar kaymasını önle
    if (scrollBarWidth > 0) {
        document.body.style.paddingRight = scrollBarWidth + 'px';
    }
    
    // Bir sonraki frame'de show class'ını ekle (animasyon için)
    requestAnimationFrame(() => {
        modalElement.classList.add('show');
    });
}

// Modal geçiş fonksiyonu
function switchModal(fromModal, toModal) {
    if (!fromModal || !toModal) return;

    // İlk modalı kapat
    fromModal.classList.remove('show');
    
    // Geçiş süresi kadar bekle
    setTimeout(() => {
        fromModal.style.display = 'none';
        // İkinci modalı aç
        toModal.style.display = 'flex';
        requestAnimationFrame(() => {
            toModal.classList.add('show');
        });
    }, 300); // CSS transition süresiyle eşleşmeli
}

// Auth işlemleri için gerekli fonksiyonlar
async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Giriş yapılırken bir hata oluştu');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

// Auth durumu değiştiğinde event tetikle
function triggerAuthStateChange() {
    const event = new Event('authStateChanged');
    document.dispatchEvent(event);
}

// Auth butonlarını ayarla
function setupAuthButtons() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');

    // Giriş yap butonuna tıklandığında modalı aç
    loginBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(loginModal);
    });

    // Kayıt ol butonuna tıklandığında modalı aç
    registerBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(registerModal);
    });
}

// Form submit işlemleri
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');

    // Header yüklendiğinde auth butonlarını ayarla
    document.addEventListener('headerLoaded', setupAuthButtons);

    // Modal geçiş işlemleri
    switchToRegister?.addEventListener('click', (e) => {
        e.preventDefault();
        switchModal(loginModal, registerModal);
    });

    switchToLogin?.addEventListener('click', (e) => {
        e.preventDefault();
        switchModal(registerModal, loginModal);
    });

    // Modal kapatma butonları
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                closeModal(modal);
            }
        });
    });

    // Modalların dışına tıklandığında kapatma
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });

    // ESC tuşuna basıldığında modalı kapat
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal.show');
            if (openModal) {
                closeModal(openModal);
            }
        }
    });

    // Giriş formu submit
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const data = await login(email, password);

            // Token ve kullanıcı bilgilerini kaydet
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Modalı kapat
            closeModal(loginModal);

            // Auth durumu değişti event'ini tetikle
            triggerAuthStateChange();

            // Başarılı mesajı göster
            showNotification('Başarıyla giriş yapıldı!', 'success');

            // Sayfayı yenile
            window.location.reload();

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
        const registerPasswordConfirm = document.getElementById('registerPasswordConfirm');

        if (!registerFullName || !registerEmail || !registerPassword || !registerPasswordConfirm) {
            showNotification('Form alanları bulunamadı', 'error');
            return;
        }

        if (registerPassword.value !== registerPasswordConfirm.value) {
            showNotification('Şifreler eşleşmiyor', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fullName: registerFullName.value,
                    email: registerEmail.value,
                    password: registerPassword.value
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Kayıt olurken bir hata oluştu');
            }

            const data = await response.json();

            // Token ve kullanıcı bilgilerini kaydet
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Modalı kapat
            closeModal(registerModal);

            // Auth durumu değişti event'ini tetikle
            triggerAuthStateChange();

            // Başarılı mesajı göster
            showNotification('Başarıyla kayıt oldunuz!', 'success');

            // Sayfayı yenile
            window.location.reload();

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

        // Sayfayı yenile
        window.location.reload();
    });

    // Sayfa yüklendiğinde auth durumunu kontrol et
    updateMenu();
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
    if (!name) return '';
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase();
}

// Bildirim göster
function showNotification(message, type = 'info') {
    // Mevcut bildirimi kaldır
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Yeni bildirimi oluştur
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Bildirimi ekle
    document.body.appendChild(notification);

    // 3 saniye sonra kaldır
    setTimeout(() => {
        notification.remove();
    }, 3000);
}