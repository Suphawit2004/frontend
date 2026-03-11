import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const { user, error: authError } = isLogin 
      ? await signIn(email, password) 
      : await signUp(email, password);

    if (authError) {
      setError(authError.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    } else {
      if (user?.role === 'admin') navigate('/admin');
      onClose();
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    const { user, error: googleError } = await signInWithGoogle();
    
    if (googleError) {
      setError('ไม่สามารถเข้าสู่ระบบด้วย Google ได้ กรุณาลองใหม่');
    } else if (user) {
      if (user.role === 'admin') navigate('/admin');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-8 relative shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition">
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-bold text-center mb-8">
          {isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
        </h2>
        
        {error && (
          <div className="mb-4 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" 
            placeholder="อีเมล" 
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="รหัสผ่าน" 
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-bold transition">
            {isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <div className="relative flex justify-center text-sm"><span className="bg-white px-2 text-gray-500">หรือ</span></div>
        </div>

        <button 
          onClick={handleGoogleLogin} 
          className="w-full border border-gray-200 p-3 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          ดำเนินการต่อด้วย Google
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          {isLogin ? 'ยังไม่มีบัญชี?' : 'มีบัญชีอยู่แล้ว?'}
          <button type="button" onClick={() => setIsLogin(!isLogin)} className="ml-2 text-blue-600 font-bold hover:underline">
            {isLogin ? 'สร้างบัญชีใหม่' : 'เข้าสู่ระบบที่นี่'}
          </button>
        </p>
      </div>
    </div>
  );
}