// Global değişkenler
if (!window.adminData) {
    window.adminData = {
        places: [],
        comments: [],
        users: [],
        editingPlaceId: null
    };
}

// Admin giriş işlemi
function handleAdminLogin(e) {
    e.preventDefault();
    console.log('Login attempt started');
    
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    
    console.log('Email:', email);
    console.log('Password:', password);

    // Test için basit kontrol
    if (email === "admin@example.com" && password === "admin123") {
        console.log('Test credentials matched');
        localStorage.setItem('adminToken', 'test-admin-token');
        window.location.href = 'admin-dashboard.html';
        return;
    }

    // API ile giriş denemesi
    fetch('http://localhost:5000/api/auth/admin/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Login failed');
    })
    .then(data => {
        console.log('Login successful');
        localStorage.setItem('adminToken', data.token);
        window.location.href = 'admin-dashboard.html';
    })
    .catch(error => {
        console.error('Login error:', error);
        showNotification('Giriş yapılırken bir hata oluştu', 'error');
    });
}

// Admin girişini kontrol et
function checkAdminAuth() {
    const adminToken = localStorage.getItem('adminToken');
    const currentPath = window.location.pathname;
    
    if (adminToken && currentPath.includes('admin.html')) {
        window.location.href = 'admin-dashboard.html';
    } else if (!adminToken && currentPath.includes('admin-dashboard.html')) {
        window.location.href = 'admin.html';
    }
}

// Admin çıkış işlemi
function handleAdminLogout() {
    localStorage.removeItem('adminToken');
    window.location.href = 'admin.html';
}

// Yardımcı fonksiyonlar
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 3 saniye sonra bildirimi kaldır
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Admin dashboard başlatma
function initializeAdminDashboard() {
    // Menü işlemleri
    const menuItems = document.querySelectorAll('.admin-nav a[data-section]');
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = item.getAttribute('data-section');
            switchSection(sectionId);
        });
    });

    // İlk yükleme
    loadPlaces();
    loadComments();
    loadUsers();
}

// Bölüm değiştirme
function switchSection(sectionId) {
    // Aktif menü öğesini güncelle
    document.querySelectorAll('.admin-nav li').forEach(li => {
        li.classList.remove('active');
    });
    document.querySelector(`.admin-nav a[data-section="${sectionId}"]`).parentElement.classList.add('active');

    // Bölümleri gizle/göster
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${sectionId}-section`).classList.add('active');

    // Bölüme göre verileri yükle
    if (sectionId === 'comments') {
        loadComments();
    } else if (sectionId === 'users') {
        loadUsers();
    }
}

// Yorumları yükle
function loadComments() {
    // window.comments'ten yorumları al ve filtrele
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    const searchTerm = document.getElementById('searchComments')?.value.toLowerCase() || '';

    let filteredComments = window.comments || [];

    // Durum filtrelemesi
    if (statusFilter !== 'all') {
        filteredComments = filteredComments.filter(comment => comment.status === statusFilter);
    }

    // Arama filtrelemesi
    if (searchTerm) {
        filteredComments = filteredComments.filter(comment => 
            comment.content.toLowerCase().includes(searchTerm) ||
            comment.user.name.toLowerCase().includes(searchTerm) ||
            comment.place_name.toLowerCase().includes(searchTerm)
        );
    }

    displayComments(filteredComments);
}

// Yorumları görüntüle
function displayComments(comments) {
    const tbody = document.getElementById('commentsTableBody');
    if (!tbody) return;

    tbody.innerHTML = comments.map(comment => `
        <tr data-comment-id="${comment.id}">
            <td>
                <div class="user-info">
                    <div class="user-avatar">${comment.user.avatar}</div>
                    <span class="user-email">${comment.user.email}</span>
                </div>
            </td>
            <td>${comment.place_name}</td>
            <td>${comment.content}</td>
            <td>${new Date(comment.date).toLocaleDateString('tr-TR')}</td>
            <td>
                <span class="status status-${comment.status}">
                    ${getStatusText(comment.status)}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    ${getActionButtons(comment)}
                </div>
            </td>
        </tr>
    `).join('');

    // Aksiyon butonları için event listener'ları ekle
    addActionListeners();
}

// Durum metnini getir
function getStatusText(status) {
    switch (status) {
        case 'approved': return 'Onaylı';
        case 'banned': return 'Yasaklı';
        default: return status;
    }
}

// Aksiyon butonlarını getir
function getActionButtons(comment) {
    if (comment.status === 'approved') {
        return `
            <button class="action-btn reject-btn" onclick="banComment(${comment.id})">
                <i class="fas fa-ban"></i> Yasakla
            </button>
        `;
    } else if (comment.status === 'banned') {
        return `
            <button class="action-btn approve-btn" onclick="approveComment(${comment.id})">
                <i class="fas fa-check"></i> Yasağı Kaldır
            </button>
            <button class="action-btn delete-btn" onclick="deleteComment(${comment.id})">
                <i class="fas fa-trash"></i> Sil
            </button>
        `;
    }
}

// Aksiyon listener'ları ekle
function addActionListeners() {
    // Yasaklama işlemi
    document.querySelectorAll('.reject-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const commentId = parseInt(e.target.closest('tr').dataset.commentId);
            banComment(commentId);
        });
    });

    // Yasak kaldırma işlemi
    document.querySelectorAll('.approve-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const commentId = parseInt(e.target.closest('tr').dataset.commentId);
            approveComment(commentId);
        });
    });

    // Silme işlemi
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const commentId = parseInt(e.target.closest('tr').dataset.commentId);
            deleteComment(commentId);
        });
    });
}

// Yorum aksiyonları
function approveComment(commentId) {
    const comment = window.comments.find(c => c.id === commentId);
    if (comment) {
        comment.status = 'approved';
        showNotification('Yorum yasağı kaldırıldı');
        loadComments();
    }
}

function banComment(commentId) {
    const comment = window.comments.find(c => c.id === commentId);
    if (comment) {
        comment.status = 'banned';
        comment.content = 'Uygunsuz içerik nedeniyle yasaklandı.';
        showNotification('Yorum yasaklandı');
        loadComments();
    }
}

function deleteComment(commentId) {
    if (confirm('Bu yorumu silmek istediğinizden emin misiniz?')) {
        const index = window.comments.findIndex(c => c.id === commentId);
        if (index !== -1) {
            window.comments.splice(index, 1);
            showNotification('Yorum başarıyla silindi');
            loadComments();
        }
    }
}

// Yorumları filtrele
function filterComments() {
    loadComments(); // Filtreleme loadComments içinde yapılıyor
}

// Kullanıcıları yükle
function loadUsers() {
    // window.users'dan kullanıcıları al ve filtrele
    const statusFilter = document.getElementById('userStatusFilter')?.value || 'all';
    const searchTerm = document.getElementById('searchUsers')?.value.toLowerCase() || '';

    let filteredUsers = window.users || [];

    // Durum filtrelemesi
    if (statusFilter !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.status === statusFilter);
    }

    // Arama filtrelemesi
    if (searchTerm) {
        filteredUsers = filteredUsers.filter(user => 
            user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
        );
    }

    displayUsers(filteredUsers);
}

// Kullanıcıları görüntüle
function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    tbody.innerHTML = users.map(user => `
        <tr data-user-id="${user.id}">
            <td>
                <div class="user-info">
                    <div class="user-avatar">${user.avatar}</div>
                    <span class="user-email">${user.email}</span>
                </div>
            </td>
            <td>${new Date(user.registerDate).toLocaleDateString('tr-TR')}</td>
            <td>${user.commentCount}</td>
            <td>
                <span class="status status-${user.status}">
                    ${getUserStatusText(user.status)}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    ${getUserActionButtons(user)}
                </div>
            </td>
        </tr>
    `).join('');

    // Aksiyon butonları için event listener'ları ekle
    addUserActionListeners();
}

// Kullanıcı durum metnini getir
function getUserStatusText(status) {
    switch (status) {
        case 'active': return 'Aktif';
        case 'banned': return 'Yasaklı';
        default: return status;
    }
}

// Kullanıcı aksiyon butonlarını getir
function getUserActionButtons(user) {
    if (user.status === 'active') {
        return `
            <button class="action-btn reject-btn" onclick="banUser(${user.id})">
                <i class="fas fa-ban"></i> Yasakla
            </button>
        `;
    } else if (user.status === 'banned') {
        return `
            <button class="action-btn approve-btn" onclick="activateUser(${user.id})">
                <i class="fas fa-check"></i> Yasağı Kaldır
            </button>
            <button class="action-btn delete-btn" onclick="deleteUser(${user.id})">
                <i class="fas fa-trash"></i> Sil
            </button>
        `;
    }
}

// Kullanıcı aksiyon listener'ları ekle
function addUserActionListeners() {
    // Yasaklama işlemi
    document.querySelectorAll('.reject-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const userId = parseInt(e.target.closest('tr').dataset.userId);
            banUser(userId);
        });
    });

    // Yasak kaldırma işlemi
    document.querySelectorAll('.approve-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const userId = parseInt(e.target.closest('tr').dataset.userId);
            activateUser(userId);
        });
    });

    // Silme işlemi
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const userId = parseInt(e.target.closest('tr').dataset.userId);
            deleteUser(userId);
        });
    });
}

// Kullanıcı aksiyonları
function activateUser(userId) {
    const user = window.users.find(u => u.id === userId);
    if (user) {
        user.status = 'active';
        showNotification('Kullanıcı yasağı kaldırıldı');
        loadUsers();
    }
}

function banUser(userId) {
    const user = window.users.find(u => u.id === userId);
    if (user) {
        user.status = 'banned';
        showNotification('Kullanıcı yasaklandı');
        loadUsers();
    }
}

function deleteUser(userId) {
    if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
        const index = window.users.findIndex(u => u.id === userId);
        if (index !== -1) {
            window.users.splice(index, 1);
            showNotification('Kullanıcı başarıyla silindi');
            loadUsers();
        }
    }
}

// Kullanıcıları filtrele
function filterUsers() {
    loadUsers(); // Filtreleme loadUsers içinde yapılıyor
}

// Mekan Yönetimi Fonksiyonları

// Mekanları yükle
async function loadPlaces() {
    try {
        const response = await fetch('http://localhost:3000/api/places');
        window.adminData.places = await response.json();
        displayPlaces();
    } catch (error) {
        console.error('Mekanlar yüklenirken hata:', error);
        showNotification('Mekanlar yüklenirken bir hata oluştu', 'error');
    }
}

// Mekanları tabloda göster
function displayPlaces(filteredPlaces = null) {
    const placesTableBody = document.getElementById('placesTableBody');
    const displayData = filteredPlaces || window.adminData.places;
    
    if (!placesTableBody) return;

    placesTableBody.innerHTML = displayData.map(place => `
        <tr>
            <td>${place.name}</td>
            <td>${translatePlaceType(place.type)}</td>
            <td>${place.location}</td>
            <td>${place.rating || 0}</td>
            <td>${place.status === 'active' ? 'Aktif' : 'Pasif'}</td>
            <td>
                <button onclick="editPlace('${place._id}')" class="action-btn edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deletePlace('${place._id}')" class="action-btn delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Kategori çevirisi
function translatePlaceType(type) {
    const types = {
        'restaurant': 'Restoran',
        'historical': 'Tarihi Mekan',
        'nature': 'Doğal Güzellik',
        'museum': 'Müze'
    };
    return types[type] || type;
}

// Modal işlemleri
function openAddPlaceModal() {
    window.adminData.editingPlaceId = null;
    document.getElementById('modalTitle').textContent = 'Yeni Mekan Ekle';
    document.getElementById('placeForm').reset();
    document.getElementById('placeModal').style.display = 'block';
}

function openEditPlaceModal(place) {
    window.adminData.editingPlaceId = place._id;
    document.getElementById('modalTitle').textContent = 'Mekan Düzenle';
    
    document.getElementById('placeName').value = place.name;
    document.getElementById('placeType').value = place.type;
    document.getElementById('placeLocation').value = place.location;
    document.getElementById('placeDescription').value = place.description;
    
    document.getElementById('placeModal').style.display = 'block';
}

function closePlaceModal() {
    document.getElementById('placeModal').style.display = 'none';
    document.getElementById('placeForm').reset();
    window.adminData.editingPlaceId = null;
}

// Mekan düzenleme
async function editPlace(placeId) {
    try {
        const response = await fetch(`http://localhost:3000/api/places/${placeId}`);
        const place = await response.json();
        openEditPlaceModal(place);
    } catch (error) {
        console.error('Mekan bilgileri alınırken hata:', error);
        showNotification('Mekan bilgileri alınamadı', 'error');
    }
}

// Mekan silme
async function deletePlace(placeId) {
    if (!confirm('Bu mekanı silmek istediğinizden emin misiniz?')) return;

    try {
        await fetch(`http://localhost:3000/api/places/${placeId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        showNotification('Mekan başarıyla silindi', 'success');
        loadPlaces();
    } catch (error) {
        console.error('Mekan silinirken hata:', error);
        showNotification('Mekan silinirken bir hata oluştu', 'error');
    }
}

// Form gönderimi
document.getElementById('placeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', document.getElementById('placeName').value);
    formData.append('type', document.getElementById('placeType').value);
    formData.append('location', document.getElementById('placeLocation').value);
    formData.append('description', document.getElementById('placeDescription').value);
    
    const imageFiles = document.getElementById('placeImages').files;
    for (let i = 0; i < imageFiles.length; i++) {
        formData.append('images', imageFiles[i]);
    }

    try {
        const url = window.adminData.editingPlaceId 
            ? `http://localhost:3000/api/places/${window.adminData.editingPlaceId}`
            : 'http://localhost:3000/api/places';
            
        const method = window.adminData.editingPlaceId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: formData
        });

        if (response.ok) {
            showNotification(
                window.adminData.editingPlaceId ? 'Mekan başarıyla güncellendi' : 'Mekan başarıyla eklendi',
                'success'
            );
            closePlaceModal();
            loadPlaces();
        } else {
            throw new Error('İşlem başarısız');
        }
    } catch (error) {
        console.error('Mekan kaydedilirken hata:', error);
        showNotification('Mekan kaydedilirken bir hata oluştu', 'error');
    }
});

// Arama ve filtreleme
document.getElementById('searchPlaces').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const typeFilter = document.getElementById('placeTypeFilter').value;
    
    const filteredPlaces = window.adminData.places.filter(place => {
        const matchesSearch = place.name.toLowerCase().includes(searchTerm) ||
                            place.location.toLowerCase().includes(searchTerm);
        const matchesType = typeFilter === 'all' || place.type === typeFilter;
        
        return matchesSearch && matchesType;
    });
    
    displayPlaces(filteredPlaces);
});

document.getElementById('placeTypeFilter').addEventListener('change', (e) => {
    const typeFilter = e.target.value;
    const searchTerm = document.getElementById('searchPlaces').value.toLowerCase();
    
    const filteredPlaces = window.adminData.places.filter(place => {
        const matchesSearch = place.name.toLowerCase().includes(searchTerm) ||
                            place.location.toLowerCase().includes(searchTerm);
        const matchesType = typeFilter === 'all' || place.type === typeFilter;
        
        return matchesSearch && matchesType;
    });
    
    displayPlaces(filteredPlaces);
});

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    // Admin giriş formunu kontrol et
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        console.log('Admin login form found');
        adminLoginForm.addEventListener('submit', handleAdminLogin);
        console.log('Admin login form event listener added');
    } else {
        console.log('Admin login form not found');
    }

    // Auth kontrolü
    checkAdminAuth();

    // Admin dashboard sayfasındaysak
    if (window.location.pathname.includes('admin-dashboard.html')) {
        console.log('Initializing admin dashboard');
        initializeAdminDashboard();
    }
}); 