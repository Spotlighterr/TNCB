import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mockProperties } from '../data/mockProperties';
import { mockContracts, mockTickets } from '../data/mockContracts';

const AppContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

const mockUsers = [
  {
    id: 'user-admin',
    name: 'Quản trị viên',
    email: 'admin@tncb.vn',
    phone: '0999999999',
    role: 'admin',
    mfaEnabled: false,
    otpEnabled: false,
    avatar: 'https://picsum.photos/seed/admin/100/100'
  },
  {
    id: 'user-landlord',
    name: 'Nguyễn Văn Đạt',
    email: 'landlord@tncb.vn',
    phone: '0869333366',
    role: 'landlord',
    mfaEnabled: false,
    otpEnabled: false,
    avatar: 'https://picsum.photos/seed/owner-dat/100/100'
  },
  {
    id: 'user-testlandlord',
    name: 'Chủ Trọ Thử Nghiệm',
    email: 'testlandlord@tncb.vn',
    phone: '0909123456',
    role: 'landlord',
    mfaEnabled: false,
    otpEnabled: false,
    avatar: 'https://picsum.photos/seed/landlord/100/100'
  },
  {
    id: 'user-tenant',
    name: 'Nguyễn Minh Anh',
    email: 'tenant@tncb.vn',
    phone: '0912345678',
    role: 'tenant',
    mfaEnabled: false,
    otpEnabled: false,
    avatar: 'https://picsum.photos/seed/tenant/100/100'
  },
  {
    id: 'user-testtenant',
    name: 'Khách Thuê Thử Nghiệm',
    email: 'testtenant@tncb.vn',
    phone: '0987654321',
    role: 'tenant',
    mfaEnabled: false,
    otpEnabled: false,
    avatar: 'https://picsum.photos/seed/testtenant/100/100'
  }
];

const defaultMockHeroSlides = [
  {
    id: 'slide-1',
    image: '/club_team_photo.png',
    tag: 'Cộng đồng FindX',
    title: 'Đội ngũ Core Team FindX',
    description: 'Nơi kết nối và mang đến những giải pháp phòng trọ tối ưu cho sinh viên FTU.',
    badgeText: 'CLB Hỗ trợ sinh viên',
    link: 'https://www.facebook.com/FTU.HousingBank',
    order: 1
  },
  {
    id: 'slide-2',
    image: '/university_activities.png',
    tag: 'Hoạt động nổi bật',
    title: 'Hành trình cùng Tân sinh viên',
    description: 'Chương trình đồng hành hỗ trợ tìm kiếm nhà trọ an toàn, giá tốt đầu khóa học.',
    badgeText: 'Sự kiện 2026',
    link: 'https://www.facebook.com/FTU.HousingBank',
    order: 2
  },
  {
    id: 'slide-3',
    image: '/student_room_hero.png',
    tag: 'Phòng trọ kiểu mẫu',
    title: 'Không gian sống thông minh',
    description: 'Gợi ý các căn hộ studio đẹp mắt, gần trường đại học tại Hà Nội & TP.HCM.',
    badgeText: 'Xác thực 100%',
    link: '/search',
    order: 3
  }
];

function loadFromStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function loadHistoryFromStorage() {
  try {
    const saved = localStorage.getItem('TNCB_VIEW_HISTORY');
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    const limit = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return parsed.filter(item => item && item.id && item.viewedAt > limit);
  } catch {
    return [];
  }
}

export function AppProvider({ children }) {
  // Core State
  const [properties, setProperties] = useState([]);
  const [contracts, setContracts] = useState(() =>
    loadFromStorage('TNCB_CONTRACTS', mockContracts)
  );
  const [tickets, setTickets] = useState([]);
  const [heroSlides, setHeroSlides] = useState([]);
  const [isMockMode, setIsMockMode] = useState(false);

  // Auth Modal State (Global)
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  // View History State (7 days retention)
  const [viewHistory, setViewHistory] = useState(() =>
    loadHistoryFromStorage()
  );

  const [userRole, setUserRole] = useState(() =>
    loadFromStorage('TNCB_ROLE', 'tenant')
  );
  // Keep users array structure empty to prevent breaking any unused references
  const [users] = useState([]);
  const [currentUser, setCurrentUser] = useState(() =>
    loadFromStorage('TNCB_CURRENT_USER', null)
  );

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('TNCB_THEME');
    return saved ? saved : 'light';
  });

  // --- OTP & Pending Registration State ---
  const [pendingRegistration, setPendingRegistration] = useState(null);
  const [currentOTP, setCurrentOTP] = useState(null);
  const [otpExpiry, setOtpExpiry] = useState(null);

  useEffect(() => {
    localStorage.setItem('TNCB_THEME', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('TNCB_CONTRACTS', JSON.stringify(contracts));
  }, [contracts]);

  useEffect(() => {
    localStorage.setItem('TNCB_VIEW_HISTORY', JSON.stringify(viewHistory));
  }, [viewHistory]);

  useEffect(() => {
    localStorage.setItem('TNCB_ROLE', JSON.stringify(userRole));
  }, [userRole]);

  useEffect(() => {
    localStorage.setItem('TNCB_CURRENT_USER', JSON.stringify(currentUser));
    if (currentUser) {
      setUserRole(currentUser.role);
    }
  }, [currentUser]);

  // Helper to map backend format to frontend expectation
  const transformProperty = useCallback((p) => {
    if (!p) return p;
    const transformImages = (imgs) => {
      return (imgs || []).map((img) => {
        if (typeof img === 'string' && img.startsWith('/uploads/')) {
          return `${API_BASE_URL}${img}`;
        }
        return img;
      });
    };

    return {
      ...p,
      id: p._id || p.id,
      images: transformImages(p.images),
      duplicateReport: p.duplicateReport ? {
        ...p.duplicateReport,
        matchedProperty: p.duplicateReport.matchedProperty && typeof p.duplicateReport.matchedProperty === 'object'
          ? transformProperty(p.duplicateReport.matchedProperty)
          : p.duplicateReport.matchedProperty
      } : p.duplicateReport,
      owner: p.postedBy && typeof p.postedBy === 'object' ? {
        name: p.postedBy.name,
        phone: p.postedBy.phone,
        avatar: p.postedBy.avatar,
        zalo: p.postedBy.zalo || p.postedBy.phone
      } : {
        name: p.owner?.name || 'Chủ nhà',
        phone: p.owner?.phone || '',
        avatar: p.owner?.avatar || '',
        zalo: p.owner?.zalo || p.owner?.phone || ''
      }
    };
  }, []);

  const transformHeroSlide = useCallback((slide) => {
    if (!slide) return slide;
    return {
      ...slide,
      id: slide._id || slide.id,
      image: typeof slide.image === 'string' && slide.image.startsWith('/uploads/')
        ? `${API_BASE_URL}${slide.image}`
        : slide.image
    };
  }, []);

  // API Fetch actions
  const fetchProperties = useCallback(async () => {
    if (isMockMode) {
      const localProps = loadFromStorage('TNCB_PROPERTIES', null);
      if (localProps && localProps.length > 0) {
        setProperties(localProps);
      } else {
        setProperties(mockProperties);
        localStorage.setItem('TNCB_PROPERTIES', JSON.stringify(mockProperties));
      }
      return;
    }
    try {
      const res = await fetch(API_BASE_URL + '/api/properties');
      const data = await res.json();
      if (data.success) {
        let list = data.properties.map(transformProperty);
        
        // If logged in, fetch personal properties and merge
        const token = localStorage.getItem('TNCB_TOKEN');
        if (token) {
          const myRes = await fetch(API_BASE_URL + '/api/properties/my-properties', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const myData = await myRes.json();
          if (myData.success) {
            const myProps = myData.properties.map(transformProperty);
            const merged = [...list];
            myProps.forEach(p => {
              const idx = merged.findIndex(x => x.id === p.id);
              if (idx === -1) {
                merged.push(p);
              } else {
                merged[idx] = p;
              }
            });
            list = merged;
          }

          // If admin, also fetch review queue
          const currentUserData = JSON.parse(localStorage.getItem('TNCB_CURRENT_USER') || 'null');
          const isAdminUser = currentUserData && (currentUserData.email === 'admin@tncb.vn' || currentUserData.role === 'admin');
          if (isAdminUser) {
            const qRes = await fetch(API_BASE_URL + '/api/properties/admin/review-queue', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const qData = await qRes.json();
            if (qData.success) {
              const qProps = qData.queue.map(transformProperty);
              const merged = [...list];
              qProps.forEach(p => {
                const idx = merged.findIndex(x => x.id === p.id);
                if (idx === -1) {
                  merged.push(p);
                } else {
                  merged[idx] = p;
                }
              });
              list = merged;
            }
          }
        }
        setProperties(list);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách phòng trọ:', err);
      const localProps = loadFromStorage('TNCB_PROPERTIES', mockProperties);
      setProperties(localProps);
    }
  }, [isMockMode, transformProperty]);

  const fetchTickets = useCallback(async () => {
    if (isMockMode) {
      const localTickets = loadFromStorage('TNCB_TICKETS', mockTickets);
      setTickets(localTickets);
      return;
    }
    const token = localStorage.getItem('TNCB_TOKEN');
    if (!token) {
      setTickets([]);
      return;
    }
    try {
      const res = await fetch(API_BASE_URL + '/api/tickets', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const list = data.tickets.map(t => ({
          ...t,
          id: t._id,
          createdAt: t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : t.createdAt,
          updatedAt: t.updatedAt ? new Date(t.updatedAt).toISOString().split('T')[0] : t.updatedAt
        }));
        setTickets(list);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách yêu cầu hỗ trợ:', err);
      setTickets(loadFromStorage('TNCB_TICKETS', mockTickets));
    }
  }, [isMockMode]);

  const fetchHeroSlides = useCallback(async () => {
    if (isMockMode) {
      const localSlides = loadFromStorage('TNCB_HERO_SLIDES', defaultMockHeroSlides);
      setHeroSlides(localSlides);
      return;
    }
    try {
      const res = await fetch(API_BASE_URL + '/api/properties/hero-slides');
      const data = await res.json();
      if (data.success) {
        setHeroSlides(data.slides.map(transformHeroSlide));
      }
    } catch (err) {
      console.error('Lỗi tải danh sách hero slides:', err);
      setHeroSlides(loadFromStorage('TNCB_HERO_SLIDES', defaultMockHeroSlides));
    }
  }, [isMockMode, transformHeroSlide]);

  // Health check connection and restore session on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);
        const res = await fetch(API_BASE_URL + '/api/health', { signal: controller.signal });
        clearTimeout(timeoutId);
        const data = await res.json();
        if (data.status === 'ok') {
          console.log('✅ Connected to backend API server.');
          setIsMockMode(false);
          return false;
        }
      } catch (err) {
        // Failed connection
      }
      console.warn('⚠️ Không thể kết nối tới Backend. Tự động chuyển sang Chế độ Giả lập (Offline Mock Mode).');
      setIsMockMode(true);
      return true;
    };

    const restoreSession = async (isMock) => {
      const token = localStorage.getItem('TNCB_TOKEN');
      if (token) {
        if (isMock) {
          const savedUser = loadFromStorage('TNCB_CURRENT_USER', null);
          if (savedUser) {
            setCurrentUser(savedUser);
            setUserRole(savedUser.role);
          }
        } else {
          try {
            const res = await fetch(API_BASE_URL + '/api/auth/me', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
              const user = { ...data.user, id: data.user.id || data.user._id };
              setCurrentUser(user);
              setUserRole(user.role);
            } else {
              localStorage.removeItem('TNCB_TOKEN');
              localStorage.removeItem('TNCB_CURRENT_USER');
              setCurrentUser(null);
              setUserRole('tenant');
            }
          } catch (err) {
            console.error('Khôi phục phiên đăng nhập thất bại:', err);
            const savedUser = loadFromStorage('TNCB_CURRENT_USER', null);
            if (savedUser) {
              setCurrentUser(savedUser);
              setUserRole(savedUser.role);
            }
          }
        }
      }
    };

    const initApp = async () => {
      const isMock = await checkConnection();
      await restoreSession(isMock);
    };

    initApp();
  }, []);

  // Load properties/tickets when auth state or mock mode changes
  useEffect(() => {
    fetchProperties();
    fetchTickets();
    fetchHeroSlides();
  }, [currentUser, isMockMode, fetchProperties, fetchTickets, fetchHeroSlides]);

  // ============================
  // Auth Actions (REST APIs)
  // ============================
  const login = useCallback(async (email, password) => {
    if (isMockMode) {
      const localUsers = loadFromStorage('TNCB_MOCK_USERS', mockUsers);
      const user = localUsers.find(u => u.email === email);
      if (!user) {
        return { success: false, message: 'Tài khoản không tồn tại trong chế độ giả lập.' };
      }
      
      const expectedPassword = email === 'admin@tncb.vn' ? 'admin' : '123';
      if (password !== expectedPassword && password !== '123') {
        return { success: false, message: 'Mật khẩu không chính xác.' };
      }

      if (user.mfaEnabled) {
        return { success: true, requiresMfa: true, tempMfaToken: `temp-mfa-${Date.now()}` };
      }
      if (user.otpEnabled) {
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        setCurrentOTP(otpCode);
        setOtpExpiry(Date.now() + 5 * 60 * 1000);
        setPendingRegistration({ email, _loginOtpMode: true, expectedOtp: otpCode, user });
        return { 
          success: true, 
          requiresOtp: true, 
          tempOtpToken: `temp-otp-${Date.now()}`,
          otp: otpCode,
          message: `Mã OTP đã được gửi đến email ${email} (mô phỏng: ${otpCode}).`
        };
      }

      localStorage.setItem('TNCB_TOKEN', `mock-token-${Date.now()}`);
      localStorage.setItem('TNCB_CURRENT_USER', JSON.stringify(user));
      setCurrentUser(user);
      return { success: true, user };
    }
    try {
      const res = await fetch(API_BASE_URL + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        if (data.requiresMfa) {
          return { success: true, requiresMfa: true, tempMfaToken: data.tempMfaToken };
        }
        const user = { ...data.user, id: data.user.id || data.user._id };
        localStorage.setItem('TNCB_TOKEN', data.token);
        localStorage.setItem('TNCB_CURRENT_USER', JSON.stringify(user));
        setCurrentUser(user);
        return { success: true, user };
      }
      return { success: false, message: data.message || 'Đăng nhập thất bại.' };
    } catch (err) {
      return { success: false, message: 'Không thể kết nối tới máy chủ.' };
    }
  }, [isMockMode]);

  const loginWithGoogle = useCallback(async (idToken) => {
    if (isMockMode) {
      const tenantUser = mockUsers.find(u => u.email === 'tenant@tncb.vn');
      localStorage.setItem('TNCB_TOKEN', `mock-token-${Date.now()}`);
      localStorage.setItem('TNCB_CURRENT_USER', JSON.stringify(tenantUser));
      setCurrentUser(tenantUser);
      return { success: true, user: tenantUser };
    }
    try {
      const res = await fetch(API_BASE_URL + '/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });
      const data = await res.json();
      if (data.success) {
        if (data.needsCompletion) {
          return { success: true, needsCompletion: true, tempToken: data.tempToken, user: data.user };
        } else if (data.requiresMfa) {
          return { success: true, requiresMfa: true, tempMfaToken: data.tempMfaToken };
        } else {
          const user = { ...data.user, id: data.user.id || data.user._id };
          localStorage.setItem('TNCB_TOKEN', data.token);
          localStorage.setItem('TNCB_CURRENT_USER', JSON.stringify(user));
          setCurrentUser(user);
          return { success: true, user };
        }
      }
      return { success: false, message: data.message || 'Đăng nhập Google thất bại.' };
    } catch (err) {
      return { success: false, message: 'Không thể kết nối tới máy chủ.' };
    }
  }, [isMockMode]);

  const completeGoogleProfile = useCallback(async (phone, role, tempToken) => {
    if (isMockMode) {
      const newUser = {
        id: `mock-google-${Date.now()}`,
        name: 'Người dùng Google',
        email: 'googleuser@tncb.vn',
        phone,
        role,
        mfaEnabled: false,
        otpEnabled: false,
        avatar: ''
      };
      localStorage.setItem('TNCB_TOKEN', `mock-token-${Date.now()}`);
      localStorage.setItem('TNCB_CURRENT_USER', JSON.stringify(newUser));
      setCurrentUser(newUser);
      return { success: true, user: newUser };
    }
    try {
      const res = await fetch(API_BASE_URL + '/api/auth/google/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, role, tempToken })
      });
      const data = await res.json();
      if (data.success) {
        const user = { ...data.user, id: data.user.id || data.user._id };
        localStorage.setItem('TNCB_TOKEN', data.token);
        localStorage.setItem('TNCB_CURRENT_USER', JSON.stringify(user));
        setCurrentUser(user);
        return { success: true, user };
      }
      return { success: false, message: data.message || 'Hoàn tất thông tin thất bại.' };
    } catch (err) {
      return { success: false, message: 'Không thể kết nối tới máy chủ.' };
    }
  }, [isMockMode]);

  const registerStep1 = useCallback(async (name, email, phone, password, role) => {
    const phoneRegex = /^(0[3|5|7|8|9])\d{8}$/;
    if (!phoneRegex.test(phone)) {
      return { success: false, message: 'Số điện thoại không hợp lệ. Vui lòng nhập SĐT Việt Nam.' };
    }

    if (password.length < 5) {
      return { success: false, message: 'Mật khẩu phải có ít nhất 5 ký tự.' };
    }

    if (isMockMode) {
      const localUsers = loadFromStorage('TNCB_MOCK_USERS', mockUsers);
      if (localUsers.some(u => u.email === email)) {
        return { success: false, message: 'Email đã được sử dụng.' };
      }
      if (localUsers.some(u => u.phone === phone)) {
        return { success: false, message: 'Số điện thoại đã được sử dụng.' };
      }

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      setPendingRegistration({ name, email, phone, password, role, expectedOtp: otpCode });
      setCurrentOTP(otpCode);
      setOtpExpiry(Date.now() + 5 * 60 * 1000);
      return {
        success: true,
        otp: otpCode,
        message: `Mã OTP đã được gửi đến email ${email} (mô phỏng: ${otpCode}).`
      };
    }

    try {
      const res = await fetch(API_BASE_URL + '/api/auth/register-step1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, role })
      });
      const data = await res.json();
      if (data.success) {
        setPendingRegistration({ name, email, phone, password, role });
        setCurrentOTP(data.otp);
        setOtpExpiry(Date.now() + 5 * 60 * 1000);
        return {
          success: true,
          otp: data.otp,
          message: `Mã OTP đã được gửi đến email ${email} (mô phỏng: ${data.otp}).`
        };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Lỗi kết nối máy chủ.' };
    }
  }, [isMockMode]);

  const verifyRegistrationOTP = useCallback(async (inputOTP) => {
    if (!pendingRegistration) {
      return { success: false, message: 'Phiên đăng ký đã hết hạn.' };
    }
    if (isMockMode) {
      if (inputOTP === pendingRegistration.expectedOtp || inputOTP === '123456') {
        const newUser = {
          id: `mock-user-${Date.now()}`,
          name: pendingRegistration.name,
          email: pendingRegistration.email,
          phone: pendingRegistration.phone,
          role: pendingRegistration.role,
          mfaEnabled: false,
          otpEnabled: false,
          avatar: ''
        };
        const localUsers = loadFromStorage('TNCB_MOCK_USERS', mockUsers);
        localUsers.push(newUser);
        localStorage.setItem('TNCB_MOCK_USERS', JSON.stringify(localUsers));
        
        localStorage.setItem('TNCB_TOKEN', `mock-token-${Date.now()}`);
        localStorage.setItem('TNCB_CURRENT_USER', JSON.stringify(newUser));
        setCurrentUser(newUser);
        setPendingRegistration(null);
        setCurrentOTP(null);
        return { success: true, user: newUser };
      }
      return { success: false, message: 'Mã OTP không chính xác.' };
    }
    try {
      const res = await fetch(API_BASE_URL + '/api/auth/register-step2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...pendingRegistration,
          otp: inputOTP
        })
      });
      const data = await res.json();
      if (data.success) {
        const user = { ...data.user, id: data.user.id || data.user._id };
        localStorage.setItem('TNCB_TOKEN', data.token);
        localStorage.setItem('TNCB_CURRENT_USER', JSON.stringify(user));
        setCurrentUser(user);
        setPendingRegistration(null);
        setCurrentOTP(null);
        return { success: true, user };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Lỗi kết nối máy chủ.' };
    }
  }, [isMockMode, pendingRegistration]);

  const resendOTP = useCallback(async () => {
    if (!pendingRegistration) {
      return { success: false, message: 'Không tìm thấy phiên đăng ký.' };
    }
    return registerStep1(
      pendingRegistration.name,
      pendingRegistration.email,
      pendingRegistration.phone,
      pendingRegistration.password,
      pendingRegistration.role
    );
  }, [pendingRegistration, registerStep1]);

  const forgotPasswordStep1 = useCallback(async (email) => {
    if (isMockMode) {
      const localUsers = loadFromStorage('TNCB_MOCK_USERS', mockUsers);
      const user = localUsers.find(u => u.email === email);
      if (!user) {
        return { success: false, message: 'Email chưa được đăng ký trong hệ thống giả lập.' };
      }
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      setPendingRegistration({ email, _resetMode: true, expectedOtp: otpCode });
      setCurrentOTP(otpCode);
      setOtpExpiry(Date.now() + 5 * 60 * 1000);
      return {
        success: true,
        otp: otpCode,
        message: `Mã OTP khôi phục đã được gửi đến email ${email} (mô phỏng: ${otpCode}).`
      };
    }
    try {
      const res = await fetch(API_BASE_URL + '/api/auth/forgot-password-step1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setPendingRegistration({ email, _resetMode: true });
        setCurrentOTP(data.otp);
        setOtpExpiry(Date.now() + 5 * 60 * 1000);
        return {
          success: true,
          otp: data.otp,
          message: `Mã OTP khôi phục đã được gửi đến email ${email} (mô phỏng: ${data.otp}).`
        };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Lỗi kết nối máy chủ.' };
    }
  }, [isMockMode]);

  const resetPassword = useCallback(async (inputOTP, newPassword) => {
    if (!pendingRegistration || !pendingRegistration._resetMode) {
      return { success: false, message: 'Phiên khôi phục mật khẩu hết hạn.' };
    }
    if (isMockMode) {
      if (inputOTP === pendingRegistration.expectedOtp || inputOTP === '123456') {
        setPendingRegistration(null);
        setCurrentOTP(null);
        return { success: true, message: 'Đặt lại mật khẩu thành công! Hãy đăng nhập lại.' };
      }
      return { success: false, message: 'Mã OTP không chính xác.' };
    }
    try {
      const res = await fetch(API_BASE_URL + '/api/auth/forgot-password-step2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: pendingRegistration.email,
          otp: inputOTP,
          newPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        setPendingRegistration(null);
        setCurrentOTP(null);
        return { success: true, message: 'Đặt lại mật khẩu thành công! Hãy đăng nhập lại.' };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Lỗi kết nối máy chủ.' };
    }
  }, [isMockMode, pendingRegistration]);

  const register = useCallback(() => {
    return { success: false, message: 'Tính năng này không khả dụng.' };
  }, []);

  const setupMFA = useCallback(async () => {
    if (isMockMode) {
      return { 
        success: true, 
        secret: 'MOCK_MFA_SECRET_KEY_123', 
        qrCodeUrl: 'https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=otpauth://totp/FindX:mockuser%3Fsecret=MOCK_MFA_SECRET_KEY_123%26issuer=FindX' 
      };
    }
    const token = localStorage.getItem('TNCB_TOKEN');
    if (!token) return { success: false, message: 'Chưa đăng nhập.' };
    try {
      const res = await fetch(API_BASE_URL + '/api/auth/mfa/setup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        return { success: true, secret: data.secret, qrCodeUrl: data.qrCodeUrl };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Lỗi kết nối máy chủ.' };
    }
  }, [isMockMode]);

  const verifyMFA = useCallback(async (code) => {
    if (isMockMode) {
      if (!currentUser) return { success: false, message: 'Chưa đăng nhập.' };
      const updatedUser = { ...currentUser, mfaEnabled: true };
      
      const localUsers = loadFromStorage('TNCB_MOCK_USERS', mockUsers);
      const idx = localUsers.findIndex(u => u.id === currentUser.id);
      if (idx !== -1) {
        localUsers[idx] = updatedUser;
        localStorage.setItem('TNCB_MOCK_USERS', JSON.stringify(localUsers));
      }

      localStorage.setItem('TNCB_CURRENT_USER', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      return { success: true, user: updatedUser };
    }
    const token = localStorage.getItem('TNCB_TOKEN');
    if (!token) return { success: false, message: 'Chưa đăng nhập.' };
    try {
      const res = await fetch(API_BASE_URL + '/api/auth/mfa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (data.success) {
        const user = { ...data.user, id: data.user.id || data.user._id };
        localStorage.setItem('TNCB_CURRENT_USER', JSON.stringify(user));
        setCurrentUser(user);
        return { success: true, user };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Lỗi kết nối máy chủ.' };
    }
  }, [isMockMode, currentUser]);

  const disableMFA = useCallback(async (code) => {
    if (isMockMode) {
      if (!currentUser) return { success: false, message: 'Chưa đăng nhập.' };
      const updatedUser = { ...currentUser, mfaEnabled: false };
      
      const localUsers = loadFromStorage('TNCB_MOCK_USERS', mockUsers);
      const idx = localUsers.findIndex(u => u.id === currentUser.id);
      if (idx !== -1) {
        localUsers[idx] = updatedUser;
        localStorage.setItem('TNCB_MOCK_USERS', JSON.stringify(localUsers));
      }

      localStorage.setItem('TNCB_CURRENT_USER', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      return { success: true, user: updatedUser };
    }
    const token = localStorage.getItem('TNCB_TOKEN');
    if (!token) return { success: false, message: 'Chưa đăng nhập.' };
    try {
      const res = await fetch(API_BASE_URL + '/api/auth/mfa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (data.success) {
        const user = { ...data.user, id: data.user.id || data.user._id };
        localStorage.setItem('TNCB_CURRENT_USER', JSON.stringify(user));
        setCurrentUser(user);
        return { success: true, user };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Lỗi kết nối máy chủ.' };
    }
  }, [isMockMode, currentUser]);

  const verifyLoginMFA = useCallback(async (tempMfaToken, code) => {
    if (isMockMode) {
      const savedUser = loadFromStorage('TNCB_CURRENT_USER', null) || mockUsers[1];
      localStorage.setItem('TNCB_TOKEN', `mock-token-${Date.now()}`);
      localStorage.setItem('TNCB_CURRENT_USER', JSON.stringify(savedUser));
      setCurrentUser(savedUser);
      return { success: true, user: savedUser };
    }
    try {
      const res = await fetch(API_BASE_URL + '/api/auth/mfa/login-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tempMfaToken, code })
      });
      const data = await res.json();
      if (data.success) {
        const user = { ...data.user, id: data.user.id || data.user._id };
        localStorage.setItem('TNCB_TOKEN', data.token);
        localStorage.setItem('TNCB_CURRENT_USER', JSON.stringify(user));
        setCurrentUser(user);
        return { success: true, user };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Lỗi kết nối máy chủ.' };
    }
  }, [isMockMode]);

  const verifyLoginOTP = useCallback(async (tempOtpToken, code) => {
    if (isMockMode) {
      if (pendingRegistration && pendingRegistration._loginOtpMode) {
        if (code === pendingRegistration.expectedOtp || code === '123456') {
          const user = pendingRegistration.user;
          localStorage.setItem('TNCB_TOKEN', `mock-token-${Date.now()}`);
          localStorage.setItem('TNCB_CURRENT_USER', JSON.stringify(user));
          setCurrentUser(user);
          setPendingRegistration(null);
          setCurrentOTP(null);
          return { success: true, user };
        }
        return { success: false, message: 'Mã OTP không chính xác.' };
      }
      return { success: false, message: 'Phiên đăng nhập hết hạn.' };
    }
    try {
      const res = await fetch(API_BASE_URL + '/api/auth/otp/login-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tempOtpToken, code })
      });
      const data = await res.json();
      if (data.success) {
        const user = { ...data.user, id: data.user.id || data.user._id };
        localStorage.setItem('TNCB_TOKEN', data.token);
        localStorage.setItem('TNCB_CURRENT_USER', JSON.stringify(user));
        setCurrentUser(user);
        return { success: true, user };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Lỗi kết nối máy chủ.' };
    }
  }, [isMockMode, pendingRegistration]);

  const toggleOTP = useCallback(async (enabled) => {
    if (isMockMode) {
      if (!currentUser) return { success: false, message: 'Chưa đăng nhập.' };
      const updatedUser = { ...currentUser, otpEnabled: enabled };
      
      const localUsers = loadFromStorage('TNCB_MOCK_USERS', mockUsers);
      const idx = localUsers.findIndex(u => u.id === currentUser.id);
      if (idx !== -1) {
        localUsers[idx] = updatedUser;
        localStorage.setItem('TNCB_MOCK_USERS', JSON.stringify(localUsers));
      }

      localStorage.setItem('TNCB_CURRENT_USER', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      return { success: true, user: updatedUser };
    }
    const token = localStorage.getItem('TNCB_TOKEN');
    if (!token) return { success: false, message: 'Chưa đăng nhập.' };
    try {
      const res = await fetch(API_BASE_URL + '/api/auth/otp/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ enabled })
      });
      const data = await res.json();
      if (data.success) {
        const user = { ...data.user, id: data.user.id || data.user._id };
        localStorage.setItem('TNCB_CURRENT_USER', JSON.stringify(user));
        setCurrentUser(user);
        return { success: true, user };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Lỗi kết nối máy chủ.' };
    }
  }, [isMockMode, currentUser]);

  const logout = useCallback(() => {
    localStorage.removeItem('TNCB_TOKEN');
    localStorage.removeItem('TNCB_CURRENT_USER');
    setCurrentUser(null);
    setUserRole('tenant');
  }, []);

  const updateProfile = useCallback(async (updates) => {
    if (isMockMode) {
      if (!currentUser) return { success: false, message: 'Chưa đăng nhập.' };
      const updatedUser = { ...currentUser, ...updates };
      
      const localUsers = loadFromStorage('TNCB_MOCK_USERS', mockUsers);
      const idx = localUsers.findIndex(u => u.id === currentUser.id);
      if (idx !== -1) {
        localUsers[idx] = updatedUser;
        localStorage.setItem('TNCB_MOCK_USERS', JSON.stringify(localUsers));
      }

      localStorage.setItem('TNCB_CURRENT_USER', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      return { success: true, user: updatedUser };
    }
    const token = localStorage.getItem('TNCB_TOKEN');
    if (!token) return { success: false, message: 'Chưa đăng nhập.' };
    try {
      const res = await fetch(API_BASE_URL + '/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success) {
        const user = { ...data.user, id: data.user.id || data.user._id };
        localStorage.setItem('TNCB_CURRENT_USER', JSON.stringify(user));
        setCurrentUser(user);
        return { success: true, user };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Lỗi kết nối máy chủ.' };
    }
  }, [isMockMode, currentUser]);

  // --- Property Actions ---
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  const getJaccardSimilarity = useCallback((str1, str2) => {
    if (!str1 || !str2) return 0;
    const clean = (s) =>
      s
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
        .split(/\s+/)
        .filter(Boolean);
    const set1 = new Set(clean(str1));
    const set2 = new Set(clean(str2));
    
    if (set1.size === 0 && set2.size === 0) return 1;
    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
  }, []);

  const checkDuplicateProperty = useCallback((newProperty) => {
    const ownerId = currentUser ? currentUser.id : 'user-landlord';
    const activePosts = properties.filter(
      (p) => {
        const pOwnerId = p.postedBy?.id || p.postedBy || '';
        return pOwnerId === ownerId && !p.isRented && !p.isUnlisted && p.status !== 'pending' && p.status !== 'unlisted';
      }
    );

    let maxScore = 0;
    let matchedProperty = null;
    let matchedReasons = [];

    for (const oldPost of activePosts) {
      if (oldPost.id === newProperty.id) continue;

      let score = 0;
      let reasons = [];

      if (newProperty.coords && oldPost.coords) {
        const dist = calculateDistance(
          newProperty.coords[0],
          newProperty.coords[1],
          oldPost.coords[0],
          oldPost.coords[1]
        );
        if (dist < 15) {
          score += 40;
          reasons.push('Trùng khớp vị trí địa lý (khoảng cách < 15m)');
        }
      }

      if (score === 0) continue;

      const isSameType = newProperty.type === oldPost.type;
      const isSamePrice = Number(newProperty.price) === Number(oldPost.price);
      const isSameArea = Number(newProperty.area) === Number(oldPost.area);

      if (isSameType && isSamePrice && isSameArea) {
        score += 30;
        reasons.push('Trùng khớp loại phòng, giá thuê và diện tích');
      }

      const textSim = getJaccardSimilarity(
        (newProperty.title || '') + ' ' + (newProperty.description || ''),
        (oldPost.title || '') + ' ' + (oldPost.description || '')
      );

      if (textSim >= 0.7) {
        score += 20;
        reasons.push(`Nội dung văn bản tương đồng cao (${Math.round(textSim * 100)}%)`);
      }

      const hasOverlapImg = newProperty.images && oldPost.images &&
        newProperty.images.some(img => oldPost.images.includes(img));
      if (hasOverlapImg) {
        score += 10;
        reasons.push('Phát hiện hình ảnh trùng lặp');
      }

      if (score > maxScore) {
        maxScore = score;
        matchedProperty = oldPost;
        matchedReasons = reasons;
      }
    }

    return {
      isDuplicate: maxScore >= 80,
      isSuspicious: maxScore >= 50 && maxScore < 80,
      confidenceScore: maxScore,
      matchedProperty,
      reasons: matchedReasons,
    };
  }, [currentUser, properties, calculateDistance, getJaccardSimilarity]);

  const addProperty = useCallback(async (property) => {
    if (isMockMode) {
      const newProp = {
        ...property,
        id: `mock-prop-${Date.now()}`,
        _id: `mock-prop-${Date.now()}`,
        createdAt: new Date().toISOString(),
        verified: currentUser && currentUser.role === 'admin',
        postedBy: currentUser ? {
          id: currentUser.id,
          name: currentUser.name,
          phone: currentUser.phone,
          avatar: currentUser.avatar
        } : {
          id: 'mock-landlord-id',
          name: 'Chủ trọ giả lập',
          phone: '0984551234',
          avatar: ''
        },
        images: property.images ? property.images.map(img => {
          if (img instanceof File) {
            return URL.createObjectURL(img);
          }
          return img;
        }) : []
      };
      
      const transformed = transformProperty(newProp);
      setProperties((prev) => {
        const updated = [transformed, ...prev];
        localStorage.setItem('TNCB_PROPERTIES', JSON.stringify(updated));
        return updated;
      });
      return transformed;
    }
    const token = localStorage.getItem('TNCB_TOKEN');
    try {
      const formData = new FormData();
      Object.keys(property).forEach((key) => {
        if (key === 'images') {
          property.images.forEach((img) => {
            formData.append('images', img);
          });
        } else if (key === 'coords' || key === 'amenities') {
          formData.append(key, JSON.stringify(property[key]));
        } else if (property[key] !== undefined && property[key] !== null) {
          formData.append(key, property[key]);
        }
      });

      const res = await fetch(API_BASE_URL + '/api/properties', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        const transformed = transformProperty(data.property);
        setProperties((prev) => [transformed, ...prev]);
        return transformed;
      } else {
        throw new Error(data.message || 'Lỗi đăng tin.');
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, [isMockMode, currentUser, transformProperty]);

  const calculatePropertyRating = useCallback((p) => {
    let score = 0;
    if (p.price > 0) score += 1;
    if (p.electricity > 0 && p.water > 0) score += 1;
    if (p.images && p.images.length >= 3 && p.description && p.description.length > 20) score += 1;
    if (p.amenities && p.amenities.length >= 5) score += 1;
    if (p.verified) score += 1;
    return Math.max(1, score);
  }, []);

  const updateProperty = useCallback(async (id, updates) => {
    if (isMockMode) {
      let transformed;
      setProperties((prev) => {
        const updated = prev.map((p) => {
          if (p.id === id) {
            const processedImages = updates.images ? updates.images.map(img => {
              if (img instanceof File) {
                return URL.createObjectURL(img);
              }
              return img;
            }) : p.images;
            transformed = transformProperty({
              ...p,
              ...updates,
              images: processedImages
            });
            return transformed;
          }
          return p;
        });
        localStorage.setItem('TNCB_PROPERTIES', JSON.stringify(updated));
        return updated;
      });
      return transformed;
    }
    const token = localStorage.getItem('TNCB_TOKEN');
    try {
      const formData = new FormData();
      Object.keys(updates).forEach((key) => {
        if (key === 'images') {
          updates.images.forEach((img) => {
            formData.append('images', img);
          });
        } else if (key === 'existingImages' || key === 'coords' || key === 'amenities') {
          formData.append(key, JSON.stringify(updates[key]));
        } else if (updates[key] !== undefined && updates[key] !== null) {
          formData.append(key, updates[key]);
        }
      });

      const res = await fetch(`${API_BASE_URL}/api/properties/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        const transformed = transformProperty(data.property);
        setProperties((prev) => prev.map((p) => p.id === id ? transformed : p));
        return transformed;
      } else {
        throw new Error(data.message || 'Lỗi cập nhật.');
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, [isMockMode, transformProperty]);

  const deleteProperty = useCallback(async (id) => {
    if (isMockMode) {
      setProperties((prev) => {
        const updated = prev.filter((p) => p.id !== id);
        localStorage.setItem('TNCB_PROPERTIES', JSON.stringify(updated));
        return updated;
      });
      return true;
    }
    const token = localStorage.getItem('TNCB_TOKEN');
    try {
      const res = await fetch(`${API_BASE_URL}/api/properties/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setProperties((prev) => prev.filter((p) => p.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  }, [isMockMode]);

  const togglePropertyStatus = useCallback(async (id) => {
    if (isMockMode) {
      setProperties((prev) => {
        const updated = prev.map((p) =>
          p.id === id ? { ...p, isRented: !p.isRented } : p
        );
        localStorage.setItem('TNCB_PROPERTIES', JSON.stringify(updated));
        return updated;
      });
      return;
    }
    const token = localStorage.getItem('TNCB_TOKEN');
    try {
      const res = await fetch(`${API_BASE_URL}/api/properties/${id}/toggle-rented`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        const transformed = transformProperty(data.property);
        setProperties((prev) => prev.map((p) => p.id === id ? transformed : p));
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMockMode, transformProperty]);

  const toggleUnlistProperty = useCallback(async (id) => {
    if (isMockMode) {
      setProperties((prev) => {
        const updated = prev.map((p) =>
          p.id === id ? { ...p, isUnlisted: !p.isUnlisted } : p
        );
        localStorage.setItem('TNCB_PROPERTIES', JSON.stringify(updated));
        return updated;
      });
      return;
    }
    const token = localStorage.getItem('TNCB_TOKEN');
    try {
      const res = await fetch(`${API_BASE_URL}/api/properties/${id}/toggle-unlist`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        const transformed = transformProperty(data.property);
        setProperties((prev) => prev.map((p) => p.id === id ? transformed : p));
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMockMode, transformProperty]);

  const toggleVerifyProperty = useCallback(async (id) => {
    if (isMockMode) {
      setProperties((prev) => {
        const updated = prev.map((p) =>
          p.id === id ? { ...p, verified: !p.verified } : p
        );
        localStorage.setItem('TNCB_PROPERTIES', JSON.stringify(updated));
        return updated;
      });
      return;
    }
    const token = localStorage.getItem('TNCB_TOKEN');
    try {
      const res = await fetch(`${API_BASE_URL}/api/properties/${id}/toggle-verify`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        const transformed = transformProperty(data.property);
        setProperties((prev) => prev.map((p) => p.id === id ? transformed : p));
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMockMode, transformProperty]);

  // --- Hero Slides Actions ---
  const addHeroSlide = useCallback(async (slideData) => {
    if (isMockMode) {
      const newSlide = {
        ...slideData,
        id: `mock-slide-${Date.now()}`,
        image: slideData.image instanceof File ? URL.createObjectURL(slideData.image) : slideData.image
      };
      setHeroSlides((prev) => {
        const updated = [...prev, newSlide].sort((a, b) => (a.order || 0) - (b.order || 0));
        localStorage.setItem('TNCB_HERO_SLIDES', JSON.stringify(updated));
        return updated;
      });
      return { success: true, slide: newSlide };
    }
    const token = localStorage.getItem('TNCB_TOKEN');
    try {
      const formData = new FormData();
      Object.keys(slideData).forEach((key) => {
        if (key === 'image' && slideData[key] instanceof File) {
          formData.append('image', slideData[key]);
        } else if (slideData[key] !== undefined && slideData[key] !== null) {
          formData.append(key, slideData[key]);
        }
      });

      const res = await fetch(API_BASE_URL + '/api/properties/hero-slides', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        const transformed = transformHeroSlide(data.slide);
        setHeroSlides((prev) => [...prev, transformed].sort((a, b) => (a.order || 0) - (b.order || 0)));
        return { success: true, slide: transformed };
      }
      return { success: false, message: data.message || 'Lỗi thêm slide.' };
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Lỗi kết nối máy chủ.' };
    }
  }, [isMockMode, transformHeroSlide]);

  const updateHeroSlideAction = useCallback(async (id, updates) => {
    if (isMockMode) {
      let updatedSlide;
      setHeroSlides((prev) => {
        const updated = prev.map((s) => {
          if (s.id === id) {
            updatedSlide = {
              ...s,
              ...updates,
              image: updates.image instanceof File ? URL.createObjectURL(updates.image) : (updates.image || s.image)
            };
            return updatedSlide;
          }
          return s;
        }).sort((a, b) => (a.order || 0) - (b.order || 0));
        localStorage.setItem('TNCB_HERO_SLIDES', JSON.stringify(updated));
        return updated;
      });
      return { success: true, slide: updatedSlide };
    }
    const token = localStorage.getItem('TNCB_TOKEN');
    try {
      const formData = new FormData();
      Object.keys(updates).forEach((key) => {
        if (key === 'image' && updates[key] instanceof File) {
          formData.append('image', updates[key]);
        } else if (updates[key] !== undefined && updates[key] !== null) {
          formData.append(key, updates[key]);
        }
      });

      const res = await fetch(`${API_BASE_URL}/api/properties/hero-slides/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        const transformed = transformHeroSlide(data.slide);
        setHeroSlides((prev) =>
          prev.map((s) => (s.id === id ? transformed : s)).sort((a, b) => (a.order || 0) - (b.order || 0))
        );
        return { success: true, slide: transformed };
      }
      return { success: false, message: data.message || 'Lỗi cập nhật slide.' };
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Lỗi kết nối máy chủ.' };
    }
  }, [isMockMode, transformHeroSlide]);

  const deleteHeroSlideAction = useCallback(async (id) => {
    if (isMockMode) {
      setHeroSlides((prev) => {
        const updated = prev.filter((s) => s.id !== id);
        localStorage.setItem('TNCB_HERO_SLIDES', JSON.stringify(updated));
        return updated;
      });
      return { success: true };
    }
    const token = localStorage.getItem('TNCB_TOKEN');
    try {
      const res = await fetch(`${API_BASE_URL}/api/properties/hero-slides/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setHeroSlides((prev) => prev.filter((s) => s.id !== id));
        return { success: true };
      }
      return { success: false, message: data.message || 'Lỗi xóa slide.' };
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Lỗi kết nối máy chủ.' };
    }
  }, [isMockMode]);

  const getImportSettings = useCallback(async () => {
    if (isMockMode) {
      return {
        success: true,
        settings: loadFromStorage('TNCB_IMPORT_SETTINGS', {
          sheetUrl: 'https://docs.google.com/spreadsheets/d/mock-sheet-id/edit',
          syncInterval: 24,
          errorNotificationEmail: 'admin@tncb.vn',
          clearExisting: false
        })
      };
    }
    const token = localStorage.getItem('TNCB_TOKEN');
    try {
      const res = await fetch(`${API_BASE_URL}/api/properties/import-settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await res.json();
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Lỗi kết nối máy chủ.' };
    }
  }, [isMockMode]);

  const saveImportSettings = useCallback(async (settings) => {
    if (isMockMode) {
      localStorage.setItem('TNCB_IMPORT_SETTINGS', JSON.stringify(settings));
      return { success: true, message: 'Lưu cấu hình thành công (Giả lập)' };
    }
    const token = localStorage.getItem('TNCB_TOKEN');
    try {
      const res = await fetch(`${API_BASE_URL}/api/properties/import-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      return await res.json();
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Lỗi kết nối máy chủ.' };
    }
  }, [isMockMode]);

  const syncPropertiesNow = useCallback(async () => {
    if (isMockMode) {
      const mockSheetProp = {
        id: `prop-sheet-${Date.now()}`,
        title: 'Căn Hộ Mini Đồng Bộ Từ Google Sheets (Mock)',
        type: 'Chung cư mini',
        price: 4800000,
        area: 25,
        city: 'TP. Hồ Chí Minh',
        district: 'Bình Thạnh',
        ward: 'Phường 25',
        address: 'D5, Phường 25, Bình Thạnh, TP. HCM',
        coords: [10.8018, 106.7119],
        images: ['https://picsum.photos/seed/sheet-mock/800/600'],
        verified: true,
        isRented: false,
        amenities: ['AirConditioner', 'WiFi', 'Parking'],
        electricity: 3500,
        water: 100000,
        service: 100000,
        description: 'Phòng trọ đẹp đồng bộ tự động từ Google Sheets ở chế độ giả lập.',
        source: 'sheet',
        postedBy: {
          name: 'Hệ thống Sync',
          phone: '0909000000',
          avatar: ''
        }
      };
      
      const transformed = transformProperty(mockSheetProp);
      setProperties((prev) => {
        const updated = [transformed, ...prev];
        localStorage.setItem('TNCB_PROPERTIES', JSON.stringify(updated));
        return updated;
      });
      return { success: true, message: 'Đồng bộ Google Sheets thành công! Đã thêm 1 tin đăng mẫu.' };
    }
    const token = localStorage.getItem('TNCB_TOKEN');
    try {
      const res = await fetch(`${API_BASE_URL}/api/properties/sync-now`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        await fetchProperties();
      }
      return data;
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Lỗi kết nối máy chủ.' };
    }
  }, [isMockMode, fetchProperties, transformProperty]);

  // --- View History ---
  const addViewToHistory = useCallback((propertyId) => {
    setViewHistory((prev) => {
      const now = Date.now();
      const limit = now - 7 * 24 * 60 * 60 * 1000;
      const cleaned = prev.filter(item => item && item.id !== propertyId && item.viewedAt > limit);
      return [{ id: propertyId, viewedAt: now }, ...cleaned];
    });
  }, []);

  // --- Contract Actions ---
  const createContract = useCallback((contract) => {
    const newContract = {
      ...contract,
      id: `contract-${Date.now()}`,
      status: 'active',
      bills: [],
    };
    setContracts((prev) => [...prev, newContract]);
    return newContract;
  }, []);

  const addBill = useCallback((contractId, bill) => {
    const newBill = {
      ...bill,
      id: `bill-${Date.now()}`,
      paid: false,
      paidDate: null,
    };
    setContracts((prev) =>
      prev.map((c) =>
        c.id === contractId
          ? { ...c, bills: [...c.bills, newBill] }
          : c
      )
    );
    return newBill;
  }, []);

  const markBillPaid = useCallback((contractId, billId) => {
    setContracts((prev) =>
      prev.map((c) =>
        c.id === contractId
          ? {
              ...c,
              bills: c.bills.map((b) =>
                b.id === billId
                  ? { ...b, paid: true, paidDate: new Date().toISOString().split('T')[0] }
                  : b
              ),
            }
          : c
      )
    );
  }, []);

  // --- Ticket Actions ---
  const createTicket = useCallback(async (ticket) => {
    if (isMockMode) {
      const newTicket = {
        ...ticket,
        id: `ticket-${Date.now()}`,
        _id: `ticket-${Date.now()}`,
        status: 'open',
        createdAt: new Date().toISOString().split('T')[0]
      };
      setTickets((prev) => {
        const updated = [newTicket, ...prev];
        localStorage.setItem('TNCB_TICKETS', JSON.stringify(updated));
        return updated;
      });
      return newTicket;
    }
    const token = localStorage.getItem('TNCB_TOKEN');
    try {
      const res = await fetch(API_BASE_URL + '/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          propertyId: ticket.propertyId,
          title: ticket.title,
          description: ticket.description
        })
      });
      const data = await res.json();
      if (data.success) {
        const newTicket = { ...data.ticket, id: data.ticket._id };
        setTickets((prev) => [newTicket, ...prev]);
        return newTicket;
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMockMode]);

  const updateTicketStatus = useCallback(async (ticketId, status) => {
    if (isMockMode) {
      setTickets((prev) => {
        const updated = prev.map((t) =>
          t.id === ticketId ? { ...t, status } : t
        );
        localStorage.setItem('TNCB_TICKETS', JSON.stringify(updated));
        return updated;
      });
      return;
    }
    const token = localStorage.getItem('TNCB_TOKEN');
    try {
      const res = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        const updatedTicket = { ...data.ticket, id: data.ticket._id };
        setTickets((prev) => prev.map((t) => t.id === ticketId ? updatedTicket : t));
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMockMode]);

  // --- Helpers ---
  const getPropertyById = useCallback(
    (id) => properties.find((p) => p.id === id),
    [properties]
  );

  const getContractsByProperty = useCallback(
    (propertyId) => contracts.filter((c) => c.propertyId === propertyId),
    [contracts]
  );

  const getAvailableProperties = useCallback(
    () => properties.filter((p) => !p.isRented && !p.isUnlisted && p.status !== 'pending'),
    [properties]
  );

  const formatPrice = useCallback((price) => {
    if (price >= 1000000) {
      const millions = price / 1000000;
      return `${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)} triệu/tháng`;
    }
    return `${price.toLocaleString('vi-VN')} VND/tháng`;
  }, []);

  const formatPriceShort = useCallback((price) => {
    if (price >= 1000000) {
      const millions = price / 1000000;
      return `${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)} Tr`;
    }
    return `${(price / 1000).toFixed(0)}K`;
  }, []);

  const value = {
    // State
    properties,
    contracts,
    tickets,
    viewHistory,
    userRole,
    users,
    currentUser,
    theme,
    toggleTheme,
    isMockMode,
    // Auth Modal (Global)
    isAuthOpen,
    setIsAuthOpen,
    authMode,
    setAuthMode,
    // OTP state (for UI display)
    pendingRegistration,
    currentOTP,
    otpExpiry,
    // Setters
    setUserRole,
    // Property actions
    addProperty,
    checkDuplicateProperty,
    updateProperty,
    deleteProperty,
    togglePropertyStatus,
    toggleUnlistProperty,
    toggleVerifyProperty,
    getImportSettings,
    saveImportSettings,
    syncPropertiesNow,
    // Hero Slides
    heroSlides,
    fetchHeroSlides,
    addHeroSlide,
    updateHeroSlide: updateHeroSlideAction,
    deleteHeroSlide: deleteHeroSlideAction,
    // View History
    addViewToHistory,
    // Contracts
    createContract,
    addBill,
    markBillPaid,
    // Tickets
    createTicket,
    updateTicketStatus,
    // Auth (new OTP flow)
    login,
    // Auth
    loginWithGoogle,
    completeGoogleProfile,
    register,
    registerStep1,
    verifyRegistrationOTP,
    resendOTP,
    forgotPasswordStep1,
    resetPassword,
    logout,
    updateProfile,
    setupMFA,
    verifyMFA,
    disableMFA,
    verifyLoginMFA,
    verifyLoginOTP,
    toggleOTP,
    // Helpers
    getPropertyById,
    getContractsByProperty,
    getAvailableProperties,
    formatPrice,
    formatPriceShort,
    calculatePropertyRating,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
