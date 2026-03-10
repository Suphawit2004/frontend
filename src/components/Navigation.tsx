import { User as UserIcon, Search } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal'; // 1. เพิ่มการนำเข้า AuthModal

type NavigationProps = {
  currentPage: string;
  onNavigate: (page: string) => void;
  onSearch: (query: string) => void;
  onAuthClick: () => void;
};

export function Navigation({ currentPage, onNavigate, onSearch, onAuthClick }: NavigationProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); // 2. เพิ่ม State สำหรับจัดการเปิด-ปิด Modal
  const { user } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  // 3. สร้างฟังก์ชันแยกเพื่อจัดการการคลิกปุ่มไอคอนรูปคน
  const handleUserClick = () => {
    if (user) {
      // ถ้ามีผู้ใช้ล็อกอินอยู่แล้ว ให้เรียกใช้ onAuthClick (เช่น พาไปหน้าโปรไฟล์)
      onAuthClick();
    } else {
      // ถ้ายังไม่ล็อกอิน ให้เปิดหน้าต่างเข้าสู่ระบบ
      setIsAuthModalOpen(true);
    }
  };

  const navItems = [
    { id: 'home', label: 'หน้าหลัก' },
    { id: 'places', label: 'ข้อมูลท่องเที่ยว' },
    { id: 'nature', label: 'เที่ยวธรรมชาติ' },
    { id: 'cafe', label: 'คาเฟ่ ร้านอาหาร' },
  ];

  return (
    <div className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="bg-gray-200 w-20 h-10 flex items-center justify-center rounded">
              <div className="w-15 h-15 flex items-center justify-center overflow-hidden rounded">
                <img
                  src="/image.png"
                  alt="Thiao Nai Dee Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหา..."
                className="w-64 px-4 py-2 pr-10 border border-gray-400 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>

            <button
              onClick={handleUserClick} // 4. เปลี่ยนมาเรียกใช้ฟังก์ชันใหม่ที่เราเพิ่งสร้าง
              className="text-gray-700 hover:text-gray-800 transition-colors"
              title={user ? 'โปรไฟล์' : 'เข้าสู่ระบบ'}
            >
              <UserIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center justify-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-6 py-3 text-white font-medium transition-colors ${
                  currentPage === item.id
                    ? 'bg-blue-900 bg-opacity-50'
                    : 'hover:bg-blue-800 hover:bg-opacity-30'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 5. วาง Component AuthModal ไว้ด้านล่างสุด */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
}