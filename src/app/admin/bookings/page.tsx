'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function UserBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

  // Fetch danh sách đặt bàn của khách hàng
  const fetchUserBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, profiles(full_name)')
      .order('booking_date', { ascending: true });

    if (error) {
      console.error("Lỗi lấy dữ liệu lịch sử đặt bàn:", error.message);
      return;
    }
    if (data) {
      setBookings(data);
    }
  };

  useEffect(() => {
    fetchUserBookings();

    // Lắng nghe thay đổi dữ liệu Realtime từ Supabase
    const channels = supabase
      .channel('user-realtime-bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchUserBookings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channels);
    };
  }, []);

  // Hàm xử lý Hủy đặt bàn trực tiếp
  const handleCancelBooking = async (id: number) => {
    const confirmCancel = window.confirm("Bạn có chắc chắn muốn hủy đơn đặt bàn này không?");
    if (!confirmCancel) return;

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) {
      alert("Không thể hủy bàn: " + error.message);
    } else {
      // Cập nhật State cục bộ tối ưu hóa UI phản hồi nhanh
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    }
  };

  // Phân loại danh sách theo Tab
  // Sắp tới: Trạng thái là pending (đang chờ) hoặc confirmed (đã duyệt)
  const upcomingBookings = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed');
  // Lịch sử: Trạng thái là completed (đã hoàn thành) hoặc cancelled (đã hủy)
  const historyBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

  return (
    <div className="bg-[#121414] text-[#e2e2e2] font-sans min-h-screen overflow-x-hidden">
      
      {/* Khung Style cho font, Google Icons và Glassmorphism Effect */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .glass-card {
          background: rgba(30, 32, 32, 0.6);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(142, 145, 146, 0.12);
        }
      `}</style>

      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 shadow-md bg-[#1a1c1c] flex items-center justify-between px-6 h-16 border-b border-zinc-800/50">
        <div className="flex items-center gap-4">
          <button className="active:scale-95 transition-transform text-[#ffb3ac]">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h1 className="font-bold text-lg text-[#e2e2e2] tracking-tighter uppercase" style={{ fontFamily: "'Playfair Display', serif" }}>
            SMOKE & OAK
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="active:scale-95 transition-transform text-[#ffb3ac]">
            <span className="material-symbols-outlined">shopping_bag</span>
          </button>
        </div>
      </header>

      {/* Toàn bộ vùng nội dung chính */}
      <main className="pt-24 pb-32 px-5 max-w-3xl mx-auto">
        
        {/* User Profile Summary Section */}
        <section className="mb-6">
          <div className="glass-card rounded-xl p-5 flex items-center justify-between shadow-lg relative overflow-hidden">
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border-2 border-[#ffb3ac] overflow-hidden bg-zinc-800">
                <img 
                  className="w-full h-full object-cover" 
                  alt="Avatar" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnMG5-iXR4sM5JQrirDZQ-0bQNDUDyjv0W7K3oeMmVHIhw86Sqb8ZJyyqV2iRl7SS1p3F4hwl2Jo-l3JpSUt1brlQyOgRbE5E8SwPs-Ab8OHN8xiJ8h_VnUPEwr8ji6SPLc5e1weNvd2cfNipXx-uQx29aQWpNHxzP2HulhM3Fq9rRnINt1Gd8vUdJspixqMNZhg-3htix08qAM_HzalKJWohbvxf6Na9ZZMqDpO3hpaNpKBcJxIWZUSI8EphbtjWRvChvGV__R98"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {bookings[0]?.profiles?.full_name || 'Nguyễn Minh Quân'}
                </h2>
                <div className="flex items-center gap-1 text-[#ffb3ac] mt-0.5">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                  <span className="text-xs font-semibold uppercase tracking-wider">Thành viên Vàng • 2,450 điểm</span>
                </div>
              </div>
            </div>
            <div className="relative z-10 text-right hidden sm:block">
              <button className="px-4 py-1.5 rounded-full border border-zinc-700 text-sm text-[#e2e2e2] hover:bg-zinc-800 transition-colors active:scale-95">
                Chỉnh sửa
              </button>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-800 mb-6 relative">
          <button 
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-3 text-center font-bold text-xs tracking-widest transition-colors duration-300 relative ${activeTab === 'upcoming' ? 'text-[#ffb3ac]' : 'text-zinc-500'}`}
          >
            SẮP TỚI
            <div className={`absolute bottom-0 left-0 w-full h-[2px] bg-[#ffb3ac] transition-opacity duration-300 ${activeTab === 'upcoming' ? 'opacity-100' : 'opacity-0'}`} />
          </button>
          
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-center font-bold text-xs tracking-widest transition-colors duration-300 relative ${activeTab === 'history' ? 'text-[#ffb3ac]' : 'text-zinc-500'}`}
          >
            LỊCH SỬ
            <div className={`absolute bottom-0 left-0 w-full h-[2px] bg-[#ffb3ac] transition-opacity duration-300 ${activeTab === 'history' ? 'opacity-100' : 'opacity-0'}`} />
          </button>
        </div>

        {/* Danh sách thẻ đặt bàn dựa vào trạng thái Tab hoạt động */}
        <div className="space-y-4">
          
          {/* TAP SẮP TỚI */}
          {activeTab === 'upcoming' && (
            upcomingBookings.length === 0 ? (
              <p className="text-center text-zinc-500 py-8 italic text-sm">Bạn không có lịch đặt bàn nào sắp tới.</p>
            ) : (
              upcomingBookings.map((b) => (
                <div 
                  key={b.id} 
                  className={`glass-card rounded-xl p-5 flex flex-col gap-4 border-l-4 shadow-md transition-all duration-300 ${
                    b.status === 'confirmed' ? 'border-[#ffb3ac]' : 'border-zinc-600'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-[#ffb3ac] text-[10px] tracking-widest font-mono uppercase">Mã số: #SA-{b.id}</span>
                      <h3 className="font-bold text-base text-white mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Smoke & Oak - Premium BBQ
                      </h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                      b.status === 'confirmed' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/20' : 'bg-amber-950/50 text-amber-400 border border-amber-500/20'
                    }`}>
                      {b.status === 'confirmed' ? 'Đã xác nhận' : 'Đang chờ'}
                    </span>
                  </div>

                  {/* Chi tiết thông số đặt bàn */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-y border-zinc-800/60 py-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-zinc-400 text-lg">calendar_today</span>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-500 uppercase">Ngày</span>
                        <span className="text-xs font-semibold text-zinc-300">{b.booking_date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-zinc-400 text-lg">schedule</span>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-500 uppercase">Giờ</span>
                        <span className="text-xs font-semibold text-zinc-300">{b.booking_time || '19:30'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-zinc-400 text-lg">group</span>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-500 uppercase">Số khách</span>
                        <span className="text-xs font-semibold text-zinc-300">{b.guests_count} Người</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-zinc-400 text-lg">deck</span>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-500 uppercase">Khu vực</span>
                        <span className="text-xs font-semibold text-zinc-300 capitalize">{b.table_type === 'terrace' ? 'Sân thượng' : 'Trong nhà'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Phần chân Thẻ */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full border-2 border-[#121414] overflow-hidden bg-zinc-800">
                        <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwzi_viih0zMQO6YI2MEhNlzOu-0jLFZHH9f4DJjxoIzqUb8ViE95tau-4E3m4zsPUsxThu2U53Jt1t16fsUx0afTpWVKrPy-VsmcYODPMdR8WCV_-UCo0tzjRaHx4yp9hnq6SYx_2pJuVgUlDGmxB2Ya49FQUmOTI8ea78W4JBAdPMu3DGE2cf5oc_iUFvYz1SjLBKsv4k6GJcv1Df4LOVLMpbQmP8CTo5xQ3Hq85XP9tPqoduUoM_FU_GOr4yVPSWQNv6AMv3jQ" alt="food" />
                      </div>
                      <div className="w-8 h-8 rounded-full border-2 border-[#121414] flex items-center justify-center bg-zinc-800 text-[11px] font-bold text-zinc-400">+2</div>
                    </div>
                    
                    {/* Nút hủy kích hoạt trực tiếp lên database */}
                    <button 
                      onClick={() => handleCancelBooking(b.id)}
                      className="flex items-center gap-1 text-rose-400 text-xs font-bold hover:underline active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">cancel</span>
                      Hủy đặt bàn
                    </button>
                  </div>
                </div>
              ))
            )
          )}

          {/* TAP LỊCH SỬ KHÁCH HÀNG */}
          {activeTab === 'history' && (
            historyBookings.length === 0 ? (
              <p className="text-center text-zinc-500 py-8 italic text-sm">Bạn chưa có lịch sử đơn đặt bàn cũ.</p>
            ) : (
              historyBookings.map((b) => (
                <div 
                  key={b.id} 
                  className={`glass-card rounded-xl p-5 flex flex-col gap-4 border-l-4 transition-opacity duration-300 ${
                    b.status === 'completed' ? 'border-zinc-700 opacity-80 hover:opacity-100' : 'border-rose-900/40 opacity-60'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-zinc-500 text-[10px] tracking-widest font-mono uppercase">Mã số: #SA-{b.id}</span>
                      <h3 className="font-bold text-base text-zinc-300 mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {b.table_type === 'vip' ? "Chef's Table Experience" : "Smoke & Oak Restaurant"}
                      </h3>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      b.status === 'completed' ? 'bg-zinc-800 text-zinc-400' : 'bg-rose-950/40 text-rose-400'
                    }`}>
                      {b.status === 'completed' ? 'Đã hoàn thành' : 'Đai hủy'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 border-y border-zinc-800/40 py-3 text-xs">
                    <div className="flex flex-col">
                      <span className="text-zinc-500 text-[10px] uppercase">Ngày</span>
                      <span className="font-semibold text-zinc-400 mt-0.5">{b.booking_date}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-zinc-500 text-[10px] uppercase">Số khách</span>
                      <span className="font-semibold text-zinc-400 mt-0.5">{b.guests_count} Người</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-zinc-500 text-[10px] uppercase">{b.status === 'completed' ? 'Tích lũy' : 'Lý do'}</span>
                      <span className={`font-semibold mt-0.5 ${b.status === 'completed' ? 'text-[#ffb3ac]' : 'text-rose-400/80'}`}>
                        {b.status === 'completed' ? '+150 pts' : 'Thay đổi kế hoạch'}
                      </span>
                    </div>
                  </div>

                  {b.status === 'completed' && (
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex gap-0.5 text-[#ffb3ac]">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        ))}
                      </div>
                      <button className="flex items-center gap-1 text-[#ffb3ac] text-xs font-bold hover:underline active:scale-95 transition-all">
                        <span className="material-symbols-outlined text-sm">restart_alt</span>
                        Đặt lại bàn này
                      </button>
                    </div>
                  )}
                </div>
              ))
            )
          )}

        </div>
      </main>

      {/* Footer giữ nguyên */}
      <footer className="w-full bg-[#161818] border-t border-zinc-800/40 flex flex-col items-center gap-4 py-8 px-5 text-center mb-20">
        <h2 className="font-bold text-base text-[#ffb3ac] tracking-widest" style={{ fontFamily: "'Playfair Display', serif" }}>SMOKE & OAK</h2>
        <div className="flex flex-wrap justify-center gap-5 text-xs text-zinc-400">
          <a className="hover:text-[#ffb3ac] transition-colors" href="#">Contact Us</a>
          <a className="hover:text-[#ffb3ac] transition-colors" href="#">Privacy Policy</a>
          <a className="hover:text-[#ffb3ac] transition-colors" href="#">Terms of Service</a>
          <a className="hover:text-[#ffb3ac] transition-colors" href="#">Locations</a>
        </div>
        <p className="text-[11px] text-zinc-600 mt-2">© 2024 Smoke & Oak Premium BBQ. All Rights Reserved.</p>
      </footer>

      {/* BottomNavBar cố định chân trang điều hướng */}
      <nav className="fixed bottom-0 w-full z-50 rounded-t-xl bg-[#1e2020] border-t border-zinc-800 shadow-[0_-4px_12px_rgba(0,0,0,0.4)] flex justify-around items-center h-20 px-2 pb-safe">
        <button className="flex flex-col items-center justify-center text-zinc-400 hover:text-[#ffb3ac] transition-colors">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] font-medium mt-0.5">Home</span>
        </button>
        <button className="flex flex-col items-center justify-center text-zinc-400 hover:text-[#ffb3ac] transition-colors">
          <span className="material-symbols-outlined">restaurant_menu</span>
          <span className="text-[10px] font-medium mt-0.5">Menu</span>
        </button>
        <button className="flex flex-col items-center justify-center text-zinc-400 hover:text-[#ffb3ac] transition-colors">
          <span className="material-symbols-outlined">event_available</span>
          <span className="text-[10px] font-medium mt-0.5">Book Now</span>
        </button>
        <button className="flex flex-col items-center justify-center text-[#ffb3ac] font-bold">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          <span className="text-[10px] font-medium mt-0.5">Profile</span>
        </button>
      </nav>

    </div>
  );
}