"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from '@/lib/supabase'; 

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        alert("Lỗi đăng nhập: " + error.message);
      } else {
        window.location.href = "/";
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    } catch (error) {
      console.error("Lỗi đăng nhập Google:", error);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    } catch (error) {
      console.error("Lỗi đăng nhập Facebook:", error);
    }
  };

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen flex flex-col items-center justify-center relative overflow-x-hidden w-full px-4">
      
      {/* 1. Sửa hình nền (Khắc phục lỗi vỡ ảnh và làm tối nền sâu hơn như ảnh 1) */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div 
          className="w-full h-full bg-cover bg-center scale-110 blur-[3px] opacity-30" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000')" }} // Bạn thay URL ảnh thật vào đây nhé
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80"></div>
      </div>

      {/* Login Container */}
      <main className="relative z-10 w-full max-w-[440px] py-12 flex flex-col items-center">
        
        {/* Brand Identity */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-widest text-white mb-2" style={{ fontFamily: 'serif' }}>SMOKE & OAK</h1>
          <p className="text-sm text-zinc-400 italic">Elevated Live-Fire Dining</p>
        </header>

        {/* Form Card -> THAY P-MD THÀNH P-8 ĐỂ TẠO KHOẢNG ĐỆM TRONG */}
        <div className="w-full bg-zinc-900/70 rounded-2xl p-8 shadow-2xl border border-zinc-800/80 backdrop-blur-md">
          {/* Sửa space-y-md thành space-y-5 */}
          <form className="space-y-5" onSubmit={handleLoginSubmit}>
            
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest" htmlFor="email">
                Email
              </label>
              <div className="relative flex items-center group">
               
                {/* Thay thế input từ dạng gạch chân viền đáy (border-b) thành dạng hộp bo góc nhẹ như ảnh mẫu 1 */}
                <input 
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg focus:border-amber-600 text-zinc-100 py-3 pl-12 pr-4 transition-all outline-none text-sm placeholder-zinc-600" 
                  id="email" 
                  placeholder="email@example.com" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest" htmlFor="password">
                  Mật khẩu
                </label>
                <Link className="text-xs text-amber-600/90 hover:text-amber-500 transition-colors" href="/forgot-password">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative flex items-center group">
                
                <input 
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg focus:border-amber-600 text-zinc-100 py-3 pl-12 pr-4 transition-all outline-none text-sm placeholder-zinc-600" 
                  id="password" 
                  placeholder="••••••••" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Button Đăng Nhập Đỏ */}
            <button 
              className="w-full bg-red-700 hover:bg-red-600 text-white font-semibold text-sm uppercase py-3.5 rounded-lg tracking-widest active:scale-[0.99] transition-all duration-200 mt-4 shadow-lg shadow-red-900/20 cursor-pointer disabled:opacity-50" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Đăng Nhập"}
            </button>
          </form>

          {/* Divider -> Sửa py-lg thành py-6 */}
          <div className="relative flex items-center py-6">
            <div className="flex-grow border-t border-zinc-800"></div>
            <span className="flex-shrink mx-4 text-xs text-zinc-500 uppercase tracking-widest font-medium">Hoặc</span>
            <div className="flex-grow border-t border-zinc-800"></div>
          </div>

          {/* Social Logins Section -> Sửa gap-gutter thành gap-4 */}
          <div className="grid grid-cols-2 gap-4">
            {/* Google Button */}
            <button 
              type="button" 
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-zinc-950/40 border border-zinc-800 rounded-lg hover:bg-zinc-800/60 transition-colors active:scale-95 duration-200 cursor-pointer"
            >
              <img alt="Google" className="w-4 h-4" src="https://www.svgrepo.com/show/475656/google-color.svg" />
              <span className="text-xs font-medium text-zinc-200">Google</span>
            </button>

            {/* Facebook Button */}
            <button 
              type="button" 
              onClick={handleFacebookLogin}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-zinc-950/40 border border-zinc-800 rounded-lg hover:bg-zinc-800/60 transition-colors active:scale-95 duration-200 cursor-pointer"
            >
              <img alt="Facebook" className="w-4 h-4" src="https://www.svgrepo.com/show/475647/facebook-color.svg" />
              <span className="text-xs font-medium text-zinc-200">Facebook</span>
            </button>
          </div>
        </div>

        {/* Secondary Navigation */}
        <div className="mt-6 text-center">
          <p className="text-sm text-zinc-400">
            Bạn chưa có tài khoản? 
            <Link className="text-amber-600 font-semibold hover:underline ml-1" href="/register">
              Đăng ký tài khoản
            </Link>
          </p>
        </div>
      </main>

      {/* Footer Identity */}
      <footer className="mt-auto py-6 text-center relative z-10 w-full">
        <p className="text-xs text-zinc-500">© 2024 Smoke & Oak Premium BBQ. All Rights Reserved.</p>
        <div className="flex justify-center gap-4 mt-2">
          <Link className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors" href="/terms">
            Điều khoản
          </Link>
          <Link className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors" href="/privacy">
            Bảo mật
          </Link>
        </div>
      </footer>
    </div>
  );
}