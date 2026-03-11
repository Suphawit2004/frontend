import { useState } from 'react';
import { Routes, Route } from 'react-router-dom'; // 💡 นำเข้าเครื่องมือจัดการเส้นทาง
import { AuthProvider } from './contexts/AuthContext';
import { Navigation } from './components/Navigation';
import { AuthModal } from './components/AuthModal';
import { HomePage } from './pages/HomePage';
import { PlacesPage } from './pages/PlacesPage';
import { PlaceDetailPage } from './pages/PlaceDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';

// 💡 1. นำเข้า ProtectedRoute และ AdminMediaPage ที่เราสร้างไว้
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminMediaPage } from './pages/AdminMediaPage';

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAuthRequired = () => {
    setShowAuthModal(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navigation
          onSearch={handleSearch}
          onAuthClick={() => setShowAuthModal(true)}
        />
        
        <Routes>
          {/* 🟢 หน้าทั่วไป (ใครก็เข้าดูได้) */}
          <Route path="/" element={
            <HomePage 
              onAuthRequired={handleAuthRequired} 
              searchQuery={searchQuery}
            />
          } />
          
          <Route path="/places" element={
            <PlacesPage 
              category="all" 
              onAuthRequired={handleAuthRequired} 
              searchQuery={searchQuery}
            />
          } />

          <Route path="/nature" element={
            <PlacesPage 
              category="nature" 
              onAuthRequired={handleAuthRequired} 
              searchQuery={searchQuery}
            />
          } />

          <Route path="/cafe" element={
            <PlacesPage 
              category="cafe" 
              onAuthRequired={handleAuthRequired} 
              searchQuery={searchQuery}
            />
          } />

          <Route path="/place/:id" element={
            <PlaceDetailPage onBack={() => window.history.back()} />
          } />

          {/* 🟡 หน้าโปรไฟล์ (ถ้าอยากให้กันหลุดด้วย สามารถเอา <ProtectedRoute> มาครอบได้นะครับ แต่ตอนนี้คงเดิมไว้ก่อน) */}
          <Route path="/profile" element={
            <ProfilePage onAuthRequired={handleAuthRequired} />
          } />

          {/* 🔴 หน้าสำหรับ Admin (ใส่ยาม ProtectedRoute มาเฝ้าไว้แล้ว!) */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminPage onAuthRequired={handleAuthRequired} />
              </ProtectedRoute>
            } 
          />

          {/* 🔴 หน้าคลังสื่อสำหรับ Admin */}
          <Route 
            path="/admin/media" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminMediaPage />
              </ProtectedRoute>
            } 
          />
        </Routes>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    </AuthProvider>
  );
}

export default App;