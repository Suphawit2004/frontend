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
        
        {/* 💡 เปลี่ยนจาก Switch-Case เป็น Routes มาตรฐาน */}
        <Routes>
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

          <Route path="/profile" element={
            <ProfilePage onAuthRequired={handleAuthRequired} />
          } />

          {/* 🔒 หน้าสำหรับ Admin */}
          <Route path="/admin" element={<AdminPage onAuthRequired={handleAuthRequired} />} />
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