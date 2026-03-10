import { useEffect, useState } from 'react';
import { supabase, Place } from '../lib/supabase';
import { PlaceCard } from '../components/PlaceCard';
import { useAuth } from '../contexts/AuthContext';

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

    let query = supabase.from('places').select('*');

    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    } else if (category !== 'all') {
      query = query.eq('category', category);
    }

    const [placesRes, bookmarksRes] = await Promise.all([
      query,
      user ? supabase.from('bookmarks').select('place_id').eq('user_id', user.id) : null,
    ]);

    if (placesRes.data) setPlaces(placesRes.data);
    if (bookmarksRes?.data) {
      setBookmarkedIds(new Set(bookmarksRes.data.map(b => b.place_id)));
    }

    setLoading(false);
  };

  const handleBookmarkClick = async (placeId: string) => {
    if (!user) {
      onAuthRequired();
      return;
    }

    const isBookmarked = bookmarkedIds.has(placeId);

    if (isBookmarked) {
      await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('place_id', placeId);

      setBookmarkedIds(prev => {
        const next = new Set(prev);
        next.delete(placeId);
        return next;
      });
    } else {
      await supabase
        .from('bookmarks')
        .insert({ user_id: user.id, place_id: placeId });

      setBookmarkedIds(prev => new Set(prev).add(placeId));
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
