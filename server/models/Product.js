const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  mrp: { type: Number, required: true, min: 0 },
  category: {
    type: String,
    required: true,
    enum: ['Red', 'White', 'Rosé', 'Sparkling', 'Dessert']
  },
  region: { type: String, required: true },
  year: { type: Number },
  rating: { type: Number, default: 4, min: 0, max: 5 },
  image: { type: String, required: true },
  stock: { type: Number, required: true, default: 50, min: 0 },
  volume: { type: String, default: '750ml' },
  alcoholContent: { type: String },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

// Indexes for faster queries
productSchema.index({ category: 1, featured: -1, createdAt: -1 });
productSchema.index({ featured: -1, createdAt: -1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ name: 'text', description: 'text', region: 'text' });

module.exports = mongoose.model('Product', productSchema);

