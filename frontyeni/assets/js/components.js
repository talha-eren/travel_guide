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

// Auth durumuna göre UI'ı güncelle
function updateAuthUI() {
    const isLoggedIn = checkAuth();
    const guestMenu = document.querySelector('.guest-menu');
    const userMenu = document.querySelector('.user-menu');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    
    if (isLoggedIn) {
        // Kullanıcı giriş yapmışsa
        if (guestMenu) guestMenu.style.display = 'none';
        if (userMenu) userMenu.style.display = 'flex';
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        
        // Kullanıcı bilgilerini göster
        const user = JSON.parse(localStorage.getItem('user'));
        const userNameElement = document.querySelector('.user-name');
        const avatarText = document.querySelector('.avatar-text');
        
        if (user) {
            if (userNameElement) userNameElement.textContent = user.fullName;
            if (avatarText) avatarText.textContent = getInitials(user.fullName);
        }
    } else {
        // Kullanıcı giriş yapmamışsa
        if (guestMenu) guestMenu.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
        if (loginBtn) loginBtn.style.display = 'block';
        if (registerBtn) registerBtn.style.display = 'block';
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

// Sayfa yüklendiğinde bileşenleri yükle
document.addEventListener('DOMContentLoaded', loadComponents);

// Auth durumu değiştiğinde UI'ı güncelle
document.addEventListener('authStateChanged', updateAuthUI); 