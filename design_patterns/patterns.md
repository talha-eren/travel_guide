# Gezi Rehberi Projesinde Kullanılan Tasarım Desenleri

## 1. MVC (Model-View-Controller) Pattern
**Kullanım Amacı**: Veri, görünüm ve iş mantığını ayırmak.

**Projemizdeki Detaylı Kullanımı**:
- **Model**: `backend/models` klasöründeki User.js, Place.js gibi veri modellerimiz
- **View**: `frontyeni` klasöründeki HTML dosyalarımız (profile.html, index.html vb.)
- **Controller**: `backend/routes` klasöründeki route dosyalarımız (profile.js, auth.js vb.)
- **Örnek**: Kullanıcı profil sayfasında, kullanıcı bilgileri User modelinde saklanıyor, profile.html'de görüntüleniyor ve profile.js route'unda işleniyor.

**Projemizdeki Kullanım ve Kod Açıklaması**:
```javascript
// Model (backend/models/User.js)
// Mongoose ve bcrypt modüllerini içe aktarıyoruz
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Kullanıcı şeması tanımlanıyor
const userSchema = new mongoose.Schema({
    // Kullanıcının tam adı - zorunlu alan
    fullName: {
        type: String,
        required: true
    },
    // E-posta adresi - zorunlu ve benzersiz alan
    email: {
        type: String,
        required: true,
        unique: true
    },
    // Şifre - zorunlu alan
    password: {
        type: String,
        required: true
    },
    // E-posta doğrulama durumu - varsayılan olarak false
    isVerified: {
        type: Boolean,
        default: false
    },
    // Hesap oluşturma tarihi - varsayılan olarak şu anki zaman
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// View (frontyeni/profile.html)
// Profil bilgilerini gösteren ve düzenlemeye izin veren form
<div class="profile-section active" id="profile">
    <h2>Profil Bilgileri</h2>
    <form id="profileForm" class="profile-form">
        <!-- Ad Soyad giriş alanı -->
        <div class="form-group">
            <label>Ad Soyad</label>
            <input type="text" id="fullName" name="fullName" required>
        </div>
        <!-- E-posta giriş alanı -->
        <div class="form-group">
            <label>E-posta</label>
            <input type="email" id="email" name="email" required>
        </div>
        <!-- Kaydet butonu -->
        <button type="submit" class="btn btn-primary">Değişiklikleri Kaydet</button>
    </form>
</div>

// Controller (backend/routes/profile.js)
// Profil güncelleme route'u
router.put('/update', authMiddleware, async (req, res) => {
    try {
        // İstek gövdesinden kullanıcı bilgilerini al
        const { fullName, email } = req.body;
        const user = req.user;

        // E-posta değişmişse, yeni e-postanın başka bir kullanıcıda olup olmadığını kontrol et
        if (email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Bu email adresi zaten kullanılıyor.' });
            }
            user.email = email;
        }

        // Kullanıcı bilgilerini güncelle
        user.fullName = fullName;
        await user.save();

        // Şifre hariç güncel kullanıcı bilgilerini döndür
        const updatedUser = user.toObject();
        delete updatedUser.password;

        // Başarılı yanıt döndür
        res.json({
            message: 'Profil bilgileri başarıyla güncellendi',
            user: updatedUser
        });
    } catch (error) {
        // Hata durumunda 500 hatası döndür
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});
```

## 2. Middleware Pattern
**Kullanım Amacı**: İstek-yanıt döngüsünü kontrol etmek ve kimlik doğrulama.

**Projemizdeki Detaylı Kullanımı**:
- `backend/middleware` klasöründe bulunuyor
- `authMiddleware`: Kullanıcı girişi kontrolü için her korumalı route'da kullanılıyor
- Token kontrolü, kullanıcı doğrulama ve yetkilendirme işlemleri burada yapılıyor
- **Örnek**: Profil güncelleme, şifre değiştirme gibi işlemlerde kullanıcının giriş yapmış olduğunu kontrol ediyoruz.

**Projemizdeki Kullanım ve Kod Açıklaması**:
```javascript
// backend/routes/profile.js
// Kimlik doğrulama middleware'i
const authMiddleware = async (req, res, next) => {
    try {
        // İstek header'ından Bearer token'ı al ve "Bearer " kısmını kaldır
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'Yetkilendirme hatası' });
        }

        // JWT token'ı doğrula
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Token'dan alınan kullanıcı ID'si ile kullanıcıyı bul
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        // Kullanıcı bilgisini request nesnesine ekle
        req.user = user;
        // Bir sonraki middleware'e veya route handler'a geç
        next();
    } catch (error) {
        // Token geçersizse veya süresi dolmuşsa 401 hatası döndür
        res.status(401).json({ message: 'Yetkilendirme hatası', error: error.message });
    }
};
```

## 3. Module Pattern
**Kullanım Amacı**: Kodun modüler ve bakımı kolay olması.

**Projemizdeki Detaylı Kullanımı**:
- `frontyeni/assets/js` klasöründeki her JavaScript dosyası ayrı bir modül
- auth.js: Kimlik doğrulama işlemleri
- profile.js: Profil yönetimi
- components.js: Ortak bileşenler
- **Örnek**: Giriş yapma, kayıt olma gibi işlemler auth.js modülünde toplanmış durumda.

**Projemizdeki Kullanım ve Kod Açıklaması**:
```javascript
// frontyeni/assets/js/auth.js
// API'nin temel URL'i
const API_URL = 'http://localhost:5000/api';

// Giriş yapma fonksiyonu
async function login(email, password) {
    try {
        // API'ye POST isteği gönder
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // Kullanıcı bilgilerini JSON formatında gönder
            body: JSON.stringify({ email, password })
        });

        // API yanıtını JSON formatında al
        const data = await response.json();

        // Yanıt başarısızsa hata fırlat
        if (!response.ok) {
            throw new Error(data.message || 'Giriş başarısız');
        }

        // Token ve kullanıcı bilgilerini localStorage'a kaydet
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Profil sayfasına yönlendir
        window.location.href = 'profile.html';
    } catch (error) {
        // Hata durumunda konsola yaz ve kullanıcıya göster
        console.error('Login error:', error);
        alert(error.message);
    }
}
```

// ... Diğer desenler için de benzer detaylı açıklamalar eklenecek ... 