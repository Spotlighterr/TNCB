import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingContact from './components/FloatingContact';
import Home from './pages/Home';
import Search from './pages/Search';
import PropertyDetail from './pages/PropertyDetail';
import Dashboard from './pages/Dashboard';
import { useApp } from './context/AppContext';

export default function App() {
  const { pathname } = useLocation();
  const { isMockMode } = useApp();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app" id="app-root">
      {isMockMode && (
        <div style={{
          backgroundColor: '#ea580c',
          color: '#ffffff',
          textAlign: 'center',
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: '600',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          zIndex: 9999,
          position: 'relative',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <span style={{ fontSize: '16px' }}>⚠️</span>
          <span>Hệ thống đang chạy ở <strong>Chế độ Giả lập (Offline Mock Mode)</strong> do không kết nối được máy chủ. Các thao tác sẽ được lưu tạm ở trình duyệt.</span>
        </div>
      )}
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      <Footer />
      <FloatingContact />
    </div>
  );
}
