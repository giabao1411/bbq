'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function BookingPage() {
  const router = useRouter();
  
  // Quản lý trạng thái các bước trong giao diện (Giờ chỉ còn Step 1 và Step 2)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);

  // State quản lý dữ liệu form (Đã bỏ table_type)
  const [formData, setFormData] = useState({
    guests: 2,
    date: new Date().toISOString().split('T')[0], // Mặc định lấy ngày hôm nay
    time: '19:00', // Mặc định giờ tối phổ biến
    notes: ''
  });

  // Kiểm tra trạng thái đăng nhập của người dùng khi truy cập trang
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUserId(user.id);
      }
    };
    checkUser();
  }, [router]);

  // Hàm xử lý tăng giảm số lượng khách hàng (Giới hạn từ 1 đến 20 người)
  const adjustGuests = (val: number) => {
    setFormData(prev => ({
      ...prev,
      guests: Math.max(1, Math.min(20, prev.guests + val))
    }));
  };

  // Điều hướng qua lại giữa các bước của Form và cuộn mượt lên đầu trang
  const nextStep = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Xử lý gửi Form chính thức lên hệ thống Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);

    const { error } = await supabase.from('bookings').insert([
      {
        user_id: userId,
        booking_date: formData.date,
        booking_time: formData.time,
        guests_count: formData.guests,
        special_requests: formData.notes,
        status: 'pending' // Trạng thái mặc định chờ Admin kiểm duyệt
      }
    ]);

    setLoading(false);
    if (error) {
      alert('Đặt bàn thất bại: ' + error.message);
    } else {
      alert('Cảm ơn quý khách! Yêu cầu đặt bàn của bạn đã được tiếp nhận. Vui lòng chờ nhà hàng xác nhận.');
      // Reset form về trạng thái ban đầu và quay về bước 1
      setFormData({
        guests: 2,
        date: new Date().toISOString().split('T')[0],
        time: '19:00',
        notes: ''
      });
      setCurrentStep(1);
    }
  };

  // Tiêu đề động hiển thị theo từng bước
  const getStepTitle = () => {
    return currentStep === 1 ? "Chi tiết bàn đặt" : "Hoàn tất đặt bàn";
  };

  return (
    <div className="bg-[#121414] text-[#e2e2e2] font-sans min-h-screen overflow-x-hidden">
      
      {/* Khung nhúng font và style bổ trợ Material Icon toàn cục */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .glass-panel {
          background: rgba(30, 32, 32, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(142, 145, 146, 0.1);
        }
      `}</style>

      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#1a1c1c] shadow-md flex items-center justify-between px-6 h-16 border-b border-zinc-800/40">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#ffb3ac] cursor-pointer active:scale-95 transition-transform">menu</span>
        </div>
        <h1 className="font-bold text-lg text-[#e2e2e2] tracking-tighter uppercase" style={{ fontFamily: "'Playfair Display', serif" }}>
          SMOKE & OAK
        </h1>
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#ffb3ac] cursor-pointer active:scale-95 transition-transform">shopping_bag</span>
        </div>
      </header>

      {/* Toàn bộ khu vực chính chứa Form */}
      <main className="pt-24 pb-32 px-5 max-w-2xl mx-auto">
        
        {/* Bộ chỉ dẫn các bước (Thu gọn lại thành 2 nút tròn chỉ dẫn) */}
        <div className="flex justify-between items-center mb-8 relative max-w-[240px] mx-auto">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-zinc-800 -z-10"></div>
          
          {/* Vòng tròn bước 1 */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 border-[#121414] transition-all text-xs ${
            currentStep > 1 ? 'bg-[#ffb3ac] text-[#680008]' : 'bg-[#ffb3ac] text-[#680008] shadow-lg shadow-[#ffb3ac]/20'
          }`}>
            {currentStep > 1 ? <span className="material-symbols-outlined text-sm font-bold">check</span> : "1"}
          </div>

          {/* Vòng tròn bước 2 */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 border-[#121414] transition-all text-xs ${
            currentStep === 2 ? 'bg-[#ffb3ac] text-[#680008] shadow-lg shadow-[#ffb3ac]/20' : 'bg-zinc-800 text-zinc-400'
          }`}>
            2
          </div>
        </div>

        {/* Tiêu đề Động */}
        <h2 className="text-2xl font-bold mb-6 text-center text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
          {getStepTitle()}
        </h2>

        {/* Khối Form lớn */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* BƯỚC 1: THÔNG TIN SỐ LƯỢNG / NGÀY / GIỜ */}
          {currentStep === 1 && (
            <div className="space-y-4">
              {/* Bộ chọn số lượng khách */}
              <div className="glass-panel p-5 rounded-xl">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 block">Số lượng khách</label>
                <div className="flex items-center justify-between">
                  <button 
                    type="button" 
                    className="w-12 h-12 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center active:scale-90 transition-transform" 
                    onClick={() => adjustGuests(-1)}
                  >
                    <span className="material-symbols-outlined">remove</span>
                  </button>
                  <span className="text-4xl font-light text-white font-mono">{formData.guests}</span>
                  <button 
                    type="button" 
                    className="w-12 h-12 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center active:scale-90 transition-transform" 
                    onClick={() => adjustGuests(1)}
                  >
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
              </div>

              {/* Ô chọn ngày */}
              <div className="glass-panel p-5 rounded-xl">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 block">Chọn ngày</label>
                <input 
                  type="date"
                  required
                  className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-lg h-14 px-4 focus:border-[#ffb3ac] outline-none transition-colors text-white text-base scheme-dark"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              {/* Ô chọn giờ */}
              <div className="glass-panel p-5 rounded-xl">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 block">Chọn khung giờ đến</label>
                <input 
                  type="time"
                  required
                  className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-lg h-14 px-4 focus:border-[#ffb3ac] outline-none transition-colors text-white text-base scheme-dark font-mono"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>

              {/* Nút tiến tới bước tiếp theo */}
              <button 
                type="button" 
                className="w-full h-16 bg-[#ffb3ac] text-[#680008] font-bold rounded-xl active:scale-95 transition-transform uppercase tracking-widest text-xs shadow-lg shadow-[#ffb3ac]/10" 
                onClick={() => nextStep(2)}
              >
                Tiếp theo
              </button>
            </div>
          )}

          {/* BƯỚC 2: GHI CHÚ VÀ XÁC NHẬN TỔNG HỢP (SUBMIT FORM) */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="glass-panel p-5 rounded-xl space-y-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">Yêu cầu đặc biệt</label>
                  <textarea 
                    className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-lg p-3 focus:border-[#ffb3ac] outline-none transition-colors text-zinc-200 text-sm h-28 resize-none" 
                    placeholder="VD: Sinh nhật, dị ứng thức ăn, bàn cạnh cửa sổ..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                {/* Phần tóm tắt thông số trực quan */}
                <div className="border-t border-zinc-800 pt-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Ngày:</span>
                    <span className="font-bold text-white">{formData.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Giờ đến:</span>
                    <span className="font-bold text-white">{formData.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Số lượng khách:</span>
                    <span className="font-bold text-white">{formData.guests} người</span>
                  </div>
                </div>
              </div>

              {/* Nút Submit gửi toàn bộ dữ liệu chính thức lên Supabase */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full h-20 bg-[#ffb3ac] text-[#680008] font-bold text-sm rounded-xl active:scale-95 transition-transform uppercase tracking-[0.2em] shadow-xl shadow-[#ffb3ac]/5 relative overflow-hidden group disabled:opacity-50"
              >
                <span className="relative z-10">{loading ? 'Đang xử lý...' : 'Xác nhận đặt bàn'}</span>
                <div className="absolute inset-0 bg-white/10 translate-x-full group-active:translate-x-0 transition-transform duration-300"></div>
              </button>

              <button 
                type="button" 
                className="w-full py-2 text-zinc-500 text-xs uppercase tracking-wider hover:text-[#ffb3ac] transition-colors font-medium" 
                onClick={() => nextStep(1)}
              >
                Quay lại chỉnh sửa
              </button>
            </div>
          )}

        </form>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 w-full z-50 bg-[#1e2020] rounded-t-xl shadow-[0_-4px_12px_rgba(0,0,0,0.4)] border-t border-zinc-800/80 flex justify-around items-center h-20 px-2 pb-safe">
        <a className="flex flex-col items-center justify-center text-zinc-400 hover:text-[#ffb3ac] transition-colors" href="#">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] font-medium mt-0.5">Home</span>
        </a>
        <a className="flex flex-col items-center justify-center text-zinc-400 hover:text-[#ffb3ac] transition-colors" href="#">
          <span className="material-symbols-outlined">restaurant_menu</span>
          <span className="text-[10px] font-medium mt-0.5">Menu</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#ffb3ac] font-bold" href="#">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>event_available</span>
          <span className="text-[10px] font-medium mt-0.5">Book Now</span>
        </a>
        <a className="flex flex-col items-center justify-center text-zinc-400 hover:text-[#ffb3ac] transition-colors" href="#">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-medium mt-0.5">Profile</span>
        </a>
      </nav>

    </div>
  );
}