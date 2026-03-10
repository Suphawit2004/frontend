import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Clock, ExternalLink } from 'lucide-react';
// ลบ import { supabase, Place } from '../lib/supabase';
import { fetchAPI } from '../lib/api';

// กำหนด Type ของ Place (แนะนำให้ใช้ร่วมกันจากไฟล์ types.ts ในโปรเจกต์จริง)
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
  opening_hours?: Record<string, string>;
};

type PlaceDetailPageProps = {
  placeId: string;
  onBack: () => void;
};

export function PlaceDetailPage({ placeId, onBack }: PlaceDetailPageProps) {
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlace();
  }, [placeId]);

  const loadPlace = async () => {
    setLoading(true);
    try {
      // ดึงข้อมูลสถานที่จาก API ของ Cloudflare Worker
      const data = await fetchAPI(`/api/places/${placeId}`);
      if (data) setPlace(data);
    } catch (error) {
      console.error('Error fetching place details:', error);
      setPlace(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">กำลังโหลด...</div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-600 mb-4">ไม่พบข้อมูลสถานที่</p>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          กลับ
        </button>
      </div>
    );
  }

  // ป้องกัน error กรณีที่ opening_hours เป็น null หรือ undefined
  const openingHours = place.opening_hours || {};
  const daysOfWeek = [
    { key: 'monday', label: 'จันทร์' },
    { key: 'tuesday', label: 'อังคาร' },
    { key: 'wednesday', label: 'พุธ' },
    { key: 'thursday', label: 'พฤหัสบดี' },
    { key: 'friday', label: 'ศุกร์' },
    { key: 'saturday', label: 'เสาร์' },
    { key: 'sunday', label: 'อาทิตย์' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            กลับ
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-96 bg-gray-200 flex items-center justify-center overflow-hidden">
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

          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-800">{place.name}</h1>
              <div
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  place.is_open
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {place.is_open ? 'OPEN' : 'CLOSED'}
              </div>
            </div>

            {place.description && (
              <p className="text-gray-600 mb-6 leading-relaxed">{place.description}</p>
            )}

            {place.location && (
              <div className="flex items-start mb-6">
                <MapPin className="w-5 h-5 text-gray-400 mr-2 mt-1 flex-shrink-0" />
                <p className="text-gray-700">{place.location}</p>
              </div>
            )}

            {Object.keys(openingHours).length > 0 && (
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <Clock className="w-5 h-5 text-gray-400 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-800">เวลาทำการ</h2>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {daysOfWeek.map((day) => (
                    <div key={day.key} className="flex justify-between">
                      <span className="text-gray-700">{day.label}</span>
                      <span className="text-gray-600 font-medium">
                        {openingHours[day.key] || 'ปิด'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {place.map_link && (
              <a
                href={place.map_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                ดูใน Google Maps
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}