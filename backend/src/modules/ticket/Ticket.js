import mongoose from 'mongoose';

const TicketSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Yêu cầu hỗ trợ phải liên kết với một phòng trọ.']
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Yêu cầu hỗ trợ phải do khách thuê gửi.']
  },
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Yêu cầu hỗ trợ phải liên kết với chủ trọ của phòng đó.']
  },
  title: {
    type: String,
    required: [true, 'Tiêu đề yêu cầu hỗ trợ là bắt buộc.'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Mô tả chi tiết sự cố là bắt buộc.'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'resolved'],
    default: 'pending'
  }
}, {
  timestamps: true
});

const Ticket = mongoose.model('Ticket', TicketSchema);
export default Ticket;
