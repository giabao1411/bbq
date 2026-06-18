'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*');
    if (data) setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const changeRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'client' : 'admin';
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', id);
    
    if (error) {
      alert(error.message);
    } else {
      fetchUsers(); // Tải lại danh sách
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Quản lý Thành viên (User Management)</h1>
      <div className="bg-white shadow rounded-lg overflow-hidden max-w-4xl">
        <div className="divide-y divide-gray-200">
          {users.map((user) => (
            <div key={user.id} className="p-4 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <img src={user.avatar_url || 'https://via.placeholder.com/40'} alt="Avatar" className="w-10 h-10 rounded-full" />
                <div>
                  <div className="font-medium text-gray-900">{user.full_name}</div>
                  <div className="text-sm text-gray-500">ID: {user.id}</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                  {user.role.toUpperCase()}
                </span>
                <button
                  onClick={() => changeRole(user.id, user.role)}
                  className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-3 rounded"
                >
                  Đổi quyền Admin/Client
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}