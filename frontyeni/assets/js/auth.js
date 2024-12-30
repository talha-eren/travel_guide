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
    modalElement.style.display = 'none';
    modalElement.classList.remove('show');
    document.body.classList.remove('modal-open');
    document.body.style.overflow = ''; // Sayfa kaydırmasını geri aç
    document.body.style.paddingRight = ''; // Padding'i sıfırla
    
    // Modal arka planını kaldır
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
        backdrop.remove();
    }
}

// Modal açma fonksiyonu
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Önce diğer tüm modalları kapat
    document.querySelectorAll('.modal').forEach(m => {
        m.style.display = 'none';
        m.classList.remove('show');
    });

    // Yeni modalı aç
    modal.style.display = 'flex';
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';

    // Modal arka planını ekle
    if (!document.querySelector('.modal-backdrop')) {
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        document.body.appendChild(backdrop);
    }

    // Modal içeriğini ortala
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.style.opacity = '0';
        setTimeout(() => {
            modalContent.style.opacity = '1';
            modalContent.style.transform = 'translateY(0)';
        }, 10);
    }
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

// Form submit işlemleri
document.addEventListener('DOMContentLoaded', () => {
    // Modal açma butonları için event listener'lar ekle
    const loginBtn = document.querySelector('[data-target="#loginModal"]');
    const registerBtn = document.querySelector('[data-target="#registerModal"]');

    loginBtn?.addEventListener('click', () => openModal('loginModal'));
    registerBtn?.addEventListener('click', () => openModal('registerModal'));

    // Switch between login and register modals
    document.getElementById('switchToRegister')?.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(document.getElementById('loginModal'));
        openModal('registerModal');
    });

    document.getElementById('switchToLogin')?.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(document.getElementById('registerModal'));
        openModal('loginModal');
    });

    // Mevcut modal kapatma butonlarını seç
    const closeButtons = document.querySelectorAll('.modal .close');
    const modals = document.querySelectorAll('.modal');

    // Her kapatma butonu için event listener ekle
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                closeModal(modal);
            }
        });
    });

    // Modal dışına tıklandığında kapatma
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    // ESC tuşuna basıldığında aktif modalı kapatma
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal[style*="display: block"]');
            if (activeModal) {
                closeModal(activeModal);
            }
        }
    });

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

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
            const loginModal = document.getElementById('loginModal');
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
            const registerModal = document.getElementById('registerModal');
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