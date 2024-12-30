// Global değişkenler
let places = [];
let comments = [];
let users = [];
let editingPlaceId = null;

// Admin giriş işlemleri
document.addEventListener('DOMContentLoaded', function() {
    const currentPath = window.location.pathname;
    const isAdminLoginPage = currentPath.includes('admin.html');
    const isDashboardPage = currentPath.includes('admin-dashboard.html');
    const adminToken = localStorage.getItem('adminToken');

    // Admin login sayfasındayız
    if (isAdminLoginPage) {
        const adminLoginForm = document.getElementById('adminLoginForm');
        if (adminLoginForm) {
            adminLoginForm.addEventListener('submit', handleAdminLogin);
        }
    }
    // Dashboard sayfasındayız
    else if (isDashboardPage) {
        initializeAdminDashboard();
    }
});

// Admin giriş işlemi
async function handleAdminLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    try {
        // API'ye istek at
        const response = await fetch(`${API_URL}/auth/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            throw new Error('Giriş başarısız');
        }

        const data = await response.json();
        localStorage.setItem('adminToken', data.token);
        window.location.href = 'admin-dashboard.html';
    } catch (error) {
        // Test için basit kontrol
        if (email === 'admin@example.com' && password === 'admin123') {
            localStorage.setItem('adminToken', 'test-admin-token');
            window.location.href = 'admin-dashboard.html';
        } else {
            showNotification('Hatalı e-posta veya şifre!', 'error');
        }
    }
}

// Admin çıkış işlemi
function handleAdminLogout() {
    localStorage.removeItem('adminToken');
    window.location.href = 'admin.html';
}

// Yardımcı fonksiyonlar
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Admin dashboard başlatma
function initializeAdminDashboard() {
    // Token kontrolü
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
        window.location.href = 'admin.html';
        return;
    }

    // Menü işlemleri
    const menuItems = document.querySelectorAll('.admin-nav a[data-section]');
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = item.getAttribute('data-section');
            switchSection(sectionId);
        });
    });

    // Çıkış yapma butonu için event listener
    const logoutBtn = document.getElementById('logoutButton');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleAdminLogout();
        });
    }

    // Event listener'ları ekle
    setupEventListeners();

    // İlk yükleme
    switchSection('places');
}

// Bölüm değiştirme
function switchSection(sectionId) {
    // Aktif menü öğesini güncelle
    document.querySelectorAll('.admin-nav a').forEach(a => {
        a.classList.remove('active');
    });
    const activeMenuItem = document.querySelector(`.admin-nav a[data-section="${sectionId}"]`);
    if (activeMenuItem) {
        activeMenuItem.classList.add('active');
    }

    // Bölümleri gizle/göster
    document.querySelectorAll('.admin-section').forEach(section => {
        section.style.display = 'none';
    });
    
    const activeSection = document.getElementById(`${sectionId}-section`);
    if (activeSection) {
        activeSection.style.display = 'block';
        loadSectionData(sectionId);
    }
}

// Event listener'ları ayarla
function setupEventListeners() {
    // Yorum filtreleme
    const statusFilter = document.getElementById('statusFilter');
    const searchComments = document.getElementById('searchComments');
    
    if (statusFilter) statusFilter.addEventListener('change', filterComments);
    if (searchComments) searchComments.addEventListener('input', filterComments);

    // Kullanıcı filtreleme
    const userStatusFilter = document.getElementById('userStatusFilter');
    const searchUsers = document.getElementById('searchUsers');
    
    if (userStatusFilter) userStatusFilter.addEventListener('change', filterUsers);
    if (searchUsers) searchUsers.addEventListener('input', filterUsers);

    // Mekan yönetimi
    const addPlaceBtn = document.getElementById('addPlaceBtn');
    const categoryFilter = document.getElementById('categoryFilter');
    const cityFilter = document.getElementById('cityFilter');
    const searchPlaces = document.getElementById('searchPlaces');
    const placeForm = document.getElementById('placeForm');
    const placeImages = document.getElementById('placeImages');

    if (addPlaceBtn) addPlaceBtn.addEventListener('click', () => openPlaceModal());
    if (categoryFilter) categoryFilter.addEventListener('change', renderPlacesTable);
    if (cityFilter) cityFilter.addEventListener('change', renderPlacesTable);
    if (searchPlaces) searchPlaces.addEventListener('input', renderPlacesTable);
    if (placeForm) placeForm.addEventListener('submit', handlePlaceSubmit);
    if (placeImages) {
        placeImages.addEventListener('change', handleImagePreview);
    }
}

// Bölüm verilerini yükle
async function loadSectionData(sectionId) {
    try {
        switch (sectionId) {
            case 'places':
                await loadPlaces();
                break;
            case 'comments':
                await loadComments();
                break;
            case 'users':
                await loadUsers();
                break;
        }
    } catch (error) {
        showNotification('Veriler yüklenirken hata oluştu', 'error');
    }
}

// Mekan işlemleri
async function loadPlaces() {
    try {
        // Test verisi
        places = [
            {
                _id: '1',
                name: 'Örnek Mekan 1',
                category: 'Tarihi',
                city: 'İstanbul',
                rating: 4.5,
                status: 'Aktif'
            },
            {
                _id: '2',
                name: 'Örnek Mekan 2',
                category: 'Doğal',
                city: 'Ankara',
                rating: 4.0,
                status: 'Aktif'
            }
        ];
        renderPlacesTable();
        updateCityFilter();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Şehir filtresini güncelle
function updateCityFilter() {
    const cityFilter = document.getElementById('cityFilter');
    if (!cityFilter) return;

    const cities = [...new Set(places.map(place => place.city))].sort();
    
    cityFilter.innerHTML = '<option value="all">Tüm Şehirler</option>';
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        cityFilter.appendChild(option);
    });
}

// Mekanlar tablosunu oluştur
function renderPlacesTable() {
    const tbody = document.getElementById('placesTableBody');
    if (!tbody) return;

    const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';
    const cityFilter = document.getElementById('cityFilter')?.value || 'all';
    const searchText = document.getElementById('searchPlaces')?.value.toLowerCase() || '';

    const filteredPlaces = places.filter(place => {
        const matchesCategory = categoryFilter === 'all' || place.category === categoryFilter;
        const matchesCity = cityFilter === 'all' || place.city === cityFilter;
        const matchesSearch = place.name.toLowerCase().includes(searchText);
        return matchesCategory && matchesCity && matchesSearch;
    });

    tbody.innerHTML = filteredPlaces.map(place => `
        <tr>
            <td>${place.name}</td>
            <td>${place.category}</td>
            <td>${place.city}</td>
            <td>${place.rating ? place.rating.toFixed(1) : '-'}</td>
            <td>${place.status}</td>
            <td>
                <button onclick="editPlace('${place._id}')" class="btn btn-sm btn-primary">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deletePlace('${place._id}')" class="btn btn-sm btn-danger">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Yorum işlemleri
async function loadComments() {
    try {
        // Test verisi
        comments = [
            {
                _id: '1',
                user: { name: 'Kullanıcı 1' },
                place: { name: 'Mekan 1' },
                text: 'Harika bir yer!',
                createdAt: new Date(),
                status: 'Onaylı'
            },
            {
                _id: '2',
                user: { name: 'Kullanıcı 2' },
                place: { name: 'Mekan 2' },
                text: 'Güzel mekan',
                createdAt: new Date(),
                status: 'Beklemede'
            }
        ];
        renderCommentsTable();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Kullanıcı işlemleri
async function loadUsers() {
    try {
        // Test verisi
        users = [
            {
                _id: '1',
                name: 'Test Kullanıcı 1',
                email: 'test1@example.com',
                createdAt: new Date(),
                commentCount: 5,
                status: 'Aktif'
            },
            {
                _id: '2',
                name: 'Test Kullanıcı 2',
                email: 'test2@example.com',
                createdAt: new Date(),
                commentCount: 3,
                status: 'Aktif'
            }
        ];
        renderUsersTable();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Yorum tablosunu oluştur
function renderCommentsTable() {
    const tbody = document.getElementById('commentsTableBody');
    if (!tbody) return;

    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    const searchText = document.getElementById('searchComments')?.value.toLowerCase() || '';

    const filteredComments = comments.filter(comment => {
        const matchesStatus = statusFilter === 'all' || comment.status === statusFilter;
        const matchesSearch = comment.text.toLowerCase().includes(searchText) ||
                            comment.user.name.toLowerCase().includes(searchText);
        return matchesStatus && matchesSearch;
    });

    tbody.innerHTML = filteredComments.map(comment => `
        <tr>
            <td>${comment.user.name}</td>
            <td>${comment.place.name}</td>
            <td>${comment.text}</td>
            <td>${new Date(comment.createdAt).toLocaleDateString()}</td>
            <td>${comment.status}</td>
            <td>
                <button onclick="approveComment('${comment._id}')" class="btn btn-success btn-sm">
                    <i class="fas fa-check"></i>
                </button>
                <button onclick="deleteComment('${comment._id}')" class="btn btn-danger btn-sm">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Kullanıcı tablosunu oluştur
function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    const statusFilter = document.getElementById('userStatusFilter')?.value || 'all';
    const searchText = document.getElementById('searchUsers')?.value.toLowerCase() || '';

    const filteredUsers = users.filter(user => {
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
        const matchesSearch = user.name.toLowerCase().includes(searchText) ||
                            user.email.toLowerCase().includes(searchText);
        return matchesStatus && matchesSearch;
    });

    tbody.innerHTML = filteredUsers.map(user => `
        <tr>
            <td>${user.name}</td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td>${user.commentCount || 0}</td>
            <td>${user.status}</td>
            <td>
                <button onclick="toggleUserStatus('${user._id}')" class="btn ${user.status === 'active' ? 'btn-warning' : 'btn-success'} btn-sm">
                    <i class="fas ${user.status === 'active' ? 'fa-ban' : 'fa-check'}"></i>
                </button>
                <button onclick="deleteUser('${user._id}')" class="btn btn-danger btn-sm">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Yorumları filtrele
function filterComments() {
    renderCommentsTable();
}

// Kullanıcıları filtrele
function filterUsers() {
    renderUsersTable();
}

// Mekan modalı işlemleri
function openPlaceModal(placeId = null) {
    const modal = document.getElementById('placeModal');
    if (!modal) return;

    editingPlaceId = placeId;
    const title = document.getElementById('placeModalTitle');
    const form = document.getElementById('placeForm');

    if (title) title.textContent = placeId ? 'Mekan Düzenle' : 'Yeni Mekan Ekle';

    if (placeId && form) {
        const place = places.find(p => p._id === placeId);
        if (place) {
            form.placeName.value = place.name;
            form.placeCategory.value = place.category;
            form.placeCity.value = place.city;
            form.placeAddress.value = place.address;
            form.placeDescription.value = place.description;
        }
    } else if (form) {
        form.reset();
    }

    modal.style.display = 'block';
}

// Görsel önizleme
function handleImagePreview(e) {
    const preview = document.getElementById('imagePreview');
    if (!preview) return;

    preview.innerHTML = '';
    [...e.target.files].forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'preview-image';
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}

// Form gönderimi
async function handlePlaceSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    
    try {
        const url = editingPlaceId 
            ? `${API_URL}/places/${editingPlaceId}`
            : `${API_URL}/places`;
        
        const method = editingPlaceId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: formData
        });

        if (!response.ok) throw new Error('Mekan kaydedilirken bir hata oluştu');

        showNotification(
            editingPlaceId ? 'Mekan başarıyla güncellendi' : 'Yeni mekan başarıyla eklendi',
            'success'
        );

        const modal = document.getElementById('placeModal');
        if (modal) modal.style.display = 'none';
        
        loadPlaces();
    } catch (error) {
        console.error('Error saving place:', error);
        showNotification(error.message, 'error');
    }
} 