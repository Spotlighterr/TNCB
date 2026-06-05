import mongoose from 'mongoose';

const HeroSlideSchema = new mongoose.Schema({
  image: { type: String, required: true },
  tag: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  badgeText: { type: String, required: true },
  link: { type: String, required: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('HeroSlide', HeroSlideSchema);
