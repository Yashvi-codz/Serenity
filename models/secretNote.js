const mongoose = require('mongoose');


const SecretNoteSchema = new mongoose.Schema({
userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
month: { type: String, required: true, index: true }, // YYYY-MM
text: { type: String, required: true, maxlength: 500 },
createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('SecretNote', SecretNoteSchema);