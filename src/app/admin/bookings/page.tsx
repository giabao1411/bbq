'use client';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import HeaderAdmin from '@/components/HeaderAdmin';
import { useRouter, usePathname } from "next/navigation";
import { toast, Toaster } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Import file CSS gốc
import { registerLocale } from "react-datepicker";
import { vi } from 'date-fns/locale/vi';

interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  guests_count: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  special_requests?: string;
  created_at: string;
  user_name?: string;
  profiles: { full_name: string | null } | { full_name: string | null }[] | null;
  phone_number?: string;
}

interface CalendarDay {
  dayOfWeek: string;
  dayNum: string;
  dateStr: string;
}
registerLocale('vi', vi);

export default function AdminBookings() {
  const router = useRouter();
  const pathname = usePathname();
  // const dateInputRef = useRef<HTMLInputElement>(null);

  // State quản lý danh sách đặt bàn và bộ lọc
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');


  // Mặc định ban đầu chọn ngày 2023-10-25 theo UI mẫu
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  // State lưu danh sách 7 ngày hiển thị trên slider dựa theo ngày đang chọn
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [isOpen, setIsOpen] = useState(false); // Trạng thái đóng/mở lịch

  // chức năng thêm đặt bàn cho admin
  // begin 

  // State đóng/mở Modal thêm bàn
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customers, setCustomers] = useState<{ id: string; full_name: string }[]>([]);

  // Cập nhật lại cấu trúc formData để lưu user_id thay vì full_name dạng chữ độc lập
  const [formData, setFormData] = useState({
    user_id: '', // Mặc định ban đầu chọn luôn Khách vãng lai
    booking_time: '',
    booking_date: selectedDate,
    guests_count: 2,
    phone_number: '',
    special_requests: ''
  });
  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .order('full_name', { ascending: true });

    if (data) {
      setCustomers(data);
    }
  };
  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.booking_time) return toast.error("Vui lòng chọn giờ đến!");
    if (formData.guests_count <= 0) return toast.error("Số lượng khách phải lớn hơn 0!");
    const phoneTrimmed = formData.phone_number.trim();

    if (!phoneTrimmed) {
      return toast.error("Vui lòng nhập số điện thoại !");
    }

    // Biểu thức Regex kiểm tra đầu số VN: bắt đầu bằng 0 hoặc +84, theo sau là 9 chữ số từ 3, 5, 7, 8, 9
    const vnf_regex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;

    if (!vnf_regex.test(phoneTrimmed)) {
      return toast.error("Số điện thoại không đúng định dạng Việt Nam! (Ví dụ: 0912345678)");
    }
    try {
      const { error } = await supabase
        .from('bookings')
        .insert([
          {
            // NẾU LÀ CHUỖI RỖNG THÌ LƯU NULL, CÒN LÀ KHÁCH THẬT THÌ LƯU ID CỦA HỌ
            user_id: formData.user_id === '' ? null : formData.user_id,
            booking_date: formData.booking_date,
            booking_time: formData.booking_time + ":00",
            guests_count: Number(formData.guests_count),
            special_requests: formData.special_requests,
            phone_number: formData.phone_number.trim(),
            status: 'confirmed',
          }
        ]);

      if (error) throw error;

      toast.success(`Đã tạo lượt đặt bàn thành công!`);
      setIsModalOpen(false);

      // Reset form
      setFormData({
        user_id: '',
        booking_time: '',
        booking_date: selectedDate,
        guests_count: 2,
        phone_number: '',
        special_requests: ''

      });

      fetchBookings(); // Tải lại danh sách

    } catch (error: any) {
      console.error(error);
      toast.error(`Lỗi: ${error.message}`);
    }
  };

  // Gọi hàm này trong useEffect chạy lần đầu tiên khi vào trang
  useEffect(() => {
    fetchCustomers();
  }, []);
  //end chức năng thêm bàn của admin
  // Hàm xử lý khi click vào nút Xem lịch
  const handleOpenCalendar = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsOpen(!isOpen); // Đảo ngược trạng thái đóng/mở
  };

  // Hàm tạo ra chuỗi thứ trong tuần (Tiếng Việt)
  const getVietnameseDayOfWeek = (date: Date) => {
    const day = date.getDay();
    return day === 0 ? 'CN' : `TH ${day + 1}`;
  };

  // Hàm cập nhật danh sách 7 ngày xung quanh ngày được chọn (Ngày chọn nằm ở giữa hoặc đầu)
  const generateCalendarSlider = (centerDateStr: string) => {
    const centerDate = new Date(centerDateStr);
    const days: CalendarDay[] = [];

    // Tạo dải 7 ngày (lấy ngày được chọn làm tâm, lùi 3 ngày và tiến 3 ngày)
    for (let i = -3; i <= 3; i++) {
      const loopDate = new Date(centerDate);
      loopDate.setDate(centerDate.getDate() + i);

      const yyyy = loopDate.getFullYear();
      const mm = String(loopDate.getMonth() + 1).padStart(2, '0');
      const dd = String(loopDate.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      days.push({
        dayOfWeek: getVietnameseDayOfWeek(loopDate),
        dayNum: dd,
        dateStr: dateStr
      });
    }
    setCalendarDays(days);
  };

  // Mỗi khi selectedDate thay đổi -> Tính lại dải ngày Slider và gọi API lấy dữ liệu mới
  useEffect(() => {
    generateCalendarSlider(selectedDate);
    fetchBookings();
    // Cập nhật ngày trong form cho khớp với ngày admin đang xem
    setFormData(prev => ({ ...prev, booking_date: selectedDate }));
  }, [selectedDate]);
  useEffect(() => {
    // Nếu chưa có danh sách đặt bàn thì không chạy interval làm gì cho tốn hiệu năng
    if (!bookings || bookings.length === 0) return;

    console.log("🚀 Hệ thống nhắc giờ đặt bàn đã được kích hoạt!");

    const checkComingBookings = () => {
      // ĐƯA NOW VÀO TRONG NÀY: Để mỗi lần hàm chạy, nó phải lấy đúng giờ phút thực tế hiện tại
      const now = new Date();

      bookings.forEach((booking: any) => {
        // Chỉ check các bàn chưa hoàn thành hoặc chưa hủy
        if (booking.status === 'completed' || booking.status === 'cancelled') return;
        if (!booking.booking_time) return;

        // 1. Bóc tách giờ và phút từ trường booking_time
        const [bHours, bMinutes] = booking.booking_time.split(':').map(Number);

        // 2. Tạo mốc thời gian đặt bàn dựa trên ngày được chọn (selectedDate)
        const bookingDateTime = new Date(selectedDate);
        bookingDateTime.setHours(bHours, bMinutes, 0, 0);

        // 3. Tính khoảng thời gian chênh lệch (phút)
        const timeDiffInMinutes = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60);

        console.log(`Kiểm tra khách ${booking.user_name || 'Khách vãng lai'}: Còn ${Math.round(timeDiffInMinutes)} phút.`);

        // 4. Nếu thời gian sắp đến nằm trong khoảng từ 0 đến 30 phút -> Bắn thông báo ngay
        if (timeDiffInMinutes > 0 && timeDiffInMinutes <= 30) {
          const guestName = booking.user_name || 'Khách vãng lai';

          toast.custom((t) => (
            <div className="bg-amber-500 text-white p-4 rounded-lg shadow-lg flex flex-col gap-1 border border-amber-600 animate-bounce">
              <span className="font-bold font-serif text-base">⏳ BÀN SẮP ĐẾN GIỜ!</span>
              <span className="text-sm">
                Khách <strong>{guestName}</strong> ({booking.guests_count} người) sẽ đến sau <strong>{Math.round(timeDiffInMinutes)} phút</strong> nữa ({booking.booking_time}).
              </span>
            </div>
          ), { id: `alert-${booking.id}`, duration: 5000, });
        }
      });
    };

    // Chạy kích hoạt lần đầu tiên ngay khi vừa vào trang (Không cần đợi 1 phút sau mới chạy)
    checkComingBookings();

    // Khởi tạo Interval quét liên tục sau mỗi 1 phút
    const interval = setInterval(checkComingBookings, 60000);

    // Dọn dẹp interval khi chuyển trang hoặc reload để không bị lỗi rò rỉ bộ nhớ
    return () => {
      console.log("🧹 Đang dọn dẹp bộ nhớ nhắc giờ...");
      clearInterval(interval);
    };
  }, [bookings, selectedDate]);

  // Định dạng hiển thị tiêu đề Tháng/Năm (Ví dụ: THÁNG 10, 2023)
  const formatMonthYearHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "THÁNG 11, 2024";
    return `THÁNG ${date.getMonth() + 1}, ${date.getFullYear()}`;
  };


  // Fetch dữ liệu từ Supabase (Lọc trực tiếp theo selectedDate)
  const fetchBookings = async () => {
    const { data } = await supabase
      .from('bookings')
      .select(`
      id,
      created_at,
      guests_count,
      special_requests,
      booking_time,
      booking_date,
      status,
      phone_number,
      profiles (
        full_name
      ) 
    `)
      .eq('booking_date', selectedDate);

    if (data && data.length > 0) {
      const rawData = data as unknown as Booking[]
      const normalizedBookings: Booking[] = rawData.map((b) => ({
        ...b,
        user_name: (Array.isArray(b.profiles) ? b.profiles[0]?.full_name : b.profiles?.full_name) ?? 'Khách vãng lai'
      }));
      setBookings(normalizedBookings);
      // console.log(data);
    } else {

      setBookings([]); // Ngày khác mặc định trống để chờ bạn thêm mới dữ liệu dữ trữ

    }
  };


  const updateBookingStatus = async (id: string, newStatus: 'pending' | 'completed' | 'cancelled' | 'confirmed') => {
    const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', id);
    if (error) alert(error.message);
    else fetchBookings();
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch = b.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) || b.phone_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesStatus && matchesSearch;
  });

  const getNavLinkClass = (path: string) => {
    return "flex flex-col items-center justify-center" + (pathname === path ? " text-white" : " text-white/40");
  };

  // Kích hoạt ô chọn lịch ẩn khi click nút "Xem lịch"
  // const handleOpenCalendar = () => {
  //   if (dateInputRef.current) {
  //     dateInputRef.current.showPicker(); // Hàm tiêu chuẩn kích hoạt giao diện Lịch của trình duyệt
  //   }
  // };

  return (
    <div className="flex min-h-screen overflow-hidden font-body-md bg-[#0c0f0f] text-[#e2e2e2]">
      <Toaster position="top-right" />
      <HeaderAdmin />

      <main className="flex-1 lg:ml-72 flex flex-col h-screen relative overflow-hidden bg-[#121414]">
        {/* Header */}
        <header className="flex items-center justify-between px-6 md:px-10 h-20 bg-[#121414]/80 backdrop-blur-md sticky top-0 z-30 border-b border-white/5">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all active:scale-95">
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </Link>
            <h2 className="text-xs font-semibold text-white/60 uppercase tracking-[0.3em]">Hệ thống Quản trị / Quản lý đặt bàn</h2>
          </div>
        </header>

        {/* Nội dung chính */}
        <section className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 pb-32 lg:pb-10">

          {/* Tiêu đề & CTA */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <h3 className="font-serif text-3xl font-bold text-white leading-tight">Quản lý đặt bàn</h3>
              <p className="text-white/60 text-sm font-light">Giám sát và điều phối lượt khách đến nhà hàng trong ngày.</p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="bg-[#93000a] text-white px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-[#93000a]/20">
              <span className="material-symbols-outlined text-base">add_circle</span>
              Tạo đặt bàn mới
            </button>
          </div>

          {/* Chọn ngày và xem lịch */}
          <div className="w-full flex flex-col gap-4">

            {/* HÀNG 1: TIÊU ĐỀ THÁNG VÀ NÚT BẤM XEM LỊCH */}
            <div className="flex items-center justify-between w-full">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/70">
                {formatMonthYearHeader(selectedDate)}
              </h3>

              {/* Container bọc nút để định vị hộp lịch */}
              <div className="relative">
                <button
                  onClick={handleOpenCalendar}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 text-sm transition-all"
                >
                  <span>📅</span> Xem lịch
                </button>

                {/* Hộp lịch bay lên trên, không chiếm diện tích của hàng */}
                {isOpen && (
                  <div className="absolute top-[100%] right-0 mt-2 z-50 custom-datepicker-wrapper">
                    <DatePicker
                      selected={selectedDate ? new Date(selectedDate) : null}
                      onChange={(date: Date | null) => {
                        if (date) {
                          const dateString = date.toISOString().split('T')[0];
                          setSelectedDate(dateString);
                          setIsOpen(false);
                        }
                      }}

                      inline
                      dateFormat="dd/MM/yyyy"
                      locale="vi"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* HÀNG 2: DẢI Ô CHỌN NGÀY NGANG (ĐOẠN CODE CỦA BẠN) */}
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none w-full">
              {calendarDays.map((item) => {
                const isSelected = selectedDate === item.dateStr;
                return (
                  <button
                    key={item.dateStr}
                    onClick={() => setSelectedDate(item.dateStr)}
                    className={`flex flex-col items-center justify-center min-w-[56px] h-20 rounded-2xl transition-all ${isSelected
                      ? 'bg-[#93000a] text-white shadow-lg shadow-[#93000a]/30 scale-105 font-bold'
                      : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    <span className="text-[10px] tracking-wider uppercase opacity-80 mb-1">{item.dayOfWeek}</span>
                    <span className="text-lg font-semibold">{item.dayNum}</span>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Thanh Tìm kiếm & Lọc */}
          <div className="flex flex-col sm:flex-row gap-3 items-center w-full">
            <div className="relative w-full sm:flex-1">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-lg">search</span>
              <input
                type="text"
                placeholder="Tìm tên khách, số điện thoại..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#1a1d1d] text-sm text-white pl-11 pr-4 py-3 rounded-xl border border-white/5 focus:outline-none focus:border-[#93000a] w-full"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#1a1d1d] text-xs px-4 py-3 rounded-xl border border-white/5 text-white/80 focus:outline-none cursor-pointer flex-1 sm:flex-none"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chưa đến</option>
                <option value="completed">Đã đến</option>
                <option value="cancelled">Đã hủy</option>
                <option value="confirmed">Đã xác nhận</option>
              </select>
            </div>
          </div>

          {/* Danh sách Đặt bàn */}
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="relative bg-[#161919] border border-white/5 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 group transition-all hover:border-white/10">
                {booking.status === 'pending' && (
                  <div className="absolute left-0 top-4 bottom-4 w-[3px] bg-[#93000a] rounded-r-md"></div>
                )}
                <div className="space-y-3.5 pl-2">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-white group-hover:text-amber-400 transition-colors">{booking.user_name}</h4>
                    <p className="text-xs text-white/40 font-light flex items-center gap-1.5 mt-1">
                      <span className="material-symbols-outlined text-sm">phone</span>{booking.phone_number}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium text-white/70">
                    <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md">
                      <span className="material-symbols-outlined text-sm text-white/40">groups</span>{booking.guests_count} Khách
                    </span>
                    <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md">
                      <span className="material-symbols-outlined text-sm text-white/40">table_restaurant</span>
                    </span>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 border-t md:border-t-0 border-white/5 pt-3 md:pt-0">


                  <div className="flex items-center gap-2 text-xl font-bold text-white md:text-2xl">
                    <span className="material-symbols-outlined text-white/40 text-lg md:text-xl">schedule</span>{booking.booking_time ? booking.booking_time.split(":").slice(0, 2).join(":") : '--:--'}
                  </div>

                  <div className="flex items-center gap-2">
                    {booking.status === 'pending' ? (
                      <>
                        <button onClick={() => updateBookingStatus(booking.id, 'confirmed')} className="bg-[#1d2121] border border-white/10 hover:bg-white/10 text-white text-xs px-4 py-2 rounded-xl transition-all font-semibold">XÁC NHẬN BÀN</button>
                        <button onClick={() => updateBookingStatus(booking.id, 'cancelled')} className="p-2 text-white/40 hover:text-red-400 rounded-lg"><span className="material-symbols-outlined text-base">cancel</span></button>
                      </>
                    ) : booking.status === 'completed' ? (
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] px-4 py-1.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> ĐÃ ĐẾN
                      </span>
                    ) : booking.status ===  'confirmed'?
                    <>
                     <span className="text-[10px] font-bold uppercase tracking-[0.15em] px-4 py-1.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> ĐÃ XÁC NHẬN
                      </span>
                      
                        <button onClick={() => updateBookingStatus(booking.id, 'completed')} className="bg-[#1d2121] border border-white/10 hover:bg-white/10 text-white text-xs px-4 py-2 rounded-xl transition-all font-semibold">ĐÃ ĐẾN</button>
                        <button onClick={() => updateBookingStatus(booking.id, 'cancelled')} className="p-2 text-white/40 hover:text-red-400 rounded-lg"><span className="material-symbols-outlined text-base">cancel</span></button>
                      
                    </>
                    : (
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] px-4 py-1.5 rounded-full bg-white/5 text-white/30 border border-white/5">ĐÃ HỦY</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredBookings.length === 0 && (
              <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/5 text-sm text-white/40">
                Không tìm thấy lượt đặt bàn nào trong ngày được chọn.
              </div>
            )}
          </div>
        </section>

        {/* Mobile Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 px-4 bg-[#121414]/95 backdrop-blur-lg border-t border-white/5">
          <a className={getNavLinkClass("/")} href="/"><span className="material-symbols-outlined">home</span><span className="text-[10px] uppercase font-bold mt-1">Trang chủ</span></a>
          <a className={getNavLinkClass("/admin/users")} href="/admin/users"><span className="material-symbols-outlined">group</span><span className="text-[10px] uppercase font-bold mt-1">Người dùng</span></a>
          <a className={getNavLinkClass("/#menu")} href="/#menu"><span className="material-symbols-outlined">menu_book</span><span className="text-[10px] uppercase font-bold mt-1">Món ăn</span></a>
          <a className={getNavLinkClass("/admin/bookings")} href="/admin/bookings"><span className="material-symbols-outlined">event_available</span><span className="text-[10px] uppercase font-bold mt-1">Đặt bàn</span></a>
        </nav>
      </main>
      {/* MODAL THÊM ĐẶT BÀN MỚI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#161919] border border-white/10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-scaleUp">

            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#1a1d1d]">
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500">deck</span>
                Tạo Lượt Đặt Bàn Mới
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleCreateBooking} className="p-6 space-y-4">

              {/* Tên khách hàng */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Khách hàng đặt bàn</label>
                <select
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  className="w-full bg-[#1a1d1d] text-sm text-white px-4 py-3 rounded-xl border border-white/5 focus:outline-none focus:border-[#93000a] cursor-pointer"
                >
                  {/* Option mặc định cho khách vãng lai */}
                  <option value="" className="bg-[#161919] text-amber-400 font-semibold">
                    ✨ Khách vãng lai (Không có tài khoản)
                  </option>

                  {/* Danh sách thành viên thật */}
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id} className="bg-[#161919] text-white">
                      {customer.full_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hàng chứa Ngày & Giờ */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Ngày đến</label>
                  {/* <DatePicker
                    // Thư viện này cần giá trị là đối tượng Date, nên ta cần convert từ chuỗi yyyy-mm-dd của bạn ra
                    selected={formData.booking_date ? new Date(formData.booking_date) : null}

                    // Khi đổi ngày, ta lại convert ngược về chuỗi yyyy-mm-dd để lưu vào state cũ của bạn
                    onChange={(date: Date |null) => {
                      if (date) {
                        const yyyy = date.getFullYear();
                        const mm = String(date.getMonth() + 1).padStart(2, '0');
                        const dd = String(date.getDate()).padStart(2, '0');
                        setFormData({ ...formData, booking_date: `${yyyy}-${mm}-${dd}` });
                      }
                    }}

                    locale="vi"               // Ép buộc hiển thị Tiếng Việt
                    dateFormat="dd/MM/yyyy"   // Định dạng chuẩn Việt Nam
                    required

                    // Giữ nguyên toàn bộ CSS giao diện tối (Dark mode) của bạn
                    className="w-full bg-[#1a1d1d] text-sm text-white px-4 py-3 rounded-xl border border-white/5 focus:outline-none focus:border-[#93000a]"
                  /> */}
                  <input
                    type="date"
                    value={formData.booking_date}
                    onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                    className="w-full bg-[#1a1d1d] text-sm text-white px-4 py-3 rounded-xl border border-white/5 focus:outline-none focus:border-[#93000a]"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Giờ đến</label>
                  <input
                    type="time"
                    value={formData.booking_time}
                    onChange={(e) => setFormData({ ...formData, booking_time: e.target.value })}
                    className="w-full bg-[#1a1d1d] text-sm text-white px-4 py-3 rounded-xl border border-white/5 focus:outline-none focus:border-[#93000a]"
                    required
                  />
                </div>
              </div>
              {/*Số điện thoại đặt bàn  */}
              <div className="space-y-1.5 animate-fadeIn">
                <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Số điện thoại liên hệ</label>
                <input
                  type="tel"
                  placeholder="Ví dụ: 0912345678"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full bg-[#1a1d1d] text-sm text-white px-4 py-3 rounded-xl border border-white/5 focus:outline-none focus:border-[#93000a]"
                  pattern="^(0|\+84)(3|5|7|8|9)[0-9]{8}$"
                  title="Số điện thoại phải đúng định dạng Việt Nam (10 số, bắt đầu bằng 0 hoặc +84)"
                />
              </div>

              {/* Số lượng khách */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Số lượng khách đến</label>
                <div className="flex items-center bg-[#1a1d1d] rounded-xl border border-white/5 px-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, guests_count: Math.max(1, formData.guests_count - 1) })}
                    className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={formData.guests_count}
                    onChange={(e) => setFormData({ ...formData, guests_count: Math.max(1, Number(e.target.value)) })}
                    className="flex-1 bg-transparent text-center text-sm text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min="1"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, guests_count: formData.guests_count + 1 })}
                    className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Yêu cầu đặc biệt */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Yêu cầu đặc biệt (Ghi chú)</label>
                <textarea
                  placeholder="Ví dụ: Bàn gần cửa sổ, tổ chức sinh nhật,..."
                  value={formData.special_requests}
                  onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                  rows={3}
                  className="w-full bg-[#1a1d1d] text-sm text-white px-4 py-3 rounded-xl border border-white/5 focus:outline-none focus:border-[#93000a] resize-none"
                />
              </div>

              {/* Nhóm nút điều hướng */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-white/5 text-white/60 border border-white/5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#93000a] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#93000a]/20"
                >
                  Xác nhận tạo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}