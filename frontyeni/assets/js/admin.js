// Admin giriş işlemleri
document.addEventListener('DOMContentLoaded', function() {
    const adminLoginForm = document.getElementById('adminLoginForm');
    
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    } else {
        // Admin dashboard sayfasındayız
        initializeAdminDashboard();
    }

    // Eğer zaten giriş yapılmışsa yönlendir
    checkAdminAuth();
});

// Admin girişini kontrol et
function checkAdminAuth() {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken && window.location.pathname.endsWith('admin.html')) {
        window.location.href = 'admin-dashboard.html';
    } else if (!adminToken && !window.location.pathname.endsWith('admin.html')) {
        window.location.href = 'admin.html';
    }
}

// Admin giriş işlemi
async function handleAdminLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    // Test için basit bir kontrol (gerçek uygulamada API'ye istek atılmalı)
    if (email === 'admin@example.com' && password === 'admin123') {
        // Giriş başarılı
        localStorage.setItem('adminToken', 'test-admin-token');
        window.location.href = 'admin-dashboard.html';
    } else {
        // Giriş başarısız
        alert('Hatalı e-posta veya şifre!');
    }
}

// Admin çıkış işlemi
function handleAdminLogout() {
    localStorage.removeItem('adminToken');
    window.location.href = 'admin.html';
}

// Yardımcı fonksiyonlar
function showNotification(message, type = 'info') {
    alert(message); // Şimdilik basit bir alert
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

    // Yorum filtreleme işlemleri
    const statusFilter = document.getElementById('statusFilter');
    const searchInput = document.getElementById('searchComments');

    if (statusFilter) {
        statusFilter.addEventListener('change', filterComments);
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterComments);
    }

    // Kullanıcı filtreleme işlemleri
    const userStatusFilter = document.getElementById('userStatusFilter');
    const searchUsers = document.getElementById('searchUsers');

    if (userStatusFilter) {
        userStatusFilter.addEventListener('change', filterUsers);
    }

    if (searchUsers) {
        searchUsers.addEventListener('input', filterUsers);
    }

    // İlk yükleme - sadece yorumlar bölümünü göster
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById('comments-section').classList.add('active');
    loadComments();
    loadUsers(); // Verileri yükle ama gösterme
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