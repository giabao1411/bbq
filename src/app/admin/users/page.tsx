'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import HeaderAdmin from '@/components/HeaderAdmin';
import { useRouter, usePathname } from "next/navigation";
interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  email?: string; // Bổ sung nếu bảng profiles có liên kết email, hoặc fallback bằng id
  created_at?: string;
  status?: string; // 'active' hoặc 'suspended'
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const router = useRouter();
  const pathname = usePathname();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2; // Số lượng thành viên trên mỗi trang (Bạn có thể đổi thành 10, 20...)

  // Reset về trang 1 mỗi khi người dùng thay đổi bộ lọc hoặc tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, statusFilter]);
  
  // 1. Bổ sung State để lưu thông tin Admin/User đang đăng nhập hệ thống
  const [currentUser, setCurrentUser] = useState<{ name: string; avatar: string; role: string } | null>(null);
// 2. Hàm lấy thông tin tài khoản đang thao tác (đang đăng nhập)
  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Truy vấn vào bảng profiles để lấy Name và Avatar thật của tài khoản này
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, role')
        .eq('id', user.id)
        .single();

      if (profile) {
        setCurrentUser({
          name: profile.full_name || user.email || 'Ẩn danh',
          avatar: profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100',
          role: profile.role === 'admin' ? 'Tổng quản lý' : 'Nhân viên'
        });
        return;
      }
    }
    
    // Fallback dữ liệu mẫu nếu chưa cấu hình Auth hoặc chạy offline
    setCurrentUser({
      name: "Cao Gia Bảo",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100",
      role: "Tổng quản lý"
    });
  };
  // Lấy dữ liệu thực tế từ bảng profiles của Supabase
  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*');
    if (data) {
      // Chuẩn hóa dữ liệu, gán fallback nếu thiếu trường status/email từ UI mẫu
      const normalized = data.map((u: any) => ({
        ...u,
        role: u.role || 'client',
        status: u.status || 'active',
        email: u.email || `${u.id.substring(0, 8)}@emberandash.com`
      }));
      setUsers(normalized);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, []);

  // Chức năng cũ: Đổi quyền Admin/Client đồng bộ xuống DB
  const changeRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'client' : 'admin';
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', id);
    
    if (error) {
      alert(error.message);
    } else {
      fetchUsers();
    }
  };

  // Tính năng mới bổ sung: Đổi trạng thái Hoạt động / Đình chỉ trực tiếp
  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      alert(error.message);
    } else {
      fetchUsers();
    }
  };

  // Logic lọc dữ liệu động kết hợp giữa Tìm kiếm + Vai trò + Trạng thái
  const filteredUsers = users.filter((user) => {
    const matchesSearch = (user.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (user.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });
  // Tính toán chỉ số phân trang thực tế
  const totalFilteredItems = filteredUsers.length;
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage) || 1;
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  
  // ĐÂY LÀ MẢNG DỮ LIỆU THỰC TẾ DÙNG ĐỂ MAP RA TABLE
  const currentDisplayedUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  // Đếm số liệu thống kê thực tế từ DB để hiển thị lên 4 ô Cards hàng đầu
  const totalStaff = users.length;
  const activeStaff = users.filter(u => u.status === 'active').length;
  const pendingStaff = users.filter(u => u.status === 'pending').length;
  const getNavLinkClass = (path: string) => {
    const baseClass = "flex flex-col items-center justify-center";
    const activeClass = " text-white";
    const inactiveClass = " text-white/40";

    return baseClass + (pathname === path ? activeClass : inactiveClass);
  };

  return (
    <div className="flex min-h-screen overflow-hidden font-body-md bg-[#0c0f0f] text-[#e2e2e2]">
      
      <HeaderAdmin/>

      {/* Main Content Container (Bên phải) */}
      <main className="flex-1 lg:ml-72 flex flex-col h-screen relative overflow-hidden bg-[#121414]">
        
        {/* Header chuẩn duy nhất - Đã tích hợp nút quay về Home */}
        <header className="flex items-center justify-between px-6 md:px-10 h-20 bg-[#121414]/80 backdrop-blur-md sticky top-0 z-30 border-b border-white/5">
          <div className="flex items-center gap-4">
            
            {/* NÚT VỀ HOME (BACK BUTTON) */}
            <Link 
              href="/" 
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all active:scale-95"
              title="Quay về trang chủ"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </Link>

           
            
            <h2 className="text-xs font-semibold text-white/60 uppercase tracking-[0.3em]">Hệ thống Quản trị / Người dùng</h2>
          </div>
        </header>

        {/* Scrollable View Area */}
        <section className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 pb-32 lg:pb-10">
          
          {/* Welcome Area & CTA */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-2">
              <h3 className="font-serif text-3xl font-bold text-white leading-tight">Quản lý người dùng</h3>
              <p className="text-white/60 max-w-2xl text-base font-light">Giám sát quyền hạn, thay đổi vai trò trực tuyến và điều hành nhân viên nhà hàng.</p>
            </div>
            <button className="bg-[#93000a] text-white px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-3 hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-[#93000a]/20">
              <span className="material-symbols-outlined text-sm">person_add</span>
              Thêm Thành Viên
            </button>
          </div>

          {/* Stats Real-time BIND DATA */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/5 border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] text-white/50 uppercase tracking-widest">Tổng thành viên (DB)</span>
                <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
              </div>
              <div className="space-y-1">
                <div className="text-4xl font-bold tracking-tight text-white">{totalStaff}</div>
                <div className="text-[10px] text-green-400 font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">trending_up</span> +12% tháng này
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] text-white/50 uppercase tracking-widest">Đang hoạt động</span>
                <span className="material-symbols-outlined text-sm text-amber-500">bolt</span>
              </div>
              <div className="space-y-1">
                <div className="text-4xl font-bold tracking-tight text-white">{activeStaff}</div>
                <div className="text-[10px] text-white/40">Tài khoản hợp lệ</div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] text-white/50 uppercase tracking-widest">Bị đình chỉ</span>
                <span className="material-symbols-outlined text-sm text-red-400">pending</span>
              </div>
              <div className="space-y-1">
                <div className="text-4xl font-bold tracking-tight text-white">{users.filter(u => u.status === 'suspended').length}</div>
                <div className="text-[10px] text-red-400/80 underline cursor-pointer">Xem chi tiết</div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 bg-white/[0.02] p-6 rounded-2xl flex flex-col justify-between">
              <span className="text-[10px] text-white/50 uppercase tracking-widest mb-4">Hiệu suất DB</span>
              <div className="flex items-end gap-1 h-12">
                <div className="w-full bg-white/10 h-[60%] rounded-t-sm"></div>
                <div className="w-full bg-white/10 h-[40%] rounded-t-sm"></div>
                <div className="w-full bg-white/20 h-[80%] rounded-t-sm"></div>
                <div className="w-full bg-white/40 h-[90%] rounded-t-sm"></div>
              </div>
              <span className="text-[10px] text-white/40 mt-2">Độ trễ Supabase: 18ms</span>
            </div>
          </div>

          {/* Interactive Filter and Search Inputs */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 border border-white/5 p-4 rounded-2xl">
            <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
              <input 
                type="text" 
                placeholder="Tìm tên hoặc email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#1e2020] text-sm text-white px-4 py-2 rounded-xl border border-white/5 focus:outline-none focus:border-red-500 w-full md:w-60"
              />
              
              <select 
                value={roleFilter} 
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-[#1e2020] text-xs px-4 py-2 rounded-xl border border-white/5 text-white/80 focus:outline-none cursor-pointer"
              >
                <option value="all">Vai trò: Tất cả</option>
                <option value="admin">Vai trò: Admin</option>
                <option value="client">Vai trò: Client</option>
              </select>

              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#1e2020] text-xs px-4 py-2 rounded-xl border border-white/5 text-white/80 focus:outline-none cursor-pointer"
              >
                <option value="all">Trạng thái: Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="suspended">Đình chỉ</option>
              </select>
            </div>
          </div>

          {/* Table Bind Data Supabase */}
          <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="px-8 py-5 text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">Hồ sơ thành viên</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">Email liên hệ / ID</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">Vai trò (DB)</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] text-center">Trạng thái</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] text-right">Thao tác dữ liệu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {currentDisplayedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <div className={`w-14 h-14 rounded-2xl bg-neutral-800 overflow-hidden group-hover:scale-105 transition-transform duration-500 shadow-xl ${user.status === 'suspended' ? 'opacity-40 grayscale' : ''}`}>
                            <img className="w-full h-full object-cover" src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop'} alt="Avatar" />
                          </div>
                          <div className={user.status === 'suspended' ? 'opacity-40' : ''}>
                            <p className="font-serif text-base text-white tracking-tight font-bold">{user.full_name || 'Chưa cập nhật'}</p>
                            <p className="text-[10px] text-white/40 uppercase mt-1">ID: {user.id.substring(0, 12)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`text-sm font-light ${user.status === 'suspended' ? 'text-white/20' : 'text-white/60'}`}>{user.email}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-2 h-2 rounded-full ${user.role === 'admin' ? 'bg-purple-400' : 'bg-neutral-500'}`}></span>
                          <span className="text-xs font-bold text-white uppercase tracking-wider">{user.role}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        {user.status === 'active' ? (
                          <span className="px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] bg-green-500/10 text-green-400 border border-green-500/20">Hoạt động</span>
                        ) : (
                          <span className="px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] bg-red-500/10 text-red-400 border border-red-500/20">Đình chỉ</span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => changeRole(user.id, user.role)}
                            title="Đổi quyền Admin/Client"
                            className="text-xs bg-white/5 hover:bg-white/10 text-white/80 py-2 px-3 rounded-lg border border-white/10 transition-colors"
                          >
                            Đổi Quyền
                          </button>
                          <button 
                            onClick={() => toggleStatus(user.id, user.status || 'active')}
                            className="p-2 text-white/60 hover:bg-white/5 rounded-lg transition-colors"
                            title={user.status === 'active' ? "Đình chỉ tài khoản" : "Kích hoạt lại"}
                          >
                            <span className={`material-symbols-outlined text-lg ${user.status === 'active' ? 'hover:text-red-400' : 'hover:text-green-400'}`}>
                              {user.status === 'active' ? 'block' : 'lock_open'}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {currentDisplayedUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-sm text-white/40">Không tìm thấy thành viên nào khớp bộ lọc.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination UI bottom */}
            <div className="bg-white/5 px-8 py-5 flex items-center justify-between border-t border-white/5">
              <p className="text-[10px] text-white/50 uppercase tracking-widest">
                Hiển thị <span className="text-white font-bold">{Math.min(indexOfFirstItem + 1, totalFilteredItems)}</span> đến{' '}
                <span className="text-white font-bold">{Math.min(indexOfLastItem, totalFilteredItems)}</span> trên tổng số{' '}
                <span className="text-white font-bold">{totalFilteredItems}</span> thành viên đã lọc
              </p>

              <div className="flex items-center gap-2">
                {/* Nút Quay lại trang trước (Prev) */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`p-1.5 rounded-lg bg-white/5 transition-colors ${currentPage === 1 ? 'text-white/20 cursor-not-allowed' : 'text-white/80 hover:bg-white/10'
                    }`}
                >
                  <span className="material-symbols-outlined text-xs">chevron_left</span>
                </button>

                {/* Hiển thị danh sách số trang trực quan */}
                {Array.from({ length: totalPages }, (_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`w-10 h-10 rounded-lg text-xs font-bold transition-all ${currentPage === pageNumber
                          ? 'bg-[#93000a] text-white shadow-md'
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                {/* Nút Sang trang tiếp theo (Next) */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`p-1.5 rounded-lg bg-white/5 transition-colors ${currentPage === totalPages ? 'text-white/20 cursor-not-allowed' : 'text-white/80 hover:bg-white/10'
                    }`}
                >
                  <span className="material-symbols-outlined text-xs">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Navigation (Bottom Bar) */}
        <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 px-4 bg-[#121414]/95 backdrop-blur-lg border-t border-white/5">
          <a className={getNavLinkClass("/")} href="/">
            <span className="material-symbols-outlined">home</span>
            <span className="text-[10px] uppercase font-bold mt-1">Trang chủ</span>
          </a>
          <a className={getNavLinkClass("/admin/users")} href="/admin/users">
            <span className="material-symbols-outlined">group</span>
            <span className="text-[10px] uppercase font-bold mt-1">Người dùng</span>
          </a>
          <a className={getNavLinkClass("/#menu")} href="/#menu">
            <span className="material-symbols-outlined">menu_book</span>
            <span className="text-[10px] uppercase font-bold mt-1">Món ăn</span>
          </a>
          <a className={getNavLinkClass("/admin/bookings")} href="/admin/bookings">
            <span className="material-symbols-outlined transition-transform group-hover:scale-110">event_available</span>
            <span className="text-sm font-medium tracking-wide">Quản lý đặt bàn</span>
          </a>
        </nav>
      </main>
    </div>
  );
}