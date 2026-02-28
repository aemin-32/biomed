
import { Supplier } from '../types';

export const SUPPLIERS_DATA: Supplier[] = [
  {
    id: 'SUP-001',
    name: 'تكنولوجيا الحياة (Philips Agent)',
    type: 'Agent',
    contactPerson: 'م. سامر العاني',
    phone: '+964 770 111 2222',
    email: 'support@philips-iraq.com',
    address: 'بغداد - الكرادة - شارع 62',
    notes: 'الوكيل الحصري لأجهزة التصوير الطبي'
  },
  {
    id: 'SUP-002',
    name: 'الرافدين للأجهزة الطبية (Drager)',
    type: 'Agent',
    contactPerson: 'د. هدى محمد',
    phone: '+964 790 333 4444',
    email: 'service@rafidain-med.com',
    address: 'بغداد - الحارثية',
    notes: 'دعم فني 24/7 لأجهزة التخدير والتنفس'
  },
  {
    id: 'SUP-003',
    name: 'المستقبل للتقنيات (GE HealthCare)',
    type: 'Distributor',
    contactPerson: 'م. أحمد كمال',
    phone: '+964 750 555 6666',
    email: 'ahmed@future-tech.iq',
    address: 'أربيل - شارع 100',
    notes: 'عقود صيانة شاملة (Service Contract Active)'
  },
  {
    id: 'SUP-004',
    name: 'مجموعة النور للمختبرات',
    type: 'Distributor',
    contactPerson: 'علي حسن',
    phone: '+964 771 888 9999',
    email: 'sales@alnoor-lab.com',
    address: 'البصرة - الجزائر',
    notes: 'تجهيز مستهلكات ومعدات مختبرية صغيرة'
  }
];
