import Property from './Property.js';
import HeroSlide from './HeroSlide.js';
import { checkDuplicateProperty } from './deduplication.js';
import { propertyBloomFilter } from './propertyBloomFilter.js';
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

    let filtered = [...cachedProperties];

    // Filter by city
    if (city) {
      filtered = filtered.filter(p => p.city === city);
    }
    // Filter by district
    if (district) {
      filtered = filtered.filter(p => p.district === district);
    }
    // Filter by ward
    if (ward) {
      filtered = filtered.filter(p => p.ward === ward);
    }
    // Filter by type
    if (type) {
      filtered = filtered.filter(p => p.type === type);
    }
    // Price range
    if (minPrice) {
      filtered = filtered.filter(p => p.price >= Number(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(p => p.price <= Number(maxPrice));
    }
    // Area range
    if (minArea) {
      filtered = filtered.filter(p => p.area >= Number(minArea));
    }
    if (maxArea) {
      filtered = filtered.filter(p => p.area <= Number(maxArea));
    }
    // Amenities
    if (amenities) {
      const amenitiesList = Array.isArray(amenities)
        ? amenities
        : amenities.split(',').map(a => a.trim()).filter(Boolean);
      if (amenitiesList.length > 0) {
        filtered = filtered.filter(p => 
          amenitiesList.every(a => p.amenities && p.amenities.includes(a))
        );
      }
    }
    // Search query (case-insensitive in title, description, address)
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(p => 
        (p.title && p.title.toLowerCase().includes(s)) ||
        (p.description && p.description.toLowerCase().includes(s)) ||
        (p.address && p.address.toLowerCase().includes(s))
      );
    }

    // Sort: verified first, then createdAt desc
    filtered.sort((a, b) => {
      if (a.verified && !b.verified) return -1;
      if (!a.verified && b.verified) return 1;
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return res.status(200).json({
      success: true,
      count: filtered.length,
      properties: filtered
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
    return res.status(200).json({
      success: true,
      count: cachedProperties.length,
      properties: cachedProperties
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
    const property = cachedProperties.find(p => p.id === req.params.id);

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
  return returnSheetsModeError(res);
};

export const updateProperty = async (req, res) => {
  return returnSheetsModeError(res);
};

export const deleteProperty = async (req, res) => {
  return returnSheetsModeError(res);
};

export const toggleRentedStatus = async (req, res) => {
  return returnSheetsModeError(res);
};

export const toggleUnlistedStatus = async (req, res) => {
  return returnSheetsModeError(res);
};

export const toggleVerifyStatus = async (req, res) => {
  return returnSheetsModeError(res);
};

export const getAdminReviewQueue = async (req, res) => {
  return res.status(200).json({
    success: true,
    count: 0,
    queue: []
  });
};

export const approveProperty = async (req, res) => {
  return returnSheetsModeError(res);
};

export const rejectProperty = async (req, res) => {
  return returnSheetsModeError(res);
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

export const syncPropertiesFromSheet = async (triggerType = 'auto') => {
  try {
    console.log(`[Sync] Bắt đầu đồng bộ từ Google Sheet. Trigger: ${triggerType}`);
    const settingsDoc = await SystemSettings.findOne({ key: 'import_settings' });
    if (!settingsDoc || !settingsDoc.value || !settingsDoc.value.sheetUrl) {
      console.log('[Sync Skip] Chưa cấu hình Google Sheet URL trong Settings.');
      return { success: false, message: 'Chưa cấu hình đường dẫn Google Sheet URL.' };
    }

    const { sheetUrl, notificationEmail } = settingsDoc.value;

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
    const hasCoords = headerMap['coords'] !== undefined || (headerMap['latitude'] !== undefined && headerMap['longitude'] !== undefined);

    if (missing.length > 0 || !hasCoords) {
      let msg = 'Thiếu các cột bắt buộc: ';
      if (missing.length > 0) msg += missing.join(', ');
      if (!hasCoords) msg += (missing.length > 0 ? ', ' : '') + 'coords (hoặc latitude & longitude)';
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
      } else {
        const lat = Number(getVal('latitude'));
        const lng = Number(getVal('longitude'));
        if (!isNaN(lat) && !isNaN(lng)) {
          coords = [lat, lng];
        }
      }

      if (!coords) {
        errors.push({ row: i + 1, message: `Tọa độ không hợp lệ (Phải là định dạng "Vĩ độ,Kinh độ" chứa hai số thực).` });
        continue;
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
        createdAt: new Date(),
        updatedAt: new Date()
      });
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
