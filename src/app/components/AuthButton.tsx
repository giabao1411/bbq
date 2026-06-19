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
    const displayName = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0];
    const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || "https://via.placeholder.com/40";
    const isAdmin = profile?.role === "admin" || user.user_metadata?.role === "admin";

    return (
      <div className="flex items-center gap-sm bg-surface-container-low border border-outline-variant/30 rounded-full py-1.5 pl-2 pr-4 backdrop-blur-md">
        {/* Avatar khách hàng */}
        <img 
          src={avatarUrl} 
          alt="Avatar" 
          className="w-8 h-8 rounded-full object-cover border border-outline-variant/50"
        />
        
        {/* Thông tin tên và nút chuyển đổi nhanh */}
        <div className="flex flex-col text-left">
          <span className="text-xs font-semibold text-on-surface line-clamp-1 max-w-[120px]">
            {displayName}
          </span>
          {isAdmin ? (
            <Link href="/admin" className="text-[10px] text-tertiary-fixed-dim font-bold uppercase tracking-wider hover:underline">
              Bàn Quản Trị
            </Link>
          ) : (
            <Link href="/booking" className="text-[10px] text-outline hover:text-on-surface transition-colors">
              Lịch đặt bàn
            </Link>
          )}
        </div>

        {/* Nút Đăng xuất */}
        <button 
          onClick={handleSignOut}
          className="material-symbols-outlined text-outline hover:text-flame-red text-lg ml-xs transition-colors cursor-pointer"
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