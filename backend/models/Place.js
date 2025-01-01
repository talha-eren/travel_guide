const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    wiki_summary: {
        type: String
    },
    category: {
        type: String,
        required: true,
        enum: ['tarihi', 'dogal', 'kulturel', 'eglence', 'yeme-icme']
    },
    city: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    images: [{
        type: String
    }],
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalRatings: {
        type: Number,
        default: 0
    },
    opening_hours: [{
        type: String
    }]
}, {
    timestamps: true,
    toJSON: { 
        virtuals: true,
        transform: function(doc, ret) {
            // description alanını wiki_summary'den al
            ret.description = doc.wiki_summary;
            
            // openingHours'ı opening_hours'dan oluştur
            if (doc.opening_hours && Array.isArray(doc.opening_hours)) {
                const dayMap = {
                    'Pazartesi': 'monday',
                    'Salı': 'tuesday',
                    'Çarşamba': 'wednesday',
                    'Perşembe': 'thursday',
                    'Cuma': 'friday',
                    'Cumartesi': 'saturday',
                    'Pazar': 'sunday'
                };

                const openingHours = {
                    monday: { open: null, close: null },
                    tuesday: { open: null, close: null },
                    wednesday: { open: null, close: null },
                    thursday: { open: null, close: null },
                    friday: { open: null, close: null },
                    saturday: { open: null, close: null },
                    sunday: { open: null, close: null }
                };

                doc.opening_hours.forEach(dayStr => {
                    const [turkishDay, hours] = dayStr.split(': ');
                    const day = dayMap[turkishDay];
                    
                    if (day) {
                        if (hours === 'Kapalı') {
                            openingHours[day] = { open: null, close: null };
                        } else if (hours === '24 saat açık') {
                            openingHours[day] = { open: '00:00', close: '23:59' };
                        } else if (hours.includes(',')) {
                            const [morning, afternoon] = hours.split(', ');
                            const morningTimes = morning.split('–');
                            const afternoonTimes = afternoon.split('–');
                            openingHours[day] = {
                                open: morningTimes[0],
                                close: afternoonTimes[1]
                            };
                        } else {
                            const times = hours.split('–');
                            if (times.length === 2) {
                                openingHours[day] = {
                                    open: times[0],
                                    close: times[1]
                                };
                            }
                        }
                    }
                });

                ret.openingHours = openingHours;
            }

            return ret;
        }
    }
});

module.exports = mongoose.model('Place', placeSchema); 