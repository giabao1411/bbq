"use client"

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation"; // Import thêm usePathname
import { supabase } from "@/lib/supabase";
import AuthButton,{useAuthStatus} from '@/app/components/AuthButton';
 

export default function HeaderAdmin(){
const router = useRouter();
  const pathname = usePathname(); // Lấy đường dẫn hiện tại của trang (ví dụ: "/", "/booking")
 const {displayName ,avatarUrl,profile ,handleSignOut} = useAuthStatus();

  

  // Hàm helper để kiểm tra xem link có đang active hay không
  // và trả về class CSS tương ứng
  const getNavLinkClass = (path: string) => {
    const baseClass = "flex items-center gap-4 ";
    const activeClass = "bg-[#93000a] text-white rounded-xl px-4 py-3.5 shadow-xl shadow-[#93000a]/10 transition-transform active:scale-95";
    const inactiveClass = "text-white/60 hover:text-white px-4 py-3.5 rounded-xl hover:bg-white/5 transition-all cursor-pointer group";

    return baseClass + (pathname === path ? activeClass : inactiveClass);
  };
    return (
    <> {/* 1. Thêm Fragment bọc ngoài cùng vì có nhiều khối đồng cấp */}
      
      {/* Glassmorphism Sidebar (Bên trái) */}
      <aside className="hidden lg:flex flex-col h-screen fixed left-0 top-0 w-72 z-40 bg-white/5 border-r border-white/5 backdrop-blur-md">
        <div className="p-10">
          <h1 className="font-serif text-2xl font-bold uppercase tracking-[0.2em] leading-none text-white">Smoke &amp; Oak</h1>
          <p className="text-[10px] text-white/40 tracking-[0.3em] uppercase mt-2">Hệ thống Quản trị</p>
        </div>
        
        <nav className="flex-1 mt-4 px-4 space-y-1">
          {/* SỬA LỖI: Đổi <lin thành <a thông thường như các nút dưới */}
          <Link className={getNavLinkClass("/admin/dashboard")} href="/admin/dashboard">
            <span className="material-symbols-outlined transition-transform group-hover:scale-110">dashboard</span>
            <span className="text-sm font-medium tracking-wide">Dashboard</span>
          </Link>
          
          <Link className={getNavLinkClass("/admin/users")} href="/admin/users">
            <span className="material-symbols-outlined">group</span>
            <span className="text-sm font-medium tracking-wide">Quản lý người dùng</span>
          </Link>
          
          <Link className={getNavLinkClass("/admin/menu")} href="#">
            <span className="material-symbols-outlined transition-transform group-hover:scale-110">restaurant_menu</span>
            <span className="text-sm font-medium tracking-wide">Danh mục món ăn</span>
          </Link>
          
          <Link className={getNavLinkClass("/admin/bookings")} href="/admin/bookings">
            <span className="material-symbols-outlined transition-transform group-hover:scale-110">event_available</span>
            <span className="text-sm font-medium tracking-wide">Quản lý đặt bàn</span>
          </Link>
        </nav>

        {/* User Profile động ở cuối Sidebar */}
        <div className="p-4 m-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-2">
          
          {/* Khối bên trái: Gồm Avatar + Thông tin chữ */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden shrink-0">
              <img 
                className="w-full h-full object-cover" 
                src={avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100'} 
                alt="User Avatar" 
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{displayName || 'Đang tải...'}</p>
              <p className="text-[10px] text-white/50 uppercase tracking-tighter truncate">{profile?.role || 'Hệ thống'}</p>
            </div>
          </div>
          
          {/* Khối bên phải: Vạch ngăn cách và Nút bấm Đăng xuất */}
          <div className="flex items-center shrink-0">
            {/* Vạch kẻ dọc mờ */}
            <div className="h-5 w-[1px] bg-zinc-700/50 mr-2 shrink-0" /> 
            
            {/* Nút bấm logout */}
            <button 
              onClick={handleSignOut}
              className="material-symbols-outlined text-zinc-400 hover:text-red-400 text-xl transition-all cursor-pointer shrink-0 hover:scale-110 active:scale-95 duration-200 bg-transparent border-none p-1 flex items-center justify-center"
              title="Đăng xuất"
            >
              logout
            </button>
          </div>

        </div>

        
      </aside>

      {/* Cụm nút Logout nằm độc lập bên ngoài Sidebar (cho mobile/topbar) */}
       {/* SỬA LỖI: Dấu đóng này giờ đã có thẻ mở tương ứng ở trên */}

    </>
  );
}
