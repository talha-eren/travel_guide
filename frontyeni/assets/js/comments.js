// Yorum işlevleri
function addComment(placeId, content) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return false;

    const newComment = {
        id: window.comments.length + 1,
        place_id: placeId,
        user_id: user.id,
        user: {
            id: user.id,
            name: user.name,
            avatar: user.name.charAt(0)
        },
        date: new Date().toISOString().split('T')[0],
        content: content,
        likes: 0,
        liked: false
    };

    window.comments.push(newComment);
    return true;
}

function editComment(commentId, newContent) {
    const commentIndex = window.comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) return false;

    window.comments[commentIndex].content = newContent;
    return true;
}

function deleteComment(commentId) {
    const commentIndex = window.comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) return false;

    window.comments.splice(commentIndex, 1);
    return true;
}

function toggleLike(commentId) {
    const comment = window.comments.find(c => c.id === commentId);
    if (!comment) return;

    comment.liked = !comment.liked;
    comment.likes += comment.liked ? 1 : -1;

    // Sadece yorum bölümünü güncelle--Gözlemmciyi bilgilendirme
    updateCommentsSection(comment.place_id);
}

function updateCommentsSection(placeId) {
    const place = window.places.find(p => p.id === placeId);
    if (!place) return;

    const commentsSection = document.querySelector('#placeDetailsModal .comments-section');
    if (!commentsSection) return;

    const placeComments = window.commentService.getPlaceComments(placeId);
    //// Yorum formu HTML'ini oluşturan fabrika metodu renderCommentForm
    commentsSection.innerHTML = `
        <div class="comments-header">
            <h3>Yorumlar (${placeComments.length})</h3>
        </div>
        ${renderCommentForm(placeId)}
        <div class="comments-list">
            ${placeComments.map(comment => `
                <div class="comment" data-comment-id="${comment.id}">
                    <div class="comment-header">
                        <div class="comment-user">
                            <div class="user-avatar">${comment.user.avatar}</div>
                            <span class="user-name">${comment.user.name}</span>
                        </div>
                        <span class="comment-date">${new Date(comment.date).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <div class="comment-content">
                        ${comment.content}
                    </div>
                    <div class="comment-footer">
                        <div class="comment-action ${comment.liked ? 'liked' : ''}" onclick="toggleLike(${comment.id})">
                            <i class="fas fa-heart"></i>
                            <span>${comment.likes}</span>
                        </div>
                        <div class="comment-action" onclick="reportComment(${comment.id})">
                            <i class="fas fa-flag"></i>
                            <span>Bildir</span>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function submitComment(placeId) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        showLoginModal();
        return;
    }

    const commentInput = document.querySelector('#placeDetailsModal .comment-input');
    const commentText = commentInput.value.trim();
    
    if (commentText) {
        if (addComment(placeId, commentText)) {
            // Sadece yorum bölümünü güncelle
            updateCommentsSection(placeId);
            // Yorum inputunu temizle
            commentInput.value = '';
        }
    }
}

function cancelComment() {
    const commentInput = document.querySelector('#placeDetailsModal .comment-input');
    if (commentInput) {
        commentInput.value = '';
    }
}

function reportComment(commentId) {
    if (confirm('Bu yorumu bildirmek istediğinizden emin misiniz?')) {
        alert('Yorum bildirildi. İncelememiz için teşekkürler!');
    }
}

function showLoginModal() {
    const loginModal = document.getElementById('loginModal');
    const detailsModal = document.getElementById('placeDetailsModal');
    
    if (loginModal) {
        // Detay modalını kapat
        if (detailsModal) {
            detailsModal.style.display = 'none';
        }
        // Giriş modalını aç
        loginModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

// Global scope'a ekle
window.commentService = {
    addComment,
    editComment,
    deleteComment,
    toggleLike,
    getUserComments: (userId) => window.comments.filter(comment => comment.user_id === userId),
    getPlaceComments: (placeId) => window.comments.filter(comment => comment.place_id === placeId)
};

// Yorum işlevlerini global scope'a ekle
window.submitComment = submitComment;
window.cancelComment = cancelComment;
window.toggleLike = toggleLike;
window.reportComment = reportComment;
window.showLoginModal = showLoginModal; 