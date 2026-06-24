"use client"
import Link from 'next/link';
import  { useState } from 'react';
import { useAuthStatus } from '@/app/components/AuthButton';
import { usePathname } from 'next/navigation';
export default function MenuUserForMobile(){
    const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user, avatarUrl, loading, displayName, handleSignOut } = useAuthStatus();
  const pathName = usePathname();
  const getNavActiveLink = (path : string) => {
    console.log(path);
    return "flex flex-col items-center justify-center " + (pathName === path? "text-[#ffb3ac] font-bold active:scale-90 transition-transform no-underline":"text-[#c4c7c7] active:scale-90 transition-transform hover:text-[#ffb3ac] no-underline");
  }
  return (<>
  {/* BottomNavBar (Mobile only) */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 rounded-t-xl bg-[#1e2020] border-t border-[#444748]/30 shadow-[0_-4px_12px_rgba(0,0,0,0.3)] flex justify-around items-center h-20 px-2 pb-safe">
        <Link href="/" className={getNavActiveLink("/")}>
          <span className="material-symbols-outlined">home</span>
          <span className="text-xs">Home</span>
        </Link>
        <a href="/#menu" className={getNavActiveLink("/#menu")}>
          <span className="material-symbols-outlined">restaurant_menu</span>
          <span className="text-xs">Menu</span>
        </a>
        <Link href="/booking" className={getNavActiveLink("/booking")}>
          <span className="material-symbols-outlined">event_available</span>
          <span className="text-xs">Book Now</span>
        </Link>
       {/* XỬ LÝ ĐỘNG NÚT AUTH TRÊN MOBILE */}
        {loading ? (
          <div className="flex flex-col items-center justify-center">
            <div className="w-5 h-5 rounded-full border-2 border-zinc-600 border-t-red-400 animate-spin" />
          </div>
        ) : user ? (
          <div className="relative flex flex-col items-center justify-center">
            
            {/* MENU BẢNG CHỌN (DROPDOWN) HIỆN LÊN KHI BẤM VÀO AVATAR */}
            {showMobileMenu && (
              <>
                {/* Lớp nền trong suốt phía sau để bấm ra ngoài thì tự đóng menu */}
                <div 
                  className="fixed inset-0 z-40 bg-black/10" 
                  onClick={() => setShowMobileMenu(false)}
                />
                
                {/* Khối menu nổi lên phía trên nút bấm */}
                <div className="absolute bottom-20 right-0 z-50 min-w-[160px] bg-[#1e2020] border border-zinc-700/50 rounded-xl p-2 shadow-2xl flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="px-3 py-1.5 border-b border-zinc-700/30 mb-1">
                    <p className="text-xs text-zinc-400">Tài khoản</p>
                    <p className="text-xs font-semibold text-white truncate max-w-[130px]">{displayName}</p>
                  </div>
                  
                  <Link 
                    href="/booking-history" 
                    className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 rounded-lg no-underline"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <span className="material-symbols-outlined text-sm">event_available</span>
                    Lịch đặt bàn
                  </Link>
                  
                  <button 
                    onClick={() => {
                      setShowMobileMenu(false);
                      handleSignOut();
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-950/30 rounded-lg w-full text-left border-none bg-transparent cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">logout</span>
                    Đăng xuất
                  </button>
                </div>
              </>
            )}

            {/* NÚT AVATAR CHÍNH */}
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="flex flex-col items-center justify-center text-[#c4c7c7] active:scale-90 transition-transform bg-transparent border-none p-0 cursor-pointer"
            >
              <img 
                src={avatarUrl} 
                alt="Profile" 
                className={`w-6 h-6 rounded-full object-cover shadow-sm transition-all ${showMobileMenu ? 'ring-2 ring-red-700' : 'border border-zinc-600'}`}
              />
              <span className="text-xs mt-1 text-zinc-300">Tôi</span>
            </button>

          </div>
        ) : (
          /* NẾU CHƯA ĐĂNG NHẬP: Hiện nút Login mặc định cũ */
          <Link href="/login" className="flex flex-col items-center justify-center text-[#c4c7c7] active:scale-90 transition-transform hover:text-[#ffb3ac] no-underline">
            <span className="material-symbols-outlined">person</span>
            <span className="text-xs">Login</span>
          </Link>
        )}
      </nav>
  </>);
}