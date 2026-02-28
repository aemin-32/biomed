
export const ACTIVITIES_DATA = [
    { 
      id: 'JOB-2023-882', 
      action: 'إصلاح عطل في وحدة التبريد واستبدال الموصلات التالفة.', 
      date: '2023-10-24', 
      time: '10:30 AM',
      type: 'Repair', 
      device: 'DEV-MRI-01', 
      deviceName: 'Philips MRI Scanner',
      location: 'غرفة الرنين المغناطيسي (MRI)',
      parts: ['Cooling Pump V2', 'Thermal Paste', 'Connector Type-C'],
      errorCode: 'ERR-COOL-04',
      engineerName: 'المهندس علي'
    },
    { 
      id: 'PM-2023-150', 
      action: 'صيانة دورية (PM) - فحص الحساسات، تنظيف الفلاتر، واختبار الأداء.', 
      date: '2023-10-22', 
      time: '09:00 AM',
      type: 'PM', 
      device: 'DEV-VEN-02', 
      deviceName: 'Drager Ventilator',
      location: 'العنبر العام - ICU',
      parts: ['Bacterial Filter Set', 'O-Ring Seal'],
      errorCode: null,
      engineerName: 'المهندس علي'
    },
    { 
      id: 'SYS-2023-099', 
      action: 'تحديث بيانات المخزون وإضافة قطع غيار جديدة.', 
      date: '2023-10-20', 
      time: '02:15 PM',
      type: 'System', 
      device: '-',
      deviceName: 'System Log',
      location: 'الإدارة',
      parts: [],
      errorCode: null,
      engineerName: 'المهندس علي'
    },
    { 
      id: 'CAL-2023-045', 
      action: 'معايرة جهاز الصدمات (Defibrillator) واختبار التفريغ 200J.', 
      date: '2023-10-18', 
      time: '11:45 AM',
      type: 'Calibration', 
      device: 'DEV-DEF-01',
      deviceName: 'Zoll R Series',
      location: 'غرفة الإنعاش (Resuscitation)',
      parts: [],
      errorCode: null,
      engineerName: 'المهندس علي'
    },
];
