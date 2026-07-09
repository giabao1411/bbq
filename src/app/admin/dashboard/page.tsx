"use client"
import { useEffect,useState } from 'react';
import { supabase } from '@/lib/supabase';
import HeaderAdmin from '@/components/HeaderAdmin'
import Link from 'next/link';
import { useRouter, usePathname } from "next/navigation";
import FooterAdmin from '@/components/FooterAdmin'
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area,Cell
} from 'recharts';
interface DashboardData {
  metrics: {
    todayBookings: number;
    totalMembers: number;
    memberGrowthPercent: number;
  };
  weeklyCapacity: Array<{ day: string; bookings: number }>;
  monthlyGrowth: Array<{ month: string; members: number }>;
}
export default function AdminDashBoard (){
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);

        // MÔ PHỎNG DỮ LIỆU THỰC TẾ TRẢ VỀ TỪ SUPABASE (CHỈ GỒM BOOKING & USER)
        // (Bạn có thể thay thế bằng logic await supabase.from().select() thực tế)
        const mockSupabaseData: DashboardData = {
          metrics: {
            todayBookings: 42,
            totalMembers: 1284,
            memberGrowthPercent: 15,
          },
          weeklyCapacity: [
            { day: "Thứ 2", bookings: 24 },
            { day: "Thứ 3", bookings: 36 },
            { day: "Thứ 4", bookings: 48 },
            { day: "Thứ 5", bookings: 20 },
            { day: "Thứ 6", bookings: 32 },
            { day: "Thứ 7", bookings: 45 },
            { day: "Chủ Nhật", bookings: 26 },
          ],
          monthlyGrowth: [
            { month: "T1", members: 400 },
            { month: "T2", members: 550 },
            { month: "T3", members: 700 },
            { month: "T4", members: 850 },
            { month: "T5", members: 1100 },
            { month: "T6", members: 1284 },
          ]
        };

        setData(mockSupabaseData);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu từ Supabase:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen text-on-surface">
        <p className="animate-pulse">Đang tải dữ liệu hệ thống...</p>
      </div>
    );
  }
  
    return (
         <div className="flex min-h-screen overflow-hidden font-body-md bg-[#0c0f0f] text-[#e2e2e2]">
            <HeaderAdmin/>
      <main className="flex-1 lg:ml-72 flex flex-col h-screen relative overflow-hidden bg-[#121414]">
        <header className="flex items-center justify-between px-6 md:px-10 h-20 bg-[#121414]/80 backdrop-blur-md sticky top-0 z-30 border-b border-white/5">
                  <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all active:scale-95">
                      <span className="material-symbols-outlined text-xl">arrow_back</span>
                    </Link>
                    <h2 className="text-xs font-semibold text-white/60 uppercase tracking-[0.3em]">Hệ thống Quản trị / Thống Kê</h2>
                   
                  </div>
                </header>
                 <section className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 pb-32 lg:pb-10">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-2">
              <h3 className="font-serif text-3xl font-bold text-white leading-tight">Tổng quan hệ thống</h3>
              <p className="text-white/60 max-w-2xl text-base font-light">Giám sát hiệu suất kinh doanh, quản lý luồng khách hàng và tôi ưu hóa vận hành nhà hàng thời gian thực.</p>
            </div>
            
          </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Metric 1: Booking */}




        <div className="bg-white/5 border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <p className="font-label-sm text-on-surface-variant uppercase tracking-widest">Lượt đặt bàn hôm nay</p>
            <span className=" material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          </div>
          <div className="space-y-1">
            <p className="text-4xl font-bold tracking-tight text-white">{data.metrics.todayBookings}</p>
            <p className="text-[10px] text-green-400 font-medium flex items-center gap-1">Cập nhật thời gian thực</p>
          </div>
        </div> 

        {/* Metric 2: Users */}
         <div className="bg-white/5 border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="font-label-sm text-on-surface-variant uppercase tracking-widest">Tổng thành viên</p>
            <span className="material-symbols-outlined text-secondary">person_add</span>
          </div>
          <div className="space-y-1">
            <p className="text-4xl font-bold tracking-tight text-white">{data.metrics.totalMembers.toLocaleString()}</p>
            <p className="text-emerald-500 text-[12px] mt-xs font-bold">+{data.metrics.memberGrowthPercent}% so với tháng trước</p>
          </div>
        </div>
      </div>

      {/* ------------------------------- */}
      {/* CHARTS GRID                     */}
      {/* ------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
     {/* CHART 1: BOOKING ANALYSIS (Đã sửa lỗi lệch cột, lỗi TS và tối ưu Responsive) */}
<section className="lg:col-span-12 bg-[#121414] border border-[#2d2c30] rounded-2xl p-6">
  <div className="flex justify-between items-center mb-md">
    <div>
      <h3 className="font-serif font-bold text-white leading-tight text-2xl" >
        Phân tích đặt bàn chi tiết
      </h3>
      <p className=" font-serif text-label-sm text-on-surface-variant">
        Lưu lượng khách hàng hàng tuần so với công suất tối đa
      </p>
    </div>
    <div className="flex gap-2 bg-[#1c1b1f] p-1 rounded-lg text-xs border border-white/5">
      <button className="px-3 py-1.5 rounded-md text-gray-400 font-medium">Tất cả</button>
      <button className="px-3 py-1.5 rounded-md bg-[#990011] text-white shadow-sm font-medium">Tuần này</button>
    </div>
  </div>
  
  <div className="h-72 w-full px-2">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        data={data.weeklyCapacity} 
        margin={{ top: 10, right: 10, left: -30, bottom: 0 }}
      >
        {/* Ẩn lưới xám ngang dọc */}
        <CartesianGrid stroke="transparent" />
        
        <XAxis 
          dataKey="day" 
          tick={{ fontSize: 11, fill: '#888888', fontWeight: 500 }} 
          axisLine={false} 
          tickLine={false}
          dy={10}
        />
        {/* Ẩn trục số Y */}
        <YAxis hide={true} />
        
        <Tooltip 
          contentStyle={{ backgroundColor: '#1c1b1f', borderColor: '#2d2c30', borderRadius: '8px', fontSize: '12px', color: '#fff', }}
          cursor={{ fill: 'transparent' }}
          itemStyle={{ color: '#fff' }}
        />
        
        {/* VẼ ĐỒNG THỜI CẢ THANH NỀN VÀ CỘT THỰC TẾ TRÊN CÙNG MỘT TRỤC TỌA ĐỘ */}
       <Bar 
  dataKey="bookings" 
  shape={(props: any) => {
    // Lấy chính xác tọa độ x, y và độ rộng width tự động từ hệ thống Recharts
    const { x, y, width, height, payload } = props;
    
    // 1. Lấy chiều cao và tọa độ y tối đa của khung đồ thị
    const bgHeight = props.background?.height || 220; 
    const bgY = props.background?.y || 10;

    // 2. Định hình màu sắc cho cột thực tế dựa vào ngày (payload)
    let barColor = "#555555"; // Màu xám mặc định cho các ngày thường
    if (payload && payload.day === "Thứ 4") barColor = "#800000"; // Đỏ nhung trầm
    if (payload && payload.day === "Thứ 7") barColor = "#a38067"; // Nâu vàng đồng cát

    // Giới hạn độ rộng tối đa của cột để không bị quá béo trên màn hình siêu rộng (ví dụ: tối đa 45px hoặc lấy theo width tự động)
    const finalWidth = Math.min(width, 45);
    // Tính toán lại độ lệch căn giữa (offset) để cột luôn nằm chính giữa ngày
    const offset = (width - finalWidth) / 2;

    return (
      <g>
        {/* LỚP 1: Thanh nền đại diện cho công suất tối đa */}
        <rect 
          x={x + offset} 
          y={bgY} 
          width={finalWidth} 
          height={bgHeight} 
          fill="#222425" 
          opacity={0.5}
          rx={6} 
          ry={6}
        />
        
        {/* LỚP 2: Thanh tiến trình thực tế (Đè khít khao lên thanh nền từ Thứ 2 đến Chủ nhật) */}
        <rect 
          x={x + offset} 
          y={y} 
          width={finalWidth} 
          height={height} 
          fill={barColor} 
          rx={6} 
          ry={6}
        />
      </g>
    );
  }}
/>
      </BarChart>
    </ResponsiveContainer>
  </div>
</section>

        {/* CHART 2: USER GROWTH TREND (AREA CHART) - Kéo rộng ra chiếm 12 cột do bỏ phần loại bàn */}
        <section className="lg:col-span-12 bg-[#121414] border border-[#2d2c30] rounded-2xl p-6 w-full flex flex-col justify-between">
          <div className="mb-6">

          <h3 className="font-serif font-bold text-white leading-tight text-2xl mb-md">Xu hướng tăng trưởng thành viên</h3>
          </div>
          
          <div className="h-64 w-full px-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlyGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffb3ac" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ffb3ac" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' , backgroundColor:'#1c1b1f'}}  />
                <Area type="monotone" dataKey="members" stroke="#ffb3ac" strokeWidth={2} fillOpacity={1} fill="url(#areaGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

         <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4 px-2">
    <div className="flex items-center gap-2">
      {/* Thay màu hồng nhạt khớp với đường line stroke của Area */}
      <div className="w-2.5 h-2.5 rounded-full bg-[#ffb3ac]"></div>
      <span className="text-xs font-medium text-gray-400">Thành viên mới</span>
    </div>
    <p className="text-sm font-bold text-white tracking-wide">+184 tháng này</p>
  </div>
        </section>

      </div>
                    </section>
                {/* Mobile Nav */}
     <FooterAdmin/>
</main>
         </div>
    );
}