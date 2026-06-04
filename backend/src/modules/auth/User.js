import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng cung cấp họ tên.'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Vui lòng cung cấp email.'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  password: {
    type: String,
    minlength: [5, 'Mật khẩu phải có ít nhất 5 ký tự.'],
  },
  role: {
    type: String,
    enum: ['tenant', 'landlord', 'admin'],
    default: 'tenant',
  },
  avatar: {
    type: String,
    default: '/default-avatar.jpg'
  },
  zalo: {
    type: String,
    default: function() {
      return this.phone;
    }
  },
  ssoProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  ssoId: {
    type: String,
    default: null
  },
  mfaSecret: {
    type: String,
    default: null
  },
  mfaEnabled: {
    type: Boolean,
    default: false
  },
  otpEnabled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.password || !this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);
export default User;
