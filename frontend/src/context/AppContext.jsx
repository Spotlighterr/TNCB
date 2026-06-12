import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mockProperties } from '../data/mockProperties';
import { mockContracts, mockTickets } from '../data/mockContracts';

const AppContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

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
        name: 'Chủ nhà',
        phone: '',
        avatar: '',
        zalo: ''
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
    }
  }, [transformProperty]);

  const fetchTickets = useCallback(async () => {
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
    }
  }, []);

  const fetchHeroSlides = useCallback(async () => {
    try {
      const res = await fetch(API_BASE_URL + '/api/properties/hero-slides');
      const data = await res.json();
      if (data.success) {
        setHeroSlides(data.slides.map(transformHeroSlide));
      }
    } catch (err) {
      console.error('Lỗi tải danh sách hero slides:', err);
    }
  }, [transformHeroSlide]);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('TNCB_TOKEN');
      if (token) {
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
        }
      }
    };
    restoreSession();
  }, []);

  // Load properties/tickets when auth state changes
  useEffect(() => {
    fetchProperties();
    fetchTickets();
    fetchHeroSlides();
  }, [currentUser, fetchProperties, fetchTickets, fetchHeroSlides]);

  // ============================
  // Auth Actions (REST APIs)
  // ============================
  const login = useCallback(async (email, password) => {
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
  }, []);

  const loginWithGoogle = useCallback(async (idToken) => {
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
  }, []);

  const completeGoogleProfile = useCallback(async (phone, role, tempToken) => {
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
  }, []);

  const registerStep1 = useCallback(async (name, email, phone, password, role) => {
    const phoneRegex = /^(0[3|5|7|8|9])\d{8}$/;
    if (!phoneRegex.test(phone)) {
      return { success: false, message: 'Số điện thoại không hợp lệ. Vui lòng nhập SĐT Việt Nam.' };
    }

    if (password.length < 5) {
      return { success: false, message: 'Mật khẩu phải có ít nhất 5 ký tự.' };
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
  }, []);

  const verifyRegistrationOTP = useCallback(async (inputOTP) => {
    if (!pendingRegistration) {
      return { success: false, message: 'Phiên đăng ký đã hết hạn.' };
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
  }, [pendingRegistration]);

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
  }, []);

  const resetPassword = useCallback(async (inputOTP, newPassword) => {
    if (!pendingRegistration || !pendingRegistration._resetMode) {
      return { success: false, message: 'Phiên khôi phục mật khẩu hết hạn.' };
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
  }, [pendingRegistration]);

  const register = useCallback(() => {
    return { success: false, message: 'Tính năng này không khả dụng.' };
  }, []);

  const setupMFA = useCallback(async () => {
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
  }, []);

  const verifyMFA = useCallback(async (code) => {
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
  }, []);

  const disableMFA = useCallback(async (code) => {
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
  }, []);

  const verifyLoginMFA = useCallback(async (tempMfaToken, code) => {
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
  }, []);

  const verifyLoginOTP = useCallback(async (tempOtpToken, code) => {
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
  }, []);

  const toggleOTP = useCallback(async (enabled) => {
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
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('TNCB_TOKEN');
    localStorage.removeItem('TNCB_CURRENT_USER');
    setCurrentUser(null);
    setUserRole('tenant');
  }, []);

  const updateProfile = useCallback(async (updates) => {
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
  }, []);

  // --- Property Actions ---
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Bán kính Trái Đất (mét)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // mét
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
    // Chỉ so sánh với các bài đăng đang hoạt động của chính chủ nhà này và chưa bị gỡ xuống, và trạng thái không phải pending hay unlisted
    const activePosts = properties.filter(
      (p) => p.postedBy === ownerId && !p.isRented && !p.isUnlisted && p.status !== 'pending' && p.status !== 'unlisted'
    );

    let maxScore = 0;
    let matchedProperty = null;
    let matchedReasons = [];

    for (const oldPost of activePosts) {
      if (oldPost.id === newProperty.id) continue; // Bỏ qua khi sửa chính phòng này

      let score = 0;
      let reasons = [];

      // 1. Kiểm tra vị trí địa lý (GPS)
      if (newProperty.coords && oldPost.coords) {
        const dist = calculateDistance(
          newProperty.coords[0],
          newProperty.coords[1],
          oldPost.coords[0],
          oldPost.coords[1]
        );
        // Nếu cách nhau dưới 15m thì xem như cùng vị trí (Tòa nhà)
        if (dist < 15) {
          score += 40;
          reasons.push('Trùng khớp vị trí địa lý (khoảng cách < 15m)');
        }
      }

      // Nếu không trùng vị trí địa lý thì chắc chắn khác tòa nhà, bỏ qua
      if (score === 0) continue;

      // 2. Kiểm tra loại phòng, giá thuê và diện tích
      const isSameType = newProperty.type === oldPost.type;
      const isSamePrice = Number(newProperty.price) === Number(oldPost.price);
      const isSameArea = Number(newProperty.area) === Number(oldPost.area);

      if (isSameType && isSamePrice && isSameArea) {
        score += 30;
        reasons.push('Trùng khớp loại phòng, giá thuê và diện tích');
      }

      // 3. Tính toán tương đồng văn bản (Tiêu đề + Mô tả)
      const textSim = getJaccardSimilarity(
        (newProperty.title || '') + ' ' + (newProperty.description || ''),
        (oldPost.title || '') + ' ' + (oldPost.description || '')
      );

      if (textSim >= 0.7) {
        score += 20;
        reasons.push(`Nội dung văn bản tương đồng cao (${Math.round(textSim * 100)}%)`);
      }

      // 4. So sánh ảnh (Giả lập trùng ảnh dựa trên chuỗi URL ảnh)
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
  }, [transformProperty]);

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
  }, [transformProperty]);

  const deleteProperty = useCallback(async (id) => {
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
  }, []);

  const togglePropertyStatus = useCallback(async (id) => {
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
  }, [transformProperty]);

  const toggleUnlistProperty = useCallback(async (id) => {
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
  }, [transformProperty]);

  const toggleVerifyProperty = useCallback(async (id) => {
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
  }, [transformProperty]);

  // --- Hero Slides Actions ---
  const addHeroSlide = useCallback(async (slideData) => {
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
  }, [transformHeroSlide]);

  const updateHeroSlideAction = useCallback(async (id, updates) => {
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
  }, [transformHeroSlide]);

  const deleteHeroSlideAction = useCallback(async (id) => {
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
  }, []);

  const getImportSettings = useCallback(async () => {
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
  }, []);

  const saveImportSettings = useCallback(async (settings) => {
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
  }, []);

  const syncPropertiesNow = useCallback(async () => {
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
  }, [fetchProperties]);

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
  }, []);

  const updateTicketStatus = useCallback(async (ticketId, status) => {
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
  }, []);

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
