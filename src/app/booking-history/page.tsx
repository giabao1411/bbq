'use client'; // Bắt buộc phải ở dòng đầu tiên của file

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// 1. Định nghĩa kiểu dữ liệu (Interface)
interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  guests_count: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  special_requests?: string;
  created_at: string;
}

// 2. Component chính và là EXPORT DEFAULT duy nhất của file
export default function BookingHistoryPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Kiểm tra trạng thái đăng nhập và lấy dữ liệu đặt bàn từ Supabase
  useEffect(() => {
    const fetchUserAndBookings = async () => {
      setLoading(true);
      
      // Lấy thông tin người dùng hiện tại
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        router.push('/login');
        return;
      }

      setUserId(user.id);

      // Lấy danh sách đặt bàn lọc theo user_id
      const { data: bookingsData, error: dbError } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('booking_date', { ascending: false })
        .order('booking_time', { ascending: false });

      if (dbError) {
        console.error('Lỗi khi tải dữ liệu đặt bàn:', dbError.message);
      } else if (bookingsData) {
        setBookings(bookingsData);
      }
      setLoading(false);
    };

    fetchUserAndBookings();
  }, [router]);

  // Hàm xử lý hủy đặt bàn
  const handleCancelBooking = async (bookingId: string) => {
    const confirmCancel = window.confirm('Bạn có chắc chắn muốn hủy yêu cầu đặt bàn này không?');
    if (!confirmCancel) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
        .eq('user_id', userId);

      if (error) {
        alert('Hủy đặt bàn thất bại: ' + error.message);
      } else {
        alert('Hủy đặt bàn thành công.');
        // Cập nhật lại trạng thái ngay trên UI
        setBookings(prev =>
          prev.map(item => item.id === bookingId ? { ...item, status: 'cancelled' } : item)
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Định dạng hiển thị ngày (yyyy-MM-dd -> dd/MM/yyyy)
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Tạo mã đặt bàn hiển thị dạng #EA-XXXXX
  // Hàm mới bảo vệ lỗi:
const generateDisplayCode = (id: any) => {
  if (!id) return '#EA-00000'; // Phòng trường hợp id bị null/undefined
  
  const idString = String(id); // Ép mọi kiểu dữ liệu (số hoặc uuid) về dạng Chuỗi
  return `#EA-${idString.substring(0, 5).toUpperCase()}`;
};

  return (
    <div className="min-h-screen bg-[#0E1111] text-white font-sans antialiased selection:bg-red-800">
      
     

      {/* BODY SECTION */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-serif tracking-wide mb-3 text-zinc-100">
            Lịch sử đặt bàn của tôi
          </h1>
          <p className="text-zinc-400 text-sm max-w-2xl leading-relaxed">
            Quản lý các lần đặt bàn tại SMOKE &amp; OAK. Quý khách có thể xem chi tiết hoặc thay đổi lịch trình đặt bàn của mình.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* CỘT TRÁI: DANH SÁCH ĐẶT BÀN */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="text-center py-12 text-zinc-500 text-sm animate-pulse">
                Đang tải lịch sử đặt bàn...
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16 bg-zinc-900/20 border border-zinc-800/60 rounded-xl">
                <p className="text-zinc-500 text-sm mb-4">Bạn chưa có lịch sử đặt bàn nào.</p>
                <Link href="/booking" className="text-xs bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded uppercase tracking-wider font-medium transition">
                  Đặt bàn ngay
                </Link>
              </div>
            ) : (
              bookings.map((booking) => (
                <div 
                  key={booking.id} 
                  className={`bg-zinc-900/30 border border-zinc-800/60 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition duration-200 ${
                    booking.status === 'cancelled' ? 'opacity-50' : 'hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-3.5">
                      <span className="text-sm font-mono font-bold tracking-wider text-zinc-100">
                        {generateDisplayCode(booking.id)}
                      </span>
                      
                      {booking.status === 'confirmed' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-950/80 text-emerald-400 border border-emerald-900/50 rounded uppercase tracking-wider">
                          Đã xác nhận
                        </span>
                      )}
                      {booking.status === 'pending' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-950/80 text-amber-400 border border-amber-900/50 rounded uppercase tracking-wider">
                          Đang chờ
                        </span>
                      )}
                      {booking.status === 'completed' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded uppercase tracking-wider">
                          Đã hoàn thành
                        </span>
                      )}
                      {booking.status === 'cancelled' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-red-950/50 text-red-400 border border-red-900/30 rounded uppercase tracking-wider">
                          Đã hủy
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-zinc-400">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-red-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span>{formatDateDisplay(booking.booking_date)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-red-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>{booking.booking_time.substring(0, 5)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-red-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <span>{booking.guests_count.toString().padStart(2, '0')} Khách</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col gap-2 min-w-[100px] justify-end">
                    {booking.status === 'completed' || booking.status === 'cancelled' ? (
                      <button 
                        onClick={() => router.push('/booking')}
                        className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2 px-4 rounded text-xs font-medium tracking-wide transition"
                      >
                        Đặt lại
                      </button>
                    ) : (
                      <>
                        <button 
                          onClick={() => alert(`Yêu cầu đặc biệt: ${booking.special_requests || 'Không có ghi chú'}`)}
                          className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-2 px-4 rounded text-xs font-medium tracking-wide transition"
                        >
                          Chi tiết
                        </button>
                        <button 
                          onClick={() => handleCancelBooking(booking.id)}
                          className="w-full border border-zinc-800 hover:border-red-900/60 hover:bg-red-950/20 text-zinc-400 hover:text-red-400 py-2 px-4 rounded text-xs font-medium tracking-wide transition"
                        >
                          Hủy
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* CỘT PHẢI: SIDEBAR THÔNG TIN */}
          <div className="space-y-6">
            <div className="bg-zinc-900/20 border border-zinc-800/60 rounded-xl p-6 shadow-xl">
              <h3 className="text-lg font-serif tracking-wide mb-3 text-zinc-200">Cần hỗ trợ?</h3>
              <p className="text-zinc-400 text-xs leading-relaxed mb-6">
                Nếu quý khách gặp khó khăn trong việc đặt bàn hoặc cần thay đổi thông tin gấp, vui lòng liên hệ trực tiếp với chúng tôi.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 bg-red-950/50 rounded-lg flex items-center justify-center text-red-500 border border-red-900/20">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block">Hotline 24/7</span>
                    <span className="text-sm font-bold text-zinc-200 font-mono">1900 1234</span>
                  </div>
                </div>
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 bg-zinc-950/60 rounded-lg flex items-center justify-center text-zinc-400 border border-zinc-800/60">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block">Email</span>
                    <span className="text-xs font-medium text-zinc-300">booking@emberandash.vn</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-zinc-900/50 to-zinc-950/80 border border-zinc-800/40 rounded-xl p-6 relative overflow-hidden group shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-900/10 rounded-full blur-3xl -mr-5 -mt-5 transition duration-500 group-hover:bg-red-900/20" />
              <span className="text-[9px] font-bold px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded uppercase tracking-wider mb-3.5 inline-block">
                Ưu đãi thành viên
              </span>
              <h3 className="text-base font-serif tracking-wide text-zinc-200 mb-2">Tích lũy điểm thưởng</h3>
              <p className="text-zinc-400 text-xs leading-relaxed mb-4">
                Mỗi lần đặt bàn thành công, bạn sẽ nhận được điểm thưởng Ember Points tương ứng giá trị bữa tiệc.
              </p>
              <Link href="#" className="text-[11px] font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 inline-flex items-center gap-1.5 transition">
                Xem chương trình <span>→</span>
              </Link>
            </div>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#0A0C0C] border-t border-zinc-900 text-zinc-500 text-xs mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h4 className="font-serif text-zinc-300 text-sm tracking-wider uppercase">SMOKE &amp; OAK</h4>
            <p className="leading-relaxed text-zinc-400">Nơi nghệ thuật nướng củi gặp gỡ sự tinh tế của ẩm thực hiện đại. Trải nghiệm hương vị khói đích thực.</p>
          </div>
          <div className="space-y-3">
            <h4 className="font-serif text-zinc-300 text-sm tracking-wide">Liên kết</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="hover:text-zinc-300 transition">Về chúng tôi</Link></li>
              <li><Link href="#" className="hover:text-zinc-300 transition">Thực đơn</Link></li>
              <li><Link href="#" className="hover:text-zinc-300 transition">Khuyến mãi</Link></li>
              <li><Link href="#" className="hover:text-zinc-300 transition">Tuyển dụng</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-serif text-zinc-300 text-sm tracking-wide">Hỗ trợ</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="hover:text-zinc-300 transition">Trung tâm trợ giúp</Link></li>
              <li><Link href="#" className="hover:text-zinc-300 transition">Chính sách bảo mật</Link></li>
              <li><Link href="#" className="hover:text-zinc-300 transition">Điều khoản dịch vụ</Link></li>
              <li><Link href="#" className="hover:text-zinc-300 transition">Phản hồi</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-serif text-zinc-300 text-sm tracking-wide">Địa chỉ</h4>
            <p className="text-zinc-400 leading-relaxed">
              123 Đường Khởi Nghĩa, Quận 1<br />
              Thành phố Hồ Chí Minh, Việt Nam<br /><br />
              Thứ 2 - Chủ Nhật: 10:00 - 23:00
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-zinc-900/60 text-center tracking-widest text-[10px] text-zinc-600">
          © 2024 SMOKE &amp; OAK HOUSE. ALL RIGHTS RESERVED.
        </div>
      </footer>

    </div>
  );
}