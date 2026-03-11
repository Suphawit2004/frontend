import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, MapPin } from 'lucide-react'; // 💡 นำเข้า MapPin icon เพิ่ม
import { useAuth } from '../contexts/AuthContext';
import { fetchAPI } from '../lib/api';

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

type AdminPageProps = {
  onAuthRequired: () => void;
};

export function AdminPage({ onAuthRequired }: AdminPageProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [sliderImages, setSliderImages] = useState<SliderImage[]>([]);
  const [activeTab, setActiveTab] = useState<'places' | 'slider'>('places');
  const [editingPlace, setEditingPlace] = useState<Partial<Place> | null>(null);
  const [editingSlider, setEditingSlider] = useState<Partial<SliderImage> | null>(null);
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedSliderImage, setSelectedSliderImage] = useState<File | null>(null);
  
  // 💡 State สำหรับจัดการปุ่มโหลดข้อมูล Google
  const [isFetchingGoogle, setIsFetchingGoogle] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      onAuthRequired();
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [placesRes, sliderRes] = await Promise.all([
        fetchAPI('/api/places'),
        fetchAPI('/api/sliders'),
      ]);

      if (Array.isArray(placesRes)) setPlaces(placesRes);
      else if (placesRes?.data && Array.isArray(placesRes.data)) setPlaces(placesRes.data);
      else setPlaces([]);

      if (Array.isArray(sliderRes)) setSliderImages(sliderRes);
      else if (sliderRes?.data && Array.isArray(sliderRes.data)) setSliderImages(sliderRes.data);
      else setSliderImages([]);

    } catch (error) {
      console.error('Failed to load data:', error);
      alert('ไม่สามารถดึงข้อมูลได้');
    }
  };

  // -----------------------------------------
  // 💡 ฟังก์ชันดึงข้อมูลจาก Google Maps (ใหม่)
  // -----------------------------------------
  const handleFetchGoogleData = async () => {
    if (!editingPlace?.map_link) {
      alert('กรุณาวางลิงก์ Google Maps ในช่องก่อนครับ');
      return;
    }

    setIsFetchingGoogle(true);
    try {
      // ⚠️ หมายเหตุ: เราต้องไปสร้าง API เส้นนี้ใน Backend เพื่อเรียก Google Places API
      const response = await fetchAPI(`/api/places/fetch-google?url=${encodeURIComponent(editingPlace.map_link)}`);
      
      if (response && !response.error) {
        setEditingPlace({
          ...editingPlace,
          name: response.name || editingPlace.name,
          description: response.description || editingPlace.description,
          location: response.location || editingPlace.location,
          image_url: response.image_url || editingPlace.image_url,
        });
        alert('ดึงข้อมูลจาก Google Maps สำเร็จ!');
      } else {
        alert('ไม่สามารถดึงข้อมูลได้: ' + (response.error || 'ตรวจสอบลิงก์อีกครั้ง'));
      }
    } catch (error) {
      console.error('Google Fetch Error:', error);
      alert('เกิดข้อผิดพลาดในการดึงข้อมูลจาก Google Maps (อย่าลืมสร้าง API ฝั่ง Backend)');
    } finally {
      setIsFetchingGoogle(false);
    }
  };

  // -----------------------------------------
  // ส่วนจัดการสถานที่ (Places)
  // -----------------------------------------
  const handleSavePlace = async () => {
    if (!editingPlace) return;

    try {
      const formData = new FormData();
      formData.append('name', editingPlace.name || '');
      formData.append('description', editingPlace.description || '');
      formData.append('location', editingPlace.location || '');
      formData.append('map_link', editingPlace.map_link || '');
      formData.append('category', editingPlace.category || 'all');
      formData.append('is_recommended', String(editingPlace.is_recommended || false));
      formData.append('is_open', String(editingPlace.is_open !== false));

      if (editingPlace.image_url) formData.append('image_url', editingPlace.image_url);
      if (selectedImage) formData.append('image', selectedImage);

      // ⚠️ อย่าลืมเปลี่ยน 127.0.0.1 ให้เป็น API_BASE_URL ถ้านำไปใช้งานจริง
      const url = editingPlace.id 
        ? `http://127.0.0.1:8787/api/places/${editingPlace.id}` 
        : `http://127.0.0.1:8787/api/places`;
      const method = editingPlace.id ? 'PUT' : 'POST';

      const response = await fetch(url, { method, body: formData });
      if (!response.ok) throw new Error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');

      setEditingPlace(null);
      setSelectedImage(null);
      loadData();
      alert('บันทึกสถานที่สำเร็จ!');
    } catch (error) {
      console.error('Failed to save place:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูลสถานที่');
    }
  };

  const handleDeletePlace = async (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสถานที่นี้?')) {
      try {
        await fetchAPI(`/api/places/${id}`, { method: 'DELETE' });
        loadData();
      } catch (error) {
        alert('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    }
  };

  // -----------------------------------------
  // ส่วนจัดการสไลด์ (Sliders)
  // -----------------------------------------
  const handleSaveSlider = async () => {
    if (!editingSlider) return;
    try {
      const formData = new FormData();
      formData.append('title', editingSlider.title || '');
      formData.append('is_active', String(editingSlider.is_active !== false));
      
      if (editingSlider.image_url) formData.append('image_url', editingSlider.image_url);
      if (selectedSliderImage) formData.append('image', selectedSliderImage);

      const url = editingSlider.id 
        ? `http://127.0.0.1:8787/api/sliders/${editingSlider.id}` 
        : `http://127.0.0.1:8787/api/sliders`;
      const method = editingSlider.id ? 'PUT' : 'POST';

      const response = await fetch(url, { method, body: formData });

      if (!response.ok) throw new Error('บันทึกไม่สำเร็จ');

      setEditingSlider(null);
      setSelectedSliderImage(null);
      loadData();
      alert('บันทึกสไลด์สำเร็จ!');
    } catch (error) {
      console.error('Failed to save slider:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกรูปสไลด์');
    }
  };

  const handleDeleteSlider = async (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบภาพนี้?')) {
      try {
        await fetchAPI(`/api/sliders/${id}`, { method: 'DELETE' });
        loadData();
      } catch (error) {
        alert('เกิดข้อผิดพลาดในการลบรูปสไลด์');
      }
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
                activeTab === 'places' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              จัดการสถานที่
            </button>
            <button
              onClick={() => setActiveTab('slider')}
              className={`px-6 py-4 font-medium ${
                activeTab === 'slider' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              จัดการสไลด์
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'places' && (
              <div>
                <button
                  onClick={() => {
                    setEditingPlace({ name: '', category: 'all', is_recommended: false, is_open: true });
                    setSelectedImage(null);
                  }}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-6"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  เพิ่มสถานที่ใหม่
                </button>

                {editingPlace && (
                  <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4">{editingPlace.id ? 'แก้ไขสถานที่' : 'เพิ่มสถานที่ใหม่'}</h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      
                      {/* 💡 ส่วนดึงข้อมูลอัตโนมัติจาก Google (ย้ายลิงก์ Map มาไว้ด้านบน) */}
                      <div className="col-span-2 p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-blue-800 mb-1">Google Maps Link (เพื่อดึงข้อมูลอัตโนมัติ)</label>
                          <input 
                            type="text" 
                            placeholder="วางลิงก์ Google Maps ที่นี่..." 
                            value={editingPlace.map_link || ''} 
                            onChange={(e) => setEditingPlace({ ...editingPlace, map_link: e.target.value })} 
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
                          />
                        </div>
                        <button 
                          type="button"
                          onClick={handleFetchGoogleData}
                          disabled={isFetchingGoogle || !editingPlace.map_link}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center whitespace-nowrap"
                        >
                          <MapPin className="w-4 h-4 mr-2" />
                          {isFetchingGoogle ? 'กำลังดึงข้อมูล...' : 'ดึงข้อมูล'}
                        </button>
                      </div>

                      <input type="text" placeholder="ชื่อสถานที่" value={editingPlace.name || ''} onChange={(e) => setEditingPlace({ ...editingPlace, name: e.target.value })} className="px-3 py-2 border rounded-lg" />
                      
                      <div className="flex flex-col">
                        <input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.length) setSelectedImage(e.target.files[0]); }} className="px-3 py-2 border rounded-lg bg-white" />
                        {editingPlace.image_url && !selectedImage && (
                          <div className="mt-2 text-sm text-gray-500 flex items-center">
                            <span className="mr-2">รูปปัจจุบัน:</span>
                            <img src={editingPlace.image_url} alt="Current" className="h-10 w-10 object-cover rounded" />
                          </div>
                        )}
                      </div>

                      <textarea placeholder="รายละเอียด" value={editingPlace.description || ''} onChange={(e) => setEditingPlace({ ...editingPlace, description: e.target.value })} className="px-3 py-2 border rounded-lg col-span-2" rows={3} />
                      <input type="text" placeholder="สถานที่ตั้ง (ที่อยู่)" value={editingPlace.location || ''} onChange={(e) => setEditingPlace({ ...editingPlace, location: e.target.value })} className="px-3 py-2 border rounded-lg col-span-2" />
                      
                      <select value={editingPlace.category || 'all'} onChange={(e) => setEditingPlace({ ...editingPlace, category: e.target.value })} className="px-3 py-2 border rounded-lg">
                        <option value="all">ทั้งหมด</option>
                        <option value="nature">ธรรมชาติ</option>
                        <option value="cafe">คาเฟ่ ร้านอาหาร</option>
                      </select>
                      
                      <div className="flex items-center space-x-4 pl-2">
                        <label className="flex items-center cursor-pointer"><input type="checkbox" checked={editingPlace.is_recommended || false} onChange={(e) => setEditingPlace({ ...editingPlace, is_recommended: e.target.checked })} className="mr-2 w-4 h-4 text-blue-600" />แนะนำ</label>
                        <label className="flex items-center cursor-pointer"><input type="checkbox" checked={editingPlace.is_open !== false} onChange={(e) => setEditingPlace({ ...editingPlace, is_open: e.target.checked })} className="mr-2 w-4 h-4 text-blue-600" />เปิดให้บริการ</label>
                      </div>
                    </div>

                    <div className="flex space-x-2 mt-6 border-t pt-4">
                      <button onClick={handleSavePlace} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"><Save className="w-4 h-4 mr-2" />บันทึก</button>
                      <button onClick={() => { setEditingPlace(null); setSelectedImage(null); }} className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"><X className="w-4 h-4 mr-2" />ยกเลิก</button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {Array.isArray(places) && places.map((place) => (
                    <div key={place.id} className="flex items-center justify-between border rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
                      <div className="flex-1 flex items-center space-x-4">
                        {place.image_url ? (
                          <img src={place.image_url} alt={place.name} className="w-16 h-16 object-cover rounded shadow-sm" />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400">No Img</div>
                        )}
                        <div>
                          <h4 className="font-semibold text-gray-800">{place.name}</h4>
                          <p className="text-sm text-gray-500">{place.category === 'nature' ? 'ธรรมชาติ' : place.category === 'cafe' ? 'คาเฟ่' : 'ทั่วไป'} • {place.is_recommended && <span className="text-yellow-500 font-medium">⭐ แนะนำ</span>}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={() => { setEditingPlace(place); setSelectedImage(null); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeletePlace(place.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'slider' && (
              // ... โค้ดส่วน Slider คงเดิมทั้งหมด
              <div>
                <button
                  onClick={() => { setEditingSlider({ image_url: '', is_active: true }); setSelectedSliderImage(null); }}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-6"
                >
                  <Plus className="w-5 h-5 mr-2" />เพิ่มภาพสไลด์
                </button>

                {editingSlider && (
                  <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4">{editingSlider.id ? 'แก้ไขภาพสไลด์' : 'เพิ่มภาพสไลด์ใหม่'}</h3>
                    <div className="space-y-4 mb-4">
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">เลือกรูปภาพสไลด์</label>
                        <input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.length) setSelectedSliderImage(e.target.files[0]); }} className="w-full px-3 py-2 border rounded-lg bg-white" />
                        {editingSlider.image_url && !selectedSliderImage && (
                          <div className="mt-2 text-sm text-gray-500 flex items-center"><span className="mr-2">รูปปัจจุบัน:</span><img src={editingSlider.image_url} alt="Current Slider" className="h-16 w-24 object-cover rounded shadow-sm" /></div>
                        )}
                      </div>
                      <input type="text" placeholder="ชื่อ (ไม่บังคับ)" value={editingSlider.title || ''} onChange={(e) => setEditingSlider({ ...editingSlider, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                      <label className="flex items-center cursor-pointer"><input type="checkbox" checked={editingSlider.is_active !== false} onChange={(e) => setEditingSlider({ ...editingSlider, is_active: e.target.checked })} className="mr-2 w-4 h-4 text-blue-600" />แสดง</label>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <button onClick={handleSaveSlider} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"><Save className="w-4 h-4 mr-2" />บันทึก</button>
                      <button onClick={() => { setEditingSlider(null); setSelectedSliderImage(null); }} className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"><X className="w-4 h-4 mr-2" />ยกเลิก</button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {Array.isArray(sliderImages) && sliderImages.map((slider) => (
                    <div key={slider.id} className="flex items-center justify-between border rounded-lg p-4 bg-white">
                      <div className="flex items-center space-x-4">
                        <img src={slider.image_url} alt={slider.title || 'Slider'} className="w-24 h-16 object-cover rounded shadow-sm" />
                        <div>
                          <h4 className="font-semibold text-gray-800">{slider.title || 'ไม่มีชื่อ'}</h4>
                          <p className="text-sm text-gray-500">{slider.is_active ? '✓ แสดง' : '✗ ซ่อน'}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={() => { setEditingSlider(slider); setSelectedSliderImage(null); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteSlider(slider.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
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