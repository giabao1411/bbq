'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// Import thư viện lịch react-day-picker và cấu hình tiếng Việt
import { DayPicker } from 'react-day-picker';
import { vi } from 'date-fns/locale';
import { format } from 'date-fns';
import NavUserForMobile from '@/components/MenuUserForMobile';

export default function BookingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [todayStr, setTodayStr] = useState<string>('');

  // Khởi tạo trạng thái ngày chọn (Mặc định là ngày hôm nay)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Danh sách khung giờ cố định
  const afternoonSlots = ['17:00', '17:30', '18:00'];
  const eveningSlots = ['18:30', '19:00', '19:30', '20:00', '20:30', '21:00'];

  // State quản lý dữ liệu form tương tác
  const [formData, setFormData] = useState({
    guests: 1,
    date: '', 
    time: '18:30',
    notes: '',
    phone:'',
  });

  // Khởi tạo ngày hiện tại và kiểm tra auth
  useEffect(() => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    const localISODate = new Date(now.getTime() - tzOffset).toISOString().split('T')[0];
    
    setTodayStr(localISODate);
    setFormData(prev => ({ ...prev, date: localISODate }));

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

  // Tự động đồng bộ ngày được chọn từ DayPicker vào dữ liệu formData gửi lên database
  useEffect(() => {
    if (selectedDate) {
      const formatted = format(selectedDate, 'yyyy-MM-dd');
      setFormData(prev => ({ ...prev, date: formatted }));
    }
  }, [selectedDate]);

  // Hàm xử lý tăng giảm số lượng khách hàng
  const adjustGuests = (val: number) => {
    setFormData(prev => ({
      ...prev,
      guests: Math.max(1, Math.min(20, prev.guests + val))
    }));
  };

  // Xử lý gửi dữ liệu lên hệ thống Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      alert('Vui lòng đăng nhập để thực hiện đặt bàn.');
      return;
    }
    if (!formData.date) {
      alert('Vui lòng chọn ngày đặt bàn.');
      return;
    }
    setLoading(true);

    const { error } = await supabase.from('bookings').insert([
      {
        user_id: userId,
        booking_date: formData.date,
        booking_time: formData.time,
        guests_count: formData.guests,
        special_requests: formData.notes,
        phone_number: formData.phone,
        status: 'pending'
      }
    ]);

    if (error) {
      alert('Đặt bàn thất bại: ' + error.message);
    } else {
      alert('Cảm ơn quý khách! Yêu cầu đặt bàn của bạn đã được tiếp nhận. Vui lòng chờ nhà hàng xác nhận.');
      setFormData({
        guests: 1,
        date: todayStr,
        time: '18:30',
        notes: '',
        phone:''
      });
      setSelectedDate(new Date());
      router.push("/booking-history");
    }
    setLoading(false);
  };

  // Xác định mốc ngày hôm nay để chặn chọn các ngày cũ trong quá khứ
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="bg-[#121212] text-white font-vietnam min-h-screen">
      
      {/* Cấu hình CSS Global: Sửa lỗi hiển thị cấu trúc layout và nút bấm của react-day-picker v9 */}
     {/* Cập nhật lại bộ CSS Global này để cố định vị trí nút bấm trong hộp lịch */}
      <style jsx global>{`
        /* Giữ khung bọc lịch có kích thước cố định và làm gốc tọa độ */
        .custom-booking-calendar .rdp-root {
          position: relative !important;
          width: 100% !important;
        }

        /* Định vị khu vực tiêu đề tháng và năm */
        .custom-booking-calendar .rdp-caption,
        .custom-booking-calendar .rdp-month_caption,
        .custom-booking-calendar .rdp-header {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          width: 100% !important;
          margin-bottom: 20px !important;
          position: relative !important;
          height: 36px !important;
        }

        /* Chữ tiêu đề "Tháng Sáu 2026" nằm chính giữa */
        .custom-booking-calendar .rdp-caption_label,
        .custom-booking-calendar .rdp-month_caption_label {
          font-size: 15px !important;
          font-weight: 700 !important;
          color: #ffffff !important;
          text-transform: capitalize !important;
        }

        /* QUAN TRỌNG: Cố định thanh chứa nút điều hướng bám chặt vào khung Header của lịch */
        .custom-booking-calendar .rdp-nav {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          width: 100% !important;
          height: 36px !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          pointer-events: none !important; /* Ngăn chặn block click chuột vùng tiêu đề */
          z-index: 10 !important;
        }

        /* Tùy biến kiểu dáng nút bấm lùi/tiến tháng */
        .custom-booking-calendar .rdp-nav .rdp-button,
        .custom-booking-calendar .rdp-nav button {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 32px !important;
          height: 32px !important;
          background: rgba(255, 255, 255, 0.05) !important;
          border: none !important;
          cursor: pointer !important;
          pointer-events: auto !important; /* Mở khóa vùng bấm chuột cho nút */
          border-radius: 6px !important;
          transition: all 0.2s ease !important;
          color: #bc1c24 !important;
        }

        .custom-booking-calendar .rdp-nav .rdp-button:hover,
        .custom-booking-calendar .rdp-nav button:hover {
          background: rgba(255, 255, 255, 0.15) !important;
        }

        /* Cấu hình hiển thị lưới lịch các ngày */
        .custom-booking-calendar .rdp-table,
        .custom-booking-calendar .rdp-month_grid {
          width: 100% !important;
          border-collapse: collapse !important;
        }

        .custom-booking-calendar .rdp-head_row,
        .custom-booking-calendar .rdp-weekdays {
          display: flex !important;
          justify-content: space-between !important;
          margin-bottom: 12px !important;
        }

        .custom-booking-calendar .rdp-head_cell,
        .custom-booking-calendar .rdp-weekday {
          width: 38px !important;
          text-align: center !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          color: rgba(255, 255, 255, 0.4) !important;
        }

        .custom-booking-calendar .rdp-row,
        .custom-booking-calendar .rdp-week {
          display: flex !important;
          justify-content: space-between !important;
          margin-top: 8px !important;
        }

        /* Định dạng các ô ngày trong tháng */
        .custom-booking-calendar .rdp-cell,
        .custom-booking-calendar .rdp-day {
          width: 38px !important;
          height: 38px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 13px !important;
          border-radius: 6px !important;
          color: #ffffff !important;
          cursor: pointer !important;
          pointer-events: auto !important;
          background: transparent !important;
          border: none !important;
          transition: all 0.2s ease !important;
        }

        .custom-booking-calendar .rdp-day:hover:not(.rdp-day_disabled) {
          background: rgba(255, 255, 255, 0.08) !important;
        }

        /* Vô hiệu hóa tương tác click chuột các ngày đã qua trong quá khứ */
        .custom-booking-calendar .rdp-day_disabled,
        .custom-booking-calendar .rdp-day[disabled] {
          opacity: 0.15 !important;
          cursor: not-allowed !important;
          pointer-events: none !important;
        }
      `}</style>

     

      <main className="pb-20">
        {/* Banner Hero */}
      <section className="relative h-[450px] flex items-center justify-center overflow-hidden">
  <div className="absolute inset-0 z-0">
    <div 
      className="w-full h-full bg-cover bg-center transition-transform duration-[10000ms] hover:scale-110" 
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1920')" }}
    >
    </div>
    <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>
  </div>

  <div className="relative z-10 text-center max-w-4xl px-4">
    <h1 className="font-serif text-5xl md:text-6xl font-medium text-white mb-4 tracking-wide">
      Đặt Bàn Trực Tuyến
    </h1>
    
    <p className="font-vietnam text-zinc-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed tracking-wide font-light">
      Trải nghiệm tinh hoa nướng củi trong không gian sang trọng và ấm cúng. Hãy để chúng tôi chuẩn bị cho bữa tiệc của bạn.
    </p>
  </div>
</section>

        {/* Form Đặt Bàn chính */}
        <section className="max-w-5xl mx-auto px-6 -mt-12 relative z-20">
          <div className="bg-[#1a1a1a] border border-white/5 rounded-xl shadow-2xl p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-10">
              
              {/* Bước 1 & 2: Chọn Ngày và Giờ */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                
                {/* BƯỚC 1: CHỌN NGÀY */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[#bc1c24] flex items-center justify-center text-white font-bold text-sm">1</span>
                    <h2 className="text-lg font-bold uppercase tracking-wide">Chọn Ngày</h2>
                  </div>
                  
                  <div className="bg-[#242424] p-4 rounded-xl border border-white/5 flex justify-center custom-booking-calendar">
                    <DayPicker
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      locale={vi}
                      disabled={{ before: today }}
                      // Sửa đổi cấu hình component theo đúng tiêu chuẩn phiên bản v9
                      components={{
                        Chevron: (props) => {
                          if (props.orientation === 'left') {
                            return <span className="text-lg font-bold select-none px-1 text-[#bc1c24]">&lt;</span>;
                          }
                          return <span className="text-lg font-bold select-none px-1 text-[#bc1c24]">&gt;</span>;
                        }
                      }}
                      classNames={{
                        selected: '!bg-[#bc1c24] !text-white font-bold rounded-lg shadow-lg shadow-[#bc1c24]/20 opacity-100',
                        today: '!text-[#bc1c24] font-bold border border-[#bc1c24]/30 rounded-lg',
                      }}
                    />
                  </div>
                </div>

                {/* BƯỚC 2: CHỌN GIỜ */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[#bc1c24] flex items-center justify-center text-white font-bold text-sm">2</span>
                    <h2 className="text-lg font-bold uppercase tracking-wide">Chọn Giờ</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">Buổi Chiều</span>
                      <div className="grid grid-cols-3 gap-2">
                        {afternoonSlots.map((slot) => {
                          const isSelected = formData.time === slot;
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setFormData({ ...formData, time: slot })}
                              className={`py-2 px-3 text-sm rounded-lg font-bold transition-all ${
                                isSelected 
                                  ? 'bg-[#bc1c24] text-white ring-2 ring-[#bc1c24]/50' 
                                  : 'border border-white/10 text-white hover:border-[#bc1c24]'
                              }`}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">Buổi Tối (Cao Điểm)</span>
                      <div className="grid grid-cols-3 gap-2">
                        {eveningSlots.map((slot) => {
                          const isSelected = formData.time === slot;
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setFormData({ ...formData, time: slot })}
                              className={`py-2 px-3 text-sm rounded-lg font-bold transition-all ${
                                isSelected 
                                  ? 'bg-[#bc1c24] text-white ring-2 ring-[#bc1c24]/50' 
                                  : 'border border-white/10 text-white hover:border-[#bc1c24]'
                              }`}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[#bc1c24] flex items-center justify-center text-white font-bold text-sm">3</span>
                    <span className="material-symbols-outlined text-sm">phone</span>
                    <h2 className="text-lg font-bold uppercase tracking-wide">Số điện thoại xác nhận</h2>
                  </div>
                  
                  <div className="space-y-4">

                    <div>

                      <input
                        type="tel"
                        id="booking-phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        maxLength={10}
                        onKeyDown={(e) => {
                          // 1. Cho phép các phím chức năng hệ thống (Backspace, Delete, ArrowLeft, ArrowRight, Tab)
                          const systemKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
                          if (systemKeys.includes(e.key)) {
                            return;
                          }
                          // Chặn trực tiếp trên thẻ input, chỉ cho nhập số từ 0-9
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        placeholder="Nhập số điện thoại để nhận lịch..."
                        className="w-full bg-[#141414] text-white placeholder-gray-600 border border-gray-800 rounded field-sizing-content py-3 px-4 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all duration-200"
                      />
                    </div>


                  </div>
                </div>

                
                
              </div>

              {/* Bước 3: Số Lượng Khách */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#bc1c24] flex items-center justify-center text-white font-bold text-sm">4</span>
                  <h2 className="text-lg font-bold uppercase tracking-wide">Số Lượng Khách</h2>
                </div>
                <div className="bg-[#242424] py-4 px-8 rounded-xl flex items-center justify-between border border-white/5 max-w-xl mx-auto">
                  <button type="button" onClick={() => adjustGuests(-1)} className="w-10 h-10 rounded-full border border-white/20 text-white flex items-center justify-center font-bold text-lg hover:border-[#bc1c24]">-</button>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-[#bc1c24]">{formData.guests.toString().padStart(2, '0')}</span>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Người Lớn</p>
                  </div>
                  <button type="button" onClick={() => adjustGuests(1)} className="w-10 h-10 rounded-full border border-white/20 text-white flex items-center justify-center font-bold text-lg hover:border-[#bc1c24]">+</button>
                </div>
              </div>

              {/* Bước 4: Ghi Chú & Yêu Cầu Riêng */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#bc1c24] flex items-center justify-center text-white font-bold text-sm">5</span>
                  <h2 className="text-lg font-bold uppercase tracking-wide">Ghi Chú & Yêu Cầu Riêng</h2>
                </div>
                <textarea 
                  className="w-full bg-[#242424] border border-white/10 rounded-xl p-4 text-sm text-white focus:border-[#bc1c24] outline-none resize-none placeholder:text-gray-600" 
                  placeholder="Ví dụ: Tiệc sinh nhật, dị ứng đậu phộng, yêu cầu ghế trẻ em..." 
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              {/* Nút Xác Nhận Gửi Form */}
              <div className="pt-4 flex flex-col items-center space-y-4">
                <p className="text-xs text-gray-400">© Chúng tôi sẽ giữ bàn trong vòng 15 phút sau giờ hẹn.</p>
                <button type="submit" disabled={loading} className="w-full sm:w-auto sm:min-w-[300px] bg-[#bc1c24] text-white py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50">
                  {loading ? 'Đang xử lý...' : 'Xác nhận đặt bàn'}
                </button>
              </div>
            </form>
          </div>
        </section>
          <NavUserForMobile/>
      </main>
    
    </div>
  );
}