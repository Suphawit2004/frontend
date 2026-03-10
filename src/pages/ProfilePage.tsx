import { useEffect, useState } from 'react';
import { UserCircle } from 'lucide-react';
// ลบ import { supabase, Place } from '../lib/supabase';
import { fetchAPI } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { PlaceCard } from '../components/PlaceCard';

// กำหนด Type โครงสร้างข้อมูล (เช่นเดิมครับ แนะนำให้ใช้ไฟล์ types.ts ในโปรเจกต์จริง)
export type Place = {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  location?: string;
  map_link?: string;
  category: string;
  is_recommended: boolean;
  is_open: boolean;
};

type ProfilePageProps = {
  onPlaceClick: (placeId: string) => void;
  onAuthRequired: () => void;
};

export function ProfilePage({ onPlaceClick, onAuthRequired }: ProfilePageProps) {
  const [bookmarkedPlaces, setBookmarkedPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (!user) {
      onAuthRequired();
      return;
    }
    loadBookmarkedPlaces();
  }, [user]);

  const loadBookmarkedPlaces = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // ยิง API ไปที่ Endpoint ใหม่ที่สร้างขึ้นเพื่อดึงข้อมูลสถานที่ที่ Bookmark ไว้โดยเฉพาะ
      // (Backend จะรู้ว่าเป็น User คนไหนจาก Cookie/Token ที่แนบไปอัตโนมัติ)
      const places = await fetchAPI('/api/bookmarks/places');
      
      if (places) {
        setBookmarkedPlaces(places);
      }
    } catch (error) {
      console.error('Error loading bookmarked places:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkClick = async (placeId: string) => {
    if (!user) return;

    try {
      // ยิง API ยกเลิก Bookmark (ใช้ Method DELETE)
      await fetchAPI(`/api/bookmarks/${placeId}`, {
        method: 'DELETE',
      });

      // อัปเดต UI ทันทีโดยลบสถานที่นั้นออกจาก State
      setBookmarkedPlaces(prev => prev.filter(p => p.id !== placeId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
      alert('เกิดข้อผิดพลาดในการยกเลิกรายการโปรด');
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gray-200 rounded-full p-4">
                <UserCircle className="w-16 h-16 text-gray-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {user.name || user.email?.split('@')[0] || 'User'}
                </h1>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">ที่คั่นไว้</h2>
        </div>

        {bookmarkedPlaces.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600">ยังไม่มีสถานที่ที่บันทึกไว้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarkedPlaces.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                // กำหนดให้ isBookmarked เป็น true เสมอในหน้านี้ เพราะเป็นรายการที่คั่นไว้แล้ว
                isBookmarked={true}
                onBookmarkClick={handleBookmarkClick}
                onClick={onPlaceClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}