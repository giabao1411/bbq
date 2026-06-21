"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from '@/lib/supabase';

export default function AuthButton() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
 

  useEffect(() => {
    const getSession = async () => {
      setLoading(true);
      
      // 1. Lấy thông tin user hiện tại từ Auth Session
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // 2. Bind thêm dữ liệu (Tên, Role, Avatar) từ bảng profiles đã mở khóa RLS ở bước trước
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        setProfile(profileData);
      }
      
      setLoading(false);
    };

    getSession();

    // Lắng nghe trạng thái Auth thay đổi thực tế (Đăng nhập / Đăng xuất)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          // Fetch lại profile nếu trạng thái đổi sang đăng nhập
          supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single()
            .then(({ data }) => setProfile(data));
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Hàm Đăng xuất
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload(); // Tải lại trang để cập nhật lại trạng thái sạch sẽ
  };

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full border-2 border-outline-variant border-t-tertiary-fixed-dim animate-spin" />
    );
  }

  // TRƯỜNG HỢP: ĐÃ ĐĂNG NHẬP (Bind thông tin User / Admin)
  if (user) {
    const displayName = profile?.full_name || user.user_metadata?.nickname || user.email?.split("@")[0];
    const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || "https://via.placeholder.com/40";
    const isAdmin = profile?.role === "admin" || user.user_metadata?.role === "admin";

    return (
      <div className="flex items-center gap-4 bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/40 rounded-full py-2 pl-2 pr-5 backdrop-blur-md transition-all duration-300 shadow-sm group">
  {/* Avatar khách hàng - Tăng kích thước lên một chút (w-9 h-9) để tạo điểm nhấn */}
  <img 
    src={avatarUrl} 
    alt="Avatar" 
    className="w-9 h-9 rounded-full object-cover border border-outline-variant/60 shadow-inner shrink-0"
  />
  
  {/* Thông tin tên và nút chuyển đổi nhanh - Nới rộng diện tích hiển thị */}
  <div className="flex flex-col text-left leading-tight whitespace-nowrap min-w-[100px]">
    {/* Tăng cỡ chữ lên text-sm, nới rộng max-w từ 120px lên 160px để tên không bị cắt quá sớm */}
    <span className="text-sm font-semibold text-on-surface line-clamp-1 max-w-[160px] tracking-wide">
      {displayName}
    </span>
    {isAdmin ? (
      <Link href="/admin" className="text-[10px] text-tertiary-fixed-dim font-bold uppercase tracking-widest hover:underline mt-0.5">
        Ban Quản Trị
      </Link>
    ) : (
      <Link href="/booking" className="text-[10px] text-outline hover:text-on-surface transition-colors tracking-wider mt-0.5">
        Lịch đặt bàn
      </Link>
    )}
  </div>

  {/* Nút Đăng xuất - Tạo đường vạch ngăn cách (divider) tinh tế và đẩy dịch sang phải một chút */}
  <div className="h-5 w-[1px] bg-outline-variant/30 ml-2 shrink-0" /> {/* Vạch ngăn cách dọc kiểu Premium */}
  
  <button 
    onClick={handleSignOut}
    className="material-symbols-outlined text-outline hover:text-flame-red text-xl ml-2 transition-colors cursor-pointer shrink-0 hover:scale-105 active:scale-95 duration-200"
    title="Đăng xuất"
  >
    logout
  </button>
</div>
    );
  }

  // TRƯỜNG HỢP: CHƯA ĐĂNG NHẬP (Hiển thị nút Đăng Nhập)
  return (
    <Link 
      href="/login"
      className="flex items-center gap-xs bg-surface border border-outline-variant/50 hover:bg-surface-container-high text-on-surface text-xs font-semibold uppercase py-2 px-5 rounded-full tracking-widest transition-all duration-200 no-underline active:scale-95"
    >
      <span className="material-symbols-outlined text-sm">account_circle</span>
      Đăng Nhập
    </Link>
  );
}