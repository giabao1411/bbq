"use client"
import Link from 'next/link';
import AuthButton from '@/app/components/AuthButton'; // Đảm bảo đường dẫn này đúng với cấu trúc dự án của bạn

export default function HomePage() {
  return (
    <div className="bg-[#121414] text-[#e2e2e2] font-sans antialiased min-h-screen selection:bg-[#ffb3ac] selection:text-[#680008]">
      
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#1a1c1c] shadow-md flex items-center justify-between px-[20px] h-16 transition-all">
        {/* Nút Menu bên trái */}
        <div className="flex items-center gap-3 active:scale-95 transition-transform cursor-pointer">
          <span className="material-symbols-outlined text-[#c8c6c5]">menu</span>
        </div>
        
        {/* Tên thương hiệu ở giữa */}
        <Link href="/" className="font-serif text-2xl font-bold text-[#e2e2e2] tracking-tighter uppercase no-underline">
          SMOKE & OAK
        </Link>
        
        {/* Cụm chức năng bên phải: Giỏ hàng + Nút Đăng nhập/Profile tự động bind dữ liệu */}
        <div className="flex items-center gap-md">
          {/* Biểu tượng túi hàng cũ của bạn */}
          <div className="flex items-center gap-3 active:scale-95 transition-transform cursor-pointer text-[#c8c6c5] hover:text-white">
            <span className="material-symbols-outlined">shopping_bag</span>
          </div>

          {/* NHÚNG COMPONENT XỬ LÝ AUTH DỮ LIỆU TẠI ĐÂY */}
          <AuthButton />
        </div>
      </header>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative h-[751px] w-full overflow-hidden flex items-center">
          <div className="absolute inset-0 z-0">
            <div 
              className="w-full h-full bg-cover bg-center" 
              style={{ 
                backgroundImage: `url('https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1469&auto=format&fit=crop')`,
                backgroundColor: '#121414'
              }}
            ></div>
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#121414] via-transparent to-transparent"></div>
          </div>
          
          <div className="relative z-10 px-[20px] md:px-16 w-full max-w-5xl mx-auto text-center md:text-left">
            <span className="inline-block px-4 py-1 mb-6 bg-[#a40213] text-[#ffdad6] rounded-full text-sm font-semibold uppercase tracking-widest">
              Premium BBQ Steakhouse
            </span>
            <h1 className="font-serif text-4xl md:text-6xl mb-6 leading-tight text-white font-bold">
              Thưởng Thức Hương Vị<br />
              <span className="text-[#ffb786]">Nướng Đích Thực</span>
            </h1>
            <p className="text-lg text-[#c4c7c7] max-w-xl mb-10">
              Trải nghiệm nghệ thuật nướng củi thượng hạng với những tảng thịt được hun khói chậm rãi trong 12 giờ, hòa quyện cùng hương gỗ sồi đặc trưng.
            </p>
            <div className="flex flex-col md:flex-row gap-3">
              <Link 
                href="/booking" 
                className="px-16 py-4 bg-[#ffb3ac] text-[#680008] font-semibold text-center rounded-lg active:scale-95 transition-all shadow-lg shadow-[#ffb3ac]/20 uppercase tracking-wider no-underline"
              >
                Đặt Bàn Ngay
              </Link>
              <a 
                href="#menu" 
                className="px-16 py-4 border border-[#8e9192] text-[#e2e2e2] font-semibold text-center rounded-lg active:scale-95 transition-all hover:bg-[#333535] uppercase tracking-wider no-underline"
              >
                Xem Thực Đơn
              </a>
            </div>
          </div>
        </section>

        {/* Featured Menu Bento Grid */}
        <section id="menu" className="py-16 px-[20px] max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
            <div>
              <h2 className="font-serif text-3xl font-bold mb-1">Món Ăn Đặc Trưng</h2>
              <p className="text-[#c4c7c7]">Sự kết hợp tinh túy giữa nguyên liệu thượng hạng và kỹ thuật hun khói thủ công.</p>
            </div>
            <a className="text-[#ffb3ac] font-semibold flex items-center gap-1 border-b border-[#ffb3ac]/30 pb-1 hover:text-white transition-colors no-underline" href="#">
              Xem tất cả <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Signature Ribs - Large Card */}
            <div className="md:col-span-8 group relative overflow-hidden rounded-xl bg-[#1e2020] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/40">
              <div className="aspect-[16/9] overflow-hidden">
                <img 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1469&auto=format&fit=crop" 
                  alt="Signature Smoked Ribs"
                />
              </div>
              <div className="p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-serif text-2xl font-semibold">Signature Smoked Ribs</h3>
                    <div className="flex gap-1 text-[#ffb786] mt-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      ))}
                    </div>
                  </div>
                  <span className="font-serif text-2xl font-semibold text-[#ffb3ac]">450k</span>
                </div>
                <p className="text-[#c4c7c7] mb-6">Sườn heo được tẩm ướp 24h với 18 loại gia vị bí truyền, hun khói bằng gỗ sồi trong 6 giờ liên tục cho đến khi thịt mềm tan.</p>
                <button className="w-fit flex items-center gap-1 font-semibold text-[#ffb3ac] uppercase hover:text-white transition-colors cursor-pointer">
                  Thêm vào giỏ hàng <span className="material-symbols-outlined">add_circle</span>
                </button>
              </div>
            </div>

            {/* Brisket - Small Card */}
            <div className="md:col-span-4 group relative overflow-hidden rounded-xl bg-[#1e2020] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/40">
              <div className="aspect-square overflow-hidden">
                <img 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  src="https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?q=80&w=1470&auto=format&fit=crop" 
                  alt="Texas Beef Brisket"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-serif text-xl font-semibold">Texas Beef Brisket</h3>
                  <span className="font-semibold text-[#ffb3ac]">520k</span>
                </div>
                <div className="flex gap-1 text-[#ffb786] mb-4 scale-75 origin-left">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
                <button className="mt-4 w-full py-2 border border-[#444748] hover:bg-[#ffb3ac] hover:text-[#680008] rounded-lg transition-colors font-semibold text-xs uppercase tracking-wider cursor-pointer">
                  Chi tiết
                </button>
              </div>
            </div>

            {/* Grilled Veggies - Small Card */}
            <div className="md:col-span-4 group relative overflow-hidden rounded-xl bg-[#1e2020] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/40">
              <div className="aspect-square overflow-hidden">
                <img 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1374&auto=format&fit=crop" 
                  alt="Fire-Grilled Veggies"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-serif text-xl font-semibold">Fire-Grilled Veggies</h3>
                  <span className="font-semibold text-[#ffb3ac]">180k</span>
                </div>
                <div className="flex gap-1 text-[#ffb786] mb-4 scale-75 origin-left">
                  {[...Array(4)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>star</span>
                </div>
                <button className="mt-4 w-full py-2 border border-[#444748] hover:bg-[#ffb3ac] hover:text-[#680008] rounded-lg transition-colors font-semibold text-xs uppercase tracking-wider cursor-pointer">
                  Chi tiết
                </button>
              </div>
            </div>

            {/* Special Offer - Long Card */}
            <div className="md:col-span-8 flex flex-col md:flex-row bg-[#2e1200] text-[#ffdcc6] rounded-xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/40">
              <div className="flex-1 p-8 flex flex-col justify-center">
                <h3 className="font-serif text-3xl font-bold mb-2">Combo Gia Đình</h3>
                <p className="mb-4 opacity-90 text-sm">Thưởng thức trọn bộ các món signature cùng đồ uống thủ công cho 4 người với mức giá ưu đãi đặc biệt.</p>
                <div className="text-3xl font-serif font-bold text-white mb-6">
                  1.299k <span className="text-sm line-through opacity-60 ml-2">1.650k</span>
                </div>
                <button className="w-fit px-8 py-3 bg-[#ffdcc6] text-[#311300] font-bold rounded-lg uppercase text-sm tracking-wider hover:bg-white transition-colors cursor-pointer">
                  Mua Ngay
                </button>
              </div>
              <div className="flex-1 h-64 md:h-auto overflow-hidden">
                <img 
                  className="w-full h-full object-cover" 
                  src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1481&auto=format&fit=crop" 
                  alt="Family Combo Platter"
                />
              </div>
            </div>
          </div>
        </section>

        {/* About Us - Wood Fired Process */}
        <section className="bg-[#1a1c1c] py-16 overflow-hidden">
          <div className="max-w-7xl mx-auto px-[20px] flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 relative">
              <div className="absolute -top-12 -left-12 w-64 h-64 bg-[#ffb3ac]/5 blur-[100px] rounded-full"></div>
              <img 
                className="rounded-xl shadow-2xl relative z-10 w-full h-[500px] object-cover" 
                src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1469&auto=format&fit=crop" 
                alt="Wood fire smoking process"
              />
            </div>
            <div className="md:w-1/2">
              <span className="text-[#ffb3ac] font-semibold text-sm uppercase tracking-widest mb-2 block">Nghệ Khoa Lửa Củi</span>
              <h2 className="font-serif text-4xl font-bold mb-6 leading-tight">Quy Trình Chế Biến<br />Công Phu</h2>
              <p className="text-[#c4c7c7] text-lg mb-8">Tại Smoke & Oak, chúng tôi không dùng điện hay gas. Mọi món ăn đều được chế biến bằng sức nóng từ lửa củi sồi tự nhiên. Thịt được hun khói chậm (Low & Slow) trong hầm ủ nhiệt độ thấp, giúp giữ trọn vẹn nước thịt và tạo nên lớp vỏ giòn rụm (bark) hoàn hảo.</p>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#ffb3ac] text-3xl">timer</span>
                  <div>
                    <h4 className="font-semibold text-[#e2e2e2]">12 Giờ Hun Khói</h4>
                    <p className="text-xs text-[#c4c7c7]">Cho hương vị thấm sâu nhất.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#ffb3ac] text-3xl">local_fire_department</span>
                  <div>
                    <h4 className="font-semibold text-[#e2e2e2]">Củi Sồi Tự Nhiên</h4>
                    <p className="text-xs text-[#c4c7c7]">Tạo hương thơm đặc trưng.</p>
                  </div>
                </div>
              </div>
              <button className="mt-10 flex items-center gap-3 text-[#e2e2e2] font-semibold group uppercase text-sm tracking-wider cursor-pointer bg-transparent border-none">
                Tìm hiểu thêm về chúng tôi 
                <span className="w-12 h-px bg-[#8e9192] group-hover:w-16 transition-all"></span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>

        {/* Newsletter / CTA */}
        <section className="py-16 px-[20px] text-center bg-[#121414] relative overflow-hidden">
          <div className="max-w-3xl mx-auto relative z-10">
            <h2 className="font-serif text-4xl font-bold mb-4">Nhận Ưu Đãi Đặc Biệt</h2>
            <p className="text-[#c4c7c7] text-lg mb-8">Đăng ký để nhận thông tin về các món mới và ưu đãi độc quyền dành riêng cho khách hàng thân thiết.</p>
            <form className="flex flex-col md:flex-row gap-3 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input 
                className="flex-1 bg-[#1e2020] border border-[#444748] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#ffb3ac] focus:outline-none text-[#e2e2e2]" 
                placeholder="Email của bạn" 
                type="email"
              />
              <button className="bg-[#ffb3ac] text-[#680008] font-semibold px-8 py-3 rounded-lg uppercase text-sm tracking-wider hover:bg-white transition-colors cursor-pointer">
                Đăng Ký
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#0c0f0f] border-t border-[#444748]/20 flex flex-col items-center gap-4 py-10 px-[20px] text-center mb-20 md:mb-0">
        <div className="font-serif text-2xl text-[#c8c6c5] font-bold uppercase tracking-tighter mb-2">SMOKE & OAK</div>
        <div className="flex flex-wrap justify-center gap-6 mb-4">
          <a className="text-[#c4c7c7] text-xs hover:text-white transition-colors no-underline" href="#">Contact Us</a>
          <a className="text-[#c4c7c7] text-xs hover:text-white transition-colors no-underline" href="#">Privacy Policy</a>
          <a className="text-[#c4c7c7] text-xs hover:text-white transition-colors no-underline" href="#">Terms of Service</a>
          <a className="text-[#c4c7c7] text-xs hover:text-white transition-colors no-underline" href="#">Locations</a>
        </div>
        <p className="text-[#c4c7c7] text-sm opacity-60">© 2026 Smoke & Oak Premium BBQ. All Rights Reserved.</p>
      </footer>

      {/* BottomNavBar (Mobile only) */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 rounded-t-xl bg-[#1e2020] border-t border-[#444748]/30 shadow-[0_-4px_12px_rgba(0,0,0,0.3)] flex justify-around items-center h-20 px-2 pb-safe">
        <Link href="/" className="flex flex-col items-center justify-center text-[#ffb3ac] font-bold active:scale-90 transition-transform no-underline">
          <span className="material-symbols-outlined">home</span>
          <span className="text-xs">Home</span>
        </Link>
        <a href="#menu" className="flex flex-col items-center justify-center text-[#c4c7c7] active:scale-90 transition-transform hover:text-[#ffb3ac] no-underline">
          <span className="material-symbols-outlined">restaurant_menu</span>
          <span className="text-xs">Menu</span>
        </a>
        <Link href="/booking" className="flex flex-col items-center justify-center text-[#c4c7c7] active:scale-90 transition-transform hover:text-[#ffb3ac] no-underline">
          <span className="material-symbols-outlined">event_available</span>
          <span className="text-xs">Book Now</span>
        </Link>
        <Link href="/login" className="flex flex-col items-center justify-center text-[#c4c7c7] active:scale-90 transition-transform hover:text-[#ffb3ac] no-underline">
          <span className="material-symbols-outlined">person</span>
          <span className="text-xs">Login</span>
        </Link>
      </nav>
    </div>
  );
}