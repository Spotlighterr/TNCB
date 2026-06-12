import mongoose from 'mongoose';

const PropertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tiêu đề phòng trọ là bắt buộc.'],
    trim: true,
  },
  type: {
    type: String,
    required: [true, 'Loại phòng trọ là bắt buộc.'],
    enum: [
      'Chung cư mini',
      'Nhà trọ chung chủ',
      'Nhà trọ không chung chủ',
      'Nhà ở cải tạo thành nhà trọ (không chung chủ)',
      'Nhà ở cải tạo thành nhà trọ (chung chủ)',
      'Chung cư',
      'Kí túc xá'
    ]
  },
  price: {
    type: Number,
    required: [true, 'Giá thuê phòng là bắt buộc.'],
    min: [0, 'Giá thuê không thể nhỏ hơn 0.']
  },
  area: {
    type: Number,
    required: [true, 'Diện tích phòng là bắt buộc.'],
    min: [0, 'Diện tích không thể nhỏ hơn 0.']
  },
  city: {
    type: String,
    required: [true, 'Thành phố là bắt buộc.'],
    enum: ['Hà Nội', 'TP. Hồ Chí Minh']
  },
  district: {
    type: String,
    required: [true, 'Quận/Huyện là bắt buộc.']
  },
  ward: {
    type: String,
    required: [true, 'Phường/Xã là bắt buộc.']
  },
  address: {
    type: String,
    required: [true, 'Địa chỉ chi tiết là bắt buộc.']
  },
  coords: {
    type: [Number], // [latitude, longitude]
    required: [true, 'Tọa độ vị trí (latitude, longitude) là bắt buộc.'],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length === 2;
      },
      message: 'Tọa độ phải có định dạng [latitude, longitude].'
    }
  },
  images: {
    type: [String],
    default: []
  },
  verified: {
    type: Boolean,
    default: false
  },
  isRented: {
    type: Boolean,
    default: false
  },
  isUnlisted: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'rejected'],
    default: 'active'
  },
  amenities: {
    type: [String],
    default: []
  },
  electricity: {
    type: Number,
    required: [true, 'Đơn giá điện là bắt buộc.'],
    min: [0, 'Đơn giá điện không thể âm.']
  },
  water: {
    type: Number,
    required: [true, 'Đơn giá nước là bắt buộc.'],
    min: [0, 'Đơn giá nước không thể âm.']
  },
  service: {
    type: Number,
    required: [true, 'Phí dịch vụ là bắt buộc.'],
    min: [0, 'Phí dịch vụ không thể âm.']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Người đăng tin là bắt buộc.']
  },
  duplicateReport: {
    confidenceScore: {
      type: Number,
      default: 0
    },
    matchedProperty: {
      type: String,
      ref: 'Property',
      default: null
    },
    reasons: {
      type: [String],
      default: []
    }
  },
  source: {
    type: String,
    enum: ['manual', 'sheet'],
    default: 'manual'
  }
}, {
  timestamps: true
});

const Property = mongoose.model('Property', PropertySchema);
export default Property;
