// Admin giriş işlemleri
document.addEventListener('DOMContentLoaded', async function() {
    const adminLoginForm = document.getElementById('adminLoginForm');
    const currentPath = window.location.pathname;
    const isLoginPage = currentPath.endsWith('admin.html');
    const isDashboardPage = currentPath.endsWith('admin-dashboard.html');
    
    try {
        if (isDashboardPage) {
            // Dashboard sayfasındayız
            const token = localStorage.getItem('token');
            const userRole = localStorage.getItem('userRole');
            
            if (!token || userRole !== 'admin') {
                // Yetkisiz erişim, login sayfasına yönlendir
                throw new Error('Yetkisiz erişim');
            }
            
            // Yetkili kullanıcı, dashboard'ı başlat
            await loadPlaces(); // Önce verileri yükle
            await initializeAdminDashboard();
        } else if (isLoginPage) {
            // Login sayfasındayız
            const token = localStorage.getItem('token');
            const userRole = localStorage.getItem('userRole');
            
            if (token && userRole === 'admin') {
                // Zaten giriş yapılmış, dashboard'a yönlendir
                window.location.replace('admin-dashboard.html');
                return;
            }
            
            // Login formunu dinle
            if (adminLoginForm) {
                adminLoginForm.addEventListener('submit', handleAdminLogin);
            }
        }
    } catch (error) {
        console.error('Yetki kontrolü hatası:', error);
        // Hata durumunda login sayfasına yönlendir
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        window.location.replace('admin.html');
    }
});

// Admin girişini kontrol et
function checkAdminAuth() {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    // Token veya rol yoksa false döndür
    if (!token || !userRole) {
        return false;
    }
    
    // Admin rolü kontrolü
    return userRole === 'admin';
}

// Admin giriş işlemi
async function handleAdminLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        console.log('Login response:', data); // Debug log

        if (response.ok) {
            if (data.user && data.user.role === 'admin') {
                // Admin girişi başarılı
                localStorage.setItem('token', data.token);
                localStorage.setItem('userRole', data.user.role);
                localStorage.setItem('userId', data.user._id);
                console.log('Admin girişi başarılı, yönlendiriliyor...'); // Debug log
                window.location.replace('admin-dashboard.html');
            } else {
                // Kullanıcı admin değil
                showNotification('Admin yetkisine sahip değilsiniz', 'error');
                console.log('User role:', data.user?.role); // Debug log
            }
        } else {
            // Giriş başarısız
            showNotification(data.message || 'Giriş başarısız', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Bir hata oluştu: ' + error.message, 'error');
    }
}

// Admin çıkış işlemi
async function handleAdminLogout() {
    try {
        // Local storage'ı temizle
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');

        // Login sayfasına yönlendir
        window.location.href = 'admin.html';
    } catch (error) {
        console.error('Çıkış hatası:', error);
        showNotification('Çıkış yapılırken hata oluştu: ' + error.message, 'error');
    }
}

// Yardımcı fonksiyonlar
function showNotification(message, type = 'info') {
    // Varsa eski bildirimi kaldır
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Yeni bildirim oluştur
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Bildirimi sayfaya ekle
    document.body.appendChild(notification);

    // 3 saniye sonra bildirimi kaldır
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Admin dashboard başlatma
async function initializeAdminDashboard() {
    try {
        // Aktif sekmeyi ayarla
        setActiveSection('places');
        
        // Verileri yükle
        await loadPlaces();
        loadComments();
        loadUsers();

        // Sekme değiştirme olaylarını dinle
        document.querySelectorAll('.admin-nav a[data-section]').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const section = this.getAttribute('data-section');
                setActiveSection(section);
            });
        });

        // Modal kapatma olaylarını dinle
        document.querySelector('.close')?.addEventListener('click', closePlaceModal);
        document.querySelector('.cancel-button')?.addEventListener('click', closePlaceModal);
        
        // Modal dışına tıklandığında kapatma
        const modal = document.getElementById('placeModal');
        if (modal) {
            window.onclick = function(event) {
                if (event.target === modal) {
                    closePlaceModal();
                }
            };
        }

        // ESC tuşu ile kapatma
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                closePlaceModal();
            }
        });

        // Arama ve filtreleme olaylarını dinle
        document.getElementById('searchPlaces')?.addEventListener('input', filterPlaces);
        document.getElementById('categoryFilter')?.addEventListener('change', filterPlaces);
        document.getElementById('searchComments')?.addEventListener('input', filterComments);
        document.getElementById('statusFilter')?.addEventListener('change', filterComments);
        document.getElementById('searchUsers')?.addEventListener('input', filterUsers);
        document.getElementById('userStatusFilter')?.addEventListener('change', filterUsers);

        // Form submit olayını dinle
        document.getElementById('placeForm')?.addEventListener('submit', handlePlaceSubmit);

        // Çalışma saatleri select değişikliklerini dinle
        document.querySelectorAll('.schedule-select').forEach(select => {
            select.addEventListener('change', function() {
                const customHours = this.nextElementSibling;
                if (customHours) {
                    customHours.style.display = this.value === 'Özel saat' ? 'block' : 'none';
                }
            });
        });
    } catch (error) {
        console.error('Dashboard başlatma hatası:', error);
        showNotification('Hata oluştu: ' + error.message, 'error');
        window.location.replace('admin.html');
    }
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

// Modal işlemleri
function openAddPlaceModal() {
    const modal = document.getElementById('placeModal');
    const modalTitle = document.getElementById('modalTitle');
    const placeForm = document.getElementById('placeForm');
    
    if (modal && modalTitle && placeForm) {
        modalTitle.textContent = 'Yeni Mekan Ekle';
        placeForm.reset();
        modal.style.display = 'block';
    }
}

function closePlaceModal() {
    const modal = document.getElementById('placeModal');
    const form = document.getElementById('placeForm');
    
    if (modal) {
        modal.style.display = 'none';
        if (form) {
            form.reset();
            form.removeAttribute('data-place-id');
        }
    }
}

async function openEditPlaceModal(placeId) {
    const modal = document.getElementById('placeModal');
    const modalTitle = document.getElementById('modalTitle');
    
    if (!modal || !modalTitle) return;
    
    modalTitle.textContent = 'Mekan Düzenle';
    
    try {
        const response = await fetch(`http://localhost:5000/api/places/${placeId}`);
        if (!response.ok) {
            throw new Error('Mekan bilgileri alınamadı');
        }
        
        const place = await response.json();
        
        // Form elemanlarını güvenli bir şekilde doldur
        const elements = {
            'placeName': place.name || '',
            'placeCategory': place.category || 'other',
            'placeCity': place.city_name || '',
            'placeAddress': place.address || '',
            'placeDescription': place.description || '',
            'placeWebsite': place.website || '',
            'placePhone': place.phone_number || '',
            'placeImages': place.images?.join('\n') || '',
            'placeMapLink': place.map_link || ''
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.value = value;
            }
        });

        // Çalışma saatlerini doldur
        const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
        const openingHours = place.opening_hours || Array(7).fill('24 saat açık');

        days.forEach((day, index) => {
            const select = document.getElementById(`openingHours${day}`);
            if (select) {
                const hourText = openingHours[index] || '24 saat açık';
                if (hourText.includes('24 saat açık')) {
                    select.value = '24 saat açık';
                } else if (hourText.includes('Kapalı')) {
                    select.value = 'Kapalı';
                } else {
                    select.value = 'Özel saat';
                    const customHours = select.nextElementSibling;
                    if (customHours) {
                        const [start, end] = hourText.split(' - ');
                        customHours.querySelector('.start-time').value = start;
                        customHours.querySelector('.end-time').value = end;
                        customHours.style.display = 'block';
                    }
                }
            }
        });
        
        // Form'a mekan ID'sini ekle
        const form = document.getElementById('placeForm');
        if (form) {
            form.setAttribute('data-place-id', placeId);
        }
        
        modal.style.display = 'block';
    } catch (error) {
        console.error('Mekan düzenleme hatası:', error);
        showNotification('Hata oluştu: ' + error.message, 'error');
    }
}

// Mekan işlemleri
async function handlePlaceSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const placeId = form.getAttribute('data-place-id');
    
    // Çalışma saatlerini topla
    const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    const openingHours = days.map(day => {
        const select = document.getElementById(`openingHours${day}`);
        if (select) {
            const selectedValue = select.value;
            if (selectedValue === 'Özel saat') {
                const customHours = select.nextElementSibling;
                const startTime = customHours.querySelector('.start-time').value;
                const endTime = customHours.querySelector('.end-time').value;
                return `${day}: ${startTime} - ${endTime}`;
            }
            return `${day}: ${selectedValue}`;
        }
        return `${day}: 24 saat açık`;
    });
    
    const placeData = {
        name: document.getElementById('placeName').value,
        category: document.getElementById('placeCategory').value,
        city_name: document.getElementById('placeCity').value,
        address: document.getElementById('placeAddress').value,
        description: document.getElementById('placeDescription').value,
        website: document.getElementById('placeWebsite').value,
        phone_number: document.getElementById('placePhone').value,
        opening_hours: openingHours,
        images: document.getElementById('placeImages').value.split('\n').filter(Boolean) || [],
        map_link: document.getElementById('placeMapLink').value || ''
    };

    try {
        // Token'ı doğrula
        await validateAdminToken();
        const token = localStorage.getItem('token');

        const url = placeId 
            ? `http://localhost:5000/api/places/${placeId}`
            : 'http://localhost:5000/api/places';
        
        const method = placeId ? 'PUT' : 'POST';
        
        console.log('Gönderilen veri:', placeData); // Debug log
        console.log('URL:', url); // Debug log
        console.log('Method:', method); // Debug log
        console.log('Token:', token); // Debug log

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(placeData)
        });

        const responseData = await response.json();
        console.log('Sunucu yanıtı:', responseData); // Debug log

        if (!response.ok) {
            if (response.status === 401) {
                // Token geçersiz, yeniden doğrulama yap
                await validateAdminToken();
                throw new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
            }
            throw new Error(responseData.message || 'İşlem başarısız');
        }

        // İşlem başarılı olduğunda
        showNotification(placeId ? 'Mekan güncellendi' : 'Yeni mekan eklendi', 'success');
        
        // Modal'ı kapat ve tabloyu yenile
        setTimeout(async () => {
            closePlaceModal();
            await loadPlaces();
        }, 1000);
    } catch (error) {
        console.error('Mekan işlemi hatası:', error);
        if (error.message.includes('Token') || error.message.includes('Oturum') || error.message.includes('yetki')) {
            showNotification(error.message, 'error');
            setTimeout(() => {
                window.location.replace('admin.html');
            }, 2000);
        } else {
            showNotification('Hata oluştu: ' + error.message, 'error');
        }
    }
}

async function deletePlace(placeId) {
    if (confirm('Bu mekanı silmek istediğinizden emin misiniz?')) {
        try {
            const response = await fetch(`http://localhost:5000/api/places/${placeId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Silme işlemi başarısız');
            }

            await loadPlaces(); // Tabloyu yenile
            showNotification('Mekan başarıyla silindi', 'success');
        } catch (error) {
            console.error('Mekan silme hatası:', error);
            showNotification('Hata oluştu: ' + error.message, 'error');
        }
    }
}

// Veri yükleme fonksiyonları
async function loadPlaces() {
    try {
        const tbody = document.getElementById('placesTableBody');
        if (!tbody) {
            console.error('placesTableBody elementi bulunamadı');
            return;
        }

        const response = await fetch('http://localhost:5000/api/places');
        if (!response.ok) {
            throw new Error('Mekanlar yüklenirken bir hata oluştu');
        }
        const data = await response.json();
        const places = Array.isArray(data) ? data : data.places || [];
        
        tbody.innerHTML = '';
        
        if (places.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="6" class="text-center">Henüz mekan bulunmamaktadır.</td>';
            tbody.appendChild(row);
            return;
        }
        
        places.forEach(place => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="place-name-cell">
                    ${place.name || '-'}
                </td>
                <td class="category-cell">
                    <span class="category-badge ${place.category || 'other'}">${getCategoryName(place.category) || '-'}</span>
                </td>
                <td class="city-cell">
                    ${place.city_name || '-'}
                </td>
                <td class="address-cell">
                    ${place.address || '-'}
                </td>
                <td class="rating-cell">
                    <div class="rating">
                        <i class="fas fa-star"></i>
                        <span>${place.rating ? place.rating.toFixed(1) : '-'}</span>
                    </div>
                </td>
                <td class="actions-cell">
                    <button onclick="openEditPlaceModal('${place._id}')" class="edit-button" title="Düzenle">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deletePlace('${place._id}')" class="delete-button" title="Sil">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Mekanlar yüklenirken hata:', error);
        showNotification('Mekanlar yüklenirken hata oluştu: ' + error.message, 'error');
    }
}

// Yardımcı fonksiyonlar
function getCategoryName(category) {
    const categories = {
        'historical': 'Tarihi',
        'nature': 'Doğal',
        'cultural': 'Kültürel',
        'other': 'Diğer'
    };
    return categories[category] || category;
}

function setActiveSection(sectionId) {
    // Önce element var mı kontrol et
    const section = document.getElementById(`${sectionId}-section`);
    const menuItem = document.querySelector(`.admin-nav a[data-section="${sectionId}"]`);
    
    if (!section || !menuItem) {
        console.log('Section veya menu item bulunamadı:', sectionId);
        return;
    }

    // Tüm sekmeleri gizle
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Seçili sekmeyi göster
    section.classList.add('active');
    
    // Menüdeki aktif sekmeyi güncelle
    document.querySelectorAll('.admin-nav li').forEach(li => {
        li.classList.remove('active');
    });
    menuItem.parentElement.classList.add('active');
}

function filterPlaces() {
    const searchText = document.getElementById('searchPlaces').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    
    const rows = document.getElementById('placesTableBody').getElementsByTagName('tr');
    
    Array.from(rows).forEach(row => {
        const name = row.cells[0].textContent.toLowerCase();
        const rowCategory = row.cells[1].textContent.toLowerCase();
        
        const matchesSearch = name.includes(searchText);
        const matchesCategory = category === 'all' || rowCategory === getCategoryName(category).toLowerCase();
        
        row.style.display = matchesSearch && matchesCategory ? '' : 'none';
    });
}

function showNotification(message, type = 'success') {
    // Bildirim gösterme mantığını burada uygula
    alert(message);
}

// Kategori badge'leri için stil ekle
const style = document.createElement('style');
style.textContent = `
    .admin-section table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0 8px;
        margin-top: 20px;
    }

    .admin-section th {
        color: #666;
        font-weight: 600;
        padding: 12px 15px;
        text-align: left;
        background: transparent;
        border: none;
    }

    .admin-section td {
        background: white;
        padding: 15px;
        border: none;
        margin-bottom: 8px;
    }

    .admin-section tr td:first-child {
        border-top-left-radius: 8px;
        border-bottom-left-radius: 8px;
    }

    .admin-section tr td:last-child {
        border-top-right-radius: 8px;
        border-bottom-right-radius: 8px;
    }

    .admin-section tr {
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        transition: transform 0.2s;
    }

    .admin-section tr:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .place-name-cell {
        color: #333;
        font-weight: 500;
    }

    .category-badge {
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 0.85em;
        font-weight: 500;
        display: inline-block;
    }

    .category-badge.historical {
        background-color: #FFF3E0;
        color: #E65100;
    }

    .category-badge.nature {
        background-color: #E8F5E9;
        color: #2E7D32;
    }

    .category-badge.cultural {
        background-color: #F3E5F5;
        color: #6A1B9A;
    }

    .category-badge.other {
        background-color: #ECEFF1;
        color: #37474F;
    }

    .city-cell, .address-cell {
        color: #666;
    }

    .rating-cell {
        text-align: center;
    }

    .rating i {
        color: #FFC107;
        margin-right: 2px;
    }

    .rating span {
        font-weight: 500;
        color: #555;
    }

    .actions-cell {
        text-align: right;
    }

    .edit-button, .delete-button {
        padding: 8px 12px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9em;
        transition: all 0.2s;
        margin-left: 8px;
    }

    .edit-button {
        background-color: #E3F2FD;
        color: #1976D2;
    }

    .edit-button:hover {
        background-color: #1976D2;
        color: white;
    }

    .delete-button {
        background-color: #FFEBEE;
        color: #D32F2F;
    }

    .delete-button:hover {
        background-color: #D32F2F;
        color: white;
    }

    /* Filtre ve arama alanları */
    .filters {
        display: flex;
        gap: 15px;
        margin-bottom: 20px;
    }

    .filters select, .filters input {
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 0.9em;
    }

    .filters select:focus, .filters input:focus {
        outline: none;
        border-color: #2196F3;
    }

    /* Yeni Mekan Ekle butonu */
    .add-button {
        background-color: #4CAF50;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        transition: background-color 0.2s;
    }

    .add-button:hover {
        background-color: #43A047;
    }

    /* Modal tasarımı */
    .modal {
        background-color: rgba(0, 0, 0, 0.5);
    }

    .modal-content {
        background: white;
        border-radius: 8px;
        padding: 20px;
        max-width: 500px;
        margin: 50px auto;
    }

    .modal-header {
        margin-bottom: 20px;
    }

    .modal-header h2 {
        color: #333;
        margin: 0;
    }

    .form-group {
        margin-bottom: 15px;
    }

    .form-group label {
        display: block;
        margin-bottom: 5px;
        color: #666;
    }

    .form-group input, .form-group select, .form-group textarea {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 0.9em;
    }

    .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
        outline: none;
        border-color: #2196F3;
    }

    .modal-footer {
        margin-top: 20px;
        text-align: right;
    }

    .modal-footer button {
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        margin-left: 10px;
    }

    .save-button {
        background-color: #4CAF50;
        color: white;
    }

    .save-button:hover {
        background-color: #43A047;
    }

    .cancel-button {
        background-color: #f5f5f5;
        color: #666;
    }

    .cancel-button:hover {
        background-color: #e0e0e0;
    }

    /* Responsive tasarım */
    @media (max-width: 768px) {
        .filters {
            flex-direction: column;
        }

        .admin-section td {
            padding: 12px 10px;
        }

        .address-cell {
            max-width: 150px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }
`;
document.head.appendChild(style); 

// Admin token'ını doğrula
async function validateAdminToken() {
    try {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');

        if (!token || !userRole) {
            throw new Error('Token veya rol bulunamadı');
        }

        if (userRole !== 'admin') {
            throw new Error('Admin yetkisine sahip değilsiniz');
        }

        // Token'ın geçerliliğini kontrol et
        const response = await fetch('http://localhost:5000/api/places', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Token geçersiz');
        }

        return true;
    } catch (error) {
        console.error('Token doğrulama hatası:', error);
        // Token geçersizse çıkış yap
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        window.location.replace('admin.html');
        throw error;
    }
} 