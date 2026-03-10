import { useEffect, useState } from 'react';
import { supabase, Place, SliderImage } from '../lib/supabase';
import { ImageSlider } from '../components/ImageSlider';
import { PlaceCard } from '../components/PlaceCard';
import { useAuth } from '../contexts/AuthContext';

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

    const [sliderRes, placesRes, bookmarksRes] = await Promise.all([
      supabase.from('slider_images').select('*').eq('is_active', true).order('order_index'),
      supabase.from('places').select('*').eq('is_recommended', true).limit(4),
      user ? supabase.from('bookmarks').select('place_id').eq('user_id', user.id) : null,
    ]);

    if (sliderRes.data) setSliderImages(sliderRes.data);
    if (placesRes.data) setRecommendedPlaces(placesRes.data);
    if (bookmarksRes?.data) {
      setBookmarkedIds(new Set(bookmarksRes.data.map(b => b.place_id)));
    }

    setLoading(false);
  };

  const loadRecommendedPlaces = async () => {
    const { data } = await supabase
      .from('places')
      .select('*')
      .eq('is_recommended', true)
      .limit(4);

    if (data) setRecommendedPlaces(data);
  };

  const searchPlaces = async (query: string) => {
    const { data } = await supabase
      .from('places')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(4);

    if (data) setRecommendedPlaces(data);
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
