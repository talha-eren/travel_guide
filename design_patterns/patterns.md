# Gezi Rehberi Projesi Mimari Yapısı ve Tasarım Desenleri

## Mimari Yapı

### 1. Client-Server Mimarisi
**Açıklama**: Uygulama, istemci (client) ve sunucu (server) olmak üzere iki ana bileşene ayrılmıştır.

**Bileşenler**:
- **Client (Frontend - `frontyeni/`):**
  - HTML, CSS ve JavaScript ile geliştirilmiş web arayüzü
  - REST API ile backend'e bağlantı
  - Responsive tasarım
  - Tarayıcı tabanlı kullanıcı deneyimi

- **Server (Backend - `backend/`):**
  - Node.js ve Express.js framework'ü
  - MongoDB veritabanı entegrasyonu
  - RESTful API endpoints
  - JWT tabanlı kimlik doğrulama sistemi

### 2. MVC (Model-View-Controller) Mimarisi
**Açıklama**: Uygulama mantığı üç temel bileşene ayrılmıştır.

**Bileşenler**:
```javascript
// Model (backend/models/Place.js)
const placeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    city: { type: String, required: true }
});

// View (frontyeni/index.html ve JS render fonksiyonları)
function renderPlaces(places) {
    const placesList = document.getElementById('placesList');
    placesList.innerHTML = places.map(place => createPlaceCard(place)).join('');
}

// Controller (backend/routes/places.js)
router.get('/cities', async (req, res) => {
    try {
        const cities = await Place.distinct('city_name');
        res.json({ cities });
    } catch (error) {
        res.status(500).json({ message: 'Hata oluştu' });
    }
});
```

### 3. Katmanlı Mimari (Layered Architecture)
**Açıklama**: Uygulama mantıksal katmanlara ayrılmıştır.

**Katmanlar**:
1. **Sunum Katmanı (Presentation Layer)**
   - Frontend uygulaması
   - Kullanıcı arayüzü bileşenleri
   - Form validasyonları
   - Client-side routing

2. **İş Mantığı Katmanı (Business Layer)**
   - Route handler'lar
   - Middleware'ler
   - Veri doğrulama
   - İş kuralları

3. **Veri Erişim Katmanı (Data Access Layer)**
   - Mongoose modelleri
   - Veritabanı işlemleri
   - Veri dönüşümleri

### 4. RESTful API Mimarisi
**Açıklama**: HTTP metodları üzerinden CRUD işlemleri için standart bir arayüz.

**Endpoint Örnekleri**:
```javascript
// Mekan İşlemleri
GET    /api/places          // Mekanları listele
POST   /api/places          // Yeni mekan ekle
GET    /api/places/:id      // Mekan detayı
PUT    /api/places/:id      // Mekan güncelle
DELETE /api/places/:id      // Mekan sil

// Kullanıcı İşlemleri
POST   /api/auth/login      // Giriş yap
POST   /api/auth/register   // Kayıt ol
GET    /api/profile        // Profil bilgileri
```

### 5. Modüler Yapı
**Açıklama**: Kod tabanı mantıksal modüllere ayrılmıştır.

**Dizin Yapısı**:
```
travel_guide/
├── backend/
│   ├── models/          # Veri modelleri
│   ├── routes/          # API endpoint'leri
│   ├── middleware/      # Ara yazılımlar
│   └── scripts/         # Yardımcı scriptler
│
└── frontyeni/
    ├── assets/
    │   ├── css/         # Stil dosyaları
    │   └── js/          # JavaScript modülleri
    ├── components/      # Yeniden kullanılabilir bileşenler
    └── *.html           # Sayfa şablonları
```

### Mimari Avantajları
1. **Modülerlik**: Kod organizasyonu düzenli ve bakımı kolay
2. **Ölçeklenebilirlik**: Yeni özellikler kolayca eklenebilir
3. **Test Edilebilirlik**: Her katman bağımsız olarak test edilebilir
4. **Güvenlik**: Merkezi kontrol noktaları
5. **Performans**: Optimize edilmiş veri akışı
6. **Bakım Kolaylığı**: Sorunlar izole edilebilir ve çözülebilir

---

# Tasarım Desenleri

## 1. MVC (Model-View-Controller) Pattern
**Kullanım Amacı**: Uygulamanın veri (Model), sunum (View) ve iş mantığı (Controller) katmanlarını birbirinden ayırmak.

**Nerede Kullanıldı**:
- **Model**: `backend/models/` altındaki Place.js, User.js, Comment.js modelleri
- **View**: `frontyeni/` altındaki HTML dosyaları ve assets/js/places.js'deki render fonksiyonları
- **Controller**: `backend/routes/` altındaki route handler'lar

**Örnek**:
```javascript
// Model (backend/models/Place.js)
const placeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['tarihi', 'dogal', 'kulturel', 'eglence', 'yeme-icme']
    },
    city: {
        type: String,
        required: true
    }
});

// View (frontyeni/assets/js/places.js)
function renderPlaces(places) {
    const placesList = document.getElementById('placesList');
    if (!placesList) return;
    placesList.innerHTML = places.map(place => createPlaceCard(place)).join('');
}

// Controller (backend/routes/places.js)
router.get('/cities', async (req, res) => {
    try {
        const cities = await Place.distinct('city_name');
        res.json({ cities });
    } catch (error) {
        res.status(500).json({ message: 'Şehirler getirilirken bir hata oluştu' });
    }
});

## 2. Repository Pattern
**Kullanım Amacı**: Veri erişim mantığını soyutlamak ve merkezi bir noktadan yönetmek.

**Nerede Kullanıldı**: Backend'de Place, User ve Comment modellerinin kullanıldığı yerler.

**Örnek**:
```javascript
// backend/routes/places.js
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 12, category, city_name, search } = req.query;
        const query = {};
        if (category) query.category = category;
        if (city_name) query.city_name = city_name;
        
        const total = await Place.countDocuments(query);
        const places = await Place.find(query)
            .sort({ rating: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            places,
            total,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ message: 'Mekanlar getirilirken bir hata oluştu' });
    }
});

## 3. Observer Pattern
**Kullanım Amacı**: DOM olaylarını dinlemek ve bu olaylara tepki vermek.

**Nerede Kullanıldı**: Frontend'deki tüm event listener'lar

**Örnek**:
```javascript
// frontyeni/assets/js/places.js
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadCities();
        await fetchPlaces();

        const cityFilter = document.getElementById('cityFilter');
        cityFilter?.addEventListener('change', async () => {
            currentFilters.city = cityFilter.value;
            currentPage = 1;
            await fetchPlaces();
        });

        const searchInput = document.getElementById('searchInput');
        let searchTimeout;
        searchInput?.addEventListener('input', async (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(async () => {
                currentFilters.search = e.target.value;
                currentPage = 1;
                await fetchPlaces();
            }, 300);
        });
    } catch (error) {
        console.error('Error loading places:', error);
        showError('Mekanlar yüklenirken bir hata oluştu');
    }
});

## 4. Factory Pattern
**Kullanım Amacı**: UI bileşenlerinin oluşturulmasını merkezi bir noktada toplamak.

**Nerede Kullanıldı**: Frontend'deki createPlaceCard, createFavoriteCard ve createCommentCard fonksiyonları

**Örnek**:
```javascript
// frontyeni/assets/js/places.js
function createPlaceCard(place) {
    const mainImage = getMainImage(place);
    const apiKey = window.GOOGLE_MAPS_API_KEY || '';
    
    const allPhotos = [
        ...processPhotos(Array.isArray(place.photo) ? place.photo : [place.photo], apiKey),
        ...processPhotos(place.images, apiKey)
    ].filter(Boolean);

    return `
        <div class="place-card">
            <div class="place-image">
                <img src="${mainImage}" alt="${place.name || 'Mekan Görseli'}" 
                    onerror="this.onerror=null; this.src='data:image/svg+xml,...';"
                    data-photos='${JSON.stringify(allPhotos)}'>
                ${allPhotos.length > 1 ? `
                    <div class="photo-count">
                        <i class="fas fa-images"></i>
                        ${allPhotos.length} fotoğraf
                    </div>
                ` : ''}
            </div>
            <div class="place-info">
                <h3>${place.name || 'İsimsiz Mekan'}</h3>
                <div class="place-rating">
                    ${getStarRating(place.rating || 0)}
                    <span>(${place.totalRatings || 0} değerlendirme)</span>
                </div>
            </div>
        </div>
    `;
}

## 5. Decorator Pattern
**Kullanım Amacı**: Mongoose modellerine dinamik olarak yeni özellikler eklemek.

**Nerede Kullanıldı**: Place modelinde virtuals ve transform fonksiyonları

**Örnek**:
```javascript
// backend/models/Place.js
placeSchema.set('toJSON', { 
    virtuals: true,
    transform: function(doc, ret) {
        // description alanını wiki_summary'den al
        ret.description = doc.wiki_summary;
        
        // openingHours'ı opening_hours'dan oluştur
        if (doc.opening_hours && Array.isArray(doc.opening_hours)) {
            const dayMap = {
                'Pazartesi': 'monday',
                'Salı': 'tuesday',
                // ...diğer günler
            };
            // Çalışma saatlerini dönüştür
            ret.openingHours = transformOpeningHours(doc.opening_hours, dayMap);
        }
        return ret;
    }
});

## 6. Middleware Pattern
**Kullanım Amacı**: İstek-yanıt döngüsünü işlemek, kimlik doğrulama yapmak.

**Nerede Kullanıldı**: Backend'de auth middleware ve error handling

**Örnek**:
```javascript
// backend/middleware/auth.js
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'Yetkilendirme hatası' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Yetkilendirme hatası' });
    }
};

## 7. Module Pattern
**Kullanım Amacı**: JavaScript kodunu modüler parçalara ayırmak.

**Nerede Kullanıldı**: Frontend'deki JS dosyaları organizasyonu

**Örnek**:
```javascript
// frontyeni/assets/js/places.js
// Global state
let currentPage = 1;
let totalPages = 1;
let currentFilters = {
    city: '',
    search: ''
};

// Modül fonksiyonları
async function loadCities() { /* ... */ }
async function fetchPlaces() { /* ... */ }
function renderPlaces(places) { /* ... */ }
function createPlaceCard(place) { /* ... */ }
function getStarRating(rating) { /* ... */ }

## 8. Singleton Pattern
**Kullanım Amacı**: Bir sınıfın tek bir örneğinin (instance) olmasını sağlamak ve bu örneğe global erişim noktası sunmak.

**Nerede Kullanıldı**: 
- MongoDB veritabanı bağlantısı
- Frontend'de localStorage yönetimi

**Örnek**:
```javascript
// backend/app.js veya server.js
// MongoDB bağlantısı için Singleton Pattern
let dbInstance = null;

async function connectDB() {
    if (dbInstance) return dbInstance;
    
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        dbInstance = connection;
        console.log('MongoDB connected');
        return dbInstance;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

// Kullanımı
connectDB(); // İlk bağlantı
// Daha sonraki kullanımlarda aynı bağlantı örneği döner

// Frontend'de localStorage Singleton örneği
const Storage = {
    setItem(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    getItem(key) {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    },
    removeItem(key) {
        localStorage.removeItem(key);
    },
    clear() {
        localStorage.clear();
    }
};

// Kullanımı
Storage.setItem('user', userData);
const user = Storage.getItem('user');

## 9. Strategy Pattern
**Kullanım Amacı**: Farklı algoritmaları değiştirilebilir şekilde kullanmak.

**Nerede Kullanıldı**: 
- Frontend'de arama ve filtreleme stratejileri
- Backend'de kimlik doğrulama stratejileri

**Örnek**:
```javascript
// frontyeni/assets/js/search.js
const searchStrategies = {
    byName: (places, query) => places.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase())
    ),
    byCity: (places, city) => places.filter(p => 
        p.city_name === city
    ),
    byCategory: (places, category) => places.filter(p => 
        p.category === category
    )
};

// Kullanımı
const filteredPlaces = searchStrategies[strategy](places, query);

## 10. Chain of Responsibility Pattern
**Kullanım Amacı**: İstekleri bir dizi işleyici üzerinden geçirmek.

**Nerede Kullanıldı**: 
- Backend middleware zinciri
- Frontend'de form doğrulama

**Örnek**:
```javascript
// backend/app.js
app.use(express.json());
app.use(cors());
app.use(authMiddleware);
app.use('/api/places', placesRouter);
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);

## 11. Adapter Pattern
**Kullanım Amacı**: Farklı arayüzleri uyumlu hale getirmek.

**Nerede Kullanıldı**: 
- Place modelinde çalışma saatlerinin dönüştürülmesi
- Frontend'de API yanıtlarının UI'a uyarlanması

**Örnek**:
```javascript
// backend/models/Place.js
function transformOpeningHours(rawHours, dayMap) {
    const formattedHours = {
        monday: { open: null, close: null },
        tuesday: { open: null, close: null },
        // ... diğer günler
    };

    rawHours.forEach(dayStr => {
        const [turkishDay, hours] = dayStr.split(': ');
        const day = dayMap[turkishDay];
        
        if (day) {
            if (hours === 'Kapalı') {
                formattedHours[day] = { open: null, close: null };
            } else if (hours === '24 saat açık') {
                formattedHours[day] = { open: '00:00', close: '23:59' };
            }
            // ... diğer dönüşümler
        }
    });

    return formattedHours;
}

## 12. Command Pattern
**Kullanım Amacı**: İstekleri nesneler olarak kapsüllemek.

**Nerede Kullanıldı**: 
- Frontend'de kullanıcı işlemlerinin yönetimi
- Admin panelinde CRUD işlemleri

**Örnek**:
```javascript
// frontyeni/assets/js/admin.js
const adminCommands = {
    addPlace: async (placeData) => {
        const response = await fetch(`${API_URL}/places`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(placeData)
        });
        return response.json();
    },
    updatePlace: async (id, placeData) => {
        const response = await fetch(`${API_URL}/places/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(placeData)
        });
        return response.json();
    },
    deletePlace: async (id) => {
        const response = await fetch(`${API_URL}/places/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        return response.json();
    }
};

// Kullanımı
await adminCommands.addPlace(newPlaceData);
``` 