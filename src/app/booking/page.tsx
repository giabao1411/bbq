'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function BookingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ date: '', time: '', guests: 2 });
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Kiểm tra xem User đã đăng nhập chưa
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUserId(user.id);
      }
    };
    checkUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);

    const { error } = await supabase.from('bookings').insert([
      {
        user_id: userId,
        booking_date: formData.date,
        booking_time: formData.time,
        guests_count: formData.guests,
        status: 'pending' // Mặc định là chờ duyệt
      }
    ]);

    setLoading(false);
    if (error) {
      alert('Đặt bàn thất bại: ' + error.message);
    } else {
      alert('Đặt bàn thành công! Vui lòng chờ nhà hàng xác nhận.');
      setFormData({ date: '', time: '', guests: 2 });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Đặt Bàn BBQ</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Ngày đặt</label>
          <input
            type="date"
            required
            className="w-full border p-2 rounded"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Giờ đặt</label>
          <input
            type="time"
            required
            className="w-full border p-2 rounded"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Số lượng khách</label>
          <input
            type="number"
            min="1"
            required
            className="w-full border p-2 rounded"
            value={formData.guests}
            onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white p-2 rounded font-medium"
        >
          {loading ? 'Sử lý...' : 'Xác nhận đặt bàn'}
        </button>
      </form>
    </div>
  );
}