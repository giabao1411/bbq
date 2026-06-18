'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);

  // Hàm fetch danh sách đặt bàn
  const fetchBookings = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false });
    if (data) setBookings(data);
  };

  useEffect(() => {
    fetchBookings();

    // KÍCH HOẠT TÍNH NĂNG REALTIME
    // Lắng nghe mọi sự thay đổi (INSERT, UPDATE) trên bảng bookings
    const channels = supabase
      .channel('realtime-bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchBookings(); // Tự động fetch lại dữ liệu khi có thay đổi từ khách hàng
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channels);
    };
  }, []);

  // Hàm cập nhật trạng thái đơn đặt bàn (Xác nhận / Hủy)
  const updateStatus = async (id: number, status: 'confirmed' | 'cancelled') => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id);
    if (error) alert(error.message);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Quản lý Đặt Bàn (Admin Realtime)</h1>
      <table className="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-100 text-left text-sm font-medium text-gray-600">
            <th className="p-4">Khách hàng</th>
            <th className="p-4">Ngày / Giờ</th>
            <th className="p-4">Số khách</th>
            <th className="p-4">Trạng thái</th>
            <th className="p-4">Hành động</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 text-sm">
          {bookings.map((b) => (
            <tr key={b.id}>
              <td className="p-4 font-medium">{b.profiles?.full_name || 'Ẩn danh'}</td>
              <td className="p-4">{b.booking_date} ở {b.booking_time}</td>
              <td className="p-4">{b.guests_count} người</td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  b.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  b.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {b.status}
                </span>
              </td>
              <td className="p-4 space-x-2">
                {b.status === 'pending' && (
                  <>
                    <button onClick={() => updateStatus(b.id, 'confirmed')} className="bg-green-500 text-white px-2 py-1 rounded text-xs">Xác nhận</button>
                    <button onClick={() => updateStatus(b.id, 'cancelled')} className="bg-red-500 text-white px-2 py-1 rounded text-xs">Hủy</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}