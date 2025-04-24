const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  edad: { type: Number, min: 0 },
  email: { type: String, unique: true, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Usuario', usuarioSchema);
