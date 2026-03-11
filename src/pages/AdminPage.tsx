import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, Image as ImageIcon, MapPin } from 'lucide-react'; 
import { useAuth } from '../contexts/AuthContext';
import { fetchAPI } from '../lib/api';

// --- Types ---
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

type AdminPageProps = { onAuthRequired: () => void; };

export function AdminPage({ onAuthRequired }: AdminPageProps) {
  // States สำหรับเก็บข้อมูลจาก Server
  const [places, setPlaces] = useState<Place[]>([]);
  const [sliderImages, setSliderImages] = useState<SliderImage[]>([]);
  const [activeTab, setActiveTab] = useState<'places' | 'slider'>('places');
  
  // States สำหรับการจัดการ Form
  const [editingPlace, setEditingPlace] = useState<Partial<Place> | null>(null);
  const [editingSlider, setEditingSlider] = useState<Partial<SliderImage> | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedSliderImage, setSelectedSliderImage] = useState<File | null>(null);

  const { user } = useAuth();

  // ตรวจสอบสิทธิ์ Admin เมื่อเข้าหน้าเพจ
  useEffect(() => {
    if (!user) {
      onAuthRequired();
      return;
    }
    loadData();
  }, [user]);

  // ฟังก์ชันดึงข้อมูลทั้งหมด
  const loadData = async () => {
    try {
      const [placesRes, sliderRes] = await Promise.all([
        fetchAPI('/api/places'),
        fetchAPI('/api/sliders'),
      ]);
      setPlaces(Array.isArray(placesRes) ? placesRes : (placesRes?.data || []));
      setSliderImages(Array.isArray(sliderRes) ? sliderRes : (sliderRes?.data || []));
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  // ฟังก์ชันดึง URL รูปภาพจากคลังสื่อ R2 (LocalStorage)
  const applySelectedImage = (type: 'place' | 'slider') => {
    const savedUrl = localStorage.getItem('selected_image_url');
    if (!savedUrl) {
      alert('กรุณาเลือกรูปในเมนู "คลังสื่อ R2" ก่อนครับ');
      return;
    }
    if (type === 'place' && editingPlace) {
      setEditingPlace({ ...editingPlace, image_url: savedUrl });
    } else if (type === 'slider' && editingSlider) {
      setEditingSlider({ ...editingSlider, image_url: savedUrl });
    }
    alert('ดึงรูปภาพสำเร็จ!');
  };

  // --- ส่วนจัดการสถานที่ (Places) ---
  const handleSavePlace = async () => {
    if (!editingPlace) return;
    try {
      const formData = new FormData();
      formData.append('name', editingPlace.name || '');
      formData.append('description', editingPlace.description || '');
      formData.append('location', editingPlace.location || '');
      formData.append('map_link', editingPlace.map_link || ''); // 📍 ลิงก์แผนที่
      formData.append('category', editingPlace.category || 'all');
      formData.append('is_recommended', String(editingPlace.is_recommended || false));
      formData.append('is_open', String(editingPlace.is_open !== false));

      if (editingPlace.image_url) formData.append('image_url', editingPlace.image_url);
      if (selectedImage) formData.append('image', selectedImage);

      const endpoint = editingPlace.id ? `/api/places/${editingPlace.id}` : `/api/places`;
      const method = editingPlace.id ? 'PUT' : 'POST';

      await fetchAPI(endpoint, { method, body: formData });

      setEditingPlace(null);
      setSelectedImage(null);
      localStorage.removeItem('selected_image_url');
      loadData();
      alert('บันทึกสถานที่สำเร็จ!');
    } catch (error: any) {
      alert(`บันทึกไม่สำเร็จ: ${error.message}`);
    }
  };

  const handleDeletePlace = async (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสถานที่นี้?')) {
      try {
        await fetchAPI(`/api/places/${id}`, { method: 'DELETE' });
        loadData();
      } catch (error) {
        alert('ลบไม่สำเร็จ');
      }
    }
  };

  // --- ส่วนจัดการสไลด์ (Sliders) ---
  const handleSaveSlider = async () => {
    if (!editingSlider) return;
    try {
      const formData = new FormData();
      formData.append('title', editingSlider.title || '');
      formData.append('is_active', String(editingSlider.is_active !== false));
      if (editingSlider.image_url) formData.append('image_url', editingSlider.image_url);
      if (selectedSliderImage) formData.append('image', selectedSliderImage);

      const endpoint = editingSlider.id ? `/api/sliders/${editingSlider.id}` : `/api/sliders`;
      const method = editingSlider.id ? 'PUT' : 'POST';

      await fetchAPI(endpoint, { method, body: formData });

      setEditingSlider(null);
      setSelectedSliderImage(null);
      localStorage.removeItem('selected_image_url');
      loadData();
      alert('บันทึกสไลด์สำเร็จ!');
    } catch (error: any) {
      alert(`บันทึกไม่สำเร็จ: ${error.message}`);
    }
  };

  const handleDeleteSlider = async (id: string) => {
    if (confirm('ยืนยันการลบภาพสไลด์?')) {
      try {
        await fetchAPI(`/api/sliders/${id}`, { method: 'DELETE' });
        loadData();
      } catch (error) {
        alert('ลบไม่สำเร็จ');
      }
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Panel</h1>

        <div className="bg-white rounded-lg shadow-md mb-6">
          {/* Tab Navigation */}
          <div className="flex border-b">
            <button 
              onClick={() => setActiveTab('places')} 
              className={`px-6 py-4 font-medium ${activeTab === 'places' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
            >
              จัดการสถานที่
            </button>
            <button 
              onClick={() => setActiveTab('slider')} 
              className={`px-6 py-4 font-medium ${activeTab === 'slider' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
            >
              จัดการสไลด์
            </button>
          </div>

          <div className="p-6">
            {/* --- Section: Places --- */}
            {activeTab === 'places' && (
              <div>
                <button 
                  onClick={() => { setEditingPlace({ name: '', category: 'all', is_recommended: false, is_open: true }); setSelectedImage(null); }} 
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg mb-6 hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" /> เพิ่มสถานที่ใหม่
                </button>

                {editingPlace && (
                  <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4 text-blue-800">{editingPlace.id ? 'แก้ไขสถานที่' : 'เพิ่มสถานที่ใหม่'}</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {/* แถวลิงก์แผนที่ */}
                      <div className="col-span-2">
                        <label className="flex items-center gap-2 text-sm font-medium mb-1 text-gray-700">
                          <MapPin className="w-4 h-4 text-red-500" /> ลิงก์ Google Maps
                        </label>
                        <input 
                          type="text" 
                          placeholder="วางลิงก์จาก Google Maps (https://maps.app.goo.gl/...)"
                          value={editingPlace.map_link || ''} 
                          onChange={(e) => setEditingPlace({ ...editingPlace, map_link: e.target.value })} 
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                      </div>

                      <input type="text" placeholder="ชื่อสถานที่" value={editingPlace.name || ''} onChange={(e) => setEditingPlace({ ...editingPlace, name: e.target.value })} className="px-3 py-2 border rounded-lg col-span-2 md:col-span-1" />
                      
                      {/* การจัดการรูปภาพ */}
                      <div className="col-span-2 md:col-span-1 border rounded-lg p-3 bg-white flex flex-col gap-2">
                        <label className="text-sm font-medium">รูปภาพหลัก</label>
                        <div className="flex gap-2">
                          <input type="text" placeholder="URL รูปภาพ..." value={editingPlace.image_url || ''} onChange={(e) => setEditingPlace({ ...editingPlace, image_url: e.target.value })} className="flex-1 px-3 py-1.5 border rounded outline-none text-sm" />
                          <button type="button" onClick={() => applySelectedImage('place')} className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded flex items-center gap-1 text-xs font-bold"><ImageIcon className="w-4 h-4" /> ดึงจากคลัง</button>
                        </div>
                        <input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.length) setSelectedImage(e.target.files[0]); }} className="text-xs" />
                      </div>

                      <textarea placeholder="รายละเอียดสถานที่" value={editingPlace.description || ''} onChange={(e) => setEditingPlace({ ...editingPlace, description: e.target.value })} className="px-3 py-2 border rounded-lg col-span-2" rows={3} />
                      <input type="text" placeholder="พิกัดที่ตั้ง (ข้อความ)" value={editingPlace.location || ''} onChange={(e) => setEditingPlace({ ...editingPlace, location: e.target.value })} className="px-3 py-2 border rounded-lg col-span-2" />
                      
                      <select value={editingPlace.category || 'all'} onChange={(e) => setEditingPlace({ ...editingPlace, category: e.target.value })} className="px-3 py-2 border rounded-lg">
                        <option value="all">หมวดหมู่ทั้งหมด</option>
                        <option value="nature">ธรรมชาติ</option>
                        <option value="cafe">คาเฟ่ / ร้านอาหาร</option>
                      </select>

                      <div className="flex items-center space-x-4 pl-2">
                        <label className="flex items-center cursor-pointer"><input type="checkbox" checked={editingPlace.is_recommended || false} onChange={(e) => setEditingPlace({ ...editingPlace, is_recommended: e.target.checked })} className="mr-2 w-4 h-4" /> แนะนำ</label>
                        <label className="flex items-center cursor-pointer"><input type="checkbox" checked={editingPlace.is_open !== false} onChange={(e) => setEditingPlace({ ...editingPlace, is_open: e.target.checked })} className="mr-2 w-4 h-4" /> เปิดบริการ</label>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-4 border-t">
                      <button onClick={handleSavePlace} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700 transition-colors"><Save className="w-4 h-4 mr-2" /> บันทึก</button>
                      <button onClick={() => { setEditingPlace(null); setSelectedImage(null); }} className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-700 transition-colors"><X className="w-4 h-4 mr-2" /> ยกเลิก</button>
                    </div>
                  </div>
                )}

                {/* List of Places */}
                <div className="grid grid-cols-1 gap-4">
                  {places.map((place) => (
                    <div key={place.id} className="flex items-center justify-between border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <img src={place.image_url || ''} className="w-16 h-16 object-cover rounded shadow-sm" alt="" />
                        <div>
                          <h4 className="font-semibold text-gray-800">{place.name}</h4>
                          <p className="text-xs text-gray-500">{place.category} | {place.location}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={() => setEditingPlace(place)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeletePlace(place.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- Section: Sliders --- */}
            {activeTab === 'slider' && (
              <div>
                <button 
                  onClick={() => { setEditingSlider({ image_url: '', is_active: true }); setSelectedSliderImage(null); }} 
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg mb-6 hover:bg-blue-700"
                >
                  <Plus className="w-5 h-5 mr-2" /> เพิ่มสไลด์ใหม่
                </button>

                {editingSlider && (
                  <div className="bg-gray-50 p-6 rounded-lg mb-6 border">
                    <div className="space-y-4 mb-4">
                      <div className="flex flex-col border rounded-lg p-3 bg-white gap-2">
                        <label className="text-sm font-medium">รูปภาพสไลด์</label>
                        <div className="flex gap-2">
                          <input type="text" placeholder="URL รูปภาพ..." value={editingSlider.image_url || ''} onChange={(e) => setEditingSlider({ ...editingSlider, image_url: e.target.value })} className="flex-1 px-3 py-1.5 border rounded outline-none text-sm" />
                          <button type="button" onClick={() => applySelectedImage('slider')} className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded flex items-center gap-1 text-xs font-bold"><ImageIcon className="w-4 h-4" /> ดึงจากคลัง</button>
                        </div>
                        <input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.length) setSelectedSliderImage(e.target.files[0]); }} className="text-xs" />
                      </div>
                      <input type="text" placeholder="คำบรรยายสไลด์ (ถ้ามี)" value={editingSlider.title || ''} onChange={(e) => setEditingSlider({ ...editingSlider, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                      <label className="flex items-center cursor-pointer"><input type="checkbox" checked={editingSlider.is_active !== false} onChange={(e) => setEditingSlider({ ...editingSlider, is_active: e.target.checked })} className="mr-2 w-4 h-4" /> แสดงภาพสไลด์</label>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={handleSaveSlider} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700"><Save className="w-4 h-4 mr-2" /> บันทึก</button>
                      <button onClick={() => setEditingSlider(null)} className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-700"><X className="w-4 h-4 mr-2" /> ยกเลิก</button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  {sliderImages.map((slider) => (
                    <div key={slider.id} className="flex items-center justify-between border rounded-lg p-4 bg-white">
                      <div className="flex items-center space-x-4">
                        <img src={slider.image_url} className="w-24 h-16 object-cover rounded shadow-sm" alt="" />
                        <div>
                          <h4 className="font-semibold text-gray-800">{slider.title || 'ไม่มีชื่อสไลด์'}</h4>
                          <p className="text-xs font-bold text-gray-500">{slider.is_active ? '● กำลังแสดงผล' : '○ ถูกซ่อนไว้'}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={() => setEditingSlider(slider)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteSlider(slider.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"><Trash2 className="w-4 h-4" /></button>
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