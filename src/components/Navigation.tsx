import { User as UserIcon, Search, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';

type NavigationProps = {
  currentPage: string;
  onNavigate: (page: string) => void;
  onSearch: (query: string) => void;
};

export function Navigation({ currentPage, onNavigate, onSearch }: NavigationProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, signOut } = useAuth(); // ดึงข้อมูล user และฟังก์ชัน signOut

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const navItems = [
    { id: 'home', label: 'หน้าหลัก' },
    { id: 'places', label: 'ข้อมูลท่องเที่ยว' },
    { id: 'nature', label: 'เที่ยวธรรมชาติ' },
    { id: 'cafe', label: 'คาเฟ่ ร้านอาหาร' },
  ];

  return (
    <>
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
             <img src="/image.png" alt="Logo" className="h-10 w-auto" />
          </div>

          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหา..."
                className="w-64 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </form>

            <div className="flex items-center gap-3">
              <button
                onClick={() => !user && setIsAuthModalOpen(true)}
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                {user?.avatar_url ? (
                  <img src={user.avatar_url} className="w-8 h-8 rounded-full border" alt="profile" />
                ) : (
                  <UserIcon className="w-6 h-6" />
                )}
                <span className="text-sm font-medium">{user ? user.name || user.email : 'เข้าสู่ระบบ'}</span>
              </button>

              {user && (
                <button onClick={signOut} className="p-2 text-gray-400 hover:text-red-500" title="ออกจากระบบ">
                  <LogOut className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-blue-800">
          <div className="max-w-7xl mx-auto px-4 flex justify-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-6 py-3 text-white font-medium transition-colors ${
                  currentPage === item.id ? 'bg-blue-900/50' : 'hover:bg-blue-800/30'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}