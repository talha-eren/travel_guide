const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    try {
        // Token kontrolü
        if (!req.user || !req.user.role || req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bu işlem için admin yetkisi gerekiyor' });
        }
        next();
    } catch (error) {
        res.status(401).json({ message: 'Yetkilendirme hatası' });
    }
}; 