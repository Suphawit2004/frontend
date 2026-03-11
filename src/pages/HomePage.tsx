import { useEffect, useState } from 'react';
import { fetchAPI } from '../lib/api';
import { ImageSlider } from '../components/ImageSlider';
import { PlaceCard } from '../components/PlaceCard';
import { useAuth } from '../contexts/AuthContext';

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

export type SliderImage = {
  id: string;
  image_url: string;
  title?: string;
  is_active: boolean;
  order_index: number;
};

type HomePageProps = {
  onPlaceClick: (placeId: string) => void;
  onMorePlacesClick: () => void;
  onAuthRequired: () => void;
  searchQuery?: string;
};

export function HomePage({ onPlaceClick, onMorePlacesClick, onAuthRequired, searchQuery }: HomePageProps) {
  const [sliderImages, setSliderImages] = useState<SliderImage[]>([]);
  const [recommendedPlaces, setRecommendedPlaces] = useState<Place[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    if (searchQuery) {
      searchPlaces(searchQuery);
    } else {
      loadRecommendedPlaces();
    }
  }, [searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 🟢 1. ดึงข้อมูลสไลด์ (Public)
      const slidersRes = await fetchAPI('/api/sliders?active=true');
      if (Array.isArray(slidersRes)) setSliderImages(slidersRes);
      else if (slidersRes?.data) setSliderImages(slidersRes.data);

      // 🔴 2. ดึงข้อมูลบุ๊กมาร์ก (Private)
      // 💡 เช็คจาก user เพื่อความชัวร์ว่าล็อกอินจริงๆ
      if (user) { 
        try {
          const bookmarksRes = await fetchAPI('/api/bookmarks');
          const data = Array.isArray(bookmarksRes) ? bookmarksRes : (bookmarksRes?.data || []);
          
          // 💡 แปลง Array เป็น Set เพื่อให้ตรงกับ State bookmarkedIds ของคุณ
          const bookmarkSet = new Set<string>(data.map((b: any) => b.id));
          setBookmarkedIds(bookmarkSet);
        } catch (bookmarkErr: any) {
          console.warn('ไม่สามารถดึงข้อมูล Bookmark ได้:', bookmarkErr);
          // ล้างตั๋วทิ้งถ้าหมดอายุ เพื่อไม่ให้ Console แดงค้าง
          if (bookmarkErr.message?.includes('401') || bookmarkErr.message?.includes('Session')) {
            localStorage.removeItem('auth_token');
          }
        }
      } else {
        setBookmarkedIds(new Set());
      }
    } catch (error) {
      console.error('Failed to load home data:', error);
    } finally {
      setLoading(false); // 💡 ต้องปิด loading ตรงนี้เพื่อให้หน้าเว็บแสดงผล
    }
  };

  const loadRecommendedPlaces = async () => {
    try {
      const places = await fetchAPI('/api/places?recommended=true&limit=4');
      if (Array.isArray(places)) setRecommendedPlaces(places);
      else if (places?.data && Array.isArray(places.data)) setRecommendedPlaces(places.data);
      else setRecommendedPlaces([]);
    } catch (error) {
      console.error('Error loading recommended places:', error);
      setRecommendedPlaces([]);
    }
  };

  const searchPlaces = async (query: string) => {
    try {
      const places = await fetchAPI(`/api/places?search=${encodeURIComponent(query)}&limit=4`);
      if (Array.isArray(places)) setRecommendedPlaces(places);
      else if (places?.data && Array.isArray(places.data)) setRecommendedPlaces(places.data);
      else setRecommendedPlaces([]);
    } catch (error) {
      console.error('Error searching places:', error);
      setRecommendedPlaces([]);
    }
  };

  const handleBookmarkClick = async (placeId: string) => {
    if (!user) {
      onAuthRequired();
      return;
    }

    const isBookmarked = bookmarkedIds.has(placeId);

    try {
      if (isBookmarked) {
        await fetchAPI(`/api/bookmarks/${placeId}`, { method: 'DELETE' });
        setBookmarkedIds(prev => {
          const next = new Set(prev);
          next.delete(placeId);
          return next;
        });
      } else {
        await fetchAPI('/api/bookmarks', {
          method: 'POST',
          body: JSON.stringify({ place_id: placeId }),
        });
        setBookmarkedIds(prev => new Set(prev).add(placeId));
      }
    } catch (error) {
      console.error('Error updating bookmark:', error);
      alert('ไม่สามารถอัปเดตรายการโปรดได้');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-600 font-medium">กำลังโหลดข้อมูล...</div>
        </div>
      </div>
    );
  }

  const safeSliderImages = Array.isArray(sliderImages) ? sliderImages : [];

  return (
    <div>
      <ImageSlider images={safeSliderImages} autoPlay={true} showArrows={true} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            {searchQuery ? `ผลการค้นหา "${searchQuery}"` : 'สถานที่แนะนำ'}
          </h2>
        </div>

        {!Array.isArray(recommendedPlaces) || recommendedPlaces.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {searchQuery ? 'ไม่พบผลการค้นหา' : 'ยังไม่มีสถานที่แนะนำ'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.isArray(recommendedPlaces) && recommendedPlaces.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  isBookmarked={bookmarkedIds.has(place.id)}
                  onBookmarkClick={handleBookmarkClick}
                  onClick={onPlaceClick}
                />
              ))}
            </div>

            {!searchQuery && (
              <div className="text-center mt-8">
                <button
                  onClick={onMorePlacesClick}
                  className="px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium"
                >
                  ดูสถานที่เพิ่มเติม
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}