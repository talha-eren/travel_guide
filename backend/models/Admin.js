const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
});

// Şifre hashleme
adminSchema.pre('save', async function(next) {
    const admin = this;
    if (admin.isModified('password')) {
        admin.password = await bcrypt.hash(admin.password, 8);
    }
    next();
});

// Token oluşturma
adminSchema.methods.generateAuthToken = async function() {
    const admin = this;
    const token = jwt.sign({ _id: admin._id.toString() }, process.env.JWT_SECRET);
    admin.tokens = admin.tokens.concat({ token });
    await admin.save();
    return token;
};

// Giriş bilgilerini doğrulama
adminSchema.statics.findByCredentials = async (username, password) => {
    const admin = await Admin.findOne({ username });
    if (!admin) {
        throw new Error('Giriş başarısız');
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
        throw new Error('Giriş başarısız');
    }
    return admin;
};

// JSON dönüşünde hassas verileri kaldır
adminSchema.methods.toJSON = function() {
    const admin = this;
    const adminObject = admin.toObject();
    delete adminObject.password;
    delete adminObject.tokens;
    return adminObject;
};

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin; 