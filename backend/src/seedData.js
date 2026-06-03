import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './modules/auth/User.js';
import Property from './modules/property/Property.js';
import Ticket from './modules/ticket/Ticket.js';

dotenv.config();

const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error('❌ MONGODB_URI is not defined in .env');
  process.exit(1);
}

// 10 base properties from mockProperties.js
const baseProperties = [
  {
    title: 'Nhà Trọ Hiện Đại Cầu Giấy Gần ĐH Ngoại Thương',
    type: 'Nhà trọ không chung chủ',
    price: 4500000,
    area: 25,
    city: 'Hà Nội',
    district: 'Cầu Giấy',
    ward: 'Dịch Vọng Hậu',
    address: '91 Chùa Láng, Láng Thượng, Đống Đa, Hà Nội',
    coords: [21.0285, 105.7823],
    images: [
      'https://picsum.photos/seed/hn-studio-1a/800/600',
      'https://picsum.photos/seed/hn-studio-1b/800/600',
      'https://picsum.photos/seed/hn-studio-1c/800/600',
    ],
    verified: true,
    amenities: ['AirConditioner', 'WiFi', 'FingerprintLock', 'Balcony', 'WashingMachine'],
    electricity: 3500,
    water: 80000,
    service: 120000,
    description: 'Phòng studio thiết kế hiện đại, thoáng mát với ban công rộng nhìn ra phố. Cách ĐH Ngoại Thương chỉ 5 phút đi bộ. Khu vực an ninh, yên tĩnh phù hợp sinh viên.',
    ownerPhone: '0912345678', // Temp field to link postedBy
  },
  {
    title: 'Phòng Trọ Gác Lửng Đống Đa Gần ĐH Bách Khoa',
    type: 'Nhà ở cải tạo thành nhà trọ (không chung chủ)',
    price: 5200000,
    area: 35,
    city: 'Hà Nội',
    district: 'Đống Đa',
    ward: 'Láng Thượng',
    address: '42 Tạ Quang Bửu, Bách Khoa, Hai Bà Trưng, Hà Nội',
    coords: [21.0038, 105.8468],
    images: [
      'https://picsum.photos/seed/hn-duplex-2a/800/600',
      'https://picsum.photos/seed/hn-duplex-2b/800/600',
    ],
    verified: true,
    amenities: ['AirConditioner', 'WashingMachine', 'FreeTime', 'WiFi', 'Kitchen'],
    electricity: 3800,
    water: 100000,
    service: 100000,
    description: 'Duplex gác lửng rộng rãi, tách biệt không gian sinh hoạt và ngủ nghỉ. Gần ĐH Bách Khoa Hà Nội, thuận tiện di chuyển bằng xe buýt.',
    ownerPhone: '0909876543',
  },
  {
    title: 'Chung Cư Mini Hai Bà Trưng Đầy Đủ Nội Thất',
    type: 'Chung cư mini',
    price: 6000000,
    area: 40,
    city: 'Hà Nội',
    district: 'Hai Bà Trưng',
    ward: 'Phố Huế',
    address: '128 Phố Huế, Ngô Thì Nhậm, Hai Bà Trưng, Hà Nội',
    coords: [21.0114, 105.8550],
    images: [
      'https://picsum.photos/seed/hn-ccmini-3a/800/600',
      'https://picsum.photos/seed/hn-ccmini-3b/800/600',
      'https://picsum.photos/seed/hn-ccmini-3c/800/600',
    ],
    verified: true,
    amenities: ['AirConditioner', 'Fridge', 'WashingMachine', 'FingerprintLock', 'Security', 'WiFi'],
    electricity: 4000,
    water: 120000,
    service: 200000,
    description: 'Chung cư mini cao cấp đầy đủ nội thất, thang máy, bảo vệ 24/7. Gần ĐH Kinh Tế Quốc Dân và trung tâm thành phố.',
    ownerPhone: '0868112233',
  },
  {
    title: 'Phòng Trọ Giá Rẻ Thanh Xuân Cho Sinh Viên',
    type: 'Nhà trọ chung chủ',
    price: 2800000,
    area: 18,
    city: 'Hà Nội',
    district: 'Thanh Xuân',
    ward: 'Triều Khúc',
    address: '55 Ngõ 68 Triều Khúc, Thanh Xuân, Hà Nội',
    coords: [20.9932, 105.8100],
    images: [
      'https://picsum.photos/seed/hn-tro-4a/800/600',
      'https://picsum.photos/seed/hn-tro-4b/800/600',
    ],
    verified: false,
    amenities: ['FreeTime', 'WiFi', 'Parking'],
    electricity: 3500,
    water: 70000,
    service: 50000,
    description: 'Phòng trọ giá rẻ phù hợp sinh viên, gần Học viện Ngân Hàng. Khu dân cư yên tĩnh, an ninh tốt, giờ giấc tự do.',
    ownerPhone: '0976543210',
  },
  {
    title: 'Căn Hộ Chung Cư Cao Cấp Nam Từ Liêm View Đẹp',
    type: 'Chung cư',
    price: 7500000,
    area: 38,
    city: 'Hà Nội',
    district: 'Nam Từ Liêm',
    ward: 'Mỹ Đình 2',
    address: '12 Lê Đức Thọ, Mỹ Đình 2, Nam Từ Liêm, Hà Nội',
    coords: [21.0280, 105.7620],
    images: [
      'https://picsum.photos/seed/hn-studio-5a/800/600',
      'https://picsum.photos/seed/hn-studio-5b/800/600',
      'https://picsum.photos/seed/hn-studio-5c/800/600',
    ],
    verified: true,
    amenities: ['AirConditioner', 'Balcony', 'Fridge', 'WashingMachine', 'FingerprintLock', 'WiFi', 'Kitchen', 'Security'],
    electricity: 3800,
    water: 100000,
    service: 250000,
    description: 'Studio cao cấp full nội thất tại trung tâm Mỹ Đình. View thoáng, gần ĐH Hà Nội và các tuyến xe buýt chính. Tòa nhà có thang máy, bảo vệ 24/7.',
    ownerPhone: '0888777666',
  },
  {
    title: 'Nhà Trọ Ban Công Kính Gần ĐH Ngoại Thương CS2',
    type: 'Nhà trọ không chung chủ',
    price: 6500000,
    area: 32,
    city: 'TP. Hồ Chí Minh',
    district: 'Bình Thạnh',
    ward: 'Phường 25',
    address: '215 D5, Phường 25, Bình Thạnh, TP. HCM',
    coords: [10.8016, 106.7118],
    images: [
      'https://picsum.photos/seed/hcm-studio-6a/800/600',
      'https://picsum.photos/seed/hcm-studio-6b/800/600',
      'https://picsum.photos/seed/hcm-studio-6c/800/600',
    ],
    verified: true,
    amenities: ['AirConditioner', 'Balcony', 'Fridge', 'WashingMachine', 'FingerprintLock'],
    electricity: 3800,
    water: 100000,
    service: 150000,
    description: 'Căn hộ studio ban công kính thoáng mát, nội thất hiện đại. Cách ĐH Ngoại Thương CS2 chỉ 500m, thuận tiện di chuyển.',
    ownerPhone: '0869333366', // Map to Admin since in FE admin phone is this
  },
  {
    title: 'Phòng Trọ Tối Giản Nguyễn Gia Trí Gần HUTECH',
    type: 'Nhà ở cải tạo thành nhà trọ (không chung chủ)',
    price: 5200000,
    area: 28,
    city: 'TP. Hồ Chí Minh',
    district: 'Bình Thạnh',
    ward: 'Phường 25',
    address: '135/2 Nguyễn Gia Trí, Phường 25, Bình Thạnh, TP. HCM',
    coords: [10.8032, 106.7145],
    images: [
      'https://picsum.photos/seed/hcm-duplex-7a/800/600',
      'https://picsum.photos/seed/hcm-duplex-7b/800/600',
    ],
    verified: true,
    amenities: ['AirConditioner', 'WashingMachine', 'FreeTime', 'WiFi'],
    electricity: 4000,
    water: 120000,
    service: 100000,
    description: 'Phòng duplex thiết kế tối giản, gác lửng rộng rãi. Gần HUTECH và khu ăn uống sầm uất Nguyễn Gia Trí.',
    ownerPhone: '0909123456',
  },
  {
    title: 'Chung Cư Mini Gò Vấp Gần ĐH Công Nghiệp',
    type: 'Chung cư mini',
    price: 4200000,
    area: 30,
    city: 'TP. Hồ Chí Minh',
    district: 'Gò Vấp',
    ward: 'Phường 10',
    address: '78 Nguyễn Văn Lượng, Phường 10, Gò Vấp, TP. HCM',
    coords: [10.8380, 106.6650],
    images: [
      'https://picsum.photos/seed/hcm-ccmini-8a/800/600',
      'https://picsum.photos/seed/hcm-ccmini-8b/800/600',
      'https://picsum.photos/seed/hcm-ccmini-8c/800/600',
    ],
    verified: true,
    amenities: ['AirConditioner', 'Fridge', 'WashingMachine', 'WiFi', 'Parking', 'Security'],
    electricity: 3500,
    water: 90000,
    service: 130000,
    description: 'Chung cư mini mới xây, nội thất cơ bản, thang máy, camera an ninh. Gần ĐH Công Nghiệp TP.HCM, chợ và siêu thị tiện lợi.',
    ownerPhone: '0932111222',
  },
  {
    title: 'Phòng Trọ Phú Nhuận Yên Tĩnh Gần Trung Tâm',
    type: 'Nhà trọ không chung chủ',
    price: 3500000,
    area: 20,
    city: 'TP. Hồ Chí Minh',
    district: 'Phú Nhuận',
    ward: 'Phường 2',
    address: '23/5 Phan Xích Long, Phường 2, Phú Nhuận, TP. HCM',
    coords: [10.7998, 106.6820],
    images: [
      'https://picsum.photos/seed/hcm-tro-9a/800/600',
      'https://picsum.photos/seed/hcm-tro-9b/800/600',
    ],
    verified: false,
    amenities: ['AirConditioner', 'FreeTime', 'WiFi', 'Parking'],
    electricity: 3800,
    water: 80000,
    service: 80000,
    description: 'Phòng trọ yên tĩnh trong hẻm an ninh Phú Nhuận. Giờ giấc tự do, gần chợ Phú Nhuận và nhiều quán ăn sinh viên.',
    ownerPhone: '0945678901',
  },
  {
    title: 'Căn Hộ Chung Cư Thủ Đức Full Nội Thất Gần ĐHQG',
    type: 'Chung cư',
    price: 5800000,
    area: 30,
    city: 'TP. Hồ Chí Minh',
    district: 'Thủ Đức',
    ward: 'Bình Thọ',
    address: '190 Đường Võ Văn Ngân, Bình Thọ, Thủ Đức, TP. HCM',
    coords: [10.8510, 106.7590],
    images: [
      'https://picsum.photos/seed/hcm-studio-10a/800/600',
      'https://picsum.photos/seed/hcm-studio-10b/800/600',
      'https://picsum.photos/seed/hcm-studio-10c/800/600',
    ],
    verified: true,
    amenities: ['AirConditioner', 'Balcony', 'Fridge', 'WashingMachine', 'FingerprintLock', 'WiFi', 'Kitchen'],
    electricity: 3500,
    water: 100000,
    service: 180000,
    description: 'Studio full nội thất cao cấp gần ĐHQG TP.HCM. Tòa nhà mới xây, có thang máy, bảo vệ, và hệ thống camera an ninh.',
    ownerPhone: '0918222333',
  },
];

const seedUsers = [
  // Admin
  {
    name: 'Quản Trị Viên TNCB',
    email: 'admin@tncb.vn',
    phone: '0869333366',
    password: 'admin', // Will be hashed by mongoose pre-save hook
    role: 'admin',
    avatar: 'https://picsum.photos/seed/owner-admin/100/100',
  },
  // Default Landlord
  {
    name: 'Nguyễn Văn Đạt',
    email: 'landlord@tncb.vn',
    phone: '0900000001',
    password: '123',
    role: 'landlord',
    avatar: 'https://picsum.photos/seed/owner-dat/100/100',
  },
  // Test Landlord
  {
    name: 'Chủ Trọ Thử Nghiệm',
    email: 'testlandlord@tncb.vn',
    phone: '0900000002',
    password: '123',
    role: 'landlord',
    avatar: 'https://picsum.photos/seed/owner-testlandlord/100/100',
  },
  // Default Tenant
  {
    name: 'Nguyễn Minh Anh',
    email: 'tenant@tncb.vn',
    phone: '0900000003',
    password: '123',
    role: 'tenant',
    avatar: 'https://picsum.photos/seed/user-minhanh/100/100',
  },
  // Test Tenant
  {
    name: 'Khách Thuê Thử Nghiệm',
    email: 'testtenant@tncb.vn',
    phone: '0900000004',
    password: '123',
    role: 'tenant',
    avatar: 'https://picsum.photos/seed/user-testtenant/100/100',
  },
  // Tenant
  {
    name: 'Trần Đức An',
    email: 'an@tncb.vn',
    phone: '0987654321',
    password: '123456',
    role: 'tenant',
    avatar: 'https://picsum.photos/seed/user-an/100/100',
  },
  // Landlords
  {
    name: 'Nguyễn Văn Hùng',
    email: 'hung@tncb.vn',
    phone: '0912345678',
    password: '123456',
    role: 'landlord',
    avatar: 'https://picsum.photos/seed/owner-hung/100/100',
  },
  {
    name: 'Trần Thị Mai',
    email: 'mai@tncb.vn',
    phone: '0909876543',
    password: '123456',
    role: 'landlord',
    avatar: 'https://picsum.photos/seed/owner-mai/100/100',
  },
  {
    name: 'Lê Đức Anh',
    email: 'ducanh@tncb.vn',
    phone: '0868112233',
    password: '123456',
    role: 'landlord',
    avatar: 'https://picsum.photos/seed/owner-anh/100/100',
  },
  {
    name: 'Phạm Thị Hoa',
    email: 'hoa@tncb.vn',
    phone: '0976543210',
    password: '123456',
    role: 'landlord',
    avatar: 'https://picsum.photos/seed/owner-hoa/100/100',
  },
  {
    name: 'Đỗ Minh Tuấn',
    email: 'tuan@tncb.vn',
    phone: '0888777666',
    password: '123456',
    role: 'landlord',
    avatar: 'https://picsum.photos/seed/owner-tuan/100/100',
  },
  {
    name: 'Trần Thị Lan',
    email: 'lan@tncb.vn',
    phone: '0909123456',
    password: '123456',
    role: 'landlord',
    avatar: 'https://picsum.photos/seed/owner-lan/100/100',
  },
  {
    name: 'Võ Hoàng Nam',
    email: 'nam@tncb.vn',
    phone: '0932111222',
    password: '123456',
    role: 'landlord',
    avatar: 'https://picsum.photos/seed/owner-nam/100/100',
  },
  {
    name: 'Bùi Thanh Tùng',
    email: 'tung@tncb.vn',
    phone: '0945678901',
    password: '123456',
    role: 'landlord',
    avatar: 'https://picsum.photos/seed/owner-tung/100/100',
  },
  {
    name: 'Lý Minh Khoa',
    email: 'khoa@tncb.vn',
    phone: '0918222333',
    password: '123456',
    role: 'landlord',
    avatar: 'https://picsum.photos/seed/owner-khoa/100/100',
  },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB Atlas for seeding...');
    await mongoose.connect(mongoURI);
    console.log('✅ Connected successfully.');

    // Clear old data
    console.log('Cleaning collections...');
    await User.deleteMany({});
    await Property.deleteMany({});
    await Ticket.deleteMany({});
    console.log('✅ Collections cleaned.');

    // Seed Users
    console.log('Seeding Users...');
    const createdUsers = [];
    for (const u of seedUsers) {
      const userDoc = new User(u);
      await userDoc.save();
      createdUsers.push(userDoc);
    }
    console.log(`✅ Seeded ${createdUsers.length} users successfully.`);

    // Build Phone-to-ID map for fast linking
    const phoneToUserMap = {};
    createdUsers.forEach(u => {
      phoneToUserMap[u.phone] = u._id;
    });

    // Seed Properties
    console.log('Seeding Properties...');
    const propertiesToInsert = baseProperties.map(p => {
      const ownerId = phoneToUserMap[p.ownerPhone] || phoneToUserMap['0869333366']; // fallback to admin
      const { ownerPhone, ...rest } = p;
      return {
        ...rest,
        postedBy: ownerId
      };
    });

    const createdProperties = await Property.insertMany(propertiesToInsert);
    console.log(`✅ Seeded ${createdProperties.length} properties successfully.`);
    console.log('🎉 Seeding completed successfully!');

  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seed();
