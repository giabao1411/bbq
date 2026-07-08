"use client"
import { usePathname,useRouter } from "next/navigation"
import Link from "next/link"
export default function FooterAdmin(){
    const pathname = usePathname()
    const getNavLinkClass = (path: string) => {
    return "flex flex-col items-center justify-center" + (pathname === path ? " text-white" : " text-white/40");
  };
    return (<>
                {/* Mobile Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 px-4 bg-[#121414]/95 backdrop-blur-lg border-t border-white/5">
          <a className={getNavLinkClass("/")} href="/"><span className="material-symbols-outlined">home</span><span className="text-[10px] uppercase font-bold mt-1">Trang chủ</span></a>
          <a className={getNavLinkClass("/admin/users")} href="/admin/users"><span className="material-symbols-outlined">group</span><span className="text-[10px] uppercase font-bold mt-1">Người dùng</span></a>
          <a className={getNavLinkClass("/#menu")} href="/#menu"><span className="material-symbols-outlined">menu_book</span><span className="text-[10px] uppercase font-bold mt-1">Món ăn</span></a>
          <a className={getNavLinkClass("/admin/bookings")} href="/admin/bookings"><span className="material-symbols-outlined">event_available</span><span className="text-[10px] uppercase font-bold mt-1">Đặt bàn</span></a>
          <a className={getNavLinkClass("/admin/dashboard")} href="/admin/dashboard"><span className="material-symbols-outlined">dashboard</span><span className="text-[10px] uppercase font-bold mt-1">Thống kê</span></a>
        </nav>
    </>);
}