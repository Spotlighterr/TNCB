import mongoose from 'mongoose';

const SystemSettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: mongoose.Schema.Types.Mixed
}, { timestamps: true });

export default mongoose.model('SystemSettings', SystemSettingsSchema);
