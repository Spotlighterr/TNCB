import Ticket from '../models/Ticket.js';
import Property from '../models/Property.js';

export const createTicket = async (req, res) => {
  try {
    const { propertyId, title, description } = req.body;

    if (!propertyId || !title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin: phòng trọ, tiêu đề và nội dung sự cố.'
      });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin phòng trọ.'
      });
    }

    const ticket = new Ticket({
      propertyId,
      tenantId: req.user._id,
      landlordId: property.postedBy,
      title,
      description,
      status: 'pending'
    });

    await ticket.save();

    return res.status(201).json({
      success: true,
      message: 'Gửi yêu cầu hỗ trợ thành công. Chủ nhà sẽ sớm kiểm tra.',
      ticket
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi gửi yêu cầu hỗ trợ: ' + err.message
    });
  }
};

export const getTickets = async (req, res) => {
  try {
    const user = req.user;
    const isAdmin = user.role === 'admin' || user.email === 'admin@tncb.vn';

    let query = {};
    if (isAdmin) {
      // Admin sees everything
      query = {};
    } else if (user.role === 'landlord') {
      // Landlord sees tickets submitted for their properties
      query = { landlordId: user._id };
    } else {
      // Tenant sees tickets they submitted
      query = { tenantId: user._id };
    }

    const tickets = await Ticket.find(query)
      .populate('propertyId', 'title address')
      .populate('tenantId', 'name phone email avatar')
      .populate('landlordId', 'name phone email Zalo')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tickets.length,
      tickets
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách yêu cầu hỗ trợ: ' + err.message
    });
  }
};

export const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy yêu cầu hỗ trợ.'
      });
    }

    const isAdmin = req.user.role === 'admin' || req.user.email === 'admin@tncb.vn';
    const isLandlordOfProperty = ticket.landlordId.toString() === req.user._id.toString();

    if (!isLandlordOfProperty && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật trạng thái yêu cầu hỗ trợ này.'
      });
    }

    if (status) {
      ticket.status = status;
    } else {
      // Default to resolved if no status provided
      ticket.status = 'resolved';
    }

    await ticket.save();

    return res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái yêu cầu hỗ trợ thành công.',
      ticket
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật trạng thái yêu cầu: ' + err.message
    });
  }
};
