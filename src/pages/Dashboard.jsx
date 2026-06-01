import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CITIES, DISTRICTS, AMENITY_MAP } from '../data/mockProperties';
import {
  House,
  ChartBar,
  FileText,
  Receipt,
  Heart,
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
  { id: 'overview', label: 'Tổng quan', icon: ChartBar },
  { id: 'rooms', label: 'Quản lý phòng', icon: House },
  { id: 'contracts', label: 'Hợp đồng', icon: FileText },
  { id: 'bills', label: 'Hóa đơn', icon: Receipt },
];

const TENANT_TABS = [
  { id: 'saved', label: 'Phòng đã lưu', icon: Heart },
  { id: 'rental', label: 'Phòng đang thuê', icon: House },
  { id: 'my-listings', label: 'Tin khách thuê của tôi', icon: FileText },
  { id: 'tickets', label: 'Yêu cầu hỗ trợ', icon: Wrench },
  { id: 'contacts', label: 'Liên hệ chủ trọ', icon: Phone },
];

export default function Dashboard() {
  const {
    properties,
    contracts,
    tickets,
    savedProperties,
    userRole,
    currentUser,
    togglePropertyStatus,
    formatPrice,
    formatPriceShort,
    getPropertyById,
    deleteProperty,
    markBillPaid,
    addProperty,
    updateProperty,
    createContract,
    addBill,
    createTicket,
  } = useApp();

  const tabs = userRole === 'landlord' ? LANDLORD_TABS : TENANT_TABS;
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

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  // Switch tabs -> Reset form states
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsAddingRoom(false);
    setEditingRoomId(null);
    setIsCreatingContract(false);
    setIsCreatingBill(false);
    setIsCreatingTicket(false);
  };

  // --- Form States ---
  const [roomForm, setRoomForm] = useState({
    title: '',
    type: 'Studio',
    price: '',
    area: '',
    city: 'Hà Nội',
    district: '',
    address: '',
    coords: [21.0285, 105.7823],
    images: '',
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
          <p className="text-caption" style={{ marginBottom: 'var(--space-6)' }}>
            Vui lòng đăng nhập tài khoản của bạn để truy cập trang điều hành hệ thống.
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-subtle)', background: 'var(--bg-secondary)', padding: 'var(--space-3)', borderRadius: 'var(--radius-subtle)' }}>
            Gợi ý: Bạn có thể nhấn nút <strong>"Đăng nhập"</strong> ở thanh menu phía trên và chọn tài khoản test nhanh để trải nghiệm ngay lập tức.
          </p>
        </div>
      </div>
    );
  }

  // --- Filter listings by logged in user ---
  // Landlords can manage all their mock properties (with user-landlord id or default mocks)
  const landlordProperties = properties.filter(
    (p) => p.postedBy === currentUser.id || p.postedBy === 'user-landlord'
  );

  // Tenants can manage properties they posted (postType is roommate)
  const tenantProperties = properties.filter((p) => p.postedBy === currentUser.id);

  // --- Form Trigger Handlers ---

  // Room Form triggers
  const handleAddRoomClick = () => {
    setRoomForm({
      title: '',
      type: 'Studio',
      price: '',
      area: '',
      city: 'Hà Nội',
      district: DISTRICTS['Hà Nội'][0],
      address: '',
      coords: [21.0285, 105.7823],
      images: `https://picsum.photos/seed/prop-${Date.now()}/800/600`,
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
      address: room.address,
      coords: room.coords,
      images: room.images.join(', '),
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
    const defaultCoords =
      cityVal === 'Hà Nội' ? [21.0285, 105.7823] : [10.8016, 106.7118];

    setRoomForm((prev) => ({
      ...prev,
      city: cityVal,
      district: defaultDistrict,
      coords: defaultCoords,
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
    if (!roomForm.title || !roomForm.price || !roomForm.area) {
      alert('Vui lòng điền các thông tin bắt buộc.');
      return;
    }

    const parsedImages = roomForm.images
      ? roomForm.images.split(',').map((img) => img.trim()).filter(Boolean)
      : [`https://picsum.photos/seed/prop-${Date.now()}/800/600`];

    const data = {
      ...roomForm,
      price: Number(roomForm.price),
      area: Number(roomForm.area),
      electricity: Number(roomForm.electricity),
      water: Number(roomForm.water),
      service: Number(roomForm.service),
      images: parsedImages,
    };

    if (editingRoomId) {
      updateProperty(editingRoomId, data);
      showToast('Cập nhật thông tin thành công!');
      setEditingRoomId(null);
    } else {
      addProperty(data);
      showToast(currentUser.role === 'tenant' ? 'Đăng tin khách thuê thành công!' : 'Thêm phòng trọ mới thành công!');
      setIsAddingRoom(false);
    }
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

  // --- Landlord Computations ---
  const totalRevenue = contracts
    .filter((c) => c.status === 'active')
    .reduce((sum, c) => sum + c.monthlyRent, 0);
  const rentedCount = properties.filter((p) => p.isRented).length;
  const vacantCount = properties.filter((p) => !p.isRented).length;
  const unpaidBills = contracts
    .flatMap((c) => c.bills)
    .filter((b) => !b.paid);
  const totalUnpaid = unpaidBills.reduce((sum, b) => sum + b.total, 0);

  // --- Tenant Computations ---
  const savedProps = properties.filter((p) => savedProperties.includes(p.id));

  return (
    <div className="dashboard-page" id="dashboard-page">
      {/* Toast Notification */}
      {toast && (
        <div className="toast-notification" id="dashboard-toast">
          <CheckCircle size={20} weight="fill" />
          <span>{toast}</span>
        </div>
      )}

      {/* Sidebar */}
      <aside className="dashboard-sidebar glass" id="dashboard-sidebar">
        <div className="sidebar-header">
          <Buildings size={24} weight="duotone" color="var(--color-accent)" />
          <span className="sidebar-title">
            {userRole === 'landlord' ? 'Chủ trọ / AMS' : 'Khách thuê'}
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
            
            <div className="overview-cards">
              {Array.from({ length: 4 }).map((_, i) => (
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
                      <option value="Studio">Studio</option>
                      <option value="Duplex">Duplex</option>
                      <option value="Chung cư mini">Chung cư mini</option>
                      <option value="Phòng trọ">Phòng trọ</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {currentUser.role === 'tenant' ? 'Tiền phòng chia sẻ (VND/tháng) *' : 'Giá thuê phòng (VND/tháng) *'}
                    </label>
                    <input
                      type="number"
                      className="input text-mono"
                      required
                      placeholder="Nhập giá, VD: 4500000"
                      value={roomForm.price}
                      onChange={(e) => setRoomForm({ ...roomForm, price: e.target.value })}
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
                      onChange={(e) => setRoomForm({ ...roomForm, district: e.target.value })}
                    >
                      {DISTRICTS[roomForm.city]?.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Địa chỉ chính xác</label>
                    <input
                      className="input"
                      placeholder="Ví dụ: 91 Chùa Láng, Láng Thượng"
                      value={roomForm.address}
                      onChange={(e) => setRoomForm({ ...roomForm, address: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tọa độ GPS (Vĩ độ, Kinh độ)</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="number"
                        step="0.000001"
                        className="input text-mono"
                        placeholder="Lat"
                        value={roomForm.coords[0]}
                        onChange={(e) =>
                          setRoomForm({
                            ...roomForm,
                            coords: [Number(e.target.value), roomForm.coords[1]],
                          })
                        }
                      />
                      <input
                        type="number"
                        step="0.000001"
                        className="input text-mono"
                        placeholder="Lng"
                        value={roomForm.coords[1]}
                        onChange={(e) =>
                          setRoomForm({
                            ...roomForm,
                            coords: [roomForm.coords[0], Number(e.target.value)],
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Hình ảnh minh họa (Đường dẫn ảnh, ngăn cách bởi dấu phẩy)</label>
                    <input
                      className="input text-mono"
                      placeholder="URL 1, URL 2..."
                      value={roomForm.images}
                      onChange={(e) => setRoomForm({ ...roomForm, images: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Đơn giá điện (VND/kWh)</label>
                    <input
                      type="number"
                      className="input text-mono"
                      value={roomForm.electricity}
                      onChange={(e) => setRoomForm({ ...roomForm, electricity: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Đơn giá nước (VND/người)</label>
                    <input
                      type="number"
                      className="input text-mono"
                      value={roomForm.water}
                      onChange={(e) => setRoomForm({ ...roomForm, water: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phí dịch vụ cố định (VND/phòng)</label>
                    <input
                      type="number"
                      className="input text-mono"
                      value={roomForm.service}
                      onChange={(e) => setRoomForm({ ...roomForm, service: e.target.value })}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Mô tả phòng / Yêu cầu tìm khách thuê</label>
                    <textarea
                      className="input"
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

        {/* 1. Overview */}
        {userRole === 'landlord' && activeTab === 'overview' && !isAddingRoom && !editingRoomId && (
          <div className="animate-fade-in">
            <h2 className="dashboard-page-title">Tổng quan doanh thu</h2>
            <div className="overview-cards">
              <div className="overview-card">
                <CurrencyDollar size={24} color="var(--color-accent)" />
                <div className="overview-card-info">
                  <span className="overview-card-label">Doanh thu dự kiến</span>
                  <span className="overview-card-value price text-mono">{formatPriceShort(totalRevenue)}</span>
                </div>
              </div>
              <div className="overview-card">
                <House size={24} color="var(--color-info)" />
                <div className="overview-card-info">
                  <span className="overview-card-label">Phòng trống</span>
                  <span className="overview-card-value text-mono">{vacantCount}</span>
                </div>
              </div>
              <div className="overview-card">
                <SealCheck size={24} color="var(--color-success)" />
                <div className="overview-card-info">
                  <span className="overview-card-label">Đang thuê</span>
                  <span className="overview-card-value text-mono">{rentedCount}</span>
                </div>
              </div>
              <div className="overview-card">
                <Receipt size={24} color="var(--color-warning)" />
                <div className="overview-card-info">
                  <span className="overview-card-label">Tiền nợ</span>
                  <span className="overview-card-value text-mono" style={{ color: 'var(--color-warning)' }}>
                    {formatPriceShort(totalUnpaid)}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="dashboard-section">
              <h3 className="dashboard-section-title">Hoạt động hợp đồng gần đây</h3>
              <div className="activity-list">
                {contracts
                  .filter((c) => c.status === 'active')
                  .slice(0, 3)
                  .map((c) => {
                    const prop = getPropertyById(c.propertyId);
                    return (
                      <div key={c.id} className="activity-item">
                        <div className="badge badge-available">Đang thuê</div>
                        <div className="activity-info">
                          <strong>{prop?.title || 'Phòng trọ'}</strong>
                          <span className="text-caption">
                            Khách: {c.tenantName} | HĐ: {c.startDate} - {c.endDate}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* 2. Room Management (Landlord view) */}
        {userRole === 'landlord' && activeTab === 'rooms' && !isAddingRoom && !editingRoomId && (
          <div className="animate-fade-in">
            <div className="dashboard-page-header">
              <h2 className="dashboard-page-title">Quản lý phòng trọ của tôi</h2>
              <button
                className="btn btn-primary animate-scale-in"
                onClick={handleAddRoomClick}
                id="add-room-btn"
              >
                <Plus size={18} />
                Thêm phòng
              </button>
            </div>

            <div className="rooms-table-wrap">
              <table className="rooms-table">
                <thead>
                  <tr>
                    <th>Phòng</th>
                    <th>Quận</th>
                    <th>Giá</th>
                    <th>Diện tích</th>
                    <th>Trạng thái</th>
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
                      <td><span className="text-mono price">{formatPriceShort(p.price)}</span></td>
                      <td><span className="text-mono">{p.area} m&sup2;</span></td>
                      <td>
                        <div
                          className={`switch ${p.isRented ? 'active' : ''}`}
                          onClick={() => togglePropertyStatus(p.id)}
                          title={p.isRented ? 'Đang thuê' : 'Trống'}
                          id={`switch-${p.id}`}
                        />
                      </td>
                      <td>
                        <div className="room-actions">
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
        )}

        {/* 3. Contracts */}
        {userRole === 'landlord' && activeTab === 'contracts' && !isCreatingContract && (
          <div className="animate-fade-in">
            <div className="dashboard-page-header">
              <h2 className="dashboard-page-title">Hợp đồng thuê nhà</h2>
              <button className="btn btn-primary" onClick={handleAddContractClick}>
                <Plus size={18} />
                Tạo hợp đồng
              </button>
            </div>

            <div className="contracts-list">
              {contracts.map((c) => {
                const prop = getPropertyById(c.propertyId);
                return (
                  <div key={c.id} className="contract-card card-elevated">
                    <div className="contract-header">
                      <div>
                        <h4>{prop?.title || 'Phòng trọ'}</h4>
                        <p className="text-caption">Khách thuê: {c.tenantName} | SĐT: {c.tenantPhone}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className={`badge ${c.status === 'active' ? 'badge-available' : 'badge-rented'}`}>
                          {c.status === 'active' ? 'Đang hoạt động' : 'Hết hạn'}
                        </span>
                        {c.status === 'active' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleAddBillClick(c.id)}
                          >
                            <Receipt size={14} />
                            Tạo HĐơn
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="contract-details">
                      <span>Ngày bắt đầu: <strong>{c.startDate}</strong></span>
                      <span>Ngày kết thúc: <strong>{c.endDate}</strong></span>
                      <span>Giá thuê: <strong className="price">{formatPrice(c.monthlyRent)}</strong></span>
                      <span>Đặt cọc: <strong className="text-mono">{c.deposit.toLocaleString()} VND</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {userRole === 'landlord' && activeTab === 'contracts' && isCreatingContract && (
          <div className="form-container animate-fade-in">
            <div className="form-header">
              <h3 className="form-title">Tạo hợp đồng thuê mới</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setIsCreatingContract(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleContractSubmit} id="contract-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label">Chọn phòng trọ trống *</label>
                  <select
                    className="select"
                    required
                    value={contractForm.propertyId}
                    onChange={(e) => handleContractRoomChange(e.target.value)}
                  >
                    <option value="">-- Chọn phòng trống --</option>
                    {properties
                      .filter((p) => !p.isRented || p.id === contractForm.propertyId)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          [{p.type}] {p.title} ({p.district}) - {p.price.toLocaleString()}đ
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Họ và tên khách thuê *</label>
                  <input
                    className="input"
                    required
                    placeholder="Nguyễn Văn A"
                    value={contractForm.tenantName}
                    onChange={(e) => setContractForm({ ...contractForm, tenantName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Số điện thoại khách thuê *</label>
                  <input
                    className="input text-mono"
                    required
                    placeholder="09XXXXXXXX"
                    value={contractForm.tenantPhone}
                    onChange={(e) => setContractForm({ ...contractForm, tenantPhone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ngày bắt đầu hợp đồng *</label>
                  <input
                    type="date"
                    className="input text-mono"
                    required
                    value={contractForm.startDate}
                    onChange={(e) => setContractForm({ ...contractForm, startDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ngày kết thúc hợp đồng *</label>
                  <input
                    type="date"
                    className="input text-mono"
                    required
                    value={contractForm.endDate}
                    onChange={(e) => setContractForm({ ...contractForm, endDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tiền thuê thỏa thuận (VND/tháng) *</label>
                  <input
                    type="number"
                    className="input text-mono"
                    required
                    value={contractForm.monthlyRent}
                    onChange={(e) => setContractForm({ ...contractForm, monthlyRent: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tiền đặt cọc đặt trước (VND) *</label>
                  <input
                    type="number"
                    className="input text-mono"
                    required
                    value={contractForm.deposit}
                    onChange={(e) => setContractForm({ ...contractForm, deposit: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-actions-row">
                <button type="button" className="btn btn-ghost" onClick={() => setIsCreatingContract(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary">
                  Tạo hợp đồng
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 4. Bills */}
        {userRole === 'landlord' && activeTab === 'bills' && !isCreatingBill && (
          <div className="animate-fade-in">
            <div className="dashboard-page-header">
              <h2 className="dashboard-page-title">Hóa đơn điện nước hàng tháng</h2>
              <button className="btn btn-primary" onClick={() => handleAddBillClick()}>
                <Plus size={18} />
                Tạo hóa đơn
              </button>
            </div>

            {contracts.map((c) => {
              const prop = getPropertyById(c.propertyId);
              return (
                <div key={c.id} className="dashboard-section" style={{ marginTop: '0', marginBottom: 'var(--space-6)' }}>
                  <h3 className="dashboard-section-title" style={{ fontSize: 'var(--text-base)', borderLeft: '3px solid var(--color-accent)', paddingLeft: '8px' }}>
                    {prop?.title || c.id} ({c.tenantName})
                  </h3>
                  <div className="bills-list">
                    {c.bills.map((b) => (
                      <div key={b.id} className="bill-card card">
                        <div className="bill-header">
                          <span className="text-mono" style={{ fontWeight: 600 }}>Tháng {b.month}</span>
                          <span className={`badge ${b.paid ? 'badge-available' : 'badge-rented'}`}>
                            {b.paid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                          </span>
                        </div>
                        <div className="bill-details">
                          <span>Điện: {b.electricityUsage} kWh x {b.electricityRate.toLocaleString()} = <strong>{(b.electricityUsage * b.electricityRate).toLocaleString()}đ</strong></span>
                          <span>Nước: {b.waterUsage} ng x {b.waterRate.toLocaleString()} = <strong>{(b.waterUsage * b.waterRate).toLocaleString()}đ</strong></span>
                          <span>Dịch vụ: <strong>{b.serviceCharge.toLocaleString()}đ</strong></span>
                          <span>Tiền phòng: <strong>{b.rent.toLocaleString()}đ</strong></span>
                        </div>
                        <div className="bill-footer">
                          <span className="price text-mono" style={{ fontSize: 'var(--text-lg)' }}>
                            Tổng: {b.total.toLocaleString()} VND
                          </span>
                          {!b.paid && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                markBillPaid(c.id, b.id);
                                showToast('Hóa đơn đã đóng thành công!');
                              }}
                            >
                              Đánh dấu đã thu
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {userRole === 'landlord' && activeTab === 'bills' && isCreatingBill && (
          <div className="form-container animate-fade-in">
            <div className="form-header">
              <h3 className="form-title">Tạo hóa đơn tháng mới</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setIsCreatingBill(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBillSubmit} id="bill-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label">Chọn Hợp đồng / Phòng thuê *</label>
                  <select
                    className="select"
                    required
                    value={billForm.contractId}
                    onChange={(e) => handleBillContractChange(e.target.value)}
                  >
                    <option value="">-- Chọn hợp đồng --</option>
                    {contracts.filter((c) => c.status === 'active').map((c) => {
                      const prop = getPropertyById(c.propertyId);
                      return (
                        <option key={c.id} value={c.id}>
                          [{c.tenantName}] - {prop?.title || 'Phòng'}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Hóa đơn cho tháng *</label>
                  <input
                    type="month"
                    className="input text-mono"
                    required
                    value={billForm.month}
                    onChange={(e) => setBillForm({ ...billForm, month: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Số điện tiêu thụ (kWh) *</label>
                  <input
                    type="number"
                    className="input text-mono"
                    required
                    value={billForm.electricityUsage}
                    onChange={(e) => setBillForm({ ...billForm, electricityUsage: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Đơn giá điện (VND/kWh)</label>
                  <input
                    type="number"
                    className="input text-mono"
                    value={billForm.electricityRate}
                    onChange={(e) => setBillForm({ ...billForm, electricityRate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Số người dùng nước *</label>
                  <input
                    type="number"
                    className="input text-mono"
                    required
                    value={billForm.waterUsage}
                    onChange={(e) => setBillForm({ ...billForm, waterUsage: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Đơn giá nước (VND/người)</label>
                  <input
                    type="number"
                    className="input text-mono"
                    value={billForm.waterRate}
                    onChange={(e) => setBillForm({ ...billForm, waterRate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phí dịch vụ cố định (VND)</label>
                  <input
                    type="number"
                    className="input text-mono"
                    value={billForm.serviceCharge}
                    onChange={(e) => setBillForm({ ...billForm, serviceCharge: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tiền phòng (VND)</label>
                  <input
                    type="number"
                    className="input text-mono"
                    value={billForm.rent}
                    onChange={(e) => setBillForm({ ...billForm, rent: e.target.value })}
                  />
                </div>
              </div>

              {/* Calculated Dynamic Total Box */}
              <div className="bill-total-box animate-scale-in">
                <span className="form-label" style={{ display: 'block', marginBottom: '4px' }}>Tổng số tiền dự kiến</span>
                <span className="bill-total-value">{calculatedBillTotal.toLocaleString('vi-VN')} VND</span>
              </div>

              <div className="form-actions-row">
                <button type="button" className="btn btn-ghost" onClick={() => setIsCreatingBill(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Tạo hóa đơn
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ===================== TENANT ONLY VIEWS ===================== */}

        {/* 1. Saved Properties */}
        {userRole === 'tenant' && activeTab === 'saved' && (
          <div className="animate-fade-in">
            <h2 className="dashboard-page-title">Phòng trọ đã lưu yêu thích ({savedProps.length})</h2>
            {savedProps.length > 0 ? (
              <div className="saved-grid">
                {savedProps.map((prop) => (
                  <div key={prop.id} className="saved-item card-elevated animate-fade-in-up">
                    <img src={prop.images[0]} alt="" className="saved-img" />
                    <div className="saved-info">
                      <Link to={`/property/${prop.id}`} className="saved-title">{prop.title}</Link>
                      <p className="text-caption">{prop.district}, {prop.city}</p>
                      <span className="price">{formatPriceShort(prop.price)}/th</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dashboard-empty">
                <Heart size={48} color="var(--color-text-subtle)" />
                <p>Chưa có phòng nào được lưu yêu thích</p>
                <Link to="/search" className="btn btn-primary">Tìm phòng trọ ngay</Link>
              </div>
            )}
          </div>
        )}

        {/* 2. My Rental */}
        {userRole === 'tenant' && activeTab === 'rental' && (
          <div className="animate-fade-in">
            <h2 className="dashboard-page-title">Thông tin phòng đang thuê</h2>
            {contracts.filter((c) => c.status === 'active').length > 0 ? (
              contracts.filter((c) => c.status === 'active').map((c) => {
                const prop = getPropertyById(c.propertyId);
                return (
                  <div key={c.id} className="rental-card card-elevated animate-scale-in">
                    <div className="rental-header">
                      <img src={prop?.images[0]} alt="" className="rental-img" />
                      <div>
                        <h3>{prop?.title}</h3>
                        <p className="text-caption">{prop?.address}</p>
                        <span className="badge badge-available">Đang thuê</span>
                      </div>
                    </div>
                    <div className="rental-details">
                      <span>Hợp đồng: {c.startDate} - {c.endDate}</span>
                      <span>Giá thuê: <strong className="price">{formatPrice(c.monthlyRent)}</strong></span>
                    </div>
                    <div className="rental-bills">
                      <h4 style={{ marginBottom: 'var(--space-3)' }}>Lịch sử hóa đơn</h4>
                      {c.bills.map((b) => (
                        <div key={b.id} className="bill-mini">
                          <span className="text-mono">{b.month}</span>
                          <span className="text-mono">{b.total.toLocaleString()} VND</span>
                          <span className={`badge ${b.paid ? 'badge-available' : 'badge-rented'}`}>
                            {b.paid ? 'Đã đóng' : 'Chưa đóng'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="dashboard-empty">
                <House size={48} color="var(--color-text-subtle)" />
                <p>Chưa có thông tin phòng đang thuê hiện tại</p>
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
                        <td><span className="text-mono price">{formatPriceShort(p.price)}</span></td>
                        <td><span className="text-mono">{p.area} m&sup2;</span></td>
                        <td>
                          <span className={`badge ${p.isRented ? 'badge-rented' : 'badge-available'}`}>
                            {p.isRented ? 'Đã tìm được' : 'Đang tìm'}
                          </span>
                        </td>
                        <td>
                          <div className="room-actions">
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

        {/* 4. Support Tickets (Tenant view) */}
        {userRole === 'tenant' && activeTab === 'tickets' && !isCreatingTicket && (
          <div className="animate-fade-in">
            <div className="dashboard-page-header">
              <h2 className="dashboard-page-title">Yêu cầu hỗ trợ kỹ thuật</h2>
              <button className="btn btn-primary" onClick={handleAddTicketClick}>
                <Plus size={18} />
                Gửi yêu cầu mới
              </button>
            </div>

            <div className="tickets-list">
              {tickets.map((t) => {
                const prop = getPropertyById(t.propertyId);
                return (
                  <div key={t.id} className="ticket-card card-elevated animate-fade-in-up">
                    <div className="ticket-header">
                      <h4>{t.title}</h4>
                      <span
                        className={`badge ${
                          t.status === 'resolved'
                            ? 'badge-available'
                            : t.status === 'processing'
                            ? 'badge-rented'
                            : 'badge-status'
                        }`}
                      >
                        {t.status === 'resolved'
                          ? 'Đã xử lý'
                          : t.status === 'processing'
                          ? 'Đang xử lý'
                          : 'Chờ xử lý'}
                      </span>
                    </div>
                    <p className="text-caption">{t.description}</p>
                    <p className="text-caption" style={{ fontSize: '11px' }}>
                      Phòng: {prop?.title} | Ngày tạo: {t.createdAt}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {userRole === 'tenant' && activeTab === 'tickets' && isCreatingTicket && (
          <div className="form-container animate-fade-in">
            <div className="form-header">
              <h3 className="form-title">Gửi yêu cầu hỗ trợ kỹ thuật</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setIsCreatingTicket(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleTicketSubmit} id="ticket-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label">Chọn Hợp đồng / Phòng cần hỗ trợ *</label>
                  <select
                    className="select"
                    required
                    value={ticketForm.contractId}
                    onChange={(e) => setTicketForm({ ...ticketForm, contractId: e.target.value })}
                  >
                    {contracts.filter((c) => c.status === 'active').map((c) => {
                      const prop = getPropertyById(c.propertyId);
                      return (
                        <option key={c.id} value={c.id}>
                          {prop?.title || 'Phòng thuê'}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Tiêu đề sự cố *</label>
                  <input
                    className="input"
                    required
                    placeholder="Ví dụ: Điều hòa không lạnh, Rò rỉ nước nhà tắm..."
                    value={ticketForm.title}
                    onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Mô tả sự cố chi tiết *</label>
                  <textarea
                    className="input"
                    required
                    rows={4}
                    placeholder="Vui lòng mô tả chi tiết sự cố kỹ thuật để chủ trọ nắm thông tin..."
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              <div className="form-actions-row">
                <button type="button" className="btn btn-ghost" onClick={() => setIsCreatingTicket(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary">
                  Gửi yêu cầu
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 5. Landlord Contacts */}
        {userRole === 'tenant' && activeTab === 'contacts' && (
          <div className="animate-fade-in">
            <h2 className="dashboard-page-title">Danh bạ liên hệ chủ trọ</h2>
            <div className="contacts-table-wrap animate-scale-in">
              <table className="rooms-table">
                <thead>
                  <tr>
                    <th>Chủ trọ</th>
                    <th>Phòng</th>
                    <th>Hotline</th>
                    <th>Liên hệ</th>
                  </tr>
                </thead>
                <tbody>
                  {[...new Map(properties.map((p) => [p.owner.phone, p])).values()].map((p) => (
                    <tr key={p.owner.phone}>
                      <td>
                        <div className="room-cell">
                          <img src={p.owner.avatar} alt="" className="room-cell-img" style={{ borderRadius: '50%' }} />
                          <strong>{p.owner.name}</strong>
                        </div>
                      </td>
                      <td className="text-caption">{p.title}</td>
                      <td><span className="text-mono">{p.owner.phone}</span></td>
                      <td>
                        <div className="room-actions">
                          <a href={`tel:${p.owner.phone}`} className="btn btn-primary btn-sm">
                            <Phone size={14} />
                          </a>
                          <a
                            href={`https://zalo.me/${p.owner.zalo || p.owner.phone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary btn-sm"
                          >
                            <ChatCircleText size={14} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Emergency Hotline */}
            <div className="dashboard-section" style={{ marginTop: 'var(--space-8)' }}>
              <h3 className="dashboard-section-title">Thông tin liên hệ liên lạc hỗ trợ</h3>
              <div className="hotline-grid">
                <div className="hotline-card">
                  <Phone size={20} color="var(--color-accent)" />
                  <div>
                    <strong>Hotline Tìm Nhà Cùng Bạn</strong>
                    <p className="text-mono">034 629 7668</p>
                  </div>
                </div>
                <div className="hotline-card">
                  <EnvelopeSimple size={20} color="var(--color-info)" />
                  <div>
                    <strong>Email hỗ trợ</strong>
                    <p className="text-mono">tncb.findx@gmail.com</p>
                  </div>
                </div>
                <div className="hotline-card">
                  <FacebookLogo size={20} color="#1877f2" />
                  <div>
                    <strong>Facebook Page</strong>
                    <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-mono" style={{ color: 'var(--color-accent)', textDecoration: 'underline', fontWeight: '500' }}>FindX - Tìm Nhà Cùng Bạn</a>
                  </div>
                </div>
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

        @media (max-width: 768px) {
          .dashboard-page {
            grid-template-columns: 1fr;
          }
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

        @media (max-width: 768px) {
          .dashboard-sidebar {
            position: static;
            height: auto;
            flex-direction: row;
            overflow-x: auto;
            padding: var(--space-3) var(--content-padding);
            border-right: none;
            border-bottom: 1px solid var(--color-divider);
            gap: var(--space-3);
          }

          .sidebar-header {
            display: none;
          }

          .sidebar-nav {
            display: flex;
            flex-direction: row;
            gap: var(--space-2) !important;
          }

          .sidebar-nav-item {
            white-space: nowrap;
            padding: var(--space-2) var(--space-3) !important;
          }

          .sidebar-arrow {
            display: none;
          }
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

        @media (max-width: 768px) {
          .dashboard-main {
            padding: var(--space-5) var(--content-padding);
          }
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

        @media (max-width: 1024px) {
          .overview-cards {
            grid-template-columns: repeat(2, 1fr);
          }
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
      `}</style>
    </div>
  );
}
