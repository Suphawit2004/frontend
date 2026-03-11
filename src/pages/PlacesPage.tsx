import { useEffect, useState } from 'react';
import { fetchAPI } from '../lib/api';
import { PlaceCard } from '../components/PlaceCard';
import { useAuth } from '../contexts/AuthContext';

export type Place = {
  id: string; name: string; description?: string; image_url?: string;
  location?: string; map_link?: string; category: string;
  is_recommended: boolean; is_open: boolean;
};

type PlacesPageProps = {
  category?: 'all' | 'nature' | 'cafe';
  onPlaceClick: (placeId: string) => void;
  onAuthRequired: () => void;
  searchQuery?: string;
};

export function PlacesPage({ category = 'all', onPlaceClick, onAuthRequired, searchQuery }: PlacesPageProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const titles = {
    all: 'ที่เที่ยวทั้งหมด',
    nature: 'เที่ยวธรรมชาติ',
    cafe: 'คาเฟ่ ร้านอาหาร',
  };

  // 💡 หัวใจสำคัญ: โหลดข้อมูลใหม่ทุกครั้งที่หมวดหมู่หรือคำค้นหาเปลี่ยน
  useEffect(() => {
    loadPlaces();
  }, [category, searchQuery, user]);

  const loadPlaces = async () => {
    setLoading(true);
    let endpoint = '/api/places';
    const queryParams = new URLSearchParams();

    // 1. ตรวจสอบว่ามีการค้นหาหรือการกรองหมวดหมู่หรือไม่
    if (searchQuery) {
      queryParams.append('search', searchQuery);
    } else if (category !== 'all') {
      queryParams.append('category', category);
    }

    const queryString = queryParams.toString();
    if (queryString) {
      endpoint += `?${queryString}`;
    }

    try {
      const [placesRes, bookmarksRes] = await Promise.all([
        fetchAPI(endpoint),
        user ? fetchAPI('/api/bookmarks').catch(() => []) : Promise.resolve([]),
      ]);

      // จัดการข้อมูลสถานที่
      const placesData = Array.isArray(placesRes) ? placesRes : (placesRes?.data || []);
      setPlaces(placesData);

      // จัดการข้อมูลบุ๊กมาร์ก
      const bookmarkData = Array.isArray(bookmarksRes) ? bookmarksRes : (bookmarksRes?.data || []);
      setBookmarkedIds(new Set(bookmarkData.map((b: any) => b.place_id)));
    } catch (error) {
      console.error('Error loading places:', error);
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  // ... (ฟังก์ชัน handleBookmarkClick คงเดิม)

  if (loading) {
    return <div className="text-center py-20 text-gray-500">กำลังค้นหาสถานที่สวยๆ ให้คุณ...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          {searchQuery ? `ผลการค้นหา "${searchQuery}"` : titles[category]}
        </h1>

        {places.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm border">
            <p>ไม่พบสถานที่ที่คุณกำลังมองหา ลองเปลี่ยนหมวดหมู่ดูนะครับ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                isBookmarked={bookmarkedIds.has(place.id)}
                onBookmarkClick={() => {/* ฟังก์ชัน bookmark */}}
                onClick={onPlaceClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}