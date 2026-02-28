
import { DEVICES_DATA } from './seeds/devicesData';
import { INVENTORY_DATA } from './seeds/inventoryData';
import { ACTIVITIES_DATA } from './seeds/activitiesData';
import { SUPPLIERS_DATA } from './seeds/suppliersData';
import { LOCATIONS_DATA } from './seeds/locationsData';
import { ServiceRequest, SupplyRequest, AppNotification } from './types';

// Re-exporting data from organized seed files
export const DEVICES = DEVICES_DATA;
export const INVENTORY_ITEMS = INVENTORY_DATA;
export const ENGINEER_ACTIVITIES = ACTIVITIES_DATA;
export const SUPPLIERS = SUPPLIERS_DATA;
export const LOCATIONS = LOCATIONS_DATA;

// Mock Service Requests (Tickets)
export const SERVICE_REQUESTS: ServiceRequest[] = [
  {
    id: 'TKT-2023-1001',
    deviceId: 'DEV-VEN-02',
    deviceName: 'Drager Ventilator',
    location: 'ICU - Bed 12',
    department: 'ICU',
    issueCategory: 'Alarm',
    description: 'الجهاز يعطي إنذار High Pressure متكرر ولا يستجيب لإعادة التشغيل.',
    priority: 'Critical',
    isPatientAffected: true,
    requestedBy: 'ممرض أحمد',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    status: 'Open'
  },
  {
    id: 'TKT-2023-1002',
    deviceId: 'DEV-CEN-03',
    deviceName: 'Centrifuge 5424R',
    location: 'Lab',
    department: 'Laboratory',
    issueCategory: 'Mechanical',
    description: 'صوت ضجيج عالي أثناء الدوران.',
    priority: 'Normal',
    isPatientAffected: false,
    requestedBy: 'مختبر منى',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    status: 'Open'
  }
];

// Mock Supply Requests (New)
export const SUPPLY_REQUESTS: SupplyRequest[] = [
    {
        id: 'REQ-001',
        partName: 'Flow Sensor X2',
        partId: 'INV-006',
        quantity: 5,
        requesterName: 'المهندس علي',
        requestDate: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        status: 'Pending',
        priority: 'Normal',
        notes: 'Low stock warning triggered.'
    },
    {
        id: 'REQ-002',
        partName: 'Oxygen Cell O2',
        partId: undefined, // New item not in inventory
        quantity: 2,
        requesterName: 'المهندس سارة',
        requestDate: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
        status: 'Ordered',
        priority: 'Urgent',
        notes: 'Required for ICU Ventilator PM.'
    }
];

// Mock Notifications
export const NOTIFICATIONS_DATA: AppNotification[] = [
    {
        id: 'NOT-001',
        title: 'تنبيه مخزون حرج',
        message: 'وصل رصيد "Main Logic Board" إلى الحد الأدنى (3 قطع).',
        type: 'Stock',
        date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        isRead: false,
        actionLink: '/inventory'
    },
    {
        id: 'NOT-002',
        title: 'صيانة وقائية متأخرة',
        message: 'جهاز MRI Scanner تجاوز موعد الصيانة الدورية بـ 5 أيام.',
        type: 'PM',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        isRead: false,
        actionLink: '/maintenance'
    },
    {
        id: 'NOT-003',
        title: 'بلاغ عطل جديد',
        message: 'تم تسجيل بلاغ عطل حرج في العناية المركزة (ICU).',
        type: 'Alert',
        date: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
        isRead: true,
        actionLink: '/maintenance/requests'
    }
];
