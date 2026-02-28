import React, { useState } from 'react';
import { Users, Plus, Search, Edit2, Trash2, Shield, Wrench, Stethoscope, Package } from 'lucide-react';
import BackButton from '../../components/ui/BackButton';

interface UserData {
  id: string;
  name: string;
  role: string;
  department: string;
  status: 'active' | 'inactive';
}

const mockUsers: UserData[] = [
  { id: 'ENG-001', name: 'أحمد علي', role: 'Engineer', department: 'الهندسة الطبية', status: 'active' },
  { id: 'ENG-002', name: 'سارة محمد', role: 'Engineer', department: 'الهندسة الطبية', status: 'active' },
  { id: 'NUR-001', name: 'فاطمة حسن', role: 'Nurse', department: 'العناية المركزة', status: 'active' },
  { id: 'STR-001', name: 'عمر خالد', role: 'StoreManager', department: 'المخزن المركزي', status: 'active' },
];

const UserManagementView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'engineers' | 'nurses'>('all');
  const [users] = useState<UserData[]>(mockUsers);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.includes(searchTerm) || user.id.includes(searchTerm);
    if (activeTab === 'engineers') return matchesSearch && user.role === 'Engineer';
    if (activeTab === 'nurses') return matchesSearch && user.role === 'Nurse';
    return matchesSearch;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin': return <Shield className="w-5 h-5 text-indigo-500" />;
      case 'Engineer': return <Wrench className="w-5 h-5 text-medical-500" />;
      case 'Nurse': return <Stethoscope className="w-5 h-5 text-emerald-500" />;
      case 'StoreManager': return <Package className="w-5 h-5 text-amber-500" />;
      default: return <Users className="w-5 h-5 text-slate-500" />;
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'Admin': return 'مدير نظام';
      case 'Engineer': return 'مهندس طبي';
      case 'Nurse': return 'كادر طبي';
      case 'StoreManager': return 'أمين مخزن';
      default: return role;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 pt-12 pb-6 px-6 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">إدارة المستخدمين</h1>
              <p className="text-sm text-slate-500">إضافة وتعديل صلاحيات المهندسين والموظفين</p>
            </div>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="البحث عن مستخدم بالاسم أو الرقم الوظيفي..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all text-sm ${
              activeTab === 'all'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setActiveTab('engineers')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 ${
              activeTab === 'engineers'
                ? 'bg-white dark:bg-slate-700 text-medical-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <Wrench className="w-4 h-4" />
            المهندسين
          </button>
          <button
            onClick={() => setActiveTab('nurses')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 ${
              activeTab === 'nurses'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            الكادر الطبي
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="p-6 space-y-4">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center shrink-0">
                {getRoleIcon(user.role)}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-lg">{user.name}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="font-mono">{user.id}</span>
                  <span>•</span>
                  <span>{getRoleName(user.role)}</span>
                  <span>•</span>
                  <span>{user.department}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl flex items-center justify-center transition-colors">
                <Edit2 className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">لا يوجد مستخدمين</h3>
            <p className="text-slate-500">لم يتم العثور على مستخدمين يطابقون بحثك.</p>
          </div>
        )}
      </div>

      {/* Add User Modal (Placeholder) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] p-6 animate-in slide-in-from-bottom-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">إضافة مستخدم جديد</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">الاسم الكامل</label>
                <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="مثال: أحمد علي" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">الدور / الصلاحية</label>
                <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="Engineer">مهندس طبي (Engineer)</option>
                  <option value="Admin">مدير نظام (Admin)</option>
                  <option value="Nurse">كادر طبي (Nurse)</option>
                  <option value="StoreManager">أمين مخزن (Store Manager)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">القسم</label>
                <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="مثال: العناية المركزة" />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                إلغاء
              </button>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all"
              >
                إضافة المستخدم
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementView;
