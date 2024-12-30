const jwt = require('jsonwebtoken');
const User = require('../models/User');

const adminAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            throw new Error('Token bulunamadı');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded.userId });

        if (!user) {
            throw new Error('Kullanıcı bulunamadı');
        }

        if (user.role !== 'admin') {
            throw new Error('Bu işlem için admin yetkisi gerekiyor');
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ message: error.message || 'Lütfen admin olarak giriş yapın' });
    }
};

module.exports = adminAuth; 