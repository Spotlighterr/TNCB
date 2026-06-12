import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CITIES, DISTRICTS, WARDS, ROOM_TYPES, AMENITY_MAP } from '../data/mockProperties';
import {
  House,
  ChartBar,
  FileText,
  Receipt,
  Wrench,
  Phone,
  CurrencyDollar,
  Buildings,
  Plus,
  Trash,
  PencilSimple,
  SealCheck,
  CaretRight,
  EnvelopeSimple,
  ChatCircleText,
  X,
  CheckCircle,
  Fan,
  Sun,
  Snowflake,
  TShirt,
  Fingerprint,
  Clock,
  WifiHigh,
  Car,
  CookingPot,
  ShieldCheck,
  UserCircle,
  FacebookLogo,
  Eye,
  EyeSlash,
  UploadSimple,
  WarningCircle,
  CloudArrowDown,
} from '@phosphor-icons/react';

const ICON_COMPONENTS = {
  Fan,
  Sun,
  Snowflake,
  TShirt,
  Fingerprint,
  Clock,
  WifiHigh,
  Car,
  CookingPot,
  ShieldCheck,
};

// Dashboard sub-sections
const LANDLORD_TABS = [
  { id: 'overview', label: 'Tổng quan & Quản lý', icon: ChartBar },
];

const ADMIN_TABS = [
  { id: 'overview', label: 'Tổng quan & Quản lý', icon: ChartBar },
  { id: 'pending-reviews', label: 'Kiểm duyệt tin', icon: ShieldCheck },
  { id: 'banners', label: 'Quản lý Bản tin', icon: Buildings },
  { id: 'import', label: 'Nhập dữ liệu', icon: CloudArrowDown },
];

const TENANT_TABS = [
  { id: 'history', label: 'Lịch sử xem tin', icon: Clock },
  { id: 'my-listings', label: 'Tin ở ghép của tôi', icon: FileText },
];

export default function Dashboard() {
  const {
    properties,
    contracts,
    tickets,
    viewHistory,
    userRole,
    currentUser,
    setIsAuthOpen,
    setAuthMode,
    togglePropertyStatus,
    formatPrice,
    formatPriceShort,
    getPropertyById,
    deleteProperty,
    markBillPaid,
    addProperty,
    checkDuplicateProperty,
    updateProperty,
    toggleUnlistProperty,
    toggleVerifyProperty,
    createContract,
    addBill,
    createTicket,
    // Dynamic slides API
    heroSlides,
    addHeroSlide,
    updateHeroSlide,
    deleteHeroSlide,
    getImportSettings,
    saveImportSettings,
    syncPropertiesNow,
  } = useApp();

  const isAdmin = currentUser && (currentUser.email === 'admin@tncb.vn' || currentUser.id === 'user-admin');
  const tabs = isAdmin ? ADMIN_TABS : (userRole === 'landlord' ? LANDLORD_TABS : TENANT_TABS);
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [activeTab, userRole]);

  // --- Dynamic UI State ---
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [isCreatingContract, setIsCreatingContract] = useState(false);
  const [isCreatingBill, setIsCreatingBill] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState('');
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [toast, setToast] = useState(null);
  const [duplicateReport, setDuplicateReport] = useState(null);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);

  // Hero slides management states
  const [isAddingSlide, setIsAddingSlide] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [slideForm, setSlideForm] = useState({
    tag: '',
    title: '',
    description: '',
    badgeText: '',
    link: '',
    image: null,
    order: 1
  });

  // Google Sheets import & settings states
  const [sheetUrl, setSheetUrl] = useState('');
  const [clearExisting, setClearExisting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [autoImportEnabled, setAutoImportEnabled] = useState(false);
  const [intervalHours, setIntervalHours] = useState(24);
  const [notificationEmail, setNotificationEmail] = useState('');
  const [syncSecretToken, setSyncSecretToken] = useState('');
  const [cacheLastUpdated, setCacheLastUpdated] = useState(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Switch tabs -> Reset form states
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsAddingRoom(false);
    setEditingRoomId(null);
    setIsCreatingContract(false);
    setIsCreatingBill(false);
    setIsCreatingTicket(false);
    setIsAddingSlide(false);
    setEditingSlide(null);
    setImportResult(null);
  };

  // Fetch configurations when import tab active
  useEffect(() => {
    if (isAdmin && activeTab === 'import') {
      const fetchSettings = async () => {
        try {
          const res = await getImportSettings();
          if (res.success && res.settings) {
            setSheetUrl(res.settings.sheetUrl || '');
            setAutoImportEnabled(res.settings.autoImportEnabled || false);
            setIntervalHours(res.settings.intervalHours || 24);
            setNotificationEmail(res.settings.notificationEmail || '');
            setClearExisting(res.settings.clearExisting || false);
            setSyncSecretToken(res.syncSecretToken || '');
            setCacheLastUpdated(res.cacheLastUpdated || null);
          }
        } catch (err) {
          console.error('Lỗi khi lấy cấu hình:', err);
        }
      };
      fetchSettings();
    }
  }, [isAdmin, activeTab, getImportSettings]);

  // --- Form States ---
  const [roomForm, setRoomForm] = useState({
    title: '',
    type: 'Chung cư mini',
    price: '',
    area: '',
    city: 'Hà Nội',
    district: '',
    ward: '',
    address: '',
    coords: [21.0285, 105.7823],
    images: [],
    amenities: [],
    electricity: 3500,
    water: 100000,
    service: 150000,
    description: '',
  });

  const [contractForm, setContractForm] = useState({
    propertyId: '',
    tenantName: '',
    tenantPhone: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    monthlyRent: '',
    deposit: '',
  });

  const [billForm, setBillForm] = useState({
    contractId: '',
    month: new Date().toISOString().slice(0, 7),
    electricityUsage: 120,
    electricityRate: 3500,
    waterUsage: 1,
    waterRate: 100000,
    serviceCharge: 150000,
    rent: '',
  });

  const [ticketForm, setTicketForm] = useState({
    contractId: '',
    title: '',
    description: '',
  });

  // Access guard: if user not logged in
  if (!currentUser) {
    return (
      <div className="container" style={{ padding: 'var(--space-20) 0', textAlign: 'center' }}>
        <div className="glass-strong" style={{ padding: 'var(--space-10) var(--space-6)', borderRadius: 'var(--radius-main)', maxWidth: '480px', margin: '0 auto', border: '1px solid var(--color-border)' }}>
          <UserCircle size={64} weight="duotone" color="var(--color-accent)" style={{ marginBottom: 'var(--space-4)' }} />
          <h3 style={{ marginBottom: 'var(--space-2)' }}>Yêu cầu đăng nhập</h3>
          <p className="text-caption" style={{ marginBottom: 'var(--space-4)' }}>
            Vui lòng đăng nhập tài khoản của bạn để truy cập trang điều hành hệ thống.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => {
              setIsAuthOpen(true);
              setAuthMode('login');
            }}
            style={{ width: '100%', justifyContent: 'center' }}
            id="dashboard-login-btn"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  // --- Filter listings by logged in user ---
  // Landlords can manage all their mock properties. Admin can manage ALL properties.
  const landlordProperties = isAdmin
    ? properties
    : properties.filter(
        (p) => p.postedBy === currentUser.id || p.postedBy === 'user-landlord'
      );

  // Tenants can manage properties they posted (postType is roommate)
  const tenantProperties = properties.filter((p) => p.postedBy === currentUser.id);

  // --- Form Trigger Handlers ---

  const formatNumberWithDots = (val) => {
    if (val === undefined || val === null || val === '') return '';
    const numString = String(val).replace(/\D/g, '');
    if (!numString) return '';
    return Number(numString).toLocaleString('vi-VN');
  };

  // Room Form triggers
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    const currentCount = roomForm.images.length;
    if (currentCount + files.length > 10) {
      showToast('Bạn chỉ được chọn tối đa 10 ảnh.');
      return;
    }

    const newImages = [...roomForm.images];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        showToast('Vui lòng chỉ chọn tệp hình ảnh.');
        continue;
      }
      newImages.push(file);
    }

    setRoomForm((prev) => ({
      ...prev,
      images: newImages,
    }));
    e.target.value = '';
  };

  const handleRemoveImage = (indexToRemove) => {
    setRoomForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleAddRoomClick = () => {
    const defaultDistrict = DISTRICTS['Hà Nội'][0];
    const defaultWard = WARDS[defaultDistrict]?.[0] || '';
    setRoomForm({
      title: '',
      type: 'Chung cư mini',
      price: '',
      area: '',
      city: 'Hà Nội',
      district: defaultDistrict,
      ward: defaultWard,
      address: '',
      coords: [21.0285, 105.7823],
      images: [],
      amenities: [],
      electricity: 3500,
      water: 100000,
      service: 150000,
      description: '',
    });
    setIsAddingRoom(true);
    setEditingRoomId(null);
  };

  const handleEditRoomClick = (room) => {
    setRoomForm({
      title: room.title,
      type: room.type,
      price: room.price,
      area: room.area,
      city: room.city,
      district: room.district,
      ward: room.ward || '',
      address: room.address,
      coords: room.coords,
      images: [...room.images],
      amenities: room.amenities,
      electricity: room.electricity,
      water: room.water,
      service: room.service,
      description: room.description || '',
    });
    setEditingRoomId(room.id);
    setIsAddingRoom(false);
  };

  // Auto update district list & coordinates when city changes in roomForm
  const handleRoomCityChange = (cityVal) => {
    const districts = DISTRICTS[cityVal] || [];
    const defaultDistrict = districts[0] || '';
    const defaultWard = WARDS[defaultDistrict]?.[0] || '';
    const defaultCoords =
      cityVal === 'Hà Nội' ? [21.0285, 105.7823] : [10.8016, 106.7118];

    setRoomForm((prev) => ({
      ...prev,
      city: cityVal,
      district: defaultDistrict,
      ward: defaultWard,
      coords: defaultCoords,
    }));
  };

  // Auto update ward list when district changes in roomForm
  const handleRoomDistrictChange = (districtVal) => {
    const wards = WARDS[districtVal] || [];
    const defaultWard = wards[0] || '';
    setRoomForm((prev) => ({
      ...prev,
      district: districtVal,
      ward: defaultWard,
    }));
  };

  // Toggle amenities in checklist
  const handleAmenityToggle = (key) => {
    setRoomForm((prev) => {
      const amenities = prev.amenities.includes(key)
        ? prev.amenities.filter((k) => k !== key)
        : [...prev.amenities, key];
      return { ...prev, amenities };
    });
  };

  const handleRoomSubmit = (e) => {
    e.preventDefault();
    if (
      !roomForm.title ||
      !roomForm.price ||
      !roomForm.area ||
      !roomForm.address ||
      !roomForm.electricity ||
      !roomForm.water ||
      !roomForm.service ||
      !roomForm.description
    ) {
      showToast('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    if (roomForm.images.length === 0) {
      showToast('Vui lòng tải lên ít nhất 1 hình ảnh minh họa.');
      return;
    }

    if (roomForm.amenities.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 tiện nghi của phòng.');
      return;
    }

    let finalCoords = roomForm.coords;
    if (!editingRoomId) {
      finalCoords = [
        roomForm.coords[0] + (Math.random() - 0.5) * 0.02,
        roomForm.coords[1] + (Math.random() - 0.5) * 0.02
      ];
    }

    const cleanImageUrl = (url) => {
      if (typeof url === 'string' && url.includes('/uploads/')) {
        const index = url.indexOf('/uploads/');
        return url.substring(index);
      }
      return url;
    };

    const existingImages = roomForm.images
      .filter((img) => typeof img === 'string')
      .map(cleanImageUrl);
    const newImages = roomForm.images.filter((img) => typeof img !== 'string');

    const data = {
      ...roomForm,
      id: editingRoomId || undefined,
      price: Number(roomForm.price),
      area: Number(roomForm.area),
      electricity: Number(roomForm.electricity),
      water: Number(roomForm.water),
      service: Number(roomForm.service),
      existingImages,
      images: newImages,
      coords: finalCoords,
    };

    setIsCheckingDuplicate(true);

    // Giả lập Background Worker kiểm duyệt bài viết chạy ngầm trong 1.2s
    setTimeout(async () => {
      try {
        // Admin được bỏ qua kiểm tra trùng và tự động đăng bài hoạt động ngay
        if (isAdmin) {
          const adminData = { ...data, status: 'active', verified: true };
          if (editingRoomId) {
            await updateProperty(editingRoomId, adminData);
            showToast('Admin: Cập nhật thông tin thành công!');
            setEditingRoomId(null);
          } else {
            await addProperty(adminData);
            showToast('Admin: Đăng tin mới thành công và đã tự động Review!');
            setIsAddingRoom(false);
          }
          setIsCheckingDuplicate(false);
          return;
        }

        const report = checkDuplicateProperty(data);

        if (report.confidenceScore >= 50) {
          // Phát hiện trùng lặp cao hoặc trung bình (Score >= 50) -> Đăng dưới dạng chờ duyệt và gửi báo cáo cho Admin
          const pendingData = {
            ...data,
            status: 'pending',
            duplicateReport: {
              confidenceScore: report.confidenceScore,
              matchedPropertyId: report.matchedProperty.id,
              reasons: report.reasons,
            }
          };

          if (editingRoomId) {
            await updateProperty(editingRoomId, pendingData);
            showToast(`Tin đăng cập nhật trùng khớp ${report.confidenceScore}%. Đã gửi lại Admin duyệt.`);
            setEditingRoomId(null);
          } else {
            await addProperty(pendingData);
            showToast(`Phát hiện tin trùng lặp (${report.confidenceScore}%). Bài đăng đã được gửi tới hàng chờ Admin duyệt.`);
            setIsAddingRoom(false);
          }
        } else {
          // An toàn -> Duyệt và hiển thị ngay lập tức
          if (editingRoomId) {
            await updateProperty(editingRoomId, data);
            showToast('Cập nhật thông tin thành công!');
            setEditingRoomId(null);
          } else {
            await addProperty(data);
            showToast(currentUser.role === 'tenant' ? 'Đăng tin khách thuê thành công!' : 'Thêm phòng trọ mới thành công!');
            setIsAddingRoom(false);
          }
        }
      } catch (err) {
        showToast(err.message || 'Lỗi khi gửi dữ liệu lên máy chủ.', 'error');
      } finally {
        setIsCheckingDuplicate(false);
      }
    }, 1200);
  };

  // Contract Form triggers
  const handleAddContractClick = () => {
    const unrentedRooms = properties.filter((p) => !p.isRented);
    const initialPropId = unrentedRooms[0]?.id || '';
    const initialProp = initialPropId ? getPropertyById(initialPropId) : null;

    setContractForm({
      propertyId: initialPropId,
      tenantName: '',
      tenantPhone: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      monthlyRent: initialProp ? initialProp.price : '',
      deposit: initialProp ? initialProp.price : '',
    });
    setIsCreatingContract(true);
  };

  const handleContractRoomChange = (propId) => {
    const prop = getPropertyById(propId);
    setContractForm((prev) => ({
      ...prev,
      propertyId: propId,
      monthlyRent: prop ? prop.price : '',
      deposit: prop ? prop.price : '',
    }));
  };

  const handleContractSubmit = (e) => {
    e.preventDefault();
    if (!contractForm.propertyId || !contractForm.tenantName || !contractForm.tenantPhone) {
      alert('Vui lòng nhập đầy đủ thông tin hợp đồng.');
      return;
    }

    createContract({
      ...contractForm,
      monthlyRent: Number(contractForm.monthlyRent),
      deposit: Number(contractForm.deposit),
    });

    // Mark room as rented automatically
    updateProperty(contractForm.propertyId, { isRented: true });

    setIsCreatingContract(false);
    showToast('Tạo hợp đồng thuê nhà thành công!');
  };

  // Bill Form triggers
  const handleAddBillClick = (initialContractId = '') => {
    let initialContract = null;
    if (initialContractId) {
      initialContract = contracts.find((c) => c.id === initialContractId);
    } else {
      initialContract = contracts.filter((c) => c.status === 'active')[0] || null;
    }

    if (!initialContract) {
      alert('Không tìm thấy hợp đồng đang hoạt động nào để tạo hóa đơn.');
      return;
    }

    const prop = getPropertyById(initialContract.propertyId);

    setBillForm({
      contractId: initialContract.id,
      month: new Date().toISOString().slice(0, 7),
      electricityUsage: 120,
      electricityRate: prop ? prop.electricity : 3500,
      waterUsage: 1,
      waterRate: prop ? prop.water : 100000,
      serviceCharge: prop ? prop.service : 150000,
      rent: initialContract.monthlyRent,
    });
    setIsCreatingBill(true);
  };

  const handleBillContractChange = (cId) => {
    const contract = contracts.find((c) => c.id === cId);
    if (!contract) return;
    const prop = getPropertyById(contract.propertyId);

    setBillForm((prev) => ({
      ...prev,
      contractId: cId,
      electricityRate: prop ? prop.electricity : 3500,
      waterRate: prop ? prop.water : 100000,
      serviceCharge: prop ? prop.service : 150000,
      rent: contract.monthlyRent,
    }));
  };

  const calculatedBillTotal =
    Number(billForm.rent || 0) +
    Number(billForm.electricityUsage || 0) * Number(billForm.electricityRate || 0) +
    Number(billForm.waterUsage || 0) * Number(billForm.waterRate || 0) +
    Number(billForm.serviceCharge || 0);

  const handleBillSubmit = (e) => {
    e.preventDefault();
    if (!billForm.contractId) return;

    addBill(billForm.contractId, {
      month: billForm.month,
      electricityUsage: Number(billForm.electricityUsage),
      electricityRate: Number(billForm.electricityRate),
      waterUsage: Number(billForm.waterUsage),
      waterRate: Number(billForm.waterRate),
      serviceCharge: Number(billForm.serviceCharge),
      rent: Number(billForm.rent),
      total: calculatedBillTotal,
    });

    setIsCreatingBill(false);
    showToast('Tạo hóa đơn tháng mới thành công!');
  };

  // Ticket Form triggers
  const handleAddTicketClick = () => {
    const activeRentals = contracts.filter((c) => c.status === 'active');
    if (activeRentals.length === 0) {
      alert('Bạn phải có phòng đang thuê mới gửi được yêu cầu hỗ trợ.');
      return;
    }

    setTicketForm({
      contractId: activeRentals[0].id,
      title: '',
      description: '',
    });
    setIsCreatingTicket(true);
  };

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    if (!ticketForm.contractId || !ticketForm.title || !ticketForm.description) {
      alert('Vui lòng điền đầy đủ tiêu đề và nội dung phản hồi.');
      return;
    }

    const contract = contracts.find((c) => c.id === ticketForm.contractId);
    if (!contract) return;

    createTicket({
      contractId: ticketForm.contractId,
      propertyId: contract.propertyId,
      title: ticketForm.title,
      description: ticketForm.description,
    });

    setIsCreatingTicket(false);
    showToast('Đã gửi yêu cầu hỗ trợ thành công!');
  };

  // --- Hero Slide Actions ---
  const handleAddSlideClick = () => {
    setSlideForm({
      tag: '',
      title: '',
      description: '',
      badgeText: '',
      link: '',
      image: null,
      order: heroSlides.length + 1
    });
    setIsAddingSlide(true);
    setEditingSlide(null);
  };

  const handleEditSlideClick = (slide) => {
    setSlideForm({
      tag: slide.tag || '',
      title: slide.title || '',
      description: slide.description || '',
      badgeText: slide.badgeText || '',
      link: slide.link || '',
      image: slide.image || null,
      order: slide.order || 1
    });
    setEditingSlide(slide);
    setIsAddingSlide(false);
  };

  const handleSlideSubmit = async (e) => {
    e.preventDefault();
    if (!slideForm.title || !slideForm.tag || !slideForm.description || !slideForm.badgeText) {
      showToast('Vui lòng điền đầy đủ thông tin slide.', 'error');
      return;
    }
    if (!editingSlide && !slideForm.image) {
      showToast('Vui lòng tải lên ảnh của slide.', 'error');
      return;
    }

    try {
      if (editingSlide) {
        const res = await updateHeroSlide(editingSlide.id, slideForm);
        if (res.success) {
          showToast('Cập nhật slide thành công!');
          setIsAddingSlide(false);
          setEditingSlide(null);
        } else {
          showToast(res.message || 'Lỗi cập nhật slide.', 'error');
        }
      } else {
        const res = await addHeroSlide(slideForm);
        if (res.success) {
          showToast('Thêm slide thành công!');
          setIsAddingSlide(false);
          setEditingSlide(null);
        } else {
          showToast(res.message || 'Lỗi thêm slide.', 'error');
        }
      }
    } catch (err) {
      showToast('Lỗi kết nối máy chủ.', 'error');
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await saveImportSettings({
        sheetUrl,
        autoImportEnabled,
        intervalHours: Number(intervalHours),
        notificationEmail,
        clearExisting,
      });
      if (res.success) {
        showToast(res.message || 'Lưu cấu hình đồng bộ thành công!');
      } else {
        showToast(res.message || 'Lưu cấu hình thất bại.', 'error');
      }
    } catch (err) {
      showToast('Lỗi kết nối máy chủ.', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSyncNow = async () => {
    setIsImporting(true);
    setImportResult(null);
    try {
      // Save current configuration first
      const saveRes = await saveImportSettings({
        sheetUrl,
        autoImportEnabled,
        intervalHours: Number(intervalHours),
        notificationEmail,
        clearExisting,
      });
      
      if (!saveRes.success) {
        showToast('Không thể lưu cấu hình trước khi đồng bộ: ' + saveRes.message, 'error');
        setIsImporting(false);
        return;
      }

      const res = await syncPropertiesNow();
      if (res.success) {
        showToast(res.message || 'Đồng bộ dữ liệu thành công!');
        setImportResult(res);
        setCacheLastUpdated(new Date().toISOString());
      } else {
        showToast(res.message || 'Đồng bộ thất bại.', 'error');
        setImportResult(res);
      }
    } catch (err) {
      showToast('Lỗi kết nối máy chủ.', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const getBackendUrl = () => {
    const host = window.location.hostname;
    const protocol = window.location.protocol;
    if (window.location.port === '3000') {
      return `${protocol}//${host}:5000/api/properties/sync-now`;
    }
    return `${protocol}//${host}${window.location.port ? ':' + window.location.port : ''}/api/properties/sync-now`;
  };

  const appsScriptSnippet = `function onEdit(e) {
  // Thực hiện đồng bộ tức thì khi bạn chỉnh sửa dữ liệu trên Google Sheets
  var url = "${getBackendUrl()}";
  var token = "${syncSecretToken || 'YOUR_SYNC_SECRET_TOKEN'}";
  
  var options = {
    "method": "post",
    "headers": {
      "x-sync-token": token
    },
    "muteHttpExceptions": true
  };
  
  try {
    var response = UrlFetchApp.fetch(url, options);
    Logger.log("Đồng bộ: " + response.getContentText());
  } catch(err) {
    Logger.log("Lỗi đồng bộ: " + err.toString());
  }
}`;

  const [copiedScript, setCopiedScript] = useState(false);
  const handleCopyScript = () => {
    navigator.clipboard.writeText(appsScriptSnippet);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  // --- Landlord Computations ---
  const totalListings = landlordProperties.length;
  const activeListings = landlordProperties.filter((p) => p.status !== 'pending' && !p.isUnlisted && !p.isRented).length;

  // --- Tenant Computations ---
  const historyProps = (viewHistory || [])
    .map(item => {
      const prop = properties.find((p) => p.id === item?.id);
      return prop ? { ...prop, viewedAt: item.viewedAt } : null;
    })
    .filter(Boolean);

  return (
    <div className="dashboard-page" id="dashboard-page">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification ${toast.type || 'success'}`} id="dashboard-toast">
          {toast.type === 'error' ? (
            <WarningCircle size={20} weight="fill" />
          ) : (
            <CheckCircle size={20} weight="fill" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Sidebar */}
      <aside className="dashboard-sidebar glass" id="dashboard-sidebar">
        <div className="sidebar-header">
          <Buildings size={24} weight="duotone" color="var(--color-accent)" />
          <span className="sidebar-title">
            {isAdmin ? 'Quản trị viên' : (userRole === 'landlord' ? 'Chủ trọ / AMS' : 'Khách thuê')}
          </span>
        </div>

        <nav className="sidebar-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`sidebar-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
              id={`tab-${tab.id}`}
            >
              <tab.icon size={20} weight={activeTab === tab.id ? 'fill' : 'regular'} />
              <span>{tab.label}</span>
              <CaretRight size={14} className="sidebar-arrow" />
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main" id="dashboard-main">
        {isLoading ? (
          <div className="animate-fade-in" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="skeleton" style={{ width: '220px', height: '36px' }} />
              <div className="skeleton" style={{ width: '120px', height: '40px', borderRadius: 'var(--radius-subtle)' }} />
            </div>
            
            <div className="overview-cards" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="skeleton-card card" style={{ padding: '20px', height: '110px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="skeleton" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                  <div className="skeleton" style={{ width: '80px', height: '10px' }} />
                  <div className="skeleton" style={{ width: '110px', height: '18px' }} />
                </div>
              ))}
            </div>

            <div className="skeleton" style={{ width: '160px', height: '20px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton-card card animate-pulse" style={{ padding: '16px', height: '70px', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px' }}>
                  <div className="skeleton" style={{ width: '80px', height: '24px', borderRadius: '4px' }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="skeleton" style={{ width: '180px', height: '14px' }} />
                    <div className="skeleton" style={{ width: '320px', height: '10px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* ===================== SHARED POSTING FORM VIEW ===================== */}
            {(isAddingRoom || editingRoomId) && (
          <div className="animate-fade-in">
            <div className="form-container">
              <div className="form-header">
                <h3 className="form-title">
                  {editingRoomId
                    ? 'Chỉnh sửa thông tin bài đăng'
                    : currentUser.role === 'tenant'
                    ? 'Đăng tin tìm khách thuê mới'
                    : 'Thêm phòng trọ mới cho thuê'}
                </h3>
                <button
                  className="btn btn-ghost btn-icon"
                  onClick={() => {
                    setIsAddingRoom(false);
                    setEditingRoomId(null);
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleRoomSubmit} id="room-form">
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">Tiêu đề bài đăng *</label>
                    <input
                      className="input"
                      required
                      placeholder={
                        currentUser.role === 'tenant'
                          ? 'Ví dụ: Tìm nam ở cùng gấp tại Studio Chùa Láng gần FTU'
                          : 'Ví dụ: Căn hộ Studio Ban Công Kính Đầy Đủ Tiện Nghi Cầu Giấy'
                      }
                      value={roomForm.title}
                      onChange={(e) => setRoomForm({ ...roomForm, title: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Loại phòng</label>
                    <select
                      className="select"
                      value={roomForm.type}
                      onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })}
                    >
                      {ROOM_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {currentUser.role === 'tenant' ? 'Tiền phòng chia sẻ (VND/tháng) *' : 'Giá thuê phòng (VND/tháng) *'}
                    </label>
                    <input
                      type="text"
                      className="input"
                      required
                      placeholder="Ví dụ: 4.500.000"
                      value={formatNumberWithDots(roomForm.price)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        setRoomForm({ ...roomForm, price: raw });
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Diện tích phòng (m²) *</label>
                    <input
                      type="number"
                      className="input text-mono"
                      required
                      placeholder="Nhập diện tích, VD: 25"
                      value={roomForm.area}
                      onChange={(e) => setRoomForm({ ...roomForm, area: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Thành phố</label>
                    <select
                      className="select"
                      value={roomForm.city}
                      onChange={(e) => handleRoomCityChange(e.target.value)}
                    >
                      {CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Quận / Huyện</label>
                    <select
                      className="select"
                      value={roomForm.district}
                      onChange={(e) => handleRoomDistrictChange(e.target.value)}
                    >
                      {DISTRICTS[roomForm.city]?.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phường / Xã</label>
                    <select
                      className="select"
                      value={roomForm.ward}
                      onChange={(e) => setRoomForm({ ...roomForm, ward: e.target.value })}
                    >
                      {WARDS[roomForm.district]?.map((w) => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Địa chỉ chi tiết *</label>
                    <input
                      className="input"
                      required
                      placeholder="Ví dụ: 91 Chùa Láng, Láng Thượng"
                      value={roomForm.address}
                      onChange={(e) => setRoomForm({ ...roomForm, address: e.target.value })}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Hình ảnh minh họa (Được tải tối đa 10 ảnh, mỗi ảnh ≤ 2MB) *</span>
                      <span className="text-caption" style={{ margin: 0, fontSize: '11px' }}>
                        Đã chọn: <strong>{roomForm.images.length}/10</strong> ảnh
                      </span>
                    </label>
                    
                    <div 
                      className="image-upload-dropzone" 
                      onClick={() => document.getElementById('room-images-input').click()}
                    >
                      <UploadSimple size={24} color="var(--color-text-subtle)" />
                      <span className="dropzone-text">
                        Nhấp vào đây để chọn ảnh từ thiết bị
                      </span>
                      <span className="dropzone-hint">
                        Định dạng hỗ trợ: JPG, PNG, WEBP. Ảnh lớn hơn 2MB sẽ được tự động nén.
                      </span>
                      <input
                        id="room-images-input"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                    </div>

                    {roomForm.images.length > 0 && (
                      <div className="upload-preview-grid">
                        {roomForm.images.map((img, index) => (
                          <div key={index} className="upload-preview-item">
                            <img
                              src={typeof img === 'string' ? img : URL.createObjectURL(img)}
                              alt={`Preview ${index}`}
                            />
                            <button
                              type="button"
                              className="upload-preview-remove"
                              onClick={() => handleRemoveImage(index)}
                              title="Xóa ảnh này"
                            >
                              <X size={12} weight="bold" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Đơn giá điện (VND/kWh) *</label>
                    <input
                      type="text"
                      className="input"
                      required
                      placeholder="Ví dụ: 3.500"
                      value={formatNumberWithDots(roomForm.electricity)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        setRoomForm({ ...roomForm, electricity: raw });
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Đơn giá nước (VND/người) *</label>
                    <input
                      type="text"
                      className="input"
                      required
                      placeholder="Ví dụ: 100.000"
                      value={formatNumberWithDots(roomForm.water)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        setRoomForm({ ...roomForm, water: raw });
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phí dịch vụ cố định (VND/phòng) *</label>
                    <input
                      type="text"
                      className="input"
                      required
                      placeholder="Ví dụ: 150.000"
                      value={formatNumberWithDots(roomForm.service)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        setRoomForm({ ...roomForm, service: raw });
                      }}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Mô tả phòng / Yêu cầu tìm khách thuê *</label>
                    <textarea
                      className="input"
                      required
                      rows={4}
                      placeholder={
                        currentUser.role === 'tenant'
                          ? 'Mô tả chi tiết phòng trọ hiện tại của bạn và các tiêu chuẩn tìm khách thuê ở cùng (sạch sẽ, không hút thuốc, sinh viên trường Ngoại thương...)'
                          : 'Nhập mô tả chi tiết phòng trọ phục vụ sinh viên tìm thuê...'
                      }
                      value={roomForm.description}
                      onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label" style={{ marginBottom: 'var(--space-1)' }}>
                      Chọn Tiện Nghi Có Sẵn của Phòng
                    </label>
                    <div className="amenities-checklist">
                      {Object.entries(AMENITY_MAP).map(([key, info]) => {
                        const IconComponent = ICON_COMPONENTS[info.icon];
                        const isActive = roomForm.amenities.includes(key);
                        return (
                          <div
                            key={key}
                            className={`amenity-checkbox-label ${isActive ? 'active' : ''}`}
                            onClick={() => handleAmenityToggle(key)}
                          >
                            {IconComponent && <IconComponent size={16} />}
                            <span>{info.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="form-actions-row">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      setIsAddingRoom(false);
                      setEditingRoomId(null);
                    }}
                  >
                    Hủy bỏ
                  </button>
                  <button type="submit" className="btn btn-primary" id="save-room-btn">
                    {editingRoomId ? 'Lưu cập nhật' : currentUser.role === 'tenant' ? 'Đăng tin tìm khách thuê' : 'Thêm phòng mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===================== LANDLORD ONLY VIEWS ===================== */}

        {/* 1. Overview & Room Management Merged */}
        {(userRole === 'landlord' || isAdmin) && activeTab === 'overview' && !isAddingRoom && !editingRoomId && (
          <div className="animate-fade-in">
            <div className="dashboard-page-header">
              <h2 className="dashboard-page-title">
                {isAdmin ? 'Tổng quan & Quản lý bài đăng' : 'Tổng quan & Quản lý phòng'}
              </h2>
              <button
                className="btn btn-primary animate-scale-in"
                onClick={handleAddRoomClick}
                id="add-room-btn"
              >
                <Plus size={18} />
                Thêm phòng
              </button>
            </div>

            <div className="overview-cards" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: 'var(--space-8)' }}>
              <div className="overview-card">
                <Buildings size={24} color="var(--color-info)" />
                <div className="overview-card-info">
                  <span className="overview-card-label">Tin đăng</span>
                  <span className="overview-card-value text-mono">{totalListings}</span>
                </div>
              </div>
              <div className="overview-card">
                <SealCheck size={24} color="var(--color-success)" />
                <div className="overview-card-info">
                  <span className="overview-card-label">Bài đang hoạt động</span>
                  <span className="overview-card-value text-mono">{activeListings}</span>
                </div>
              </div>
            </div>

            <div className="dashboard-section">
              <h3 className="dashboard-section-title">Danh sách bài đăng của bạn</h3>
              <div className="rooms-table-wrap">
                <table className="rooms-table">
                  <thead>
                    <tr>
                      <th>Phòng</th>
                      <th>Quận</th>
                      <th>Giá</th>
                      <th>Diện tích</th>
                      <th>Ngày đăng</th>
                      <th>Hiển thị</th>
                      {isAdmin && <th>Đã Review</th>}
                      <th>Tình trạng</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {landlordProperties.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div className="room-cell">
                            <img src={p.images[0]} alt="" className="room-cell-img" />
                            <div>
                              <div className="room-cell-title">{p.title}</div>
                              <div className="text-caption">{p.city}</div>
                            </div>
                          </div>
                        </td>
                        <td>{p.district}</td>
                        <td><span className="price">{formatPriceShort(p.price)}</span></td>
                        <td><span className="text-mono">{p.area} m&sup2;</span></td>
                        <td>
                          <span className="text-caption" style={{ whiteSpace: 'nowrap' }}>
                            {p.createdAt ? new Date(p.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${p.isUnlisted ? 'badge-rented' : 'badge-available'}`}>
                            {p.isUnlisted ? 'Đã ẩn (Gỡ)' : 'Đang đăng'}
                          </span>
                        </td>
                        {isAdmin && (
                          <td>
                            <div
                              className={`switch ${p.verified ? 'active' : ''}`}
                              onClick={() => toggleVerifyProperty(p.id)}
                              title={p.verified ? 'Đã Review' : 'Chưa Review'}
                            />
                          </td>
                        )}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <div
                              className={`switch ${p.isRented ? 'active' : ''}`}
                              onClick={() => togglePropertyStatus(p.id)}
                              title={p.isRented ? 'Đã cho thuê (Full)' : 'Còn trống'}
                              id={`switch-${p.id}`}
                            />
                            <span style={{ 
                              fontSize: 'var(--text-xs)', 
                              fontWeight: 'var(--weight-semibold)', 
                              color: p.isRented ? 'var(--color-text-muted)' : 'var(--color-accent)',
                              display: 'inline-block',
                              width: '75px'
                            }}>
                              {p.isRented ? 'Full' : 'Còn trống'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="room-actions">
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => toggleUnlistProperty(p.id)}
                              title={p.isUnlisted ? 'Đăng lại (Hiện)' : 'Gỡ xuống (Ẩn)'}
                              style={{ color: p.isUnlisted ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
                            >
                              {p.isUnlisted ? <Eye size={16} /> : <EyeSlash size={16} />}
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleEditRoomClick(p)}
                              title="Chỉnh sửa"
                            >
                              <PencilSimple size={16} />
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => {
                                if (confirm('Bạn có chắc chắn muốn xóa phòng trọ này?')) {
                                  deleteProperty(p.id);
                                  showToast('Xóa phòng trọ thành công!');
                                }
                              }}
                              style={{ color: 'var(--color-error)' }}
                              title="Xóa"
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}





        {/* ===================== TENANT ONLY VIEWS ===================== */}

        {/* 1. View History */}
        {userRole === 'tenant' && activeTab === 'history' && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              <h2 className="dashboard-page-title" style={{ margin: 0 }}>Lịch sử tin đăng đã xem ({historyProps.length})</h2>
              <span className="text-caption" style={{ background: 'var(--bg-secondary)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-pill)', fontSize: 'var(--text-xs)' }}>
                Tự động lưu trữ trong 7 ngày gần nhất
              </span>
            </div>
            {historyProps.length > 0 ? (
              <div className="saved-grid">
                {historyProps.map((prop) => (
                  <div key={prop.id} className="saved-item card-elevated animate-fade-in-up">
                    <img src={prop.images[0]} alt="" className="saved-img" />
                    <div className="saved-info">
                      <Link to={`/property/${prop.id}`} className="saved-title">{prop.title}</Link>
                      <p className="text-caption">{prop.district}, {prop.city}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)' }}>
                        <span className="price">{formatPrice(prop.price)}</span>
                        <span style={{ fontSize: '10px', color: 'var(--color-text-subtle)' }}>
                          Xem lúc: {new Date(prop.viewedAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dashboard-empty">
                <Clock size={48} color="var(--color-text-subtle)" />
                <p>Bạn chưa xem tin đăng nào trong vòng 7 ngày qua</p>
                <Link to="/search" className="btn btn-primary">Khám phá tin đăng ngay</Link>
              </div>
            )}
          </div>
        )}


        {/* 3. Tenant's My Listings Tab */}
        {userRole === 'tenant' && activeTab === 'my-listings' && !isAddingRoom && !editingRoomId && (
          <div className="animate-fade-in">
            <div className="dashboard-page-header">
              <h2 className="dashboard-page-title">Tin tìm khách thuê của tôi</h2>
              <button className="btn btn-primary" onClick={handleAddRoomClick}>
                <Plus size={18} />
                Đăng tin tìm khách thuê
              </button>
            </div>

            {tenantProperties.length > 0 ? (
              <div className="rooms-table-wrap animate-scale-in">
                <table className="rooms-table">
                  <thead>
                    <tr>
                      <th>Tin đăng</th>
                      <th>Quận</th>
                      <th>Giá chia sẻ</th>
                      <th>Diện tích</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenantProperties.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div className="room-cell">
                            <img src={p.images[0]} alt="" className="room-cell-img" />
                            <div>
                              <div className="room-cell-title">{p.title}</div>
                              <div className="text-caption">{p.city}</div>
                            </div>
                          </div>
                        </td>
                        <td>{p.district}</td>
                        <td><span className="price">{formatPriceShort(p.price)}</span></td>
                        <td><span className="text-mono">{p.area} m&sup2;</span></td>
                        <td>
                          <span className={`badge ${p.isUnlisted ? 'badge-rented' : (p.isRented ? 'badge-rented' : 'badge-available')}`}>
                            {p.isUnlisted ? 'Đã ẩn (Gỡ)' : (p.isRented ? 'Đã tìm được' : 'Đang tìm')}
                          </span>
                        </td>
                        <td>
                          <div className="room-actions">
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => toggleUnlistProperty(p.id)}
                              title={p.isUnlisted ? 'Đăng lại (Hiện)' : 'Gỡ xuống (Ẩn)'}
                              style={{ color: p.isUnlisted ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
                            >
                              {p.isUnlisted ? <Eye size={16} /> : <EyeSlash size={16} />}
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleEditRoomClick(p)}
                              title="Chỉnh sửa"
                            >
                              <PencilSimple size={16} />
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => {
                                if (confirm('Bạn có chắc chắn muốn xóa bài đăng tìm khách thuê này?')) {
                                  deleteProperty(p.id);
                                  showToast('Xóa tin đăng thành công!');
                                }
                              }}
                              style={{ color: 'var(--color-error)' }}
                              title="Xóa"
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="dashboard-empty">
                <FileText size={48} color="var(--color-text-subtle)" />
                <p>Bạn chưa đăng bài tìm khách thuê nào hiện tại.</p>
                <button className="btn btn-primary" onClick={handleAddRoomClick}>
                  Đăng tin tìm khách thuê ngay
                </button>
              </div>
            )}
          </div>
        )}


        {/* ===================== ADMIN PENDING REVIEWS VIEW ===================== */}
        {isAdmin && activeTab === 'pending-reviews' && (
          <div className="animate-fade-in">
            <div className="dashboard-page-header">
              <h2 className="dashboard-page-title">Hàng chờ kiểm duyệt tin đăng</h2>
            </div>
            
            {properties.filter((p) => p.status === 'pending').length > 0 ? (
              <div className="rooms-table-wrap animate-scale-in">
                <table className="rooms-table">
                  <thead>
                    <tr>
                      <th>Tin đăng mới</th>
                      <th>Người đăng</th>
                      <th>Quận</th>
                      <th>Giá thuê</th>
                      <th>Độ trùng lặp</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties
                      .filter((p) => p.status === 'pending')
                      .map((p) => (
                        <tr key={p.id}>
                          <td>
                            <div className="room-cell">
                              <img src={p.images?.[0]} alt="" className="room-cell-img" />
                              <div>
                                <div className="room-cell-title">{p.title}</div>
                                <div className="text-caption">{p.address}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="text-caption" style={{ fontWeight: 'var(--weight-semibold)' }}>
                              {p.owner?.name || 'Chủ nhà'}
                            </div>
                            <div className="text-caption" style={{ fontSize: '11px' }}>
                              {p.owner?.phone}
                            </div>
                          </td>
                          <td>{p.district}</td>
                          <td><span className="price">{formatPriceShort(p.price)}</span></td>
                          <td>
                            <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', fontWeight: 'var(--weight-semibold)' }}>
                              {p.duplicateReport?.confidenceScore || 0}%
                            </span>
                          </td>
                          <td>
                            <div className="room-actions">
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => {
                                  setDuplicateReport({
                                    ...p.duplicateReport,
                                    pendingProperty: p,
                                    matchedProperty: properties.find((x) => x.id === p.duplicateReport?.matchedPropertyId),
                                    isAdminReview: true
                                  });
                                }}
                                style={{ padding: '4px 12px', fontSize: '12px' }}
                              >
                                Xem đối chiếu
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="dashboard-empty">
                <ShieldCheck size={48} color="var(--color-success)" />
                <p style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--color-success)' }}>Hàng chờ trống!</p>
                <p className="text-caption">Tất cả bài đăng trọ trên hệ thống đã được kiểm duyệt và an toàn.</p>
              </div>
            )}
          </div>
        )}


        {/* ===================== HERO SLIDES / BANNERS MANAGEMENT ===================== */}
        {isAdmin && activeTab === 'banners' && (
          <div className="animate-fade-in">
            {/* Form to Add or Edit Slide */}
            {(isAddingSlide || editingSlide) ? (
              <div className="form-container animate-scale-in">
                <div className="form-header">
                  <h3 className="form-title">
                    {editingSlide ? 'Chỉnh sửa slide bản tin' : 'Thêm slide bản tin mới'}
                  </h3>
                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => {
                      setIsAddingSlide(false);
                      setEditingSlide(null);
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSlideSubmit}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Thẻ tiêu đề (Tag) *</label>
                      <input
                        className="input"
                        required
                        placeholder="Ví dụ: Cộng đồng FindX, Hoạt động nổi bật"
                        value={slideForm.tag}
                        onChange={(e) => setSlideForm({ ...slideForm, tag: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Huy hiệu góc (Badge) *</label>
                      <input
                        className="input"
                        required
                        placeholder="Ví dụ: Sự kiện 2026, CLB Hỗ trợ sinh viên"
                        value={slideForm.badgeText}
                        onChange={(e) => setSlideForm({ ...slideForm, badgeText: e.target.value })}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label className="form-label">Tiêu đề chính *</label>
                      <input
                        className="input"
                        required
                        placeholder="Ví dụ: Đội ngũ Core Team FindX"
                        value={slideForm.title}
                        onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label className="form-label">Mô tả chi tiết *</label>
                      <textarea
                        className="input"
                        required
                        rows={3}
                        placeholder="Nhập mô tả ngắn gọn về slide..."
                        value={slideForm.description}
                        onChange={(e) => setSlideForm({ ...slideForm, description: e.target.value })}
                        style={{ resize: 'vertical' }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Đường dẫn liên kết (Link) *</label>
                      <input
                        className="input"
                        required
                        placeholder="Ví dụ: https://facebook.com/... hoặc /search"
                        value={slideForm.link}
                        onChange={(e) => setSlideForm({ ...slideForm, link: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Thứ tự hiển thị *</label>
                      <input
                        type="number"
                        className="input text-mono"
                        required
                        min="1"
                        value={slideForm.order}
                        onChange={(e) => setSlideForm({ ...slideForm, order: Number(e.target.value) })}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label className="form-label">Hình ảnh banner *</label>
                      <div 
                        className="image-upload-dropzone" 
                        onClick={() => document.getElementById('slide-image-file').click()}
                      >
                        <UploadSimple size={24} color="var(--color-text-subtle)" />
                        <span className="dropzone-text">Nhấp để chọn ảnh banner</span>
                        <input
                          id="slide-image-file"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setSlideForm({ ...slideForm, image: file });
                            }
                          }}
                          style={{ display: 'none' }}
                        />
                      </div>

                      {slideForm.image && (
                        <div className="upload-preview-grid" style={{ marginTop: 'var(--space-2)' }}>
                          <div className="upload-preview-item" style={{ width: '200px', height: '120px' }}>
                            <img
                              src={slideForm.image instanceof File ? URL.createObjectURL(slideForm.image) : slideForm.image}
                              alt="Preview"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <button
                              type="button"
                              className="upload-preview-remove"
                              onClick={() => setSlideForm({ ...slideForm, image: null })}
                            >
                              <X size={12} weight="bold" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-actions-row">
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => {
                        setIsAddingSlide(false);
                        setEditingSlide(null);
                      }}
                    >
                      Hủy bỏ
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingSlide ? 'Lưu cập nhật' : 'Thêm slide'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="animate-scale-in">
                <div className="dashboard-page-header">
                  <h2 className="dashboard-page-title">Quản lý slide quảng cáo & bản tin</h2>
                  <button className="btn btn-primary" onClick={handleAddSlideClick}>
                    <Plus size={18} />
                    Thêm slide mới
                  </button>
                </div>

                {heroSlides.length > 0 ? (
                  <div className="rooms-table-wrap">
                    <table className="rooms-table">
                      <thead>
                        <tr>
                          <th>Hình ảnh</th>
                          <th>Tiêu đề & Thẻ</th>
                          <th>Huy hiệu</th>
                          <th>Đường dẫn</th>
                          <th>Thứ tự</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {heroSlides.map((slide) => (
                          <tr key={slide.id}>
                            <td>
                              <img 
                                src={slide.image} 
                                alt="" 
                                style={{ width: '80px', height: '50px', borderRadius: '4px', objectFit: 'cover' }} 
                              />
                            </td>
                            <td>
                              <div style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)' }}>
                                {slide.title}
                              </div>
                              <div className="text-caption" style={{ color: 'var(--color-accent)' }}>
                                {slide.tag}
                              </div>
                            </td>
                            <td>
                              <span className="badge badge-available">{slide.badgeText}</span>
                            </td>
                            <td className="text-mono" style={{ fontSize: '11px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {slide.link}
                            </td>
                            <td className="text-mono">{slide.order}</td>
                            <td>
                              <div className="room-actions">
                                <button
                                  className="btn btn-ghost btn-sm"
                                  onClick={() => handleEditSlideClick(slide)}
                                  title="Chỉnh sửa"
                                >
                                  <PencilSimple size={16} />
                                </button>
                                <button
                                  className="btn btn-ghost btn-sm"
                                  onClick={() => {
                                    if (confirm('Bạn có chắc chắn muốn xóa slide này?')) {
                                      deleteHeroSlide(slide.id);
                                      showToast('Xóa slide thành công!');
                                    }
                                  }}
                                  style={{ color: 'var(--color-error)' }}
                                  title="Xóa"
                                >
                                  <Trash size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="dashboard-empty">
                    <Buildings size={48} color="var(--color-text-subtle)" />
                    <p>Chưa có slide nào được tải lên cơ sở dữ liệu.</p>
                    <button className="btn btn-primary" onClick={handleAddSlideClick}>
                      Thêm slide đầu tiên ngay
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===================== GOOGLE SHEETS IMPORT ===================== */}
        {/* ===================== GOOGLE SHEETS IMPORT & SYNC SETTINGS ===================== */}
        {isAdmin && activeTab === 'import' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div className="dashboard-page-header">
              <h2 className="dashboard-page-title">Cấu hình & Đồng bộ Google Sheets</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                Tận dụng Google Sheets làm cơ sở dữ liệu (Database) thời gian thực, đồng bộ trực tiếp lên hệ thống Web.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 'var(--space-6)' }} className="sync-grid">
              
              {/* Cấu hình Tự động Đồng bộ */}
              <div className="card glass-strong" style={{ padding: 'var(--space-5)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-main)', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-bold)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', borderBottom: '1px solid var(--color-divider)', paddingBottom: 'var(--space-2)' }}>
                  <CloudArrowDown size={20} color="var(--color-accent)" weight="fill" />
                  Cấu hình Tự động Đồng bộ
                </h3>

                <form onSubmit={handleSettingsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)' }}>Đường dẫn liên kết Google Sheet (URL) *</label>
                    <input
                      type="url"
                      className="input"
                      required
                      placeholder="https://docs.google.com/spreadsheets/d/.../edit?usp=sharing"
                      value={sheetUrl}
                      onChange={(e) => setSheetUrl(e.target.value)}
                      style={{ width: '100%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-subtle)', padding: 'var(--space-2) var(--space-3)' }}
                    />
                  </div>

                  <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                    <input
                      type="checkbox"
                      id="autoImportEnabled"
                      checked={autoImportEnabled}
                      onChange={(e) => setAutoImportEnabled(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="autoImportEnabled" style={{ fontSize: 'var(--text-sm)', cursor: 'pointer', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-main)' }}>
                      Kích hoạt tác vụ đồng bộ tự động định kỳ
                    </label>
                  </div>

                  {autoImportEnabled && (
                    <div className="form-group" style={{ paddingLeft: 'var(--space-6)', animation: 'slideDown 0.2s ease' }}>
                      <label className="form-label" style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)' }}>Tần suất đồng bộ tự động (Giờ) *</label>
                      <input
                        type="number"
                        min="1"
                        max="168"
                        className="input"
                        required
                        value={intervalHours}
                        onChange={(e) => setIntervalHours(e.target.value)}
                        style={{ width: '120px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-subtle)', padding: 'var(--space-2) var(--space-3)' }}
                      />
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        Đồng bộ định kỳ sau mỗi {intervalHours} giờ.
                      </span>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)' }}>Email nhận báo cáo lỗi dữ liệu</label>
                    <input
                      type="email"
                      className="input"
                      placeholder="admin@tncb.vn"
                      value={notificationEmail}
                      onChange={(e) => setNotificationEmail(e.target.value)}
                      style={{ width: '100%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-subtle)', padding: 'var(--space-2) var(--space-3)' }}
                    />
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      Khi có lỗi định dạng hoặc dữ liệu không hợp lệ (nhưng không bị trống các trường bắt buộc), hệ thống sẽ gửi danh sách dòng lỗi qua email này.
                    </span>
                  </div>

                  <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
                    <input
                      type="checkbox"
                      id="clearExisting"
                      checked={clearExisting}
                      onChange={(e) => setClearExisting(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="clearExisting" style={{ fontSize: 'var(--text-sm)', cursor: 'pointer', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-main)' }}>
                      Xóa toàn bộ dữ liệu tin đăng cũ trên Web khi đồng bộ
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                    <button type="submit" className="btn btn-primary" disabled={isSavingSettings} style={{ minWidth: '150px', justifyContent: 'center' }}>
                      {isSavingSettings ? (
                        <>
                          <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', marginRight: 'var(--space-2)' }}></div>
                          Đang lưu...
                        </>
                      ) : (
                        'Lưu cấu hình'
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Trạng thái & Đồng bộ thủ công */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div className="card glass-strong" style={{ padding: 'var(--space-5)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-main)', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-bold)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', borderBottom: '1px solid var(--color-divider)', paddingBottom: 'var(--space-2)' }}>
                    <CheckCircle size={20} color="var(--color-success)" weight="fill" />
                    Đồng bộ thủ công & Trạng thái
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <div>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block' }}>Cập nhật cache gần nhất</span>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text-main)' }}>
                        {cacheLastUpdated ? new Date(cacheLastUpdated).toLocaleString('vi-VN') : 'Chưa từng đồng bộ'}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block' }}>Chế độ lưu trữ dữ liệu</span>
                      <span className="badge" style={{ background: '#dbeafe', color: '#1e40af', padding: 'var(--space-1) var(--space-2)', borderRadius: 'var(--radius-subtle)', fontSize: '11px', display: 'inline-block', marginTop: '4px', fontWeight: 'var(--weight-semibold)' }}>
                        In-Memory Caching (MongoDB Bypassed)
                      </span>
                    </div>

                    <div style={{ marginTop: 'var(--space-2)', borderTop: '1px solid var(--color-divider)', paddingTop: 'var(--space-4)' }}>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)', lineHeight: '1.4' }}>
                        Nhấn nút dưới đây để chạy đồng bộ ngay lập tức từ bảng tính hiện tại. Cấu hình sẽ tự động được lưu trước khi đồng bộ.
                      </p>
                      
                      <button 
                        type="button" 
                        onClick={handleSyncNow} 
                        className="btn btn-secondary" 
                        disabled={isImporting || !sheetUrl} 
                        style={{ width: '100%', justifyContent: 'center', gap: 'var(--space-2)' }}
                      >
                        {isImporting ? (
                          <>
                            <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                            Đang đồng bộ...
                          </>
                        ) : (
                          <>
                            <CloudArrowDown size={18} />
                            Đồng bộ dữ liệu ngay
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Import Result / Summary Panel */}
            {importResult && (
              <div className="card glass-strong" style={{ padding: 'var(--space-5)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-main)', background: 'var(--bg-secondary)', animation: 'fadeIn 0.3s ease both' }}>
                <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <CheckCircle size={20} color="var(--color-success)" weight="fill" />
                  Kết quả đồng bộ gần nhất
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                  <div style={{ background: 'var(--color-surface)', padding: 'var(--space-3)', borderRadius: 'var(--radius-subtle)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 'var(--space-1)' }}>Trạng thái</span>
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: 'var(--color-success)' }}>Hoàn tất</span>
                  </div>
                  <div style={{ background: 'var(--color-surface)', padding: 'var(--space-3)', borderRadius: 'var(--radius-subtle)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 'var(--space-1)' }}>Dòng nhập thành công</span>
                    <span className="text-mono" style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-bold)', color: 'var(--color-success)' }}>{importResult.importedCount}</span>
                  </div>
                  <div style={{ background: 'var(--color-surface)', padding: 'var(--space-3)', borderRadius: 'var(--radius-subtle)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 'var(--space-1)' }}>Dòng lỗi định dạng (Bỏ qua)</span>
                    <span className="text-mono" style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-bold)', color: importResult.failedCount > 0 ? 'var(--color-error)' : 'var(--color-text-muted)' }}>{importResult.failedCount}</span>
                  </div>
                </div>

                {importResult.errors && importResult.errors.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-error)', marginBottom: 'var(--space-2)' }}>
                      Chi tiết các dòng bị bỏ qua hoặc lỗi định dạng:
                    </h4>
                    <div style={{ maxHeight: '200px', overflowY: 'auto', background: 'var(--color-surface)', borderRadius: 'var(--radius-subtle)', border: '1px solid var(--color-border)' }}>
                      <table className="rooms-table" style={{ fontSize: '12px', width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: 'var(--bg-tertiary)' }}>
                            <th style={{ width: '80px', padding: '8px', textAlign: 'left', borderBottom: '1px solid var(--color-divider)' }}>Dòng số</th>
                            <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid var(--color-divider)' }}>Mô tả chi tiết lỗi dữ liệu</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importResult.errors.map((err, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid var(--color-divider)' }}>
                              <td className="text-mono" style={{ padding: '8px', fontWeight: 'var(--weight-semibold)' }}>{err.row}</td>
                              <td style={{ padding: '8px', color: 'var(--color-text-muted)' }}>{err.message}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Real-time Google Apps Script Setup Trigger */}
            <div className="card glass-strong" style={{ padding: 'var(--space-5)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-main)', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-bold)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', borderBottom: '1px solid var(--color-divider)', paddingBottom: 'var(--space-2)' }}>
                <Buildings size={20} color="var(--color-accent)" weight="fill" />
                Tự động cập nhật Web tức thì khi sửa Sheet (Real-time Webhook)
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', lineHeight: '1.5', margin: 0 }}>
                Bạn có thể cài đặt một trigger <code>onEdit</code> trên Google Sheet để mỗi khi bạn chỉnh sửa, cập nhật hoặc thêm dòng mới, bảng tính sẽ tự động gọi API đẩy dữ liệu lên trang Web ngay lập tức (không cần bấm nút đồng bộ thủ công hay chờ đợi tác vụ định kỳ).
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-text-main)' }}>
                <strong>Các bước thực hiện:</strong>
                <ol style={{ paddingLeft: 'var(--space-4)', margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', color: 'var(--color-text-muted)' }}>
                  <li>Trên Google Sheets của bạn, chọn menu <strong>Tiện ích mở rộng (Extensions)</strong> &gt; <strong>Apps Script</strong>.</li>
                  <li>Xóa mọi đoạn mã mặc định trong khung soạn thảo.</li>
                  <li>Dán đoạn mã dưới đây vào (đoạn mã đã tự động điền URL Web và Token bảo mật của bạn):</li>
                </ol>

                <div style={{ position: 'relative', marginTop: 'var(--space-2)' }}>
                  <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 'var(--space-4)', borderRadius: 'var(--radius-subtle)', fontSize: '12px', overflowX: 'auto', fontFamily: 'monospace', margin: 0, border: '1px solid #333' }}>
                    {appsScriptSnippet}
                  </pre>
                  <button 
                    onClick={handleCopyScript} 
                    style={{ position: 'absolute', top: '10px', right: '10px', background: copiedScript ? 'var(--color-success)' : 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s ease' }}
                  >
                    {copiedScript ? 'Đã sao chép!' : 'Sao chép mã'}
                  </button>
                </div>

                <ol start="4" style={{ paddingLeft: 'var(--space-4)', margin: 'var(--space-2) 0 0 0', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', color: 'var(--color-text-muted)' }}>
                  <li>Nhấn nút <strong>Lưu (Save)</strong> (biểu tượng đĩa mềm) hoặc tổ hợp phím <code>Ctrl + S</code>.</li>
                  <li>Từ bây giờ, bất kỳ thay đổi nào của bạn trên trang tính sẽ kích hoạt webhook và đồng bộ dữ liệu ngay lập tức lên web!</li>
                </ol>
              </div>
            </div>

            {/* Instruction / Help Box */}
            <div className="card glass-strong" style={{ padding: 'var(--space-5)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-main)', background: 'var(--bg-secondary)' }}>
              <h4 style={{ fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-3)', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <CloudArrowDown size={18} />
                Hướng dẫn định dạng cột dữ liệu trên Google Sheet:
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', margin: 0 }}>
                  Để hệ thống nhận diện chính xác, bảng tính Google Sheet của bạn phải ở chế độ công khai (<strong>Chia sẻ &gt; Bất kỳ ai có liên kết đều có thể xem</strong>) và có tiêu đề các cột trùng với một trong các tên được hỗ trợ sau đây:
                </p>

                <div style={{ overflowX: 'auto' }}>
                  <table className="rooms-table" style={{ fontSize: '12px', width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-tertiary)' }}>
                        <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid var(--color-divider)' }}>Thông tin thuộc tính</th>
                        <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid var(--color-divider)' }}>Tên tiêu đề cột hỗ trợ</th>
                        <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid var(--color-divider)' }}>Yêu cầu / Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--color-divider)' }}>
                        <td style={{ padding: '8px' }}><strong>Tiêu đề tin đăng</strong></td>
                        <td style={{ padding: '8px' }}><code>Tiêu đề</code>, <code>title</code>, <code>tenphong</code>, <code>ten</code></td>
                        <td style={{ padding: '8px' }}><span style={{ color: 'var(--color-error)', fontWeight: 'bold' }}>Bắt buộc</span>. Chuỗi văn bản mô tả ngắn</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--color-divider)' }}>
                        <td style={{ padding: '8px' }}><strong>Loại phòng</strong></td>
                        <td style={{ padding: '8px' }}><code>Loại phòng</code>, <code>type</code>, <code>loai</code></td>
                        <td style={{ padding: '8px' }}><span style={{ color: 'var(--color-error)', fontWeight: 'bold' }}>Bắt buộc</span>. Giá trị: <code>Chung cư mini</code>, <code>Căn hộ</code>, <code>Phòng trọ</code>, <code>Nhà nguyên căn</code></td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--color-divider)' }}>
                        <td style={{ padding: '8px' }}><strong>Giá thuê (VND)</strong></td>
                        <td style={{ padding: '8px' }}><code>Giá thuê</code>, <code>price</code>, <code>gia</code>, <code>tienphong</code></td>
                        <td style={{ padding: '8px' }}><span style={{ color: 'var(--color-error)', fontWeight: 'bold' }}>Bắt buộc</span>. Nhập số nguyên dương (ví dụ: 3500000)</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--color-divider)' }}>
                        <td style={{ padding: '8px' }}><strong>Diện tích (m²)</strong></td>
                        <td style={{ padding: '8px' }}><code>Diện tích</code>, <code>area</code>, <code>rong</code></td>
                        <td style={{ padding: '8px' }}><span style={{ color: 'var(--color-error)', fontWeight: 'bold' }}>Bắt buộc</span>. Số nguyên hoặc số thập phân (ví dụ: 25.5)</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--color-divider)' }}>
                        <td style={{ padding: '8px' }}><strong>Thành phố / Tỉnh</strong></td>
                        <td style={{ padding: '8px' }}><code>Thành phố</code>, <code>city</code>, <code>tp</code></td>
                        <td style={{ padding: '8px' }}><span style={{ color: 'var(--color-error)', fontWeight: 'bold' }}>Bắt buộc</span>. Ví dụ: <code>Hà Nội</code>, <code>TP Hồ Chí Minh</code></td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--color-divider)' }}>
                        <td style={{ padding: '8px' }}><strong>Quận / Huyện</strong></td>
                        <td style={{ padding: '8px' }}><code>Quận huyện</code>, <code>district</code>, <code>quan</code>, <code>huyen</code></td>
                        <td style={{ padding: '8px' }}><span style={{ color: 'var(--color-error)', fontWeight: 'bold' }}>Bắt buộc</span>. Ví dụ: <code>Cầu Giấy</code>, <code>Quận 1</code></td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--color-divider)' }}>
                        <td style={{ padding: '8px' }}><strong>Phường / Xã</strong></td>
                        <td style={{ padding: '8px' }}><code>Phường xã</code>, <code>ward</code>, <code>phuong</code>, <code>xa</code></td>
                        <td style={{ padding: '8px' }}><span style={{ color: 'var(--color-error)', fontWeight: 'bold' }}>Bắt buộc</span>. Ví dụ: <code>Dịch Vọng</code>, <code>Bến Nghé</code></td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--color-divider)' }}>
                        <td style={{ padding: '8px' }}><strong>Địa chỉ chi tiết</strong></td>
                        <td style={{ padding: '8px' }}><code>Địa chỉ chi tiết</code>, <code>address</code>, <code>diachi</code></td>
                        <td style={{ padding: '8px' }}><span style={{ color: 'var(--color-error)', fontWeight: 'bold' }}>Bắt buộc</span>. Số nhà, ngõ/ngách, tên đường</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--color-divider)' }}>
                        <td style={{ padding: '8px' }}><strong>Tọa độ bản đồ</strong></td>
                        <td style={{ padding: '8px' }}><code>Tọa độ</code>, <code>coords</code>, <code>toado</code> (Hoặc tách làm 2 cột: <code>latitude</code> &amp; <code>longitude</code>)</td>
                        <td style={{ padding: '8px' }}><span style={{ color: 'var(--color-error)', fontWeight: 'bold' }}>Bắt buộc</span>. Định dạng: <code>vĩ độ, kinh độ</code> (Ví dụ: <code>21.0285, 105.7823</code>)</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--color-divider)' }}>
                        <td style={{ padding: '8px' }}><strong>Hình ảnh (URLs)</strong></td>
                        <td style={{ padding: '8px' }}><code>Hình ảnh</code>, <code>images</code>, <code>linkanh</code>, <code>anh</code></td>
                        <td style={{ padding: '8px' }}>Phân cách nhiều link bằng dấu phẩy hoặc xuống dòng.</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--color-divider)' }}>
                        <td style={{ padding: '8px' }}><strong>Tiện ích</strong></td>
                        <td style={{ padding: '8px' }}><code>Tiện ích</code>, <code>amenities</code>, <code>tiennghi</code></td>
                        <td style={{ padding: '8px' }}>Danh sách mã tiện ích viết thường phân cách bằng dấu phẩy (ví dụ: <code>dieuhoa,nonglanh,wifi,tulanh</code>)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={{ background: 'var(--bg-tertiary)', padding: 'var(--space-3)', borderRadius: 'var(--radius-subtle)', borderLeft: '4px solid var(--color-accent)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
                  <strong>Lưu ý về Dòng trống / Dữ liệu dở dang:</strong> Những hàng dữ liệu chưa điền đủ các thông tin bắt buộc (ví dụ đang nhập dở tiêu đề, địa chỉ, hoặc tọa độ) sẽ được hệ thống tự động bỏ qua trong quá trình đồng bộ mà không gửi cảnh báo lỗi về email, giúp bạn thoải mái thao tác chỉnh sửa trực tiếp trên bảng tính.
                </div>
              </div>
            </div>
          </div>
        )}


      {/* Loading Overlay for Duplicate Check */}
      {isCheckingDuplicate && (
        <div className="duplicate-check-overlay" id="duplicate-check-overlay">
          <div className="duplicate-check-spinner-card glass-strong">
            <div className="spinner"></div>
            <h4 style={{ margin: 'var(--space-2) 0 var(--space-1) 0', fontWeight: 'var(--weight-semibold)' }}>Đang phân tích tin đăng...</h4>
            <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>Đang chạy thuật toán kiểm tra trùng lặp trên nền hệ thống.</p>
          </div>
        </div>
      )}

      {/* Duplicate Report Modal */}
      {duplicateReport && (
        <div className="duplicate-modal-overlay" id="duplicate-modal-overlay">
          <div className="duplicate-modal-card glass-strong animate-fade-in" style={{ maxWidth: duplicateReport.isAdminReview ? '640px' : '520px' }}>
            <div className="duplicate-modal-header">
              <span className="warning-badge" style={{ backgroundColor: duplicateReport.isAdminReview ? 'rgba(5, 150, 105, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: duplicateReport.isAdminReview ? 'var(--color-accent)' : '#ef4444', borderColor: duplicateReport.isAdminReview ? 'rgba(5, 150, 105, 0.2)' : 'rgba(239, 68, 68, 0.2)' }}>
                {duplicateReport.isAdminReview ? 'CẦN ADMIN DUYỆT TIN' : 'PHÁT HIỆN TRÙNG LẶP'} ({duplicateReport.confidenceScore}%)
              </span>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text-main)', marginTop: 'var(--space-1)' }}>
                {duplicateReport.isAdminReview ? 'Đối Chiếu Kiểm Duyệt Tin Trùng Lặp' : 'Cảnh Báo Tin Đăng Trùng Lặp'}
              </h3>
            </div>
            
            <div className="duplicate-modal-body">
              <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.5', margin: 0 }}>
                {duplicateReport.isAdminReview 
                  ? 'Tin đăng dưới đây của người dùng đang được tạm giữ. Hãy đối chiếu thông tin so khớp tự động dưới đây để duyệt hoặc từ chối tin đăng.' 
                  : 'Tin đăng bạn vừa nhập có độ trùng lặp cao với một bài viết khác đã đăng trước đó của bạn trên hệ thống. Vui lòng kiểm tra lại để tránh spam tin đăng rác.'}
              </p>
              
              <div className="reasons-list" style={{ borderLeftColor: duplicateReport.isAdminReview ? 'var(--color-accent)' : '#ef4444' }}>
                <strong style={{ color: 'var(--color-text-main)', display: 'block', marginBottom: 'var(--space-2)' }}>Chi tiết phân tích thuật toán:</strong>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', padding: 0, margin: 0 }}>
                  {duplicateReport.reasons.map((reason, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-muted)', listStyle: 'none' }}>
                      <span style={{ color: duplicateReport.isAdminReview ? 'var(--color-accent)' : '#ef4444' }}>✓</span> {reason}
                    </li>
                  ))}
                </ul>
              </div>

              {duplicateReport.matchedProperty && (
                <div className="comparison-container" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {duplicateReport.isAdminReview && duplicateReport.pendingProperty && (
                    <div>
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-accent)' }}>1. Tin đăng mới (Đang chờ duyệt):</span>
                      <div className="comp-card" style={{ borderLeft: '3px solid var(--color-accent)' }}>
                        <img src={duplicateReport.pendingProperty.images?.[0]} alt="new room" />
                        <div className="comp-info">
                          <span className="comp-title">{duplicateReport.pendingProperty.title}</span>
                          <span className="comp-meta text-mono">{duplicateReport.pendingProperty.type} • {duplicateReport.pendingProperty.area}m² • <span className="price">{formatPrice(duplicateReport.pendingProperty.price)}</span></span>
                          <span className="comp-address">{duplicateReport.pendingProperty.address}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-muted)' }}>
                      {duplicateReport.isAdminReview ? '2. Tin đăng cũ đã tồn tại (Bài viết trùng khớp):' : 'Bài đăng gốc đã tồn tại:'}
                    </span>
                    <div className="comp-card">
                      <img src={duplicateReport.matchedProperty.images?.[0]} alt="old room" />
                      <div className="comp-info">
                        <span className="comp-title">{duplicateReport.matchedProperty.title}</span>
                        <span className="comp-meta text-mono">{duplicateReport.matchedProperty.type} • {duplicateReport.matchedProperty.area}m² • <span className="price">{formatPrice(duplicateReport.matchedProperty.price)}</span></span>
                        <span className="comp-address">{duplicateReport.matchedProperty.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="duplicate-modal-actions">
              {duplicateReport.isAdminReview ? (
                <>
                  <button 
                    type="button" 
                    className="btn btn-ghost"
                    onClick={() => {
                      if (confirm('Bạn có chắc chắn muốn TỪ CHỐI và XÓA bài đăng này?')) {
                        deleteProperty(duplicateReport.pendingProperty.id);
                        showToast('Đã từ chối và xóa bài đăng trùng lặp.');
                        setDuplicateReport(null);
                      }
                    }}
                    style={{ color: 'var(--color-error)' }}
                  >
                    Từ chối & Xóa tin
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={() => {
                      updateProperty(duplicateReport.pendingProperty.id, { status: 'active', verified: true });
                      showToast('Đã duyệt và công khai bài viết thành công!');
                      setDuplicateReport(null);
                    }}
                  >
                    Duyệt & Công khai tin
                  </button>
                </>
              ) : (
                <>
                  <button 
                    type="button" 
                    className="btn btn-ghost"
                    onClick={() => setDuplicateReport(null)}
                  >
                    Chỉnh sửa tin hiện tại
                  </button>
                  {duplicateReport.matchedProperty && (
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={() => {
                        handleEditRoomClick(duplicateReport.matchedProperty);
                        setDuplicateReport(null);
                      }}
                    >
                      Chỉnh sửa tin cũ bị trùng
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
          </>
        )}
      </main>

      <style>{`
        .dashboard-page {
          display: grid;
          grid-template-columns: var(--sidebar-width) 1fr;
          min-height: calc(100dvh - var(--header-height));
        }

        /* Sidebar */
        .dashboard-sidebar {
          position: sticky;
          top: var(--header-height);
          height: calc(100dvh - var(--header-height));
          padding: var(--space-6) var(--space-4);
          border-right: 1px solid var(--color-divider);
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
          overflow-y: auto;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: 0 var(--space-2);
        }

        .sidebar-title {
          font-size: var(--text-base);
          font-weight: var(--weight-semibold);
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-3);
          border-radius: var(--radius-subtle);
          font-size: var(--text-sm);
          font-weight: var(--weight-medium);
          color: var(--color-text-muted);
          cursor: pointer;
          transition: all var(--duration-fast) var(--ease-smooth);
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }

        .sidebar-nav-item:hover {
          color: var(--color-text-main);
          background: var(--bg-secondary);
        }

        .sidebar-nav-item.active {
          color: var(--color-accent);
          background: var(--color-accent-subtle);
        }

        .sidebar-arrow {
          margin-left: auto;
          opacity: 0.4;
        }

        /* Main */
        .dashboard-main {
          padding: var(--space-8) var(--space-8);
          overflow-y: auto;
        }

        .dashboard-page-title {
          font-size: var(--text-2xl);
          font-weight: var(--weight-bold);
          margin-bottom: var(--space-6);
        }

        .dashboard-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-6);
        }

        .dashboard-section {
          margin-top: var(--space-8);
        }

        .dashboard-section-title {
          font-size: var(--text-lg);
          font-weight: var(--weight-semibold);
          margin-bottom: var(--space-4);
        }

        .dashboard-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-16) 0;
          text-align: center;
          color: var(--color-text-muted);
        }

        /* Overview Cards */
        .overview-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-4);
        }

        .overview-card {
          padding: var(--space-5);
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-main);
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
        }

        .overview-card-info {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .overview-card-label {
          font-size: var(--text-xs);
          color: var(--color-text-muted);
        }

        .overview-card-value {
          font-size: var(--text-xl);
          font-weight: var(--weight-bold);
        }

        /* Activity */
        .activity-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
          padding: var(--space-4);
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-subtle);
        }

        .activity-info {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
          font-size: var(--text-sm);
        }

        /* Rooms Table */
        .rooms-table-wrap {
          overflow-x: auto;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-main);
        }

        .rooms-table {
          width: 100%;
          border-collapse: collapse;
          font-size: var(--text-sm);
        }

        .rooms-table th {
          text-align: left;
          padding: var(--space-3) var(--space-4);
          background: var(--bg-secondary);
          font-weight: var(--weight-semibold);
          font-size: var(--text-xs);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-muted);
          white-space: nowrap;
        }

        .rooms-table td {
          padding: var(--space-3) var(--space-4);
          border-top: 1px solid var(--color-divider);
          vertical-align: middle;
        }

        .room-cell {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .room-cell-img {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-subtle);
          object-fit: cover;
          flex-shrink: 0;
        }

        .room-cell-title {
          font-weight: var(--weight-medium);
          font-size: var(--text-sm);
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .room-actions {
          display: flex;
          gap: var(--space-1);
        }

        /* Contracts */
        .contracts-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .contract-card {
          padding: var(--space-5);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .contract-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        /* Responsive Styles (Placed at the end to guarantee correct cascade order) */
        @media (max-width: 1024px) {
          .overview-cards {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .dashboard-page {
            grid-template-columns: 1fr;
          }

          .dashboard-sidebar {
            position: static;
            height: auto;
            flex-direction: row;
            overflow-x: auto;
            padding: var(--space-3) var(--content-padding);
            border-right: none;
            border-bottom: 1px solid var(--color-divider);
            gap: var(--space-3);
            background: var(--glass-bg);
            backdrop-filter: var(--glass-blur);
          }

          .sidebar-header {
            display: none !important;
          }

          .sidebar-nav {
            display: flex;
            flex-direction: row;
            gap: var(--space-2);
            width: 100%;
            justify-content: center;
          }

          .sidebar-nav-item {
            white-space: nowrap;
            padding: var(--space-2) var(--space-4);
            border-radius: var(--radius-pill);
            font-size: var(--text-xs);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            width: auto;
            text-align: center;
          }

          .sidebar-arrow {
            display: none !important;
          }

          .dashboard-main {
            padding: var(--space-5) var(--content-padding);
          }

          .overview-cards {
            grid-template-columns: 1fr;
            gap: var(--space-3);
          }

          .rooms-table th, .rooms-table td {
            padding: var(--space-2.5) var(--space-3);
          }
        }

        .contract-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--space-4);
        }

        .contract-details {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-4);
          font-size: var(--text-sm);
          color: var(--color-text-muted);
        }

        /* Bills */
        .bills-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .bill-card {
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .bill-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .bill-details {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-3);
          font-size: var(--text-sm);
          color: var(--color-text-muted);
        }

        .bill-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: var(--space-3);
          border-top: 1px solid var(--color-divider);
        }

        .bill-mini {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3);
          background: var(--bg-secondary);
          border-radius: var(--radius-subtle);
          margin-bottom: var(--space-2);
          font-size: var(--text-sm);
        }

        /* Saved */
        .saved-grid {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .saved-item {
          display: flex;
          gap: var(--space-4);
          padding: var(--space-4);
        }

        .saved-img {
          width: 100px;
          height: 75px;
          border-radius: var(--radius-subtle);
          object-fit: cover;
          flex-shrink: 0;
        }

        .saved-info {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .saved-title {
          font-weight: var(--weight-semibold);
          font-size: var(--text-sm);
        }

        .saved-title:hover {
          color: var(--color-accent);
        }

        /* Rental */
        .rental-card {
          padding: var(--space-5);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .rental-header {
          display: flex;
          gap: var(--space-4);
          align-items: flex-start;
        }

        .rental-img {
          width: 120px;
          height: 80px;
          border-radius: var(--radius-subtle);
          object-fit: cover;
          flex-shrink: 0;
        }

        .rental-details {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-4);
          font-size: var(--text-sm);
          color: var(--color-text-muted);
        }

        .rental-bills {
          padding-top: var(--space-4);
          border-top: 1px solid var(--color-divider);
        }

        /* Tickets */
        .tickets-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .ticket-card {
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .ticket-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* Contacts / Hotline */
        .contacts-table-wrap {
          overflow-x: auto;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-main);
        }

        .hotline-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-3);
        }

        @media (max-width: 440px) {
          .hotline-grid {
            grid-template-columns: 1fr;
          }
        }

        .hotline-card {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-4);
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-subtle);
        }

        .hotline-card strong {
          font-size: var(--text-sm);
        }

        .hotline-card p {
          font-size: var(--text-sm);
          color: var(--color-text-muted);
        }

        /* Interactive Forms Specific Styling */
        .form-container {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-main);
          padding: var(--space-6);
          margin-bottom: var(--space-6);
          animation: fadeIn var(--duration-spring) var(--ease-tactile) both;
        }

        .form-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-6);
          padding-bottom: var(--space-4);
          border-bottom: 1px solid var(--color-divider);
        }

        .form-title {
          font-size: var(--text-lg);
          font-weight: var(--weight-bold);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .form-group.full-width {
          grid-column: span 2;
        }

        @media (max-width: 768px) {
          .form-group.full-width {
            grid-column: span 1;
          }
        }

        .form-label {
          font-size: var(--text-sm);
          font-weight: var(--weight-semibold);
          color: var(--color-text-main);
        }

        .amenities-checklist {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-3);
          padding: var(--space-3);
          background: var(--bg-secondary);
          border-radius: var(--radius-subtle);
        }

        @media (max-width: 600px) {
          .amenities-checklist {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 440px) {
          .amenities-checklist {
            grid-template-columns: 1fr;
          }
        }

        .amenity-checkbox-label {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-sm);
          color: var(--color-text-muted);
          cursor: pointer;
          padding: var(--space-3) var(--space-2);
          border-radius: var(--radius-subtle);
          border: 1px solid var(--color-border);
          background: var(--color-surface);
          transition: all var(--duration-fast) var(--ease-smooth);
          user-select: none;
        }

        .amenity-checkbox-label:hover {
          background: var(--bg-tertiary);
          color: var(--color-text-main);
        }

        .amenity-checkbox-label.active {
          background: var(--color-accent-subtle);
          border-color: var(--color-accent);
          color: var(--color-accent);
          font-weight: var(--weight-medium);
        }

        .form-actions-row {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: var(--space-3);
          border-top: 1px solid var(--color-divider);
          padding-top: var(--space-4);
        }

        .toast-notification {
          position: fixed;
          bottom: var(--space-6);
          right: var(--space-6);
          background: var(--color-accent);
          color: #ffffff;
          padding: var(--space-3) var(--space-5);
          border-radius: var(--radius-main);
          box-shadow: var(--shadow-lg);
          display: flex;
          align-items: center;
          gap: var(--space-3);
          z-index: var(--z-modal);
          font-weight: var(--weight-medium);
          animation: slideIn var(--duration-spring) var(--ease-tactile) both;
        }

        .toast-notification.error {
          background: #ef4444;
        }

        .bill-total-box {
          background: var(--color-accent-subtle);
          border: 1px dashed var(--color-accent);
          border-radius: var(--radius-subtle);
          padding: var(--space-4);
          text-align: center;
          margin-bottom: var(--space-6);
        }

        .bill-total-value {
          font-family: var(--font-mono);
          font-size: var(--text-2xl);
          font-weight: var(--weight-bold);
          color: var(--color-accent);
        }

        /* Duplicate Check Spinner & Modal */
        .duplicate-check-overlay,
        .duplicate-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeIn 0.3s ease both;
        }

        .duplicate-check-spinner-card {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow);
          padding: var(--space-8);
          border-radius: var(--radius-main);
          text-align: center;
          max-width: 380px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-4);
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--color-border);
          border-top-color: var(--color-accent);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .duplicate-modal-card {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow);
          padding: var(--space-6) var(--space-8);
          border-radius: var(--radius-main);
          max-width: 520px;
          width: 90%;
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }

        .duplicate-modal-header {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .warning-badge {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-pill);
          font-size: var(--text-xs);
          font-weight: var(--weight-semibold);
          width: fit-content;
        }

        .duplicate-modal-body {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          font-size: var(--text-sm);
        }

        .reasons-list {
          background: var(--bg-secondary);
          padding: var(--space-4);
          border-radius: var(--radius-subtle);
          border-left: 3px solid #ef4444;
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .reasons-list ul {
          margin: 0;
          padding-left: var(--space-4);
          list-style: none;
        }

        .reasons-list li {
          color: var(--color-text-muted);
          margin-bottom: var(--space-1);
        }

        .comparison-container {
          margin-top: var(--space-2);
        }

        .comp-card {
          display: flex;
          gap: var(--space-4);
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          padding: var(--space-3);
          border-radius: var(--radius-subtle);
          margin-top: var(--space-2);
        }

        .comp-card img {
          width: 80px;
          height: 60px;
          object-fit: cover;
          border-radius: var(--radius-subtle);
        }

        .comp-info {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
          justify-content: center;
        }

        .comp-title {
          font-weight: var(--weight-semibold);
          color: var(--color-text-main);
          font-size: var(--text-sm);
        }

        .comp-meta {
          font-size: var(--text-xs);
          color: var(--color-accent);
        }

        .comp-address {
          font-size: var(--text-xs);
          color: var(--color-text-muted);
        }

        .duplicate-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-3);
          border-top: 1px solid var(--color-divider);
          padding-top: var(--space-4);
        }

        /* Dynamic Image Upload & Preview Styling */
        .image-upload-dropzone {
          border: 2px dashed var(--color-border-strong);
          border-radius: var(--radius-main);
          padding: var(--space-6) var(--space-4);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          cursor: pointer;
          background: rgba(255, 255, 255, 0.02);
          transition: all var(--duration-normal) var(--ease-smooth);
          margin-top: var(--space-1);
        }

        .image-upload-dropzone:hover {
          border-color: var(--color-accent);
          background: var(--color-accent-subtle);
        }

        .dropzone-text {
          font-weight: var(--weight-semibold);
          color: var(--color-text-main);
          font-size: var(--text-sm);
        }

        .dropzone-hint {
          font-size: var(--text-xs);
          color: var(--color-text-muted);
          max-width: 360px;
        }

        .upload-preview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: var(--space-3);
          margin-top: var(--space-4);
        }

        .upload-preview-item {
          position: relative;
          aspect-ratio: 4 / 3;
          border-radius: var(--radius-subtle);
          overflow: hidden;
          border: 1px solid var(--color-border-strong);
          background: var(--bg-tertiary);
        }

        .upload-preview-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .upload-preview-remove {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 18px;
          height: 18px;
          background: rgba(15, 23, 42, 0.75);
          color: #ffffff;
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background var(--duration-fast);
          padding: 0;
          z-index: 2;
        }

        .upload-preview-remove:hover {
          background: #ef4444;
        }
      `}</style>
    </div>
  );
}
