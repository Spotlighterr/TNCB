import Property from './Property.js';
import HeroSlide from './HeroSlide.js';
import { checkDuplicateProperty } from './deduplication.js';
import { propertyBloomFilter, initPropertyBloomFilter } from './propertyBloomFilter.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import SystemSettings from './SystemSettings.js';
import User from '../auth/User.js';
import { sendImportErrorReport } from '../../utils/mailer.js';

// Global In-Memory Cache for Properties loaded from Google Sheets
export let cachedProperties = [];
export let cacheLastUpdated = null;

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

    const query = { isUnlisted: { $ne: true } };

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
    // Amenities
    if (amenities) {
      const amenitiesList = Array.isArray(amenities)
        ? amenities
        : amenities.split(',').map(a => a.trim()).filter(Boolean);
      if (amenitiesList.length > 0) {
        query.amenities = { $all: amenitiesList };
      }
    }
    // Search query (case-insensitive regex in title, description, address)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort: verified first, then createdAt desc
    const properties = await Property.find(query)
      .sort({ verified: -1, createdAt: -1 })
      .populate('postedBy', 'name email phone avatar');

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
    const query = {};
    const isAdmin = req.user && (req.user.role === 'admin' || req.user.email === 'admin@tncb.vn');
    if (!isAdmin) {
      query.postedBy = req.user.id;
    }
    const properties = await Property.find(query).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: properties.length,
      properties
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách tin đăng: ' + err.message
    });
  }
};

export const getPropertyDetail = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('postedBy', 'name email phone avatar');

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

const returnSheetsModeError = (res) => {
  return res.status(400).json({
    success: false,
    message: 'Hệ thống đang hoạt động ở chế độ Google Sheet Database. Mọi thay đổi dữ liệu cần thực hiện trực tiếp trên bảng tính Google Sheet của bạn.'
  });
};

export const createProperty = async (req, res) => {
  try {
    const propertyData = { ...req.body, source: 'manual' };
    
    if (req.user) {
      propertyData.postedBy = req.user.id;
    } else {
      propertyData.postedBy = 'user-admin';
    }

    if (req.files && req.files.length > 0) {
      const imageUrls = [];
      for (const file of req.files) {
        const url = await processAndSaveImage(file);
        imageUrls.push(url);
      }
      propertyData.images = imageUrls;
    }

    const property = new Property(propertyData);
    await property.save();

    if (propertyBloomFilter) {
      propertyBloomFilter.add(property._id.toString());
    }

    return res.status(201).json({
      success: true,
      message: 'Đăng tin phòng trọ mới thành công.',
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
        message: 'Không tìm thấy thông tin phòng trọ.'
      });
    }

    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        const url = await processAndSaveImage(file);
        newImages.push(url);
      }
      
      const existingImages = req.body.existingImages ? (Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages]) : [];
      property.images = [...existingImages, ...newImages];
    } else if (req.body.existingImages) {
      property.images = Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages];
    }

    const allowedUpdates = [
      'title', 'type', 'price', 'area', 'city', 'district', 'ward', 'address',
      'coords', 'amenities', 'electricity', 'water', 'service', 'description',
      'status', 'verified', 'isRented', 'isUnlisted'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        property[field] = req.body[field];
      }
    });

    await property.save();

    return res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin phòng trọ thành công.',
      property
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật phòng trọ: ' + err.message
    });
  }
};

export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin phòng trọ.'
      });
    }

    if (property.images && property.images.length > 0) {
      for (const img of property.images) {
        await deleteLocalImage(img);
      }
    }

    await Property.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Xóa phòng trọ thành công.'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi xóa phòng trọ: ' + err.message
    });
  }
};

export const toggleRentedStatus = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng trọ.' });
    
    property.isRented = !property.isRented;
    await property.save();
    
    return res.status(200).json({ success: true, message: 'Cập nhật trạng thái thuê thành công.', property });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const toggleUnlistedStatus = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng trọ.' });
    
    property.isUnlisted = !property.isUnlisted;
    await property.save();
    
    return res.status(200).json({ success: true, message: 'Cập nhật trạng thái hiển thị thành công.', property });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const toggleVerifyStatus = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng trọ.' });
    
    property.verified = !property.verified;
    await property.save();
    
    return res.status(200).json({ success: true, message: 'Cập nhật xác thực thành công.', property });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getAdminReviewQueue = async (req, res) => {
  try {
    const queue = await Property.find({ status: 'pending' }).populate('postedBy', 'name email');
    return res.status(200).json({
      success: true,
      count: queue.length,
      queue
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

export const approveProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Không tìm thấy tin trọ.' });
    
    property.status = 'active';
    property.verified = true;
    await property.save();
    
    return res.status(200).json({ success: true, message: 'Duyệt bài đăng thành công.', property });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const rejectProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Không tìm thấy tin trọ.' });
    
    property.status = 'rejected';
    await property.save();
    
    return res.status(200).json({ success: true, message: 'Từ chối bài đăng thành công.', property });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
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

// --- Google Sheets Import & Sync Logic ---

const parseCSV = (text) => {
  const lines = [];
  let row = [""];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (c === '"') {
      if (inQuotes && next === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push("");
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') {
        i++;
      }
      lines.push(row.map(cell => cell.trim()));
      row = [""];
    } else {
      row[row.length - 1] += c;
    }
  }
  if (row.length > 1 || row[0] !== "") {
    lines.push(row.map(cell => cell.trim()));
  }
  return lines;
};

const normalizeHeader = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
};

const HEADER_MAPPING = {
  title: ['title', 'tieude', 'tenphong', 'ten'],
  type: ['type', 'loaiphong', 'loai'],
  price: ['price', 'giathue', 'gia', 'tienphong'],
  area: ['area', 'dientich', 'dien-tich', 'rong'],
  city: ['city', 'thanhpho', 'tp'],
  district: ['district', 'quanhuyen', 'quan', 'huyen'],
  ward: ['ward', 'phuongxa', 'phuong', 'xa'],
  address: ['address', 'diachichitiet', 'diachi', 'dia-chi'],
  latitude: ['latitude', 'vido', 'lat'],
  longitude: ['longitude', 'kinhdo', 'lng', 'lon'],
  coords: ['coords', 'toado'],
  images: ['images', 'hinhanh', 'linkanh', 'anh'],
  verified: ['verified', 'dareview', 'xacthuc'],
  amenities: ['amenities', 'tienich', 'tien-nghi', 'tiennghi'],
  electricity: ['electricity', 'dongiadien', 'tiendien', 'dien'],
  water: ['water', 'dongianuoc', 'nuoc', 'tiennuoc'],
  service: ['service', 'phidichvu', 'dichvu', 'tiendichvu'],
  description: ['description', 'mota', 'noidung', 'mo-ta']
};

const mapHeaders = (headerRow) => {
  const mapping = {};
  headerRow.forEach((col, index) => {
    const norm = normalizeHeader(col);
    for (const [key, aliases] of Object.entries(HEADER_MAPPING)) {
      if (aliases.includes(norm)) {
        mapping[key] = index;
        break;
      }
    }
  });
  return mapping;
};

const AMENITY_COLUMN_MAP = {
  AirConditioner: ['dieuhoa', 'dieu-hoa', 'điều hòa', 'dieu hoa'],
  Balcony: ['bancong', 'ban cong', 'ban công'],
  Fridge: ['tulanh', 'tu lanh', 'tủ lạnh'],
  WashingMachine: ['maygiat', 'may giat', 'máy giặt'],
  FingerprintLock: ['khoavantay', 'khoa van tay', 'khóa vân tay'],
  FreeTime: ['giogiactudo', 'gio giac tu do', 'giờ giấc tự do', 'tự do', 'tudo'],
  WiFi: ['wifi', 'wi-fi', 'wifi mien phi', 'wifi miễn phí'],
  Parking: ['chodeve', 'cho de xe', 'chỗ để xe', 'nhadexe', 'nhà để xe'],
  Kitchen: ['beprieng', 'bep rieng', 'bếp riêng', 'bep', 'bếp'],
  Security: ['baove', 'bao ve', 'bảo vệ', 'baove247', 'bảo vệ 24/7']
};

const DISTRICT_COORDS = {
  // Hà Nội
  'cầu giấy': [21.0362, 105.7908],
  'hai bà trưng': [21.0114, 105.8550],
  'đống đa': [21.0118, 105.8239],
  'thanh xuân': [20.9932, 105.8100],
  'nam từ liêm': [21.0280, 105.7620],
  'tây hồ': [21.0584, 105.8130],
  'hoàn kiếm': [21.0285, 105.8542],
  'ba đình': [21.0345, 105.8214],
  'hoàng mai': [20.9702, 105.8488],
  'long biên': [21.0382, 105.8858],
  'hà đông': [20.9685, 105.7748],
  'bắc từ liêm': [21.0658, 105.7600],
  'gia lâm': [21.0074, 105.9400],
  'thanh trì': [20.9500, 105.8500],
  'hoài đức': [21.0167, 105.7000],
  
  // TP Hồ Chí Minh
  'quận 1': [10.7872, 106.7008],
  'quận 3': [10.7792, 106.6858],
  'quận 5': [10.7554, 106.6620],
  'quận 10': [10.7745, 106.6672],
  'bình thạnh': [10.8016, 106.7118],
  'phú nhuận': [10.7998, 106.6820],
  'gò vấp': [10.8380, 106.6650],
  'tân bình': [10.8014, 106.6520],
  'tân phú': [10.7928, 106.6180],
  'thủ đức': [10.8510, 106.7590],
  'quận 7': [10.7324, 106.7268],
  'bình tân': [10.7758, 106.5980],
  'quận 4': [10.7629, 106.7064],
  'quận 6': [10.7485, 106.6358],
  'quận 8': [10.7240, 106.6284],
  'quận 11': [10.7629, 106.6500],
  'quận 12': [10.8671, 106.6413],
  'phú mỹ hưng': [10.7289, 106.7082],
  'bình chánh': [10.6874, 106.5942],
  'nhà bè': [10.6669, 106.7278],
  'hóc môn': [10.8837, 106.5888],
  'củ chi': [11.0067, 106.4988]
};

const geocodeCache = new Map();

export const geocodeAddress = async (address, ward, district, city) => {
  const cleanAddress = address ? address.trim() : '';
  const cleanWard = ward ? ward.trim() : '';
  const cleanDistrict = district ? district.trim() : '';
  const cleanCity = city ? city.trim() : '';

  const queryAddress = `${cleanAddress}, ${cleanWard}, ${cleanDistrict}, ${cleanCity}, Việt Nam`;
  
  if (geocodeCache.has(queryAddress)) {
    return geocodeCache.get(queryAddress);
  }

  // Try calling Nominatim OpenStreetMap (non-blocking with timeout, limit rate to prevent sync hang)
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryAddress)}&format=json&limit=1`, {
      headers: { 'User-Agent': 'TNCB-Rent-Sync-Agent/1.0' },
      signal: AbortSignal.timeout(1500) // 1.5 seconds timeout
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        const coords = [Number(data[0].lat), Number(data[0].lon)];
        geocodeCache.set(queryAddress, coords);
        return coords;
      }
    }
  } catch (err) {
    // Fail silently, fallback below
  }

  // Fallback to local coordinates mapping by District
  const normDistrict = cleanDistrict.toLowerCase().replace(/^(quận|huyện|thị xã|thành phố)\s+/g, '').trim();
  const districtKey = cleanDistrict.toLowerCase().trim();
  
  let baseCoords = null;

  if (DISTRICT_COORDS[districtKey]) {
    baseCoords = DISTRICT_COORDS[districtKey];
  } else if (DISTRICT_COORDS[normDistrict]) {
    baseCoords = DISTRICT_COORDS[normDistrict];
  } else {
    // City fallback
    const cityLower = cleanCity.toLowerCase();
    if (cityLower.includes('hồ chí minh') || cityLower.includes('hcm') || cityLower.includes('sài gòn')) {
      baseCoords = [10.8231, 106.6297]; // HCMC base
    } else {
      baseCoords = [21.0285, 105.7823]; // Hanoi base
    }
  }

  // Add a slight random offset so they do not overlap
  const randomizedCoords = [
    baseCoords[0] + (Math.random() - 0.5) * 0.015,
    baseCoords[1] + (Math.random() - 0.5) * 0.015
  ];

  geocodeCache.set(queryAddress, randomizedCoords);
  return randomizedCoords;
};

export const syncPropertiesFromSheet = async (triggerType = 'auto') => {
  try {
    console.log(`[Sync] Bắt đầu đồng bộ từ Google Sheet. Trigger: ${triggerType}`);
    const settingsDoc = await SystemSettings.findOne({ key: 'import_settings' });
    if (!settingsDoc || !settingsDoc.value || !settingsDoc.value.sheetUrl) {
      console.log('[Sync Skip] Chưa cấu hình Google Sheet URL trong Settings.');
      return { success: false, message: 'Chưa cấu hình đường dẫn Google Sheet URL.' };
    }

    const { sheetUrl, notificationEmail, clearExisting } = settingsDoc.value;

    const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      console.log('[Sync Error] Đường dẫn Google Sheet không hợp lệ.');
      return { success: false, message: 'Đường dẫn Google Sheet không hợp lệ.' };
    }
    const sheetId = match[1];
    const gidMatch = sheetUrl.match(/[#&]gid=([0-9]+)/);
    const gid = gidMatch ? gidMatch[1] : '0';

    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
    const fetchResponse = await fetch(csvUrl);
    if (!fetchResponse.ok) {
      console.log('[Sync Error] Không thể tải dữ liệu CSV từ Google Sheet.');
      return { success: false, message: 'Không thể tải dữ liệu từ Google Sheet. Hãy kiểm tra chế độ chia sẻ công khai.' };
    }

    const text = await fetchResponse.text();
    const rows = parseCSV(text);

    if (rows.length < 2) {
      return { success: false, message: 'Bảng tính rỗng hoặc thiếu tiêu đề.' };
    }

    const headers = rows[0];
    const headerMap = mapHeaders(headers);

    const required = ['title', 'type', 'price', 'area', 'city', 'district', 'ward', 'address'];
    const missing = required.filter(field => headerMap[field] === undefined);

    if (missing.length > 0) {
      let msg = 'Thiếu các cột bắt buộc: ' + missing.join(', ');
      return { success: false, message: msg };
    }

    // Find the Admin user to set postedBy
    const adminUser = await User.findOne({ $or: [{ role: 'admin' }, { email: 'admin@tncb.vn' }] });
    const adminId = adminUser ? adminUser._id : null;

    const newProperties = [];
    const errors = [];

    const generateStableId = (title, address, city, district, ward) => {
      const str = `${title}-${address}-${city}-${district}-${ward}`;
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
      }
      return 'prop-' + Math.abs(hash).toString(16);
    };

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length === 1 && row[0] === '') continue;
      if (row.every(cell => cell === '')) continue;

      const getVal = (field) => {
        const idx = headerMap[field];
        return idx !== undefined ? row[idx] : '';
      };

      const title = getVal('title');
      const type = getVal('type');
      const rawPrice = getVal('price');
      const rawArea = getVal('area');
      const city = getVal('city');
      const district = getVal('district');
      const ward = getVal('ward');
      const address = getVal('address');
      const rawElectricity = getVal('electricity');
      const rawWater = getVal('water');
      const rawService = getVal('service');
      const rawImages = getVal('images');
      const rawVerified = getVal('verified');
      const rawAmenities = getVal('amenities');
      const description = getVal('description');

      // SILENT SKIP for incomplete rows
      const missingRequiredFields = !title && !type && !rawPrice && !rawArea && !city && !district && !ward && !address;
      if (missingRequiredFields) {
        continue;
      }

      if (!title || !type || !rawPrice || !rawArea || !city || !district || !ward || !address) {
        continue;
      }

      const parseNum = (val) => {
        if (!val) return NaN;
        const clean = val.replace(/[^\d.]/g, '');
        return Number(clean);
      };

      const price = parseNum(rawPrice);
      const area = parseNum(rawArea);
      const electricity = rawElectricity ? parseNum(rawElectricity) : 3500;
      const water = rawWater ? parseNum(rawWater) : 100000;
      const service = rawService ? parseNum(rawService) : 150000;

      if (isNaN(price) || price <= 0) {
        errors.push({ row: i + 1, message: `Giá thuê phòng phải là một số lớn hơn 0 (Nhận được: "${rawPrice}").` });
        continue;
      }
      if (isNaN(area) || area <= 0) {
        errors.push({ row: i + 1, message: `Diện tích phòng phải là một số lớn hơn 0 (Nhận được: "${rawArea}").` });
        continue;
      }

      let coords = null;
      if (headerMap['coords'] !== undefined) {
        const rawCoords = getVal('coords');
        if (rawCoords) {
          const split = rawCoords.split(',').map(n => Number(n.trim()));
          if (split.length === 2 && !isNaN(split[0]) && !isNaN(split[1])) {
            coords = split;
          }
        }
      } else if (headerMap['latitude'] !== undefined && headerMap['longitude'] !== undefined) {
        const lat = Number(getVal('latitude'));
        const lng = Number(getVal('longitude'));
        if (!isNaN(lat) && !isNaN(lng)) {
          coords = [lat, lng];
        }
      }

      if (!coords) {
        coords = await geocodeAddress(address, ward, district, city);
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      let images = [];
      if (rawImages) {
        images = rawImages.split(/[\n,;]/).map(url => url.trim()).filter(Boolean);
      }
      if (images.length === 0) {
        images = ['/student_room_hero.png'];
      }

      let amenities = [];
      if (rawAmenities) {
        amenities = rawAmenities.split(/[\n,;]/).map(a => a.trim()).filter(Boolean);
      }

      // Check for individual amenity checkbox columns
      for (const [apiKey, aliases] of Object.entries(AMENITY_COLUMN_MAP)) {
        for (const alias of aliases) {
          const normAlias = normalizeHeader(alias);
          const colIdx = headers.findIndex(h => normalizeHeader(h) === normAlias);
          if (colIdx !== -1 && row[colIdx] !== undefined) {
            const val = row[colIdx].toLowerCase().trim();
            if (['true', '1', 'yes', 'y', 'x', 'đúng', 'dung', 'checked'].includes(val)) {
              if (!amenities.includes(apiKey)) {
                amenities.push(apiKey);
              }
            }
          }
        }
      }

      const verified = rawVerified
        ? ['true', '1', 'yes', 'y', 'x', 'đã review', 'da review', 'xác thực'].includes(rawVerified.toLowerCase().trim())
        : false;

      const propId = generateStableId(title, address, city, district, ward);

      newProperties.push({
        id: propId,
        _id: propId,
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
        description,
        verified,
        status: 'active',
        isRented: false,
        isUnlisted: false,
        postedBy: adminId || 'user-admin',
        source: 'sheet',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Save synced properties to MongoDB database
    if (clearExisting) {
      // 1. Delete all existing properties from sheet source
      await Property.deleteMany({ source: 'sheet' });
      // 2. Insert new properties
      if (newProperties.length > 0) {
        await Property.insertMany(newProperties);
      }
    } else {
      // Upsert properties individually to update existing and insert new ones
      for (const prop of newProperties) {
        await Property.findOneAndUpdate(
          { _id: prop._id },
          { $set: prop },
          { upsert: true, new: true }
        );
      }
    }

    // Re-initialize bloom filter to ensure accuracy after sync changes
    try {
      await initPropertyBloomFilter();
    } catch (e) {
      console.error('Failed to reinitialize bloom filter:', e.message);
    }

    cachedProperties = newProperties;
    cacheLastUpdated = new Date();

    settingsDoc.value.lastRun = cacheLastUpdated;
    settingsDoc.markModified('value');
    await settingsDoc.save();

    console.log(`[Sync Success] Đồng bộ hoàn tất: ${newProperties.length} phòng trọ. Lỗi: ${errors.length}`);

    if (errors.length > 0 && notificationEmail) {
      sendImportErrorReport(notificationEmail, sheetUrl, newProperties.length, errors.length, errors);
    }

    return {
      success: true,
      importedCount: newProperties.length,
      failedCount: errors.length,
      errors
    };

  } catch (err) {
    console.error('[Sync Exception] Lỗi:', err);
    return { success: false, message: 'Lỗi hệ thống khi đồng bộ: ' + err.message };
  }
};

export const getImportSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne({ key: 'import_settings' });
    if (!settings) {
      settings = new SystemSettings({
        key: 'import_settings',
        value: {
          sheetUrl: '',
          autoImportEnabled: false,
          intervalHours: 24,
          notificationEmail: '',
          clearExisting: false,
          lastRun: null
        }
      });
      await settings.save();
    }
    return res.status(200).json({
      success: true,
      settings: settings.value,
      cacheLastUpdated,
      syncSecretToken: process.env.SYNC_SECRET_TOKEN || ''
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy cấu hình đồng bộ: ' + err.message
    });
  }
};

export const saveImportSettings = async (req, res) => {
  try {
    const { sheetUrl, autoImportEnabled, intervalHours, notificationEmail, clearExisting } = req.body;

    let settings = await SystemSettings.findOne({ key: 'import_settings' });
    if (!settings) {
      settings = new SystemSettings({ key: 'import_settings', value: {} });
    }

    settings.value = {
      sheetUrl: sheetUrl || '',
      autoImportEnabled: !!autoImportEnabled,
      intervalHours: Number(intervalHours) || 24,
      notificationEmail: notificationEmail || '',
      clearExisting: !!clearExisting,
      lastRun: settings.value.lastRun || null
    };

    settings.markModified('value');
    await settings.save();

    // Trigger update of Scheduler
    try {
      const { updateSchedulerInterval } = await import('./importScheduler.js');
      updateSchedulerInterval();
    } catch (e) {
      console.error('Cannot update scheduler:', e.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Lưu cấu hình đồng bộ thành công.',
      settings: settings.value
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi lưu cấu hình đồng bộ: ' + err.message
    });
  }
};

export const syncPropertiesNow = async (req, res) => {
  try {
    const syncTokenHeader = req.headers['x-sync-token'];
    const isWebhook = syncTokenHeader && syncTokenHeader === process.env.SYNC_SECRET_TOKEN;
    const isAdmin = req.user && (req.user.role === 'admin' || req.user.email === 'admin@tncb.vn');

    if (!isWebhook && !isAdmin) {
      return res.status(401).json({
        success: false,
        message: 'Bạn không có quyền thực hiện hành động này.'
      });
    }

    const result = await syncPropertiesFromSheet(isWebhook ? 'webhook' : 'manual');
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: `Đồng bộ thành công! Đã tải ${result.importedCount} phòng trọ. Có ${result.failedCount} dòng bị lỗi.`,
        importedCount: result.importedCount,
        failedCount: result.failedCount,
        errors: result.errors
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message || 'Đồng bộ thất bại.'
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi đồng bộ dữ liệu: ' + err.message
    });
  }
};
