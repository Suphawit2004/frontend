import React, { useState } from 'react';
import { Search, User, Menu, X, Compass, Mountain, Coffee, LogOut, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type NavigationProps = {
  onSearch: (query: string) => void;
  onAuthClick: () => void;
};

export function Navigation({ onSearch, onAuthClick }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // 💡 แก้ไข 1: เปลี่ยนจาก signOut เป็น logout ให้ตรงกับ AuthContext
  const { user, logout } = useAuth(); 
  const navigate = useNavigate(); 
  const location = useLocation(); 

  const isActive = (path: string) => location.pathname === path;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  const navItems = [
    { id: '/', label: 'หน้าแรก', icon: Compass },
    { id: '/nature', label: 'ธรรมชาติ', icon: Mountain },
    { id: '/cafe', label: 'คาเฟ่', icon: Coffee },
  ];

  const handleNavClick = (path: string) => {
    navigate(path); 
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <button 
              onClick={() => handleNavClick('/')}
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent"
            >
              เที่ยวไหนดี
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-2 px-1 py-2 text-sm font-medium transition-colors relative ${
                  isActive(item.id) ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {isActive(item.id) && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Search and Auth */}
          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="hidden sm:relative sm:block">
              <input
                type="text"
                placeholder="ค้นหาที่เที่ยว..."
                className="w-64 pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </form>

            <div className="relative">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm overflow-hidden">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.name || ''} className="w-full h-full object-cover" />
                      ) : (
                        (user.name || user.email[0]).toUpperCase()
                      )}
                    </div>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 overflow-hidden animate-in fade-in zoom-in duration-200">
                      <div className="px-4 py-3 border-b border-gray-50 mb-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.name || 'ผู้ใช้งาน'}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      
                      <button
                        onClick={() => { handleNavClick('/profile'); setIsProfileOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        โปรไฟล์ของฉัน
                      </button>

                      {user.role === 'admin' && (
                        <button
                          onClick={() => { handleNavClick('/admin'); setIsProfileOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          จัดการระบบ (Admin)
                        </button>
                      )}

                      <button
                        // 💡 แก้ไข 2: เรียกใช้ฟังก์ชัน logout()
                        onClick={() => { logout(); setIsProfileOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        ออกจากระบบ
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onAuthClick}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-200 active:scale-95"
                >
                  เข้าสู่ระบบ
                </button>
              )}
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white py-4 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive(item.id) ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}