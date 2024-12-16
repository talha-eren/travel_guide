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
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Smooth scroll for navigation links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            // Eğer href sadece # ise işlemi atla
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize all components
document.addEventListener('DOMContentLoaded', async function() {
    try {
        //  header ve footer yükle
        await loadComponent('header', 'components/header.html');
        await loadComponent('footer', 'components/footer.html');
        
        // Header yüklendikten sonra auth durumunu kontrol et
        checkAuthState();
        initAuth();
        
        // Çıkış butonu için event listener
        document.querySelector('.navbar').addEventListener('click', function(e) {
            // Çıkış butonuna veya içindeki icon'a tıklandığında
            if (e.target.closest('#logoutBtn')) {
                e.preventDefault();
                // localStorage'dan kullanıcı bilgilerini sil
                localStorage.removeItem('currentUser');
                // Bildirim göster
                alert('Başarıyla çıkış yaptınız');
                
                // Eğer profil sayfasındaysa ana sayfaya yönlendir, değilse sayfayı yenile
                if (window.location.pathname.toLowerCase().includes('profile.html')) {
                    window.location.href = 'index.html';
                } else {
                    window.location.reload();
                }
            }
        });
        
        // Sayfa bazlı başlatma işlemleri
        const currentPath = window.location.pathname;
        if (currentPath.toLowerCase().includes('profile.html')) {
            // Profil sayfası başlatma işlemleri
            initSmoothScroll();
        } else {
            // Ana sayfa başlatma işlemleri
            initSearch();
            loadPopularPlaces(); // Popüler mekanları yükle
            initSmoothScroll();
        }
    } catch (error) {
        console.error('Error initializing components:', error);
    }
}); 