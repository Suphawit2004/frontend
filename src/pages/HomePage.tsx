import { useEffect, useState } from 'react';
// ลบ import { supabase, Place, SliderImage } from '../lib/supabase';
import { fetchAPI } from '../lib/api';
import { ImageSlider } from '../components/ImageSlider';
import { PlaceCard } from '../components/PlaceCard';
import { useAuth } from '../contexts/AuthContext';

// กำหนด Type โครงสร้างข้อมูล (แนะนำให้ย้ายไปไฟล์แยกเช่น types.ts แล้ว import เข้ามาเพื่อลดความซ้ำซ้อน)
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

  // ฟังก์ชันดึงข้อมูลตอนโหลดหน้าแรก
  const loadData = async () => {
    setLoading(true);

    try {
      // ดึงข้อมูล 3 ส่วนพร้อมกันผ่าน API ของ Cloudflare
      const [sliders, places, bookmarks] = await Promise.all([
        fetchAPI('/api/sliders?active=true'), // สไลด์ที่เปิดใช้งาน
        fetchAPI('/api/places?recommended=true&limit=4'), // สถานที่แนะนำ 4 แห่ง
        // ดึงรายการโปรดเฉพาะตอนล็อกอิน (ใช้ .catch เพื่อไม่ให้กระทบส่วนอื่นถ้า API error)
        user ? fetchAPI('/api/bookmarks').catch(() => []) : Promise.resolve([]), 
      ]);

      if (sliders) setSliderImages(sliders);
      if (places) setRecommendedPlaces(places);
      if (bookmarks) {
        setBookmarkedIds(new Set(bookmarks.map((b: { place_id: string }) => b.place_id)));
      }
    } catch (error) {
      console.error('Error loading home page data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันดึงเฉพาะสถานที่แนะนำ 4 อันดับแรก
  const loadRecommendedPlaces = async () => {
    try {
      const places = await fetchAPI('/api/places?recommended=true&limit=4');
      if (places) setRecommendedPlaces(places);
    } catch (error) {
      console.error('Error loading recommended places:', error);
    }
  };

  // ฟังก์ชันค้นหาสถานที่
  const searchPlaces = async (query: string) => {
    try {
      // ส่ง query ไปให้ Backend ค้นหา (ilike แบบใน Supabase จะถูกจัดการที่ Cloudflare D1 แทน)
      const places = await fetchAPI(`/api/places?search=${encodeURIComponent(query)}&limit=4`);
      if (places) setRecommendedPlaces(places);
    } catch (error) {
      console.error('Error searching places:', error);
    }
  };

  // ฟังก์ชันจัดการรายการโปรด (Bookmark)
  const handleBookmarkClick = async (placeId: string) => {
    if (!user) {
      onAuthRequired();
      return;
    }

    const isBookmarked = bookmarkedIds.has(placeId);

    try {
      if (isBookmarked) {
        // ยกเลิก Bookmark (DELETE)
        await fetchAPI(`/api/bookmarks/${placeId}`, {
          method: 'DELETE',
        });

        setBookmarkedIds(prev => {
          const next = new Set(prev);
          next.delete(placeId);
          return next;
        });
      } else {
        // เพิ่ม Bookmark (POST)
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
        <div className="text-gray-600">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div>
      <ImageSlider images={sliderImages} autoPlay={true} showArrows={true} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            {searchQuery ? `ผลการค้นหา "${searchQuery}"` : 'สถานที่แนะนำ'}
          </h2>
        </div>

        {recommendedPlaces.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {searchQuery ? 'ไม่พบผลการค้นหา' : 'ยังไม่มีสถานที่แนะนำ'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedPlaces.map((place) => (
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