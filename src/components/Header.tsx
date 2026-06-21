"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation"; // Import thêm usePathname
import { supabase } from "@/lib/supabase";
import AuthButton from '@/app/components/AuthButton';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname(); // Lấy đường dẫn hiện tại của trang (ví dụ: "/", "/booking")
 

  

  // Hàm helper để kiểm tra xem link có đang active hay không
  // và trả về class CSS tương ứng
  const getNavLinkClass = (path: string) => {
    const baseClass = "transition uppercase tracking-widest text-sm ";
    const activeClass = "text-red-700 border-b-2 border-red-700 font-medium";
    const inactiveClass = "text-zinc-400 hover:text-white";

    return baseClass + (pathname === path ? activeClass : inactiveClass);
  };

  return (
    <header className="border-b border-zinc-800/50 bg-[#0E1111]/90 backdrop-blur sticky top-0 z-50 w-full">
 
  <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-20 grid grid-cols-3 items-center">
    
   
    <div className="flex justify-start">
      <div 
        className="text-xl font-bold tracking-wider font-serif cursor-pointer shrink-0" 
        onClick={() => router.push('/')}
      >
        SMOKE &amp; OAK
      </div>
    </div>
    
    
    <nav className="hidden md:flex justify-center space-x-8 text-sm shrink-0">
      <Link href="/" className={getNavLinkClass("/")}>
        Home
      </Link>
      <Link href="/menu" className={getNavLinkClass("/menu")}>
        Menu
      </Link>
      <Link href="/booking" className={getNavLinkClass("/booking")}>
        Reservations
      </Link>
      
    </nav>
    
    
    <div className="flex items-center justify-end space-x-6 text-sm shrink-0">
      <button className="bg-red-700 hover:bg-red-800 text-white px-5 py-2.5 rounded-sm font-medium transition duration-200 uppercase tracking-wider text-xs whitespace-nowrap">
        Join Club
      </button>
      
      {/* Component xử lý Auth của bạn */}
      <AuthButton />
    </div>

  </div>
</header>
  );
}