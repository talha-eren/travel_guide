// Sayfa yüklendiğinde çalışacak
document.addEventListener('DOMContentLoaded', () => {
    initProfile();
    loadUserData();
    initTabNavigation();
    loadFavorites();
    loadComments();

    // URL'den tab parametresini al ve ilgili sekmeyi aç
    const urlParams = new URLSearchParams(window.location.search);
    const activeTab = urlParams.get('tab');
    if (activeTab) {
        const tabElement = document.querySelector(`.profile-nav li[data-tab="${activeTab}"]`);
        if (tabElement) {
            tabElement.click();
        }
    }
});

// Profil başlatma
function initProfile() {
    // Form submit olaylarını dinle
    document.getElementById('profileForm')?.addEventListener('submit', handleProfileUpdate);
    document.getElementById('passwordForm')?.addEventListener('submit', handlePasswordUpdate);

    // Şifre gücü kontrolü
    const newPasswordInput = document.getElementById('newPassword');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', checkPasswordStrength);
    }
}

// Tab navigasyonu
function initTabNavigation() {
    const tabItems = document.querySelectorAll('.profile-nav li');
    const sections = document.querySelectorAll('.profile-section');

    tabItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetTab = item.getAttribute('data-tab');

            // Aktif tab'ı güncelle
            tabItems.forEach(tab => tab.classList.remove('active'));
            item.classList.add('active');

            // İlgili bölümü göster
            sections.forEach(section => {
                if (section.id === targetTab) {
                    section.classList.add('active');
                } else {
                    section.classList.remove('active');
                }
            });
        });
    });
}

// Kullanıcı verilerini yükle
function loadUserData() {
    // localStorage'dan kullanıcı bilgilerini al
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = '/login.html';
        return;
    }

    // Profil bilgilerini doldur
    document.querySelector('.avatar-text').textContent = getInitials(user.name);
    document.querySelector('.profile-name').textContent = user.name;
    document.querySelector('.profile-email').textContent = user.email;

    // Form alanlarını doldur
    document.getElementById('fullName').value = user.name;
    document.getElementById('email').value = user.email;
    document.getElementById('phone').value = user.phone || '';

    // E-posta doğrulama durumunu güncelle
    updateEmailVerificationStatus(user.isVerified);
}

// Profil güncelleme
async function handleProfileUpdate(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value
    };

    try {
        // Test için localStorage'a kaydet
        const user = JSON.parse(localStorage.getItem('currentUser'));
        const updatedUser = { ...user, ...formData };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));

        showNotification('Profil bilgileriniz güncellendi', 'success');
        loadUserData(); // Sayfayı yenile
    } catch (error) {
        console.error('Profil güncelleme hatası:', error);
        showNotification('Profil güncellenirken bir hata oluştu', 'error');
    }
}

// Şifre güncelleme
async function handlePasswordUpdate(e) {
    e.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Şifre kontrolü
    if (newPassword !== confirmPassword) {
        showNotification('Yeni şifreler eşleşmiyor', 'error');
        return;
    }

    try {
        // Test için
        showNotification('Şifreniz başarıyla güncellendi', 'success');
        document.getElementById('passwordForm').reset();
    } catch (error) {
        console.error('Şifre güncelleme hatası:', error);
        showNotification('Şifre güncellenirken bir hata oluştu', 'error');
    }
}

// Şifre gücü kontrolü
function checkPasswordStrength(e) {
    const password = e.target.value;
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');

    // Şifre gücü kriterleri
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    let strength = 0;
    if (hasLower) strength++;
    if (hasUpper) strength++;
    if (hasNumber) strength++;
    if (hasSpecial) strength++;
    if (isLongEnough) strength++;

    // Görsel güncelleme
    const colors = ['#ff4444', '#ffbb33', '#00C851', '#007E33'];
    const texts = ['Zayıf', 'Orta', 'İyi', 'Güçlü'];
    const index = Math.max(0, Math.min(strength - 1, 3));

    strengthBar.style.width = `${(strength / 5) * 100}%`;
    strengthBar.style.backgroundColor = colors[index];
    strengthText.textContent = texts[index];
}

// E-posta doğrulama durumunu güncelle
function updateEmailVerificationStatus(isVerified) {
    const statusDiv = document.querySelector('.email-status');
    if (isVerified) {
        statusDiv.classList.remove('unverified');
        statusDiv.classList.add('verified');
        statusDiv.innerHTML = '<i class="fas fa-check-circle"></i> E-posta adresiniz doğrulanmış';
    } else {
        statusDiv.classList.remove('verified');
        statusDiv.classList.add('unverified');
        statusDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            E-posta adresiniz doğrulanmamış
            <button type="button" class="btn-link" onclick="resendVerification()">
                Doğrulama mailini tekrar gönder
            </button>
        `;
    }
}

// Doğrulama maili gönder
async function resendVerification() {
    try {
        showNotification('Doğrulama maili gönderildi', 'success');
    } catch (error) {
        console.error('Mail gönderme hatası:', error);
        showNotification('Mail gönderilirken bir hata oluştu', 'error');
    }
}

// Favori mekanları yükle
async function loadFavorites() {
    const favoritesGrid = document.querySelector('.favorites-grid');
    if (!favoritesGrid) return;

    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;

        // Kullanıcının favori mekanlarını filtrele
        const userFavorites = window.favorites.filter(fav => fav.user_id === currentUser.id);
        
        if (userFavorites.length === 0) {
            favoritesGrid.innerHTML = `
                <div class="no-favorites">
                    <i class="fas fa-heart-broken"></i>
                    <p>Henüz favori mekan eklememişsiniz.</p>
                </div>`;
            return;
        }

        // Her favori için mekan bilgisini bul ve listele
        const favoritesHTML = userFavorites.map(favorite => {
            const place = window.places.find(p => p.id === favorite.place_id);
            if (!place) return ''; // Eğer mekan bulunamazsa boş string döndür

            return `
                <div class="place-card">
                    <img src="${place.photos[0]}" alt="${place.name}" onerror="this.src='assets/images/placeholder.jpg'">
                    <div class="place-info">
                        <h3>${place.name}</h3>
                        <div class="place-rating">
                            <i class="fas fa-star"></i>
                            <span>${place.rating.toFixed(1)}</span>
                        </div>
                        <p class="place-description">${place.description}</p>
                        <button class="btn details-btn" onclick="openPlaceDetails(${JSON.stringify(place).replace(/"/g, '&quot;')})">
                            Detayları Gör
                        </button>
                        <button class="btn remove-favorite" onclick="removeFavorite(${place.id})">
                            <i class="fas fa-heart-broken"></i> Favorilerden Çıkar
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        favoritesGrid.innerHTML = favoritesHTML;
    } catch (error) {
        console.error('Favoriler yüklenirken hata:', error);
        favoritesGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Favoriler yüklenirken bir hata oluştu.</p>
            </div>`;
    }
}

// Favorilerden mekan çıkar
function removeFavorite(placeId) {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;

        // Favoriyi bul ve kaldır
        const favoriteIndex = window.favorites.findIndex(
            fav => fav.user_id === currentUser.id && fav.place_id === placeId
        );

        if (favoriteIndex !== -1) {
            window.favorites.splice(favoriteIndex, 1);
            // Favori listesini güncelle
            loadFavorites();
            showNotification('Mekan favorilerden kaldırıldı', 'success');
        }
    } catch (error) {
        console.error('Favori kaldırma hatası:', error);
        showNotification('Favori kaldırılırken bir hata oluştu', 'error');
    }
}

// Global scope'a ekle
window.removeFavorite = removeFavorite;

// Kullanıcı yorumlarını yükle
async function loadComments() {
    const commentsList = document.querySelector('.comments-list');
    if (!commentsList) return;

    try {
        // Test için örnek veri
        const comments = [
            {
                id: 1,
                place: 'Ayasofya',
                content: 'Harika bir deneyimdi!',
                date: '2024-02-15',
                rating: 5
            }
        ];

        commentsList.innerHTML = comments.map(comment => `
            <div class="comment-item">
                <div class="comment-header">
                    <span class="comment-place">${comment.place}</span>
                    <span class="comment-date">${new Date(comment.date).toLocaleDateString('tr-TR')}</span>
                </div>
                <div class="comment-content">${comment.content}</div>
                <div class="comment-rating">
                    ${Array(5).fill().map((_, i) => `
                        <i class="fas fa-star ${i < comment.rating ? 'active' : ''}"></i>
                    `).join('')}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Yorumlar yüklenirken hata:', error);
    }
}

// Yardımcı fonksiyonlar
function getInitials(name) {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase();
}

function showNotification(message, type = 'info') {
    // Bildirim gösterme fonksiyonu
    alert(message); // Şimdilik basit bir alert
}

// Profil sayfası işlevleri
document.addEventListener('DOMContentLoaded', function() {
    // Tab değiştirme işlevi
    const tabs = document.querySelectorAll('.profile-nav li');
    const sections = document.querySelectorAll('.profile-section');

    // İlk yüklemede yorumları göster
    loadUserComments();

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Aktif tab'ı değiştir
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // İlgili section'ı göster
            const tabId = tab.getAttribute('data-tab');
            sections.forEach(section => {
                if (section.id === tabId) {
                    section.classList.add('active');
                    // Eğer yorumlar tab'ı ise yorumları yükle
                    if (tabId === 'comments') {
                        loadUserComments();
                    }
                } else {
                    section.classList.remove('active');
                }
            });
        });
    });

    // Profil formunu doldur
    fillProfileForm();
});

// Profil formunu doldur
function fillProfileForm() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        document.getElementById('fullName').value = user.name || '';
        document.getElementById('email').value = user.email || '';
        
        // Avatar baş harflerini güncelle
        const avatarText = document.querySelector('.avatar-text');
        if (avatarText) {
            avatarText.textContent = getInitials(user.name);
        }
        
        // Profil adını güncelle
        const profileName = document.querySelector('.profile-name');
        if (profileName) {
            profileName.textContent = user.name;
        }
        
        // Email'i güncelle
        const profileEmail = document.querySelector('.profile-email');
        if (profileEmail) {
            profileEmail.textContent = user.email;
        }
    }
}

// Kullanıcının yorumlarını yükle
function loadUserComments() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;

    const commentsContainer = document.querySelector('#comments .comments-list');
    if (!commentsContainer) return;

    // Global comments dizisinden kullanıcının yorumlarını filtrele
    const userComments = window.comments.filter(comment => comment.user.id === user.id);

    if (userComments.length === 0) {
        commentsContainer.innerHTML = '<p class="no-comments">Henüz yorum yapmamışsınız.</p>';
        return;
    }

    // Her yorum için ilgili mekan bilgisini bul ve yorumları listele
    const commentsHTML = userComments.map(comment => {
        return `
            <div class="comment-item" data-comment-id="${comment.id}">
                <div class="comment-header">
                    <h4>${comment.place_name}</h4>
                    <span class="comment-date">${new Date(comment.date).toLocaleDateString('tr-TR')}</span>
                </div>
                <div class="comment-content">
                    <p>${comment.content}</p>
                </div>
                <div class="comment-footer">
                    <div class="comment-likes">
                        <i class="fas fa-heart ${comment.liked ? 'liked' : ''}"></i>
                        <span>${comment.likes} beğeni</span>
                    </div>
                    <div class="comment-actions">
                        <button class="btn btn-sm" onclick="editComment(${comment.id})">
                            <i class="fas fa-edit"></i> Düzenle
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteComment(${comment.id})">
                            <i class="fas fa-trash"></i> Sil
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    commentsContainer.innerHTML = commentsHTML;
}

// Yorum düzenleme işlevi
function editComment(commentId) {
    const comment = window.comments.find(c => c.id === commentId);
    if (!comment) {
        console.error('Yorum bulunamadı:', commentId);
        return;
    }

    // Mevcut yorumu düzenleme formuna dönüştür
    const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
    if (!commentElement) {
        console.error('Yorum elementi bulunamadı:', commentId);
        return;
    }

    const commentContent = commentElement.querySelector('.comment-content');
    if (!commentContent) {
        console.error('Yorum içeriği elementi bulunamadı:', commentId);
        return;
    }

    const originalContent = comment.content;

    // Düzenleme formunu oluştur
    commentContent.innerHTML = `
        <div class="edit-form">
            <textarea class="comment-edit-input">${originalContent}</textarea>
            <div class="edit-actions">
                <button class="btn btn-sm" onclick="saveComment(${commentId})">
                    <i class="fas fa-save"></i> Kaydet
                </button>
                <button class="btn btn-sm btn-secondary" onclick="cancelEdit(${commentId}, '${originalContent.replace(/'/g, "\\'")}')">
                    <i class="fas fa-times"></i> İptal
                </button>
            </div>
        </div>
    `;

    // Textarea'yı otomatik olarak seç
    const textarea = commentContent.querySelector('.comment-edit-input');
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
}

// Yorum düzenlemeyi kaydet
function saveComment(commentId) {
    const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
    if (!commentElement) return;

    const textarea = commentElement.querySelector('.comment-edit-input');
    const newContent = textarea.value.trim();

    if (newContent === '') {
        alert('Yorum boş olamaz!');
        return;
    }

    // Comments dizisinde yorumu güncelle
    const commentIndex = window.comments.findIndex(c => c.id === commentId);
    if (commentIndex !== -1) {
        window.comments[commentIndex].content = newContent;
        
        // Yorumları yeniden yükle
        loadUserComments();
    }
}

// Yorum düzenlemeyi iptal et
function cancelEdit(commentId, originalContent) {
    const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
    if (!commentElement) return;

    const commentContent = commentElement.querySelector('.comment-content');
    commentContent.innerHTML = `<p>${originalContent}</p>`;
}

// Yorum silme işlevi
function deleteComment(commentId) {
    if (confirm('Bu yorumu silmek istediğinizden emin misiniz?')) {
        // Comments dizisinden yorumu kaldır
        const commentIndex = window.comments.findIndex(c => c.id === commentId);
        if (commentIndex !== -1) {
            window.comments.splice(commentIndex, 1);
            
            // Yorumları yeniden yükle
            loadUserComments();
        }
    }
}

// Global scope'a ekle
window.editComment = editComment;
window.deleteComment = deleteComment;
window.saveComment = saveComment;
window.cancelEdit = cancelEdit; 