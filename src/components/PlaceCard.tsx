import { Star } from 'lucide-react';
import { Place } from '../lib/supabase';

type PlaceCardProps = {
  place: Place;
  isBookmarked: boolean;
  onBookmarkClick: (placeId: string) => void;
  onClick: (placeId: string) => void;
};

export function PlaceCard({ place, isBookmarked, onBookmarkClick, onClick }: PlaceCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
      <div
        onClick={() => onClick(place.id)}
        className="relative cursor-pointer"
      >
        <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
          {place.image_url ? (
            <img
              src={place.image_url}
              alt={place.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-400">No Image</span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onBookmarkClick(place.id);
          }}
          className="absolute bottom-3 right-3 p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <Star
            className={`w-5 h-5 ${
              isBookmarked ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
            }`}
          />
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-800 line-clamp-2">
          {place.name}
        </h3>
        {place.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {place.description}
          </p>
        )}
      </div>
    </div>
  );
}
