import React, { useEffect, useState } from 'react';
import { fetchAPI, API_BASE_URL } from '../lib/api';
import { Trash2, Link as LinkIcon, ExternalLink, RefreshCw, Check } from 'lucide-react';

type MediaFile = {
  key: string;
  url: string;
  size_formatted: string;
  uploaded: string;
};

export function AdminMediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [pastedLink, setPastedLink] = useState('');
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  // 🔄 1. ฟังก์ชันดึงข้อมูล (จะถูกเรียกอัตโนมัติ)
  const loadMedia = async () => {
    setLoading(true);
    try {
      const res = await fetchAPI('/api/media/list-all');
      if (res.success) {
        setFiles(res.data);
      }
    } catch (err) {
      console.error('Failed to load media:', err);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 เรียกใช้งานอัตโนมัติเมื่อเปิดหน้า
  useEffect(() => {
    loadMedia();
  }, []);

  // 🗑️ 2. ฟังก์ชันลบไฟล์
  const handleDelete = async (key: string) => {
    if (!window.confirm(`ยืนยันการลบไฟล์: ${key}?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/media/${encodeURIComponent(key)}`, {
        method: 'DELETE',
        headers: { 'credentials': 'include' } // ส่ง Cookie ไปด้วยเพื่อยืนยันสิทธิ์ Admin
      });
      
      if (res.ok) {
        setFiles(files.filter(f => f.key !== key)); // อัปเดต UI ทันทีไม่ต้องโหลดใหม่ทั้งหมด
        alert('ลบไฟล์สำเร็จ');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการลบ');
    }
  };

  // 🔗 3. ฟังก์ชันจัดการเมื่อวางลิงก์
  const handlePasteLink = () => {
    if (!pastedLink) return;
    // ตัวอย่าง: นำลิงก์ไปใช้งานต่อ หรือเก็บไว้ใน List จำลอง
    alert(`ลิงก์ถูกนำเข้าสู่ระบบ: ${pastedLink}`);
    setPastedLink('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">คลังสื่อ R2</h1>
          <p className="text-gray-500">จัดการรูปภาพและไฟล์ทั้งหมดในระบบ</p>
        </div>
        <button 
          onClick={loadMedia} 
          className="flex items-center gap-2 bg-white border px-4 py-2 rounded-lg hover:bg-gray-50 transition shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          รีเฟรช
        </button>
      </div>

      {/* 📍 ส่วนวางลิงก์ (แทนปุ่มดึงข้อมูลเดิม) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border mb-10">
        <label className="block text-sm font-medium text-gray-700 mb-2">เพิ่มสื่อด้วยลิงก์ภายนอก</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="วาง URL รูปภาพที่นี่ (เช่น https://example.com/image.jpg)"
              className="w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={pastedLink}
              onChange={(e) => setPastedLink(e.target.value)}
            />
          </div>
          <button 
            onClick={handlePasteLink}
            className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            ใช้งานลิงก์
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <RefreshCw className="w-10 h-10 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-500">กำลังดึงข้อมูลจาก Cloudflare R2...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {files.map((file) => (
            <div key={file.key} className="bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-md transition group">
              <div className="aspect-square relative bg-gray-200">
                <img src={file.url} alt={file.key} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                  <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-3 bg-white rounded-full text-gray-800 hover:scale-110 transition"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                  <button 
                    onClick={() => handleDelete(file.key)} 
                    className="p-3 bg-red-500 rounded-full text-white hover:scale-110 transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm font-semibold text-gray-800 truncate mb-1" title={file.key}>
                  {file.key}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{file.size_formatted}</span>
                  <span>{new Date(file.uploaded).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}