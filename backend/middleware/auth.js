const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

module.exports = authMiddleware; 