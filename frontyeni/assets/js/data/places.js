// API endpoint'leri
const API_URL = 'http://localhost:5000/api';

// Şehirleri yükle
async function loadCities() {
    try {
        const response = await fetch(`${API_URL}/places/cities`);
        const data = await response.json();
        
        if (data.cities && Array.isArray(data.cities)) {
            const cityFilter = document.getElementById('cityFilter');
            cityFilter.innerHTML = '<option value="all">Tüm Şehirler</option>';
            
            data.cities.sort().forEach(city => {
                cityFilter.innerHTML += `<option value="${city}">${city}</option>`;
            });
        }
    } catch (error) {
        console.error('Şehirler yüklenirken hata:', error);
    }
}

// Mekanları listele
async function loadPlaces() {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_URL}/places`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Mekanlar yüklenirken bir hata oluştu');
        }

        const data = await response.json();
        displayPlaces(data.places || []);
    } catch (error) {
        console.error('Hata:', error);
        showNotification('Mekanlar yüklenirken bir hata oluştu', 'error');
    }
}

// Mekanları tabloda göster
function displayPlaces(places) {
    const tableBody = document.getElementById('placesTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';

    if (!Array.isArray(places)) {
        console.error('Places verisi bir array değil:', places);
        return;
    }

    if (places.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">Henüz mekan bulunmuyor</td>
            </tr>
        `;
        return;
    }

    places.forEach(place => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${place.name || 'İsimsiz'}</td>
            <td>${getCategoryName(place.category) || 'Kategorisiz'}</td>
            <td>${place.city || 'Belirtilmemiş'}</td>
            <td>${(place.rating || 0).toFixed(1)} (${place.totalRatings || 0} oy)</td>
            <td><span class="status-badge status-active">Aktif</span></td>
            <td class="actions">
                <button onclick="editPlace('${place._id}')" class="btn-edit" title="Düzenle">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deletePlace('${place._id}')" class="btn-delete" title="Sil">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Kategori adını Türkçe olarak döndür
function getCategoryName(category) {
    const categories = {
        'tarihi': 'Tarihi Mekan',
        'dogal': 'Doğal Güzellik',
        'kulturel': 'Kültürel Mekan',
        'eglence': 'Eğlence Mekanı',
        'yeme-icme': 'Yeme-İçme'
    };
    return categories[category] || category || 'Kategorisiz';
}

// Mekan silme işlemi
async function deletePlace(placeId) {
    if (!confirm('Bu mekanı silmek istediğinizden emin misiniz?')) {
        return;
    }

    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_URL}/places/${placeId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Mekan silinirken bir hata oluştu');
        }

        showNotification('Mekan başarıyla silindi', 'success');
        loadPlaces(); // Tabloyu yenile
    } catch (error) {
        console.error('Hata:', error);
        showNotification('Mekan silinirken bir hata oluştu', 'error');
    }
}

// Mekan düzenleme modalını aç
async function editPlace(placeId) {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_URL}/places/${placeId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Mekan bilgileri alınırken bir hata oluştu');
        }

        const place = await response.json();
        
        // Modal form alanlarını doldur
        document.getElementById('modalTitle').textContent = 'Mekan Düzenle';
        document.getElementById('placeName').value = place.name;
        document.getElementById('placeType').value = place.category;
        document.getElementById('placeCity').value = place.city;
        document.getElementById('placeAddress').value = place.address;
        document.getElementById('placeDescription').value = place.description;
        
        // Mevcut görselleri göster
        const previewContainer = document.getElementById('imagePreviewContainer');
        previewContainer.innerHTML = '';
        if (place.images && place.images.length > 0) {
            place.images.forEach(imageUrl => {
                const preview = createImagePreview(imageUrl);
                previewContainer.appendChild(preview);
            });
        }
        
        // Modal'ı aç
        const modal = document.getElementById('placeModal');
        modal.style.display = 'block';
        
        // Form submit handler'ını güncelle
        const form = document.getElementById('placeForm');
        form.onsubmit = (e) => updatePlace(e, placeId);
    } catch (error) {
        console.error('Hata:', error);
        showNotification('Mekan bilgileri alınırken bir hata oluştu', 'error');
    }
}

// Mekan güncelleme işlemi
async function updatePlace(event, placeId) {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append('name', document.getElementById('placeName').value);
    formData.append('category', document.getElementById('placeType').value);
    formData.append('city', document.getElementById('placeCity').value);
    formData.append('address', document.getElementById('placeAddress').value);
    formData.append('description', document.getElementById('placeDescription').value);
    
    const imageFiles = document.getElementById('placeImages').files;
    for (let i = 0; i < imageFiles.length; i++) {
        formData.append('images', imageFiles[i]);
    }

    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_URL}/places/${placeId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Mekan güncellenirken bir hata oluştu');
        }

        showNotification('Mekan başarıyla güncellendi', 'success');
        closePlaceModal();
        loadPlaces(); // Tabloyu yenile
    } catch (error) {
        console.error('Hata:', error);
        showNotification('Mekan güncellenirken bir hata oluştu', 'error');
    }
}

// Yeni mekan ekleme
async function addPlace(event) {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append('name', document.getElementById('placeName').value);
    formData.append('category', document.getElementById('placeType').value);
    formData.append('city', document.getElementById('placeCity').value);
    formData.append('address', document.getElementById('placeAddress').value);
    formData.append('description', document.getElementById('placeDescription').value);
    
    const imageFiles = document.getElementById('placeImages').files;
    for (let i = 0; i < imageFiles.length; i++) {
        formData.append('images', imageFiles[i]);
    }

    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_URL}/places`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Mekan eklenirken bir hata oluştu');
        }

        showNotification('Mekan başarıyla eklendi', 'success');
        closePlaceModal();
        loadPlaces(); // Tabloyu yenile
    } catch (error) {
        console.error('Hata:', error);
        showNotification('Mekan eklenirken bir hata oluştu', 'error');
    }
}

// Modal işlemleri
function openAddPlaceModal() {
    document.getElementById('modalTitle').textContent = 'Yeni Mekan Ekle';
    document.getElementById('placeForm').reset();
    document.getElementById('imagePreviewContainer').innerHTML = '';
    document.getElementById('placeModal').style.display = 'block';
    
    // Form submit handler'ını güncelle
    const form = document.getElementById('placeForm');
    form.onsubmit = addPlace;
}

function closePlaceModal() {
    document.getElementById('placeModal').style.display = 'none';
    document.getElementById('placeForm').reset();
    document.getElementById('imagePreviewContainer').innerHTML = '';
}

// Görsel önizleme oluştur
function createImagePreview(imageUrl) {
    const preview = document.createElement('div');
    preview.className = 'image-preview';
    preview.innerHTML = `
        <img src="${imageUrl}" alt="Mekan görseli">
        <button type="button" class="remove-image" onclick="removeImage(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    return preview;
}

// Görsel önizleme için event listener
document.getElementById('placeImages')?.addEventListener('change', function(e) {
    const previewContainer = document.getElementById('imagePreviewContainer');
    previewContainer.innerHTML = '';
    
    const files = e.target.files;
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = createImagePreview(e.target.result);
                previewContainer.appendChild(preview);
            }
            reader.readAsDataURL(file);
        }
    }
});

// Görsel kaldır
function removeImage(button) {
    button.closest('.image-preview').remove();
}

// Filtreleme işlemleri
function filterPlaces() {
    const searchTerm = document.getElementById('searchPlaces').value.toLowerCase();
    const categoryFilter = document.getElementById('placeTypeFilter').value;
    const cityFilter = document.getElementById('cityFilter').value;
    
    const rows = document.querySelectorAll('#placesTableBody tr');
    
    rows.forEach(row => {
        const name = row.cells[0].textContent.toLowerCase();
        const category = row.cells[1].textContent;
        const city = row.cells[2].textContent;
        
        const matchesSearch = name.includes(searchTerm);
        const matchesCategory = categoryFilter === 'all' || category === getCategoryName(categoryFilter);
        const matchesCity = cityFilter === 'all' || city === cityFilter;
        
        row.style.display = matchesSearch && matchesCategory && matchesCity ? '' : 'none';
    });
}

// Event listener'ları ekle
document.addEventListener('DOMContentLoaded', () => {
    loadPlaces();
    loadCities();
    
    // Filtreleme için event listener'lar
    document.getElementById('searchPlaces')?.addEventListener('input', filterPlaces);
    document.getElementById('placeTypeFilter')?.addEventListener('change', filterPlaces);
    document.getElementById('cityFilter')?.addEventListener('change', filterPlaces);
}); 