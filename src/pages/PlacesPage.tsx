import { useEffect, useState } from 'react';
// ลบ import { supabase, Place } from '../lib/supabase';
import { fetchAPI } from '../lib/api';
import { PlaceCard } from '../components/PlaceCard';
import { useAuth } from '../contexts/AuthContext';

// กำหนด Type โครงสร้างข้อมูล (ถ้ามีไฟล์ types.ts สามารถ import มาแทนได้ครับ)
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
    all: 'ที่เที่ยว',
    nature: 'เที่ยวธรรมชาติ',
    cafe: 'คาเฟ่ ร้านอาหาร',
  };

  useEffect(() => {
    loadPlaces();
  }, [category, searchQuery, user]);

  const loadPlaces = async () => {
    setLoading(true);

    // สร้าง URL สำหรับดึงข้อมูลสถานที่
    let endpoint = '/api/places';
    const params = new URLSearchParams();

    // เพิ่มเงื่อนไขการค้นหาหรือหมวดหมู่ลงใน URL
    if (searchQuery) {
      params.append('search', searchQuery);
    } else if (category !== 'all') {
      params.append('category', category);
    }

    const queryString = params.toString();
    if (queryString) {
      endpoint += `?${queryString}`;
    }

    try {
      // ดึงข้อมูลสถานที่และรายการโปรด (ถ้าล็อกอิน) พร้อมกัน
      const [placesRes, bookmarksRes] = await Promise.all([
        fetchAPI(endpoint),
        user ? fetchAPI('/api/bookmarks').catch(() => []) : Promise.resolve([]),
      ]);

      if (placesRes) setPlaces(placesRes);
      if (bookmarksRes) {
        setBookmarkedIds(new Set(bookmarksRes.map((b: { place_id: string }) => b.place_id)));
      }
    } catch (error) {
      console.error('Error loading places:', error);
    } finally {
      setLoading(false);
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
        // ลบ Bookmark
        await fetchAPI(`/api/bookmarks/${placeId}`, {
          method: 'DELETE',
        });

        setBookmarkedIds(prev => {
          const next = new Set(prev);
          next.delete(placeId);
          return next;
        });
      } else {
        // เพิ่ม Bookmark
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {searchQuery ? `ผลการค้นหา "${searchQuery}"` : titles[category]}
          </h1>
        </div>

        {places.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {searchQuery ? 'ไม่พบผลการค้นหา' : 'ยังไม่มีสถานที่ในหมวดหมู่นี้'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                isBookmarked={bookmarkedIds.has(place.id)}
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