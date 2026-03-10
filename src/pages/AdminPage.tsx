import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { supabase, Place, SliderImage } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type AdminPageProps = {
  onAuthRequired: () => void;
};

export function AdminPage({ onAuthRequired }: AdminPageProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [sliderImages, setSliderImages] = useState<SliderImage[]>([]);
  const [activeTab, setActiveTab] = useState<'places' | 'slider'>('places');
  const [editingPlace, setEditingPlace] = useState<Partial<Place> | null>(null);
  const [editingSlider, setEditingSlider] = useState<Partial<SliderImage> | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      onAuthRequired();
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    const [placesRes, sliderRes] = await Promise.all([
      supabase.from('places').select('*').order('created_at', { ascending: false }),
      supabase.from('slider_images').select('*').order('order_index'),
    ]);

    if (placesRes.data) setPlaces(placesRes.data);
    if (sliderRes.data) setSliderImages(sliderRes.data);
  };

  const handleSavePlace = async () => {
    if (!editingPlace) return;

    if (editingPlace.id) {
      await supabase
        .from('places')
        .update(editingPlace)
        .eq('id', editingPlace.id);
    } else {
      await supabase.from('places').insert(editingPlace);
    }

    setEditingPlace(null);
    loadData();
  };

  const handleDeletePlace = async (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสถานที่นี้?')) {
      await supabase.from('places').delete().eq('id', id);
      loadData();
    }
  };

  const handleSaveSlider = async () => {
    if (!editingSlider) return;

    if (editingSlider.id) {
      await supabase
        .from('slider_images')
        .update(editingSlider)
        .eq('id', editingSlider.id);
    } else {
      const maxOrder = Math.max(...sliderImages.map(s => s.order_index), -1);
      await supabase.from('slider_images').insert({
        ...editingSlider,
        order_index: maxOrder + 1,
      });
    }

    setEditingSlider(null);
    loadData();
  };

  const handleDeleteSlider = async (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบภาพนี้?')) {
      await supabase.from('slider_images').delete().eq('id', id);
      loadData();
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Panel</h1>

        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('places')}
              className={`px-6 py-4 font-medium ${
                activeTab === 'places'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              จัดการสถานที่
            </button>
            <button
              onClick={() => setActiveTab('slider')}
              className={`px-6 py-4 font-medium ${
                activeTab === 'slider'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              จัดการสไลด์
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'places' && (
              <div>
                <button
                  onClick={() => setEditingPlace({
                    name: '',
                    category: 'all',
                    is_recommended: false,
                    is_open: true,
                  })}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-6"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  เพิ่มสถานที่ใหม่
                </button>

                {editingPlace && (
                  <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <h3 className="text-lg font-semibold mb-4">
                      {editingPlace.id ? 'แก้ไขสถานที่' : 'เพิ่มสถานที่ใหม่'}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <input
                        type="text"
                        placeholder="ชื่อสถานที่"
                        value={editingPlace.name || ''}
                        onChange={(e) => setEditingPlace({ ...editingPlace, name: e.target.value })}
                        className="px-3 py-2 border rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="URL รูปภาพ"
                        value={editingPlace.image_url || ''}
                        onChange={(e) => setEditingPlace({ ...editingPlace, image_url: e.target.value })}
                        className="px-3 py-2 border rounded-lg"
                      />
                      <textarea
                        placeholder="รายละเอียด"
                        value={editingPlace.description || ''}
                        onChange={(e) => setEditingPlace({ ...editingPlace, description: e.target.value })}
                        className="px-3 py-2 border rounded-lg col-span-2"
                        rows={3}
                      />
                      <input
                        type="text"
                        placeholder="สถานที่ตั้ง"
                        value={editingPlace.location || ''}
                        onChange={(e) => setEditingPlace({ ...editingPlace, location: e.target.value })}
                        className="px-3 py-2 border rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Google Maps Link"
                        value={editingPlace.map_link || ''}
                        onChange={(e) => setEditingPlace({ ...editingPlace, map_link: e.target.value })}
                        className="px-3 py-2 border rounded-lg"
                      />
                      <select
                        value={editingPlace.category || 'all'}
                        onChange={(e) => setEditingPlace({ ...editingPlace, category: e.target.value })}
                        className="px-3 py-2 border rounded-lg"
                      >
                        <option value="all">ทั้งหมด</option>
                        <option value="nature">ธรรมชาติ</option>
                        <option value="cafe">คาเฟ่ ร้านอาหาร</option>
                      </select>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editingPlace.is_recommended || false}
                            onChange={(e) => setEditingPlace({ ...editingPlace, is_recommended: e.target.checked })}
                            className="mr-2"
                          />
                          แนะนำ
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editingPlace.is_open !== false}
                            onChange={(e) => setEditingPlace({ ...editingPlace, is_open: e.target.checked })}
                            className="mr-2"
                          />
                          เปิด
                        </label>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSavePlace}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        บันทึก
                      </button>
                      <button
                        onClick={() => setEditingPlace(null)}
                        className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                      >
                        <X className="w-4 h-4 mr-2" />
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {places.map((place) => (
                    <div key={place.id} className="flex items-center justify-between border rounded-lg p-4">
                      <div className="flex-1">
                        <h4 className="font-semibold">{place.name}</h4>
                        <p className="text-sm text-gray-600">
                          {place.category} • {place.is_recommended && '⭐ แนะนำ'}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingPlace(place)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePlace(place.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'slider' && (
              <div>
                <button
                  onClick={() => setEditingSlider({
                    image_url: '',
                    is_active: true,
                  })}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-6"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  เพิ่มภาพสไลด์
                </button>

                {editingSlider && (
                  <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <h3 className="text-lg font-semibold mb-4">
                      {editingSlider.id ? 'แก้ไขภาพสไลด์' : 'เพิ่มภาพสไลด์ใหม่'}
                    </h3>
                    <div className="space-y-4 mb-4">
                      <input
                        type="text"
                        placeholder="URL รูปภาพ"
                        value={editingSlider.image_url || ''}
                        onChange={(e) => setEditingSlider({ ...editingSlider, image_url: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="ชื่อ (ไม่บังคับ)"
                        value={editingSlider.title || ''}
                        onChange={(e) => setEditingSlider({ ...editingSlider, title: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingSlider.is_active !== false}
                          onChange={(e) => setEditingSlider({ ...editingSlider, is_active: e.target.checked })}
                          className="mr-2"
                        />
                        แสดง
                      </label>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveSlider}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        บันทึก
                      </button>
                      <button
                        onClick={() => setEditingSlider(null)}
                        className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                      >
                        <X className="w-4 h-4 mr-2" />
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {sliderImages.map((slider) => (
                    <div key={slider.id} className="flex items-center justify-between border rounded-lg p-4">
                      <div className="flex items-center space-x-4">
                        <img
                          src={slider.image_url}
                          alt={slider.title || 'Slider'}
                          className="w-24 h-16 object-cover rounded"
                        />
                        <div>
                          <h4 className="font-semibold">{slider.title || 'ไม่มีชื่อ'}</h4>
                          <p className="text-sm text-gray-600">
                            {slider.is_active ? '✓ แสดง' : '✗ ซ่อน'}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingSlider(slider)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSlider(slider.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
