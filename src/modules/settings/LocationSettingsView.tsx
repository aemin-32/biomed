
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Plus, Building2, MapPin, Trash2, Power, PowerOff, CornerDownRight, Filter, Hash } from 'lucide-react';
import { LOCATIONS } from '../../core/database/mockData';
import { LocationConfig } from '../../core/database/types';

const LocationSettingsView: React.FC = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<LocationConfig[]>(LOCATIONS);
  
  // Form States
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState(''); // e.g. 'A'

  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomCode, setNewRoomCode] = useState(''); // e.g. '1'
  
  const [selectedDeptForRoom, setSelectedDeptForRoom] = useState(''); 

  // Filtering lists
  const departments = locations.filter(l => l.type === 'Department');
  const allRooms = locations.filter(l => l.type === 'Room');

  // Dynamic Filtering for Display
  const displayedRooms = allRooms.filter(room => {
      if (!selectedDeptForRoom) return true;
      return room.parentId === selectedDeptForRoom;
  });

  // Logic
  const handleAddDept = () => {
    if (!newDeptName.trim() || !newDeptCode.trim()) {
        alert("يرجى إدخال اسم القسم والرمز (الحرف)");
        return;
    }
    const newItem: LocationConfig = {
        id: `DEP-${Date.now()}`,
        name: newDeptName.trim(),
        code: newDeptCode.trim().toUpperCase(),
        type: 'Department',
        isEnabled: true
    };
    saveLocation(newItem);
    setNewDeptName('');
    setNewDeptCode('');
  };

  const handleAddRoom = () => {
    if (!newRoomName.trim() || !newRoomCode.trim()) {
        alert("يرجى إدخال اسم الغرفة والرمز (الرقم)");
        return;
    }
    const newItem: LocationConfig = {
        id: `RM-${Date.now()}`,
        name: newRoomName.trim(),
        code: newRoomCode.trim(),
        type: 'Room',
        isEnabled: true,
        parentId: selectedDeptForRoom || undefined
    };
    saveLocation(newItem);
    setNewRoomName('');
    setNewRoomCode('');
  };

  const saveLocation = (item: LocationConfig) => {
    setLocations([...locations, item]);
    LOCATIONS.push(item);
  };

  const handleToggle = (id: string) => {
    const updated = locations.map(l => 
        l.id === id ? { ...l, isEnabled: !l.isEnabled } : l
    );
    setLocations(updated);
    
    const index = LOCATIONS.findIndex(l => l.id === id);
    if (index !== -1) {
        LOCATIONS[index].isEnabled = !LOCATIONS[index].isEnabled;
    }
  };

  const getDeptName = (id?: string) => {
      const d = departments.find(dep => dep.id === id);
      return d ? d.name : 'عام';
  };

  const getDeptCode = (id?: string) => {
      const d = departments.find(dep => dep.id === id);
      return d ? d.code : '?';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/settings')} 
          className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">إدارة المواقع (الترميز)</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">تكويد الأقسام (A, B) والغرف (1, 2) للاستيراد</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Departments Section */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col h-full">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-indigo-50/50 dark:bg-indigo-900/10 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                    الأقسام (A, B, C...)
                </h3>
                <span className="text-xs font-bold text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    {departments.length}
                </span>
            </div>
            
            {/* Add New */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex gap-2">
                    <div className="w-20">
                        <input 
                            type="text" 
                            value={newDeptCode}
                            onChange={(e) => setNewDeptCode(e.target.value.toUpperCase())}
                            placeholder="A"
                            maxLength={2}
                            className="w-full text-center bg-white dark:bg-slate-950 border-2 border-indigo-100 dark:border-indigo-900/50 focus:border-indigo-500 rounded-xl px-2 py-2.5 text-sm font-bold focus:outline-none uppercase"
                        />
                    </div>
                    <input 
                        type="text" 
                        value={newDeptName}
                        onChange={(e) => setNewDeptName(e.target.value)}
                        placeholder="اسم القسم (مثال: الطوارئ)"
                        className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddDept()}
                    />
                    <button 
                        onClick={handleAddDept}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl shadow-lg shadow-indigo-500/20"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 mx-1">
                    * الحرف (Code) سيستخدم في ملفات Excel لربط الأجهزة بهذا القسم.
                </p>
            </div>

            {/* List */}
            <div className="p-2 flex-1 overflow-y-auto custom-scrollbar max-h-[400px]">
                {departments.map(dept => (
                    <div key={dept.id} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors group">
                        <div className="flex items-center gap-3">
                            {/* Code Badge */}
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                                dept.isEnabled 
                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' 
                                : 'bg-slate-200 text-slate-500 dark:bg-slate-800'
                            }`}>
                                {dept.code || '?'}
                            </div>
                            <span className={`font-bold text-sm ${dept.isEnabled ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 line-through'}`}>
                                {dept.name}
                            </span>
                        </div>
                        <button 
                            onClick={() => handleToggle(dept.id)}
                            className={`p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 ${
                                dept.isEnabled 
                                ? 'text-green-600 bg-green-50 dark:bg-green-900/20 hover:bg-green-100' 
                                : 'text-slate-400 bg-slate-100 dark:bg-slate-800 hover:text-red-500'
                            }`}
                        >
                            {dept.isEnabled ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                        </button>
                    </div>
                ))}
            </div>
        </section>

        {/* 2. Rooms Section */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col h-full">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-purple-50/50 dark:bg-purple-900/10 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    الغرف (1, 2, 3...)
                </h3>
                <span className="text-xs font-bold text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    {displayedRooms.length}
                </span>
            </div>
            
            {/* Add New & Filter */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                
                {/* Select Department Logic */}
                <div className="relative">
                    <select
                        value={selectedDeptForRoom}
                        onChange={(e) => setSelectedDeptForRoom(e.target.value)}
                        className={`w-full bg-white dark:bg-slate-950 border rounded-xl px-4 py-3 pl-12 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer ${
                            selectedDeptForRoom 
                            ? 'border-purple-500 text-purple-700 dark:text-purple-400 bg-purple-50/30' 
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                    >
                        <option value="">عرض الكل / إضافة لعام</option>
                        {departments.filter(d => d.isEnabled).map(d => (
                            <option key={d.id} value={d.id}>[{d.code}] {d.name}</option>
                        ))}
                    </select>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400 pointer-events-none">
                       <Filter className="w-4 h-4" />
                    </div>
                </div>

                <div className="flex gap-2">
                    <div className="w-20">
                        <input 
                            type="text" 
                            value={newRoomCode}
                            onChange={(e) => setNewRoomCode(e.target.value)}
                            placeholder="1"
                            className="w-full text-center bg-white dark:bg-slate-950 border-2 border-purple-100 dark:border-purple-900/50 focus:border-purple-500 rounded-xl px-2 py-2.5 text-sm font-bold focus:outline-none"
                        />
                    </div>
                    <input 
                        type="text" 
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        placeholder="اسم الغرفة (مثال: الرنين)"
                        className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddRoom()}
                    />
                    <button 
                        onClick={handleAddRoom}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-xl shadow-lg shadow-purple-500/20"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="p-2 flex-1 overflow-y-auto custom-scrollbar max-h-[400px]">
                {displayedRooms.length > 0 ? (
                    displayedRooms.map(room => (
                        <div key={room.id} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors group">
                            <div className="flex-1 flex items-center gap-3">
                                {/* Room Code */}
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm border ${
                                    room.isEnabled 
                                    ? 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800' 
                                    : 'bg-slate-100 text-slate-400 border-slate-200'
                                }`}>
                                    {room.code || '#'}
                                </div>

                                <div>
                                    <div className={`font-bold text-sm ${room.isEnabled ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 line-through'}`}>
                                        {room.name}
                                    </div>
                                    {/* Parent Badge */}
                                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                                        <CornerDownRight className="w-3 h-3" />
                                        <span className="bg-slate-100 dark:bg-slate-800 px-1.5 rounded">
                                            [{getDeptCode(room.parentId)}] {getDeptName(room.parentId)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleToggle(room.id)}
                                className={`p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 ${
                                    room.isEnabled 
                                    ? 'text-green-600 bg-green-50 dark:bg-green-900/20 hover:bg-green-100' 
                                    : 'text-slate-400 bg-slate-100 dark:bg-slate-800 hover:text-red-500'
                                }`}
                            >
                                {room.isEnabled ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-slate-400">
                        <p className="text-sm">لا توجد غرف مضافة هنا</p>
                    </div>
                )}
            </div>
        </section>

      </div>
    </div>
  );
};

export default LocationSettingsView;
