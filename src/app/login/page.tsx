"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from '@/lib/supabase';
// import { useSearchParams } from "next/navigation";


export default function LoginPage() {
  const [xy, setXy] = useState({ x: 0, y: 0 });

  // Xử lý hiệu ứng Micro-interaction: Parallax background theo di chuột
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const amount = 10;
      const x = (e.clientX / window.innerWidth - 0.5) * amount;
      const y = (e.clientY / window.innerHeight - 0.5) * amount;
      setXy({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  // const searchParams = useSearchParams();
  // const nextTarget = searchParams.get("next") || "/";
  const handleGoogleLogin = async () => {
    try {
      // LẤY NEXT TARGET TRỰC TIẾP TỪ WINDOW
      const params = new URLSearchParams(window.location.search);
      const nextTarget = params.get("next") || "/";
      // Đính kèm mục tiêu điều hướng tiếp theo vào link callback
      const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextTarget)}`;
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callbackUrl },
      });
    } catch (error) {
      console.error("Lỗi đăng nhập Google:", error);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      // Đính kèm mục tiêu điều hướng tiếp theo vào link callback
      // LẤY NEXT TARGET TRỰC TIẾP TỪ WINDOW
      const params = new URLSearchParams(window.location.search);
      const nextTarget = params.get("next") || "/";
      const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextTarget)}`;
      await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: { redirectTo:callbackUrl },
      });
    } catch (error) {
      console.error("Lỗi đăng nhập Facebook:", error);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md overflow-x-hidden relative">
      
      {/* Background Hero Container */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div
          className="w-full h-full relative bg-cover bg-center transition-transform duration-100 ease-out"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1469&auto=format&fit=crop')",
            transform: `scale(1.05) translate(${xy.x}px, ${xy.y}px)`,
          }}
          data-alt="A high-end, cinematic close-up of a premium outdoor fire pit at night."
        >
          {/* Lớp overlay làm tối sâu chuẩn luxury */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
        </div>
      </div>

      {/* Main Content Canvas */}
      <main className="relative z-10 flex-grow flex items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-md animate-fade-in">
          
          {/* Login Card với Glassmorphism */}
          <div className="bg-zinc-900/70 rounded-2xl p-8 shadow-2xl border border-zinc-800/80 backdrop-blur-xl flex flex-col items-center text-center space-y-6">
            
            {/* Brand Anchor */}
            <div>
              <h1 className="text-4xl font-bold tracking-tighter text-white uppercase" style={{ fontFamily: 'serif' }}>
                SMOKE & OAK
              </h1>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mt-2">
                Premium Smokehouse
              </p>
            </div>

            {/* Welcome Text */}
            <div className="space-y-1 w-full">
              <h2 className="text-xl font-semibold text-white">Chào mừng trở lại</h2>
              <p className="text-sm text-zinc-400">Chọn phương thức đăng nhập để tiếp tục</p>
            </div>

            {/* Login Buttons Cluster */}
            <div className="w-full space-y-3 pt-2">
              
              {/* Google Login */}
              <button
                onClick={handleGoogleLogin}
                className="w-full h-14 bg-white hover:bg-zinc-100 text-zinc-900 font-medium rounded-lg flex items-center justify-center gap-3 transition-all duration-300 active:scale-95 shadow-md cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.39-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                <span className="text-sm font-semibold">Đăng nhập với Google</span>
              </button>

              {/* Facebook Login */}
              <button
                onClick={handleFacebookLogin}
                className="w-full h-14 bg-[#1877F2] hover:bg-[#166fe5] text-white font-medium rounded-lg flex items-center justify-center gap-3 transition-all duration-300 active:scale-95 shadow-md cursor-pointer"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                </svg>
                <span className="text-sm font-semibold">Đăng nhập với Facebook</span>
              </button>
            </div>

            {/* Footer Link */}
            <div className="pt-6 w-full border-t border-zinc-800/60">
              <Link
                className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
                href="/"
              >
                <span>←</span> Quay lại Trang chủ
              </Link>
            </div>
          </div>

          {/* Legal/Fine Print */}
          <p className="mt-4 text-center text-xs text-zinc px-4">
            Bằng cách tiếp tục, bạn đồng ý với Điều khoản Dịch vụ và Chính sách Bảo mật của Smoke & Oak.
          </p>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="relative z-10 w-full py-6 flex justify-center opacity-60">
        <p className="text-xs text-zinc tracking-wider">
          © 2026 SMOKE & OAK SMOKEHOUSE. ALL RIGHTS RESERVED.
        </p>
      </footer>
    </div>
  );
}