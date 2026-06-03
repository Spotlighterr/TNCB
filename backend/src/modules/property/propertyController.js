import Property from './Property.js';
import { checkDuplicateProperty } from './deduplication.js';

export const getProperties = async (req, res) => {
  try {
    const {
      city,
      district,
      ward,
      type,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      amenities,
      search
    } = req.query;

    const query = {
      status: 'active',
      isUnlisted: false
    };

    // Filters
    if (city) query.city = city;
    if (district) query.district = district;
    if (ward) query.ward = ward;
    if (type) query.type = type;

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Area range
    if (minArea || maxArea) {
      query.area = {};
      if (minArea) query.area.$gte = Number(minArea);
      if (maxArea) query.area.$lte = Number(maxArea);
    }

    // Amenities (Must contain all selected amenities)
    if (amenities) {
      const amenitiesList = Array.isArray(amenities)
        ? amenities
        : amenities.split(',').map(a => a.trim());
      if (amenitiesList.length > 0) {
        query.amenities = { $all: amenitiesList };
      }
    }

    // Search query (case-insensitive in title and description)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    const properties = await Property.find(query)
      .populate('postedBy', 'name phone avatar zalo')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: properties.length,
      properties
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách phòng trọ: ' + err.message
    });
  }
};

export const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ postedBy: req.user._id })
      .populate('postedBy', 'name phone avatar zalo')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: properties.length,
      properties
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách tin đăng cá nhân: ' + err.message
    });
  }
};

export const getPropertyDetail = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('postedBy', 'name phone avatar zalo')
      .populate('duplicateReport.matchedProperty', 'title price area address');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin phòng trọ.'
      });
    }

    return res.status(200).json({
      success: true,
      property
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy chi tiết phòng trọ: ' + err.message
    });
  }
};

export const createProperty = async (req, res) => {
  try {
    const {
      title,
      type,
      price,
      area,
      city,
      district,
      ward,
      address,
      coords,
      images,
      amenities,
      electricity,
      water,
      service,
      description
    } = req.body;

    const isAdmin = req.user.role === 'admin' || req.user.email === 'admin@tncb.vn';

    // Build the new property object structure for verification
    const newPropertyData = {
      title,
      type,
      price: Number(price),
      area: Number(area),
      city,
      district,
      ward,
      address,
      coords,
      images: images || [],
      amenities: amenities || [],
      electricity: Number(electricity),
      water: Number(water),
      service: Number(service),
      description,
      postedBy: req.user._id
    };

    let status = 'active';
    let verified = isAdmin; // Automatically verified for admin posts
    let duplicateReport = { confidenceScore: 0, matchedProperty: null, reasons: [] };

    // Anti-spam checks (Skip if logged in user is admin)
    if (!isAdmin) {
      // Find active listings of the SAME landlord
      const activeProperties = await Property.find({
        postedBy: req.user._id,
        status: 'active',
        isRented: false,
        isUnlisted: false
      });

      const dupCheck = checkDuplicateProperty(newPropertyData, activeProperties);

      if (dupCheck.isDuplicate) {
        return res.status(400).json({
          success: false,
          message: 'Tin đăng bị chặn do phát hiện trùng lặp cao (>= 80%) với một tin đăng khác của bạn.',
          reasons: dupCheck.reasons,
          matchedProperty: dupCheck.matchedProperty ? {
            id: dupCheck.matchedProperty._id,
            title: dupCheck.matchedProperty.title,
            address: dupCheck.matchedProperty.address
          } : null
        });
      }

      if (dupCheck.isSuspicious) {
        status = 'pending';
        duplicateReport = {
          confidenceScore: dupCheck.confidenceScore,
          matchedProperty: dupCheck.matchedProperty._id,
          reasons: dupCheck.reasons
        };
      }
    }

    const property = new Property({
      ...newPropertyData,
      status,
      verified,
      duplicateReport
    });

    await property.save();

    return res.status(201).json({
      success: true,
      message: status === 'pending'
        ? 'Tin đăng của bạn nghi ngờ trùng lặp và đã được chuyển vào hàng chờ kiểm duyệt của Admin.'
        : 'Đăng tin phòng trọ thành công.',
      property
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi đăng tin phòng trọ: ' + err.message
    });
  }
};

export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin đăng.'
      });
    }

    const isAdmin = req.user.role === 'admin' || req.user.email === 'admin@tncb.vn';
    const isOwner = property.postedBy.toString() === req.user._id.toString();

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa tin đăng này.'
      });
    }

    const fieldsToUpdate = [
      'title', 'type', 'price', 'area', 'city', 'district', 'ward', 'address',
      'coords', 'images', 'amenities', 'electricity', 'water', 'service', 'description'
    ];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        property[field] = req.body[field];
      }
    });

    // Run duplicate checking again on update if not admin
    if (!isAdmin) {
      const activeProperties = await Property.find({
        postedBy: req.user._id,
        status: 'active',
        isRented: false,
        isUnlisted: false,
        _id: { $ne: property._id }
      });

      const dupCheck = checkDuplicateProperty(property, activeProperties);

      if (dupCheck.isDuplicate) {
        return res.status(400).json({
          success: false,
          message: 'Cập nhật thất bại. Phát hiện trùng lặp cao (>= 80%) với một tin đăng khác của bạn.',
          reasons: dupCheck.reasons
        });
      }

      if (dupCheck.isSuspicious) {
        property.status = 'pending';
        property.duplicateReport = {
          confidenceScore: dupCheck.confidenceScore,
          matchedProperty: dupCheck.matchedProperty._id,
          reasons: dupCheck.reasons
        };
      } else {
        // Clear old reports if no longer suspicious
        property.status = 'active';
        property.duplicateReport = { confidenceScore: 0, matchedProperty: null, reasons: [] };
      }
    }

    await property.save();

    return res.status(200).json({
      success: true,
      message: property.status === 'pending'
        ? 'Tin cập nhật bị chuyển vào trạng thái chờ duyệt do nghi ngờ trùng lặp.'
        : 'Cập nhật tin đăng thành công.',
      property
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật tin đăng: ' + err.message
    });
  }
};

export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin đăng.'
      });
    }

    const isAdmin = req.user.role === 'admin' || req.user.email === 'admin@tncb.vn';
    const isOwner = property.postedBy.toString() === req.user._id.toString();

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa tin đăng này.'
      });
    }

    await Property.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Xóa tin đăng phòng trọ thành công.'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi xóa tin đăng: ' + err.message
    });
  }
};

export const toggleRentedStatus = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin đăng.'
      });
    }

    const isAdmin = req.user.role === 'admin' || req.user.email === 'admin@tncb.vn';
    const isOwner = property.postedBy.toString() === req.user._id.toString();

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thực hiện hành động này.'
      });
    }

    property.isRented = !property.isRented;
    await property.save();

    return res.status(200).json({
      success: true,
      message: property.isRented ? 'Đã đánh dấu phòng trọ đã cho thuê.' : 'Đã mở trống phòng trọ.',
      property
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật trạng thái thuê: ' + err.message
    });
  }
};

export const toggleUnlistedStatus = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin đăng.'
      });
    }

    const isAdmin = req.user.role === 'admin' || req.user.email === 'admin@tncb.vn';
    const isOwner = property.postedBy.toString() === req.user._id.toString();

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thực hiện hành động này.'
      });
    }

    property.isUnlisted = !property.isUnlisted;
    await property.save();

    return res.status(200).json({
      success: true,
      message: property.isUnlisted ? 'Đã ẩn tin đăng.' : 'Đã hiển thị lại tin đăng.',
      property
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật trạng thái ẩn: ' + err.message
    });
  }
};

export const toggleVerifyStatus = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin đăng.'
      });
    }

    property.verified = !property.verified;
    await property.save();

    return res.status(200).json({
      success: true,
      message: property.verified ? 'Đã xác thực tin đăng này.' : 'Đã gỡ xác thực tin đăng này.',
      property
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi xác thực tin đăng: ' + err.message
    });
  }
};

export const getAdminReviewQueue = async (req, res) => {
  try {
    const queue = await Property.find({ status: 'pending' })
      .populate('postedBy', 'name phone email avatar')
      .populate('duplicateReport.matchedProperty', 'title address price area')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: queue.length,
      queue
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách chờ duyệt: ' + err.message
    });
  }
};

export const approveProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin đăng.'
      });
    }

    property.status = 'active';
    property.verified = true; // Auto-verify on admin approval
    // Clear duplicate report details
    property.duplicateReport = { confidenceScore: 0, matchedProperty: null, reasons: [] };

    await property.save();

    return res.status(200).json({
      success: true,
      message: 'Đã duyệt tin đăng. Tin đã hiển thị công khai và gắn nhãn xác thực.',
      property
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi duyệt tin: ' + err.message
    });
  }
};

export const rejectProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin đăng.'
      });
    }

    // Set status to rejected (or delete it completely)
    // To match flow charts and Admin controls, we can just delete it, or set status = 'rejected'
    property.status = 'rejected';
    await property.save();

    return res.status(200).json({
      success: true,
      message: 'Đã từ chối tin đăng trùng lặp.',
      property
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi từ chối tin đăng: ' + err.message
    });
  }
};
