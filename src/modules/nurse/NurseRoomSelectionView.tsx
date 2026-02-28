
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  BedDouble,
  LayoutGrid,
  Search,
  ChevronDown,
  X,
  Activity,
  AlertTriangle,
  CheckCircle,
  Wrench,
  Filter
} from 'lucide-react';
import { useAuth } from '../../core/context/AuthContext';
import { LOCATIONS, DEVICES } from '../../core/database/mockData';
import LogoutButton from '../../components/ui/LogoutButton';

const NurseRoomSelectionView: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUserRooms } = useAuth();
  
  // Initialize selection from existing user data or empty
  const [selectedRooms, setSelectedRooms] = useState<string[]>(user?.responsibleRooms || []);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Toggle State: Store IDs of collapsed departments
  const [collapsedDepts, setCollapsedDepts] = useState<string[]>([]);

  // Room Details Modal State
  const [viewingRoom, setViewingRoom] = useState<any | null>(null);

  // Group Rooms by Department for better UI
  const locationGroups = useMemo(() => {
    const depts = LOCATIONS.filter(l => l.type === 'Department' && l.isEnabled);
    const rooms = LOCATIONS.filter(l => l.type === 'Room' && l.isEnabled);

    // 1. Map rooms to departments
    const groups = depts.map(dept => ({
        dept,
        rooms: rooms.filter(r => r.parentId === dept.id)
    })).filter(group => group.rooms.length > 0);

    // 2. Handle Orphan Rooms (General/No Parent)
    const orphanRooms = rooms.filter(r => !r.parentId || !depts.find(d => d.id === r.parentId));
    if (orphanRooms.length > 0) {
        groups.push({
            dept: { id: 'general', name: 'مواقع عامة / أخرى', code: 'GEN', type: 'Department', isEnabled: true },
            rooms: orphanRooms
        });
    }

    return groups;
  }, []);

  // Filter Logic - Supports Names, Dept Codes (A, B), and Room Codes (1, 2)
  const filteredGroups = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return locationGroups;

    // Smart Regex for "A 1" or "A1" pattern (Letter followed by Number)
    // Matches: Start, Letter (Group 1), Optional Space, Number (Group 2), End
    const codeMatch = query.match(/^([a-z])\s*(\d+)$/i);

    if (codeMatch) {
        const searchDeptCode = codeMatch[1]; // e.g. "a"
        const searchRoomCode = codeMatch[2]; // e.g. "1"

        return locationGroups.map(group => {
            // Must match Department Code
            if (group.dept.code?.toLowerCase() === searchDeptCode) {
                // Must match Room Code
                const matchingRooms = group.rooms.filter(r => r.code === searchRoomCode);
                if (matchingRooms.length > 0) {
                    return { ...group, rooms: matchingRooms };
                }
            }
            return null;
        }).filter(Boolean) as typeof locationGroups;
    }

    // Default Search Behavior (Partial Match Name or Code)
    return locationGroups.map(group => {
      // Check if department matches (Name or Code e.g., 'A')
      const deptMatches = 
        group.dept.name.toLowerCase().includes(query) || 
        (group.dept.code && group.dept.code.toLowerCase().includes(query));
      
      // Filter rooms (Name or Code e.g., '101')
      const matchingRooms = group.rooms.filter(room => 
        room.name.toLowerCase().includes(query) || 
        (room.code && room.code.toLowerCase().includes(query))
      );

      // If department matches, return all rooms (User likely wants to see the whole dept)
      if (deptMatches) return group;

      // If department doesn't match but some rooms do, return group with filtered rooms
      if (matchingRooms.length > 0) {
        return { ...group, rooms: matchingRooms };
      }

      return null;
    }).filter(group => group !== null) as typeof locationGroups;
  }, [locationGroups, searchQuery]);

  // Auto-expand groups when searching
  useEffect(() => {
      if (searchQuery) {
          setCollapsedDepts([]);
      }
  }, [searchQuery]);

  const toggleRoom = (roomName: string) => {
    setSelectedRooms(prev => 
        prev.includes(roomName) 
        ? prev.filter(r => r !== roomName) 
        : [...prev, roomName]
    );
  };

  const toggleDept = (deptId: string) => {
      setCollapsedDepts(prev => 
        prev.includes(deptId) ? prev.filter(id => id !== deptId) : [...prev, deptId]
      );
  };

  const handleSave = () => {
    if (selectedRooms.length === 0) {
        alert("يرجى اختيار غرفة واحدة على الأقل للمتابعة");
        return;
    }
    // Update Context (and LocalStorage via AuthContext effect)
    updateUserRooms(selectedRooms);
    
    // Redirect to Dashboard
    navigate('/nurse');
  };

  // Get devices for the viewing room
  const roomDevices = useMemo(() => {
      if (!viewingRoom) return [];
      return DEVICES.filter(d => d.location && d.location.includes(viewingRoom.name));
  }, [viewingRoom]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-28 transition-colors">
      
      {/* Header */}
      <div className="px-6 pt-8 pb-4 bg-transparent">
        <div className="flex items-center justify-between mb-4">
            <div className="text-right">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">تحديد نطاق العمل</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">أهلاً {user?.name}، حدد الغرف التي تتابعها</p>
            </div>
            <LogoutButton className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors shadow-sm transform rotate-180" />
        </div>

        {/* Search Bar */}
        <div className="relative">
            <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث ذكي: جرب كتابة 'A1' للوصول لغرفة 1 في قسم A" 
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3.5 pr-11 pl-4 text-sm font-bold focus:outline-none focus:border-medical-500 focus:ring-1 focus:ring-medical-500 transition-all text-slate-800 dark:text-white placeholder-slate-400 shadow-sm"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        </div>
      </div>

      {/* Selection Lists */}
      <div className="px-4 space-y-4">
        {filteredGroups.length > 0 ? (
            filteredGroups.map((group, groupIdx) => {
                const isCollapsed = collapsedDepts.includes(group.dept.id);
                
                return (
                    <div key={group.dept.id} className="animate-in slide-in-from-bottom-4" style={{ animationDelay: `${groupIdx * 50}ms` }}>
                        
                        {/* Department Header Toggle */}
                        <button 
                            onClick={() => toggleDept(group.dept.id)}
                            className="w-full flex items-center justify-between p-4 mb-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                                    {group.dept.id === 'general' ? <LayoutGrid className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                                </div>
                                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    {group.dept.code && (
                                        <span className="text-indigo-600 dark:text-indigo-400 font-mono text-xs bg-indigo-50 dark:bg-indigo-900/20 px-1.5 py-0.5 rounded">
                                            {group.dept.code}
                                        </span>
                                    )}
                                    {group.dept.name}
                                </h3>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} />
                        </button>
                        
                        {/* Rooms Stack (Collapsible) */}
                        {!isCollapsed && (
                            <div className="space-y-2 pr-4 border-r-2 border-slate-100 dark:border-slate-800 mr-2 transition-all">
                                {group.rooms.map(room => {
                                    const isSelected = selectedRooms.includes(room.name);
                                    return (
                                        <div
                                            key={room.id}
                                            className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all group ${
                                                isSelected 
                                                ? 'bg-white dark:bg-slate-900 border-medical-500 shadow-md ring-1 ring-medical-500/50' 
                                                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                                            }`}
                                        >
                                            {/* Left Side: Checkbox Indicator (Button) */}
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); toggleRoom(room.name); }}
                                                className="p-2 -m-2"
                                                aria-label="Toggle Selection"
                                            >
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                                                    isSelected 
                                                    ? 'border-medical-500 bg-medical-500 text-white' 
                                                    : 'border-slate-300 dark:border-slate-600 bg-transparent group-hover:border-slate-400'
                                                }`}>
                                                    {isSelected && <CheckCircle2 className="w-4 h-4" />}
                                                </div>
                                            </button>

                                            {/* Right Side (Content - Click to view details) */}
                                            <div 
                                                onClick={() => setViewingRoom(room)}
                                                className="flex items-center gap-3 flex-1 justify-end cursor-pointer"
                                            >
                                                <div className="text-right">
                                                    <p className={`font-bold text-sm ${isSelected ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                                                        {room.name}
                                                    </p>
                                                    {/* Code Badge */}
                                                    {room.code && (
                                                        <div className="flex justify-end mt-0.5">
                                                            <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 rounded-md font-mono border border-slate-200 dark:border-slate-700">
                                                                {room.code}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={`p-2 rounded-xl transition-colors shrink-0 ${
                                                    isSelected 
                                                    ? 'bg-medical-50 dark:bg-medical-900/20 text-medical-600 dark:text-medical-400' 
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                                }`}>
                                                    <BedDouble className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })
        ) : (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <Filter className="w-8 h-8" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">لا توجد نتائج مطابقة</p>
                <p className="text-xs text-slate-400 mt-1">جرب البحث برمز القسم (A) أو رقم الغرفة</p>
            </div>
        )}
      </div>

      {/* Sticky Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
         <div className="max-w-md mx-auto">
             <button 
                onClick={handleSave}
                disabled={selectedRooms.length === 0}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                    selectedRooms.length > 0 
                    ? 'bg-medical-600 hover:bg-medical-700 text-white shadow-medical-500/30' 
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
             >
                 <span>حفظ ومتابعة</span>
                 <ArrowRight className="w-5 h-5 rtl:rotate-180" />
             </button>
         </div>
      </div>

      {/* Room Details Modal */}
      {viewingRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={() => setViewingRoom(null)}
              ></div>
              <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
                  
                  {/* Header */}
                  <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                              <BedDouble className="w-6 h-6" />
                          </div>
                          <div>
                              <h2 className="text-lg font-bold text-slate-800 dark:text-white">{viewingRoom.name}</h2>
                              <p className="text-xs text-slate-500 font-mono">Code: {viewingRoom.code}</p>
                          </div>
                      </div>
                      <button onClick={() => setViewingRoom(null)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500">
                          <X className="w-5 h-5" />
                      </button>
                  </div>

                  {/* Body */}
                  <div className="p-5 overflow-y-auto custom-scrollbar">
                      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 px-1">الأجهزة الموجودة ({roomDevices.length})</h3>
                      
                      {roomDevices.length > 0 ? (
                          <div className="space-y-3">
                              {roomDevices.map(device => (
                                  <div key={device.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors bg-white dark:bg-slate-900 shadow-sm">
                                      <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden">
                                          <img src={device.image} alt="" className="w-full h-full object-cover" />
                                      </div>
                                      <div className="flex-1 min-w-0 text-right">
                                          <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate">{device.name}</h4>
                                          <p className="text-[10px] text-slate-500 font-mono">{device.id}</p>
                                      </div>
                                      <div className={`shrink-0 flex flex-col items-center gap-1 ${
                                          device.status === 'Operational' ? 'text-green-600' :
                                          device.status === 'Maintenance' ? 'text-amber-600' : 'text-red-600'
                                      }`}>
                                          {device.status === 'Operational' ? <CheckCircle className="w-5 h-5" /> : 
                                           device.status === 'Maintenance' ? <Wrench className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                                          <span className="text-[9px] font-bold">
                                              {device.status === 'Operational' ? 'يعمل' : device.status === 'Maintenance' ? 'صيانة' : 'عطلان'}
                                          </span>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                              <Activity className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                              <p className="text-sm text-slate-500">لا توجد أجهزة مسجلة في هذه الغرفة حالياً</p>
                          </div>
                      )}
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                      <button 
                        onClick={() => {
                            // Convenience action: If they open details, maybe they want to select it?
                            // Or just a close button
                            setViewingRoom(null);
                        }}
                        className="w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                      >
                          إغلاق
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default NurseRoomSelectionView;
