import { useEffect, useState } from 'react';
import { UserCircle } from 'lucide-react';
import { fetchAPI } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { PlaceCard } from '../components/PlaceCard';

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
      const places = await fetchAPI('/api/bookmarks/places');
      
      // ✅ เติมเกราะป้องกัน: เช็คว่าเป็น Array ก่อนเซ็ตค่าให้ State
      if (Array.isArray(places)) {
        setBookmarkedPlaces(places);
      } else if (places?.data && Array.isArray(places.data)) {
        setBookmarkedPlaces(places.data);
      } else {
        setBookmarkedPlaces([]); // ป้องกันการพังด้วย Array ว่าง
      }
    } catch (error) {
      console.error('Error loading bookmarked places:', error);
      setBookmarkedPlaces([]); // ถ้า API error ก็เซ็ตเป็น Array ว่างเช่นกัน
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkClick = async (placeId: string) => {
    if (!user) return;

    try {
      await fetchAPI(`/api/bookmarks/${placeId}`, {
        method: 'DELETE',
      });

      // ✅ เติมเกราะป้องกัน: เช็คว่าเป็น Array ก่อนใช้ .filter
      setBookmarkedPlaces(prev => {
        if (Array.isArray(prev)) {
          return prev.filter(p => p.id !== placeId);
        }
        return [];
      });
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

        {/* ✅ เติมเกราะป้องกัน: เช็ค Array ตอนเช็คความยาว */}
        {!Array.isArray(bookmarkedPlaces) || bookmarkedPlaces.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600">ยังไม่มีสถานที่ที่บันทึกไว้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* ✅ เติมเกราะป้องกัน: เช็ค Array ก่อน .map */}
            {Array.isArray(bookmarkedPlaces) && bookmarkedPlaces.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
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