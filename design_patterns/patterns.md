# Gezi Rehberi Projesinde Kullanılan Tasarım Desenleri

## 1. MVC (Model-View-Controller) Pattern
**Kullanım Amacı**: Veri, görünüm ve iş mantığını ayırmak.

**Projemizdeki Kullanım**:
```javascript
// Model (backend/models/User.js)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// View (frontyeni/profile.html)
<div class="profile-section active" id="profile">
    <h2>Profil Bilgileri</h2>
    <form id="profileForm" class="profile-form">
        <div class="form-group">
            <label>Ad Soyad</label>
            <input type="text" id="fullName" name="fullName" required>
        </div>
        <div class="form-group">
            <label>E-posta</label>
            <input type="email" id="email" name="email" required>
        </div>
        <button type="submit" class="btn btn-primary">Değişiklikleri Kaydet</button>
    </form>
</div>

// Controller (backend/routes/profile.js)
router.put('/update', authMiddleware, async (req, res) => {
    try {
        const { fullName, email } = req.body;
        const user = req.user;

        if (email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Bu email adresi zaten kullanılıyor.' });
            }
            user.email = email;
        }

        user.fullName = fullName;
        await user.save();

        const updatedUser = user.toObject();
        delete updatedUser.password;

        res.json({
            message: 'Profil bilgileri başarıyla güncellendi',
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});
```

## 2. Middleware Pattern
**Kullanım Amacı**: İstek-yanıt döngüsünü kontrol etmek ve kimlik doğrulama.

**Projemizdeki Kullanım**:
```javascript
// backend/routes/profile.js
const authMiddleware = async (req, res, next) => {
    try {
        // Token'ı header'dan al
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'Yetkilendirme hatası' });
        }

        // Token'ı doğrula
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Kullanıcıyı bul
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        // Kullanıcıyı request'e ekle
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Yetkilendirme hatası', error: error.message });
    }
};
```

## 3. Module Pattern
**Kullanım Amacı**: Kodun modüler ve bakımı kolay olması.

**Projemizdeki Kullanım**:
```javascript
// frontyeni/assets/js/auth.js
const API_URL = 'http://localhost:5000/api';

// Login işlemi
async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Giriş başarısız');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = 'profile.html';
    } catch (error) {
        console.error('Login error:', error);
        alert(error.message);
    }
}

// frontyeni/assets/js/profile.js
async function getProfile() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'index.html';
            return;
        }

        const response = await fetch(`${API_URL}/profile/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        // ... form doldurma işlemleri
    } catch (error) {
        console.error('Profil bilgileri alınırken hata:', error);
        alert(error.message);
    }
}
```

## 4. Observer Pattern
**Kullanım Amacı**: DOM olaylarını dinlemek ve tepki vermek.

**Projemizdeki Kullanım**:
```javascript
// frontyeni/assets/js/auth.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = e.target.querySelector('input[type="email"]').value;
            const password = e.target.querySelector('input[type="password"]').value;
            await login(email, password);
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fullName = e.target.querySelector('input[type="text"]').value;
            const email = e.target.querySelector('input[type="email"]').value;
            const password = e.target.querySelector('input[type="password"]').value;
            await register(fullName, email, password);
        });
    }
});
```

## 5. Singleton Pattern
**Kullanım Amacı**: Uygulama genelinde tek bir veri deposu kullanmak.

**Projemizdeki Kullanım**:
```javascript
// frontyeni/assets/js/auth.js ve profile.js'de localStorage kullanımı
// Token saklama
localStorage.setItem('token', data.token);
const token = localStorage.getItem('token');

// Kullanıcı bilgisi saklama
localStorage.setItem('user', JSON.stringify(data.user));
const user = JSON.parse(localStorage.getItem('user'));

// Çıkış yapma
localStorage.removeItem('token');
localStorage.removeItem('user');
```

## 6. SOLID Prensipleri
**Kullanım Amacı**: Kodun sürdürülebilir ve genişletilebilir olması.

**Projemizdeki Kullanım**:
```javascript
// Single Responsibility Principle örneği:
// backend/routes/auth.js - Sadece kimlik doğrulama işlemleri
router.post('/register', async (req, res) => {
    // Kayıt işlemleri
});

router.post('/login', async (req, res) => {
    // Giriş işlemleri
});

// backend/routes/profile.js - Sadece profil işlemleri
router.get('/me', authMiddleware, async (req, res) => {
    // Profil getirme
});

router.put('/update', authMiddleware, async (req, res) => {
    // Profil güncelleme
});
```

## 7. Async/Await Pattern
**Kullanım Amacı**: Asenkron işlemleri yönetmek.

**Projemizdeki Kullanım**:
```javascript
// frontyeni/assets/js/profile.js
async function updateProfile(event) {
    event.preventDefault();

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'index.html';
            return;
        }

        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;

        const response = await fetch(`${API_URL}/profile/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ fullName, email })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Profil güncellenemedi');
        }

        localStorage.setItem('user', JSON.stringify(data.user));
        alert('Profil bilgileri başarıyla güncellendi');
        window.location.reload();

    } catch (error) {
        console.error('Profil güncellenirken hata:', error);
        alert(error.message);
    }
}
```

## 8. Factory Pattern
**Kullanım Amacı**: Nesne oluşturma işlemlerini standartlaştırmak.

**Projemizdeki Kullanım**:
```javascript
// backend/models/User.js
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({...});
const User = mongoose.model('User', userSchema);

// Kullanım
const user = new User({
    fullName: req.body.fullName,
    email: req.body.email,
    password: hashedPassword
});
```

## 9. Strategy Pattern
**Kullanım Amacı**: Farklı HTTP metodları için farklı stratejiler uygulamak.

**Projemizdeki Kullanım**:
```javascript
// backend/routes/profile.js
// Her HTTP metodu için farklı strateji
router.get('/me', authMiddleware, async (req, res) => {
    // GET stratejisi - Profil bilgilerini getir
});

router.put('/update', authMiddleware, async (req, res) => {
    // PUT stratejisi - Profil bilgilerini güncelle
});

router.put('/change-password', authMiddleware, async (req, res) => {
    // PUT stratejisi - Şifre değiştir
});
```

## 10. Error Handling Pattern
**Kullanım Amacı**: Hataları tutarlı bir şekilde yönetmek.

**Projemizdeki Kullanım**:
```javascript
// Backend hata yönetimi (backend/routes/profile.js)
try {
    const { fullName, email } = req.body;
    // ... işlemler
} catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
}

// Frontend hata yönetimi (frontyeni/assets/js/profile.js)
try {
    const response = await fetch(`${API_URL}/profile/me`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
} catch (error) {
    console.error('Profil bilgileri alınırken hata:', error);
    alert(error.message);
}
```

## Faydaları
1. **Kod Organizasyonu**: Her dosya ve fonksiyon belirli bir sorumluluğa sahip
2. **Bakım Kolaylığı**: Değişiklikler izole edilmiş, bir yerdeki değişiklik diğerlerini etkilemiyor
3. **Test Edilebilirlik**: Her modül bağımsız olarak test edilebilir
4. **Genişletilebilirlik**: Yeni özellikler (örn: yeni profil özellikleri) kolayca eklenebilir
5. **Hata Yönetimi**: Hem backend hem frontend'de tutarlı hata yakalama
6. **Performans**: Asenkron işlemler etkili bir şekilde yönetiliyor
7. **Güvenlik**: Middleware ile merkezi yetkilendirme kontrolü
8. **Kod Tekrarını Önleme**: Ortak fonksiyonlar (örn: auth middleware) tekrar kullanılıyor 