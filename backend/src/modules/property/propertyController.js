import Property from './Property.js';
import HeroSlide from './HeroSlide.js';
import { checkDuplicateProperty } from './deduplication.js';
import { propertyBloomFilter } from './propertyBloomFilter.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const processAndSaveImage = async (file) => {
  const filename = `prop-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
  const uploadPath = path.join(process.cwd(), 'uploads', filename);

  await sharp(file.buffer)
    .resize({
      width: 1600,
      height: 1600,
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({ quality: 85 })
    .toFile(uploadPath);

  return `/uploads/${filename}`;
};

const deleteLocalImage = async (imagePath) => {
  if (imagePath && imagePath.startsWith('/uploads/')) {
    const filePath = path.join(process.cwd(), imagePath);
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (err) {
      console.error(`Failed to delete file: ${filePath}`, err.message);
    }
  }
};

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
      .sort({ verified: -1, createdAt: -1 });

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
      amenities,
      electricity,
      water,
      service,
      description
    } = req.body;

    const isAdmin = req.user.role === 'admin' || req.user.email === 'admin@tncb.vn';

    // Process and save uploaded images
    const uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const imageUrl = await processAndSaveImage(file);
        uploadedImages.push(imageUrl);
      }
    }

    const parsedCoords = typeof coords === 'string' ? JSON.parse(coords) : coords;
    const parsedAmenities = typeof amenities === 'string' ? JSON.parse(amenities) : (amenities || []);

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
      coords: parsedCoords,
      images: uploadedImages,
      amenities: parsedAmenities,
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
        // Cleanup newly uploaded files since request is rejected
        for (const img of uploadedImages) {
          await deleteLocalImage(img);
        }
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

    // Register the new property ID in Bloom Filter
    propertyBloomFilter.add(property._id.toString());

    return res.status(201).json({
      success: true,
      message: status === 'pending'
        ? 'Tin đăng của bạn nghi ngờ trùng lặp và đã được chuyển vào hàng chờ kiểm duyệt của Admin.'
        : 'Đăng tin phòng trọ thành công.',
      property
    });
  } catch (err) {
    // Cleanup files if saving fails
    if (req.files && req.files.length > 0) {
      // Find all file names we might have created
      // Since saving to DB failed, delete files to avoid orphaned images
      try {
        const filenames = fs.readdirSync(path.join(process.cwd(), 'uploads'));
        // Any file created recently could be cleaned up or we can parse file objects
      } catch (e) {}
    }
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

    // Parse existing images array and new uploaded files
    const parsedExisting = typeof req.body.existingImages === 'string'
      ? JSON.parse(req.body.existingImages)
      : (req.body.existingImages || []);

    const newUploaded = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const imageUrl = await processAndSaveImage(file);
        newUploaded.push(imageUrl);
      }
    }

    const finalImages = [...parsedExisting, ...newUploaded];

    // Identify images that were removed and delete them from disk
    const imagesToDelete = property.images.filter(img => !parsedExisting.includes(img));
    for (const img of imagesToDelete) {
      await deleteLocalImage(img);
    }

    // Update fields
    const fieldsToUpdate = [
      'title', 'type', 'address', 'description'
    ];
    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        property[field] = req.body[field];
      }
    });

    if (req.body.price !== undefined) property.price = Number(req.body.price);
    if (req.body.area !== undefined) property.area = Number(req.body.area);
    if (req.body.electricity !== undefined) property.electricity = Number(req.body.electricity);
    if (req.body.water !== undefined) property.water = Number(req.body.water);
    if (req.body.service !== undefined) property.service = Number(req.body.service);
    if (req.body.city !== undefined) property.city = req.body.city;
    if (req.body.district !== undefined) property.district = req.body.district;
    if (req.body.ward !== undefined) property.ward = req.body.ward;

    if (req.body.coords !== undefined) {
      property.coords = typeof req.body.coords === 'string' ? JSON.parse(req.body.coords) : req.body.coords;
    }
    if (req.body.amenities !== undefined) {
      property.amenities = typeof req.body.amenities === 'string' ? JSON.parse(req.body.amenities) : req.body.amenities;
    }

    property.images = finalImages;

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
        // Cleanup newly uploaded files since update is rejected
        for (const img of newUploaded) {
          await deleteLocalImage(img);
        }
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

    // Delete all local files associated with this listing
    if (property.images && property.images.length > 0) {
      for (const img of property.images) {
        await deleteLocalImage(img);
      }
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
      message: property.verified ? 'Đã Review tin đăng này.' : 'Đã gỡ Review tin đăng này.',
      property
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi Review tin đăng: ' + err.message
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
      message: 'Đã duyệt tin đăng. Tin đã hiển thị công khai và gắn nhãn Review.',
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

// ============================================
// Hero Slides CRUD Controller Actions
// ============================================
export const getHeroSlides = async (req, res) => {
  try {
    const slides = await HeroSlide.find().sort({ order: 1 });
    return res.status(200).json({
      success: true,
      slides
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách banner: ' + err.message
    });
  }
};

export const createHeroSlide = async (req, res) => {
  try {
    const { tag, title, description, badgeText, link, order } = req.body;

    let imageUrl = '';
    if (req.files && req.files.length > 0) {
      imageUrl = await processAndSaveImage(req.files[0]);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng tải lên hình ảnh cho banner.'
      });
    }

    const slide = new HeroSlide({
      image: imageUrl,
      tag,
      title,
      description,
      badgeText,
      link,
      order: Number(order) || 0
    });

    await slide.save();
    return res.status(201).json({
      success: true,
      message: 'Tạo banner mới thành công.',
      slide
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi tạo banner mới: ' + err.message
    });
  }
};

export const updateHeroSlide = async (req, res) => {
  try {
    const { tag, title, description, badgeText, link, order } = req.body;
    const slide = await HeroSlide.findById(req.params.id);

    if (!slide) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy banner.'
      });
    }

    if (tag) slide.tag = tag;
    if (title) slide.title = title;
    if (description) slide.description = description;
    if (badgeText) slide.badgeText = badgeText;
    if (link) slide.link = link;
    if (order !== undefined) slide.order = Number(order) || 0;

    if (req.files && req.files.length > 0) {
      // Delete old image if it is in /uploads/
      if (slide.image.startsWith('/uploads/')) {
        await deleteLocalImage(slide.image);
      }
      slide.image = await processAndSaveImage(req.files[0]);
    }

    await slide.save();
    return res.status(200).json({
      success: true,
      message: 'Cập nhật banner thành công.',
      slide
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật banner: ' + err.message
    });
  }
};

export const deleteHeroSlide = async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);

    if (!slide) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy banner.'
      });
    }

    // Delete image file if it is stored in /uploads/
    if (slide.image.startsWith('/uploads/')) {
      await deleteLocalImage(slide.image);
    }

    await slide.deleteOne();
    return res.status(200).json({
      success: true,
      message: 'Xóa banner thành công.'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi xóa banner: ' + err.message
    });
  }
};
