
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Settings, Activity } from 'lucide-react';

const DeviceDetailsView: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/')}
          className="p-2 bg-white border border-slate-200 rounded-full text-slate-600"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">تفاصيل الجهاز</h1>
      </header>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center py-12">
        <div className="w-20 h-20 bg-medical-50 rounded-full flex items-center justify-center mx-auto mb-6 text-medical-600">
          <Activity className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">{deviceId || 'غير معروف'}</h2>
        <p className="text-slate-500 mb-6">تم العثور على سجل الجهاز بنجاح</p>
        
        <div className="flex gap-3 justify-center">
          <button className="px-4 py-2 bg-medical-600 text-white rounded-lg font-bold text-sm">
            سجل الصيانة
          </button>
          <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm flex items-center gap-2">
            <Settings className="w-4 h-4" />
            الإعدادات
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeviceDetailsView;
