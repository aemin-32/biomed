
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search, Filter, Plus, Building2, MapPin } from 'lucide-react';
import { DEVICES, LOCATIONS } from '../../core/database/mockData';
import { Device, DeviceStatus } from '../../core/database/types';
import DeviceListItem from './components/DeviceListItem';
import AddDeviceModal from './components/AddDeviceModal';
import { useLanguage } from '../../core/context/LanguageContext';

const DeviceListView: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // Data State
  const [devices, setDevices] = useState<Device[]>(DEVICES);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | DeviceStatus>('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [roomFilter, setRoomFilter] = useState('All');
  
  const [showAddModal, setShowAddModal] = useState(false);

  // Sync with global mock data on mount
  useEffect(() => {
      setDevices([...DEVICES]);
  }, []);

  // Filter Logic
  const filteredDevices = useMemo(() => {
    return devices.filter(device => {
      // 1. Text Search (Smart)
      const term = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        device.name.toLowerCase().includes(term) ||
        device.id.toLowerCase().includes(term) ||
        device.model.toLowerCase().includes(term) ||
        (device.location && device.location.toLowerCase().includes(term)) ||
        (device.department && device.department.toLowerCase().includes(term)) ||
        (device.responsiblePerson && device.responsiblePerson.toLowerCase().includes(term));
      
      // 2. Status Filter
      const matchesStatus = statusFilter === 'All' || device.status === statusFilter;

      // 3. Department Filter
      const matchesDept = deptFilter === 'All' || device.department === deptFilter;

      // 4. Room Filter
      const matchesRoom = roomFilter === 'All' || (device.location && device.location.includes(roomFilter));

      return matchesSearch && matchesStatus && matchesDept && matchesRoom;
    });
  }, [devices, searchQuery, statusFilter, deptFilter, roomFilter]);

  // --- Dynamic Dropdown Data ---
  const departments = LOCATIONS.filter(l => l.type === 'Department' && l.isEnabled);

  const rooms = useMemo(() => {
    let availableRooms = LOCATIONS.filter(l => l.type === 'Room' && l.isEnabled);
    
    if (deptFilter !== 'All') {
        const selectedDeptObj = departments.find(d => d.name === deptFilter);
        
        if (selectedDeptObj) {
            availableRooms = availableRooms.filter(r => r.parentId === selectedDeptObj.id);
        } else {
            availableRooms = [];
        }
    }
    return availableRooms;
  }, [deptFilter, departments]);

  useEffect(() => {
      setRoomFilter('All');
  }, [deptFilter]);

  const handleSaveDevice = (newDevice: Device) => {
    DEVICES.unshift(newDevice);
    setDevices(prev => [newDevice, ...prev]);
    setShowAddModal(false);
  };

  const getStatusLabel = (s: string) => {
      if (s === 'All') return t('devices.status_all');
      if (s === 'Operational') return t('devices.status_operational');
      if (s === 'Maintenance') return t('devices.status_maintenance');
      if (s === 'Down') return t('devices.status_down');
      return s;
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans transition-colors overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')} 
            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-white leading-none">{t('devices.title')}</h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                {t('devices.total_registered').replace('{count}', devices.length.toString())}
            </p>
          </div>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="p-2 bg-medical-600 hover:bg-medical-700 text-white rounded-xl shadow-md transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Advanced Filter Section - Optimized for Mobile */}
      <div className="p-4 space-y-3 shrink-0">
        
        {/* 1. Main Search Bar */}
        <div className="relative">
          <input 
            type="text" 
            placeholder={t('devices.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pr-10 pl-4 rtl:pl-10 rtl:pr-4 text-sm font-bold focus:outline-none focus:border-medical-500 focus:ring-1 focus:ring-medical-500 transition-all text-slate-800 dark:text-white placeholder-slate-400 shadow-sm"
          />
          <Search className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>

        {/* 2. Dropdowns Row */}
        <div className="flex gap-2">
            {/* Department Dropdown */}
            <div className="relative flex-1">
                <select
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg py-2 pr-7 pl-2 rtl:pl-7 rtl:pr-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
                >
                    <option value="All">{t('devices.filter_dept_all')}</option>
                    {departments.map(dept => (
                        <option key={dept.id} value={dept.name}>{dept.name}</option>
                    ))}
                </select>
                <Building2 className="absolute right-2 rtl:right-auto rtl:left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-indigo-500 pointer-events-none" />
            </div>

            {/* Room Dropdown (Filtered) */}
            <div className="relative flex-1">
                <select
                    value={roomFilter}
                    onChange={(e) => setRoomFilter(e.target.value)}
                    disabled={rooms.length === 0}
                    className={`w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg py-2 pr-7 pl-2 rtl:pl-7 rtl:pr-2 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all shadow-sm ${rooms.length === 0 ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                    <option value="All">{rooms.length === 0 ? '---' : t('devices.filter_room_all')}</option>
                    {rooms.map(room => (
                        <option key={room.id} value={room.name}>{room.name}</option>
                    ))}
                </select>
                <MapPin className={`absolute right-2 rtl:right-auto rtl:left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none ${rooms.length === 0 ? 'text-slate-300' : 'text-purple-500'}`} />
            </div>
        </div>

        {/* 3. Status Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {['All', 'Operational', 'Maintenance', 'Down'].map((status) => (
             <button
               key={status}
               onClick={() => setStatusFilter(status as any)}
               className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all whitespace-nowrap ${
                 statusFilter === status
                   ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-800 dark:border-slate-100 shadow-sm'
                   : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
               }`}
             >
               {getStatusLabel(status)}
             </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 custom-scrollbar">
        {filteredDevices.map((device) => (
          <DeviceListItem key={device.id} device={device} />
        ))}
        
        {filteredDevices.length === 0 && (
           <div className="text-center py-12">
             <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
               <Filter className="w-8 h-8" />
             </div>
             <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">{t('devices.no_results')}</p>
             <button 
                onClick={() => {
                    setSearchQuery('');
                    setDeptFilter('All');
                    setRoomFilter('All');
                    setStatusFilter('All');
                }}
                className="mt-3 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-medical-600 hover:shadow-md transition-all"
             >
                 {t('devices.clear_filters')}
             </button>
          </div>
        )}
      </div>

      {/* Add Device Modal */}
      <AddDeviceModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveDevice}
        existingDevices={devices}
      />

    </div>
  );
};

export default DeviceListView;
