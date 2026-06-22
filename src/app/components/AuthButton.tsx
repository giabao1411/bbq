"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from '@/lib/supabase';

// 1. TẠO MỘT HOOK ĐỂ DÙNG CHUNG LOGIC CHO CẢ WEB VÀ MOBILE
export function useAuthStatus() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user);
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  // Trả ra các thông tin cần thiết để các component khác map giao diện
  const displayName = profile?.full_name || user?.user_metadata?.nickname || user?.email?.split("@")[0];
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || "https://via.placeholder.com/40";
  const isAdmin = profile?.role === "admin" || user?.user_metadata?.role === "admin";

  return { user, profile, loading, handleSignOut, displayName, avatarUrl, isAdmin };
}

// 2. COMPONENT CHÍNH DÀNH CHO HEADER TRÊN WEB (GIỮ NGUYÊN UI CŨ)
export default function AuthButton() {
  const { user, loading, handleSignOut, displayName, avatarUrl, isAdmin } = useAuthStatus();

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-red-700 animate-spin" />
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-4 bg-[#1e2020] hover:bg-zinc-800 border border-zinc-700/40 rounded-full py-2 pl-2 pr-5 backdrop-blur-md transition-all duration-300 shadow-sm group">
        <img 
          src={avatarUrl} 
          alt="Avatar" 
          className="w-9 h-9 rounded-full object-cover border border-zinc-600/60 shadow-inner shrink-0"
        />
        <div className="flex flex-col text-left leading-tight whitespace-nowrap min-w-[100px]">
          <span className="text-sm font-semibold text-white line-clamp-1 max-w-[160px] tracking-wide">
            {displayName}
          </span>
          {isAdmin ? (
            <Link href="/admin/users" className="text-[10px] text-red-400 font-bold uppercase tracking-widest hover:underline mt-0.5">
              Ban Quản Trị
            </Link>
          ) : (
            <Link href="/booking" className="text-[10px] text-zinc-400 hover:text-white transition-colors tracking-wider mt-0.5">
              Lịch đặt bàn
            </Link>
          )}
        </div>

        <div className="h-5 w-[1px] bg-zinc-700/30 ml-2 shrink-0" /> 
        
        <button 
          onClick={handleSignOut}
          className="material-symbols-outlined text-zinc-400 hover:text-red-500 text-xl ml-2 transition-colors cursor-pointer shrink-0 hover:scale-105 active:scale-95 duration-200"
          title="Đăng xuất"
        >
          logout
        </button>
      </div>
    );
  }

  return (
    <Link 
      href="/login"
      className="flex items-center gap-2 bg-[#1e2020] border border-zinc-700/50 hover:bg-zinc-800 text-white text-xs font-semibold uppercase py-2 px-5 rounded-full tracking-widest transition-all duration-200 no-underline active:scale-95"
    >
      <span className="material-symbols-outlined text-sm">account_circle</span>
      Đăng Nhập
    </Link>
  );
}