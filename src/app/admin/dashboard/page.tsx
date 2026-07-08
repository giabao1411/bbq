"use client"
import { useEffect,useState } from 'react';
import { supabase } from '@/lib/supabase';
import HeaderAdmin from '@/components/HeaderAdmin'
import Link from 'next/link';
import { useRouter, usePathname } from "next/navigation";
import FooterAdmin from '@/components/FooterAdmin'
export default function AdminDashBoard (){
    
  
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
                        <h1>DashBoard</h1>
                    </section>
                {/* Mobile Nav */}
     <FooterAdmin/>
</main>
         </div>
    );
}