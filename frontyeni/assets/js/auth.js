// Global scope'a fonksiyonları ekle
window.showLoginModal = showLoginModal;
window.showRegisterModal = showRegisterModal;

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
    modalElement.style.display = 'none';
    
    // Body'den modal-open class'ını kaldır
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
}

// Modal açma fonksiyonu
function openModal(modalElement) {
    if (!modalElement) return;
    
    // Diğer açık modalları kapat
    const openModals = document.querySelectorAll('.modal.show');
    openModals.forEach(modal => {
        if (modal !== modalElement) {
            closeModal(modal);
        }
    });
    
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
    fromModal.style.display = 'none';
    
    // İkinci modalı aç
    toModal.style.display = 'flex';
    requestAnimationFrame(() => {
        toModal.classList.add('show');
    });
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

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('E-posta veya şifre hatalı');
            } else if (response.status === 404) {
                throw new Error('Kullanıcı bulunamadı');
            } else {
                throw new Error(data.message || 'Giriş yapılırken bir hata oluştu');
            }
        }

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

// Kayıt işlemi için fonksiyon
async function register(fullName, email, password) {
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
            if (response.status === 400) {
                throw new Error(data.message || 'Bu email adresi zaten kullanılıyor');
            } else {
                throw new Error(data.message || 'Kayıt olurken bir hata oluştu');
            }
        }

        return data;
    } catch (error) {
        console.error('Register error:', error);
        throw error;
    }
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
        e.stopPropagation();
        switchModal(loginModal, registerModal);
    });

    switchToLogin?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        switchModal(registerModal, loginModal);
    });

    // Modal kapatma butonları
    const closeButtons = document.querySelectorAll('.modal .close');
    closeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const modal = button.closest('.modal');
            if (modal) {
                closeModal(modal);
            }
        });
    });

    // Modal olaylarını yönet
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        // Modal dışına tıklandığında kapatma
        modal.addEventListener('mousedown', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });

        // Modal içeriğindeki tüm etkileşimleri engelle
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.addEventListener('mousedown', (e) => {
                e.stopPropagation();
            });

            // Form elemanlarına tıklamayı engelle
            const formElements = modalContent.querySelectorAll('input, button, a');
            formElements.forEach(element => {
                element.addEventListener('mousedown', (e) => {
                    e.stopPropagation();
                });
            });
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
        e.stopPropagation();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Form validasyonu
        if (!email || !password) {
            showNotification('Lütfen tüm alanları doldurun', 'error');
            return;
        }

        try {
            const data = await login(email, password);

            // Başarılı giriş durumunda
            if (data && data.token) {
                // Token ve kullanıcı bilgilerini kaydet
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Başarılı mesajı göster
                showNotification(`Hoş geldiniz, ${data.user.fullName || 'Kullanıcı'}!`, 'success');

                // Modalı kapat ve sayfayı yenile
                setTimeout(() => {
                    closeModal(loginModal);
                    // Auth durumu değişti event'ini tetikle
                    triggerAuthStateChange();
                    // Sayfayı yenile
                    window.location.reload();
                }, 1000);
            }
        } catch (error) {
            console.error('Login error:', error);
            showNotification(error.message || 'Giriş yapılırken bir hata oluştu', 'error');
            
            // Hata durumunda şifre alanını temizle ve fokusla
            const passwordInput = document.getElementById('loginPassword');
            passwordInput.value = '';
            passwordInput.focus();
        }
    });

    // Kayıt formu submit
    registerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const fullName = document.getElementById('registerFullName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerPasswordConfirm').value;

        // Form validasyonu
        if (!fullName || !email || !password || !confirmPassword) {
            showNotification('Lütfen tüm alanları doldurun', 'error');
            return;
        }

        // Şifre kontrolü
        if (password !== confirmPassword) {
            showNotification('Şifreler eşleşmiyor', 'error');
            return;
        }

        if (password.length < 6) {
            showNotification('Şifre en az 6 karakter olmalıdır', 'error');
            return;
        }

        try {
            const data = await register(fullName, email, password);

            // Başarılı kayıt durumunda
            if (data && data.token) {
                // Token ve kullanıcı bilgilerini kaydet
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Başarılı mesajı göster
                showNotification('Kayıt başarılı! Hoş geldiniz!', 'success');

                // Modalı kapat ve sayfayı yenile
                setTimeout(() => {
                    closeModal(registerModal);
                    // Auth durumu değişti event'ini tetikle
                    triggerAuthStateChange();
                    // Sayfayı yenile
                    window.location.reload();
                }, 1000);
            }
        } catch (error) {
            console.error('Register error:', error);
            showNotification(error.message || 'Kayıt olurken bir hata oluştu', 'error');
            
            // Hata durumunda şifre alanlarını temizle
            document.getElementById('registerPassword').value = '';
            document.getElementById('registerPasswordConfirm').value = '';
            document.getElementById('registerPassword').focus();
        }
    });

    // Çıkış yapma işlemi
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn?.addEventListener('click', (e) => {
        e.preventDefault(); // Link davranışını engelle
        e.stopPropagation(); // Event yayılımını engelle
        
        try {
            // Kullanıcı bilgilerini al
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const userName = user.fullName || 'Kullanıcı';

            // Token ve kullanıcı bilgilerini sil
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Auth durumu değişti event'ini tetikle
            triggerAuthStateChange();

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

    // 3 saniye sonra kaldır
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification && notification.parentElement) {
                notification.remove();
            }
        }, 500);
    }, 3000);
}

// Modal açma fonksiyonları
function showLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        openModal(loginModal);
    }
}

function showRegisterModal() {
    const registerModal = document.getElementById('registerModal');
    if (registerModal) {
        openModal(registerModal);
    }
}