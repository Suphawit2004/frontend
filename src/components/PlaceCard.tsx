import { Star, MapPin } from 'lucide-react'; // 💡 เพิ่ม MapPin

export type Place = {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  map_link?: string | null; // 💡 เพิ่มให้รองรับ map_link
};

type PlaceCardProps = {
  place: Place;
  isBookmarked: boolean;
  onBookmarkClick: (placeId: string) => void;
  onClick: (placeId: string) => void;
};

export function PlaceCard({ place, isBookmarked, onBookmarkClick, onClick }: PlaceCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow flex flex-col">
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

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-lg text-gray-800 line-clamp-1">
          {place.name}
        </h3>
        {place.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {place.description}
          </p>
        )}

        {/* 💡 เพิ่มปุ่มนำทาง (จะแสดงเมื่อมี map_link เท่านั้น) */}
        {place.map_link && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <a
              href={place.map_link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()} // กันไม่ให้ไปเปิดหน้า Detail
              className="flex items-center justify-center gap-2 w-full py-2 bg-blue-50 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              <MapPin className="w-4 h-4" /> ดูแผนที่ / นำทาง
            </a>
          </div>
        )}
      </div>
    </div>
  );
}