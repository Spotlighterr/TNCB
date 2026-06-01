/* eslint-disable no-unused-vars */

export const CITIES = ['Hà Nội', 'TP. Hồ Chí Minh'];

export const DISTRICTS = {
  'Hà Nội': ['Cầu Giấy', 'Đống Đa', 'Hai Bà Trưng', 'Thanh Xuân', 'Nam Từ Liêm'],
  'TP. Hồ Chí Minh': ['Bình Thạnh', 'Gò Vấp', 'Phú Nhuận', 'Quận 1', 'Thủ Đức'],
};

export const WARDS = {
  'Cầu Giấy': ['Dịch Vọng', 'Dịch Vọng Hậu', 'Quan Hoa', 'Nghĩa Tân', 'Nghĩa Đô', 'Mai Dịch', 'Trung Hòa', 'Yên Hòa'],
  'Đống Đa': ['Láng Thượng', 'Láng Hạ', 'Quang Trung', 'Ô Chợ Dừa', 'Khương Thượng', 'Cát Linh', 'Kim Liên', 'Thịnh Quang'],
  'Hai Bà Trưng': ['Phố Huế', 'Ngô Thì Nhậm', 'Bách Khoa', 'Quỳnh Lôi', 'Bạch Mai', 'Trương Định', 'Minh Khai', 'Đồng Tâm'],
  'Thanh Xuân': ['Khương Mai', 'Khương Trung', 'Triều Khúc', 'Thanh Xuân Nam', 'Thanh Xuân Trung', 'Nhân Chính', 'Kim Giang', 'Thượng Đình'],
  'Nam Từ Liêm': ['Mỹ Đình 1', 'Mỹ Đình 2', 'Mễ Trì', 'Tây Mỗ', 'Đại Mỗ', 'Trung Văn', 'Xuân Phương'],
  'Bình Thạnh': ['Phường 25', 'Phường 26', 'Phường 27', 'Phường 15', 'Phường 17', 'Phường 19', 'Phường 21', 'Phường 22'],
  'Gò Vấp': ['Phường 10', 'Phường 7', 'Phường 5', 'Phường 3', 'Phường 1', 'Phường 11', 'Phường 17'],
  'Phú Nhuận': ['Phường 2', 'Phường 1', 'Phường 3', 'Phường 5', 'Phường 7', 'Phường 9', 'Phường 11'],
  'Quận 1': ['Bến Nghé', 'Bến Thành', 'Cô Giang', 'Đa Kao', 'Nguyễn Thái Bình', 'Nguyễn Cư Trinh', 'Tân Định'],
  'Thủ Đức': ['Bình Thọ', 'Linh Trung', 'Linh Xuân', 'Linh Tây', 'Linh Đông', 'Trường Thọ', 'Bình Chiểu'],
};

export const ROOM_TYPES = ['Studio', 'Duplex', 'Chung cư mini', 'Phòng trọ'];

export const AMENITY_MAP = {
  AirConditioner: { label: 'Điều hòa', icon: 'Fan' },
  Balcony: { label: 'Ban công', icon: 'Sun' },
  Fridge: { label: 'Tủ lạnh', icon: 'Snowflake' },
  WashingMachine: { label: 'Máy giặt', icon: 'TShirt' },
  FingerprintLock: { label: 'Khóa vân tay', icon: 'Fingerprint' },
  FreeTime: { label: 'Giờ giấc tự do', icon: 'Clock' },
  WiFi: { label: 'WiFi miễn phí', icon: 'WifiHigh' },
  Parking: { label: 'Chỗ để xe', icon: 'Car' },
  Kitchen: { label: 'Bếp riêng', icon: 'CookingPot' },
  Security: { label: 'Bảo vệ 24/7', icon: 'ShieldCheck' },
};

const baseProperties = [
  // ========================
  //  HÀ NỘI (5 phòng)
  // ========================
  {
    id: 'prop-1',
    title: 'Studio Hiện Đại Cầu Giấy Gần ĐH Ngoại Thương',
    type: 'Studio',
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
    owner: {
      name: 'Nguyễn Văn Hùng',
      phone: '0912345678',
      avatar: 'https://picsum.photos/seed/owner-hung/100/100',
      zalo: '0912345678',
    },
  },
  {
    id: 'prop-2',
    title: 'Duplex Gác Lửng Đống Đa Gần ĐH Bách Khoa',
    type: 'Duplex',
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
    owner: {
      name: 'Trần Thị Mai',
      phone: '0909876543',
      avatar: 'https://picsum.photos/seed/owner-mai/100/100',
      zalo: '0909876543',
    },
  },
  {
    id: 'prop-3',
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
    owner: {
      name: 'Lê Đức Anh',
      phone: '0868112233',
      avatar: 'https://picsum.photos/seed/owner-anh/100/100',
      zalo: '0868112233',
    },
  },
  {
    id: 'prop-4',
    title: 'Phòng Trọ Giá Rẻ Thanh Xuân Cho Sinh Viên',
    type: 'Phòng trọ',
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
    owner: {
      name: 'Phạm Thị Hoa',
      phone: '0976543210',
      avatar: 'https://picsum.photos/seed/owner-hoa/100/100',
      zalo: '0976543210',
    },
  },
  {
    id: 'prop-5',
    title: 'Studio Cao Cấp Nam Từ Liêm View Hồ Tây',
    type: 'Studio',
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
    owner: {
      name: 'Đỗ Minh Tuấn',
      phone: '0888777666',
      avatar: 'https://picsum.photos/seed/owner-tuan/100/100',
      zalo: '0888777666',
    },
  },

  // ============================
  //  TP. HỒ CHÍ MINH (5 phòng)
  // ============================
  {
    id: 'prop-6',
    title: 'Studio Ban Công Kính Gần ĐH Ngoại Thương CS2',
    type: 'Studio',
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
    owner: {
      name: 'Nguyễn Văn Đạt',
      phone: '0869333366',
      avatar: 'https://picsum.photos/seed/owner-dat/100/100',
      zalo: '0869333366',
    },
  },
  {
    id: 'prop-7',
    title: 'Duplex Tối Giản Nguyễn Gia Trí Gần HUTECH',
    type: 'Duplex',
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
    owner: {
      name: 'Trần Thị Lan',
      phone: '0909123456',
      avatar: 'https://picsum.photos/seed/owner-lan/100/100',
      zalo: '0909123456',
    },
  },
  {
    id: 'prop-8',
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
    owner: {
      name: 'Võ Hoàng Nam',
      phone: '0932111222',
      avatar: 'https://picsum.photos/seed/owner-nam/100/100',
      zalo: '0932111222',
    },
  },
  {
    id: 'prop-9',
    title: 'Phòng Trọ Phú Nhuận Yên Tĩnh Gần Trung Tâm',
    type: 'Phòng trọ',
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
    owner: {
      name: 'Bùi Thanh Tùng',
      phone: '0945678901',
      avatar: 'https://picsum.photos/seed/owner-tung/100/100',
      zalo: '0945678901',
    },
  },
  {
    id: 'prop-10',
    title: 'Studio Thủ Đức Full Nội Thất Gần ĐHQG',
    type: 'Studio',
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
    owner: {
      name: 'Lý Minh Khoa',
      phone: '0918222333',
      avatar: 'https://picsum.photos/seed/owner-khoa/100/100',
      zalo: '0918222333',
    },
  },
];

const generatedProperties = [];
const hanoiDistricts = DISTRICTS['Hà Nội'];
const hcmcDistricts = DISTRICTS['TP. Hồ Chí Minh'];

const streetsHanoi = [
  'Đường Nguyễn Phong Sắc', 'Đường Xuân Thủy', 'Đường Chùa Láng', 'Đường Kim Mã',
  'Đường Trần Duy Hưng', 'Đường Tây Sơn', 'Đường Xã Đàn', 'Đường Tạ Quang Bửu',
  'Đường Đại Cồ Việt', 'Đường Nguyễn Trãi', 'Đường Khuất Duy Tiến', 'Đường Mỹ Đình',
  'Đường Hồ Tùng Mậu', 'Đường Triều Khúc', 'Đường Lương Thế Vinh', 'Đường Trần Thái Tông'
];

const streetsHCMC = [
  'Đường Nguyễn Gia Trí', 'Đường D5', 'Đường Phan Xích Long', 'Đường Lê Quang Định',
  'Đường Nguyễn Văn Lượng', 'Đường Quang Trung', 'Đường Bến Vân Đồn', 'Đường Bùi Viện',
  'Đường Lê Lợi', 'Đường Võ Văn Ngân', 'Đường Kha Vạn Cân', 'Đường Hoàng Diệu 2',
  'Đường Phạm Văn Đồng', 'Đường Phan Đăng Lưu', 'Đường Nguyễn Văn Trỗi', 'Đường Phùng Văn Cung'
];

const ownerNames = [
  'Nguyễn Văn Sơn', 'Trần Thị Thảo', 'Lê Hoàng Long', 'Phạm Minh Trí', 'Nguyễn Thị Hoa',
  'Vũ Quốc Bảo', 'Đặng Hồng Nhung', 'Phan Văn Hải', 'Lý Thu Trang', 'Hoàng Kim Chi',
  'Đỗ Gia Huy', 'Bùi Ngọc Lan', 'Nguyễn Tiến Dũng', 'Lê Minh Hằng', 'Phạm Quang Minh'
];

const titlesTemplate = {
  'Studio': [
    'Studio Gác Lửng Sang Trọng Gần Tiện Ích',
    'Căn Hộ Studio Full Nội Thất Mới Keng',
    'Studio Ban Công Thoáng Mát View Đẹp',
    'Phòng Studio Yên Tĩnh Cho Thuê Dài Hạn',
    'Căn Hộ Studio Hiện Đại Cực Xịn Cho Sinh Viên'
  ],
  'Duplex': [
    'Duplex Cực Rộng Rãi Ban Công Thoáng',
    'Căn Hộ Duplex Tối Giản Hiện Đại View Xịn',
    'Duplex Thiết Kế Bắc Âu Full Nội Thất Siêu Xinh',
    'Duplex Gác Lửng Rộng Rãi Cho Sinh Viên Ở Ghép',
    'Phòng Duplex Ban Công View Thành Phố'
  ],
  'Chung cư mini': [
    'Chung Cư Mini Thang Máy Bảo Vệ 24/7 An Ninh',
    'CCMN Mới Xây Đầy Đủ Đồ Ngay Mặt Tiền',
    'Chung Cư Mini Cao Cấp Giờ Giấc Tự Do',
    'CCMN Cao Cấp Cạnh Các Trường Đại Học',
    'Chung Cư Mini Rộng Rãi Full Nội Thất Ở Liền'
  ],
  'Phòng trọ': [
    'Phòng Trọ Giá Rẻ An Ninh Tự Do Cho Sinh Viên',
    'Phòng Trọ Sinh Viên Giá Tốt Gần Trạm Xe Buýt',
    'Phòng Trọ Khép Kín Sạch Sẽ Ở Riêng Biệt',
    'Phòng Trọ Giờ Giấc Tự Do Giá Hợp Lý',
    'Phòng Trọ Sinh Viên Gần Chợ Cực Kỳ Tiện Lợi'
  ]
};

const descriptionsTemplate = [
  'Phòng trọ đẹp đẽ sạch sẽ đầy đủ tiện nghi thiết yếu, nằm trong khu vực dân cư an ninh, đông đúc. Gần nhiều trạm xe buýt và các trường đại học lớn, cực kỳ thuận tiện cho sinh viên di chuyển học tập.',
  'Căn hộ thiết kế hiện đại tối ưu hóa không gian sống, ban công ngập tràn ánh sáng tự nhiên. Giờ giấc hoàn toàn tự do khóa vân tay bảo mật tuyệt đối, khu vực để xe rộng rãi an toàn.',
  'Tòa nhà cao cấp có thang máy di chuyển nhanh, bảo vệ tuần tra 24/7 thân thiện. Nội thất đầy đủ chỉ việc mang vali quần áo vào ở ngay. Hỗ trợ kỹ thuật nhanh chóng khi gặp sự cố.',
  'Phòng khép kín sạch đẹp yên tĩnh phù hợp học tập nghỉ ngơi sau giờ học. Hàng xóm xung quanh văn minh lịch sự, chủ nhà thân thiện nhiệt tình tạo mọi điều kiện tốt nhất cho khách thuê.'
];

// Loop to generate 90 properties programmatically
for (let i = 1; i <= 90; i++) {
  const city = i % 2 === 0 ? 'Hà Nội' : 'TP. Hồ Chí Minh';
  const districts = DISTRICTS[city];
  const district = districts[i % districts.length];
  const wards = WARDS[district];
  const ward = wards[i % wards.length];
  
  const type = ROOM_TYPES[i % ROOM_TYPES.length];
  
  // Set realistic price ranges based on room type
  let price = 2500000;
  let area = 18;
  if (type === 'Studio') {
    price = 4500000 + (i % 8) * 400000;
    area = 24 + (i % 5) * 3;
  } else if (type === 'Duplex') {
    price = 5000000 + (i % 7) * 500000;
    area = 28 + (i % 4) * 4;
  } else if (type === 'Chung cư mini') {
    price = 4000000 + (i % 6) * 500000;
    area = 30 + (i % 6) * 2;
  } else { // Phòng trọ
    price = 1800000 + (i % 5) * 300000;
    area = 15 + (i % 4) * 2;
  }

  const street = city === 'Hà Nội' ? streetsHanoi[i % streetsHanoi.length] : streetsHCMC[i % streetsHCMC.length];
  const address = `Số ${15 + i}, ${street}, ${ward}, ${district}, ${city}`;
  
  // Generate realistic coordinates around HN and HCMC
  const baseLat = city === 'Hà Nội' ? 21.02 : 10.78;
  const baseLng = city === 'Hà Nội' ? 105.80 : 106.68;
  const coords = [
    baseLat + ((i % 10) - 5) * 0.006 + (i % 3) * 0.002,
    baseLng + ((i % 10) - 5) * 0.006 + (i % 3) * 0.002
  ];

  const titleList = titlesTemplate[type];
  const title = `${titleList[i % titleList.length]} ${district}`;

  const amenitiesPool = Object.keys(AMENITY_MAP);
  // Give 3 to 7 random amenities
  const amenitiesCount = 3 + (i % 5);
  const amenities = [];
  for (let j = 0; j < amenitiesCount; j++) {
    const am = amenitiesPool[(i + j) % amenitiesPool.length];
    if (!amenities.includes(am)) {
      amenities.push(am);
    }
  }

  const images = [
    `https://picsum.photos/seed/generated-prop-${i}a/800/600`,
    `https://picsum.photos/seed/generated-prop-${i}b/800/600`
  ];

  const ownerName = ownerNames[i % ownerNames.length];
  const phoneSuffix = (1000 + i).toString();
  const phone = `098455${phoneSuffix}`;

  generatedProperties.push({
    id: `generated-prop-${i}`,
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
    verified: i % 3 === 0,
    isRented: i % 12 === 0, // Mark a few as already rented to make it organic
    amenities,
    electricity: 3500 + (i % 3) * 300,
    water: 80000 + (i % 3) * 20000,
    service: 100000 + (i % 3) * 50000,
    description: descriptionsTemplate[i % descriptionsTemplate.length],
    owner: {
      name: ownerName,
      phone,
      avatar: `https://picsum.photos/seed/generated-owner-${i}/100/100`,
      zalo: phone
    }
  });
}

export const properties = [...baseProperties, ...generatedProperties];
