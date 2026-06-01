import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mockProperties } from '../data/mockProperties';
import { mockContracts, mockTickets } from '../data/mockContracts';

const AppContext = createContext(null);

function loadFromStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

export function AppProvider({ children }) {
  // Core State
  const [properties, setProperties] = useState(() =>
    loadFromStorage('TNCB_PROPERTIES', mockProperties)
  );
  const [contracts, setContracts] = useState(() =>
    loadFromStorage('TNCB_CONTRACTS', mockContracts)
  );
  const [tickets, setTickets] = useState(() =>
    loadFromStorage('TNCB_TICKETS', mockTickets)
  );
  const [savedProperties, setSavedProperties] = useState(() =>
    loadFromStorage('TNCB_SAVED', [])
  );
  const [userRole, setUserRole] = useState(() =>
    loadFromStorage('TNCB_ROLE', 'tenant')
  );
  const [users, setUsers] = useState(() =>
    loadFromStorage('TNCB_USERS', [
      { id: 'user-admin', email: 'admin@tncb.vn', name: 'Quản Trị Viên TNCB', role: 'landlord', avatar: 'https://picsum.photos/seed/owner-admin/100/100', phone: '0869333366', password: 'admin' },
      { id: 'user-tenant', email: 'tenant@tncb.vn', name: 'Nguyễn Minh Anh', role: 'tenant', avatar: 'https://picsum.photos/seed/owner-1/100/100', phone: '0987654321', password: '123' },
      { id: 'user-landlord', email: 'landlord@tncb.vn', name: 'Nguyễn Văn Đạt', role: 'landlord', avatar: 'https://picsum.photos/seed/owner-dat/100/100', phone: '0869333366', password: '123' }
    ])
  );
  const [currentUser, setCurrentUser] = useState(() =>
    loadFromStorage('TNCB_CURRENT_USER', null)
  );

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('TNCB_PROPERTIES', JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem('TNCB_CONTRACTS', JSON.stringify(contracts));
  }, [contracts]);

  useEffect(() => {
    localStorage.setItem('TNCB_TICKETS', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('TNCB_SAVED', JSON.stringify(savedProperties));
  }, [savedProperties]);

  useEffect(() => {
    localStorage.setItem('TNCB_ROLE', JSON.stringify(userRole));
  }, [userRole]);

  useEffect(() => {
    localStorage.setItem('TNCB_USERS', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('TNCB_CURRENT_USER', JSON.stringify(currentUser));
    if (currentUser) {
      setUserRole(currentUser.role);
    }
  }, [currentUser]);

  useEffect(() => {
    const hasAdmin = users.some((u) => u.email === 'admin@tncb.vn');
    if (!hasAdmin) {
      const adminUser = {
        id: 'user-admin',
        email: 'admin@tncb.vn',
        name: 'Quản Trị Viên TNCB',
        role: 'landlord',
        avatar: 'https://picsum.photos/seed/owner-admin/100/100',
        phone: '0869333366',
        password: 'admin',
      };
      setUsers((prev) => [adminUser, ...prev]);
    }
  }, []);

  // --- Auth Actions ---
  const login = useCallback((email, password) => {
    const user = users.find((u) => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      return { success: true, user };
    }
    return { success: false, message: 'Email hoặc mật khẩu không chính xác.' };
  }, [users]);

  const register = useCallback((name, email, phone, password, role) => {
    if (users.some((u) => u.email === email)) {
      return { success: false, message: 'Email này đã được sử dụng.' };
    }
    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      phone,
      password,
      role,
      avatar: `https://picsum.photos/seed/user-${Date.now()}/100/100`,
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true, user: newUser };
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setUserRole('tenant');
  }, []);

  // --- Property Actions ---
  const addProperty = useCallback((property) => {
    const newProp = {
      ...property,
      id: `prop-${Date.now()}`,
      verified: false,
      postType: currentUser ? (currentUser.role === 'tenant' ? 'find_roommate' : 'find_tenant') : 'find_tenant',
      postedBy: currentUser ? currentUser.id : 'user-landlord',
      owner: currentUser ? {
        name: currentUser.name,
        phone: currentUser.phone,
        avatar: currentUser.avatar,
        zalo: currentUser.phone,
      } : {
        name: 'Nguyễn Văn Đạt',
        phone: '0869333366',
        avatar: 'https://picsum.photos/seed/owner-dat/100/100',
        zalo: '0869333366',
      }
    };
    setProperties((prev) => [...prev, newProp]);
    return newProp;
  }, [currentUser]);

  const calculatePropertyRating = useCallback((p) => {
    let score = 0;
    if (p.price > 0) score += 1;
    if (p.electricity > 0 && p.water > 0) score += 1;
    if (p.images && p.images.length >= 3 && p.description && p.description.length > 20) score += 1;
    if (p.amenities && p.amenities.length >= 5) score += 1;
    if (p.verified) score += 1;
    return Math.max(1, score);
  }, []);

  const updateProperty = useCallback((id, updates) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  const deleteProperty = useCallback((id) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const togglePropertyStatus = useCallback((id) => {
    setProperties((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, isRented: !p.isRented } : p
      )
    );
  }, []);

  // --- Saved Properties ---
  const toggleSaveProperty = useCallback((propertyId) => {
    setSavedProperties((prev) =>
      prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId]
    );
  }, []);

  const isPropertySaved = useCallback(
    (propertyId) => savedProperties.includes(propertyId),
    [savedProperties]
  );

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
  const createTicket = useCallback((ticket) => {
    const newTicket = {
      ...ticket,
      id: `ticket-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setTickets((prev) => [...prev, newTicket]);
    return newTicket;
  }, []);

  const updateTicketStatus = useCallback((ticketId, status) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, status, updatedAt: new Date().toISOString().split('T')[0] }
          : t
      )
    );
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
    () => properties.filter((p) => !p.isRented),
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
    savedProperties,
    userRole,
    users,
    currentUser,
    // Setters
    setUserRole,
    // Property actions
    addProperty,
    updateProperty,
    deleteProperty,
    togglePropertyStatus,
    // Saved
    toggleSaveProperty,
    isPropertySaved,
    // Contracts
    createContract,
    addBill,
    markBillPaid,
    // Tickets
    createTicket,
    updateTicketStatus,
    // Auth
    login,
    register,
    logout,
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
