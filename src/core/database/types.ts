
export type DeviceStatus = 'Operational' | 'Maintenance' | 'Down' | 'Scrapped'; // Added Scrapped

export type MaintenanceType = 'Repair' | 'PM' | 'System';

// New Type for managing Dropdown Data
export interface LocationConfig {
  id: string;
  name: string;
  code?: string; // Added: e.g., 'A' for Dept, '01' for Room, 'WH' for Warehouse
  type: 'Department' | 'Room' | 'Warehouse' | 'Cabinet' | 'Shelf'; // Expanded for Inventory
  isEnabled: boolean;
  parentId?: string; // Optional: Links a Room to a Department ID, or Shelf to Cabinet
}

export interface Supplier {
  id: string;
  name: string; // Company Name e.g. "Al-Hayat Medical"
  type: 'Agent' | 'Distributor' | 'Manufacturer';
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  notes?: string;
}

export interface InventoryItem {
  id: string; // Part Number / SKU
  name: string;
  category: 'Parts' | 'Consumables' | 'Tools' | 'Scrap'; // Added Scrap category
  condition: 'New' | 'Used' | 'Refurbished'; // NEW: To track salvaged parts
  sourceDevice?: string; // NEW: If salvaged, which device ID did it come from?
  warehouseType: 'Main' | 'Department' | 'ScrapYard' | 'External'; // NEW: Distributed Inventory Logic
  quantity: number;
  minLevel: number;
  location: string; // e.g. "Shelf A-1"
  cost: number;
  supplierId?: string;
  description?: string;
  lastUpdated?: string;
}

export interface SupplyRequest {
  id: string;
  partName: string;
  partId?: string; // Optional if new part
  quantity: number;
  requesterName: string;
  requestDate: string;
  status: 'Pending' | 'Ordered' | 'Received' | 'Rejected';
  priority: 'Normal' | 'Urgent';
  notes?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'Stock' | 'PM' | 'Alert' | 'System';
  date: string;
  isRead: boolean;
  actionLink?: string; // Route to navigate to
}

export interface MaintenanceLog {
  id: string;
  date: string; // YYYY-MM-DD
  engineerName: string;
  problemDescription?: string;
  action: string;
  type: MaintenanceType;
  parts?: string[]; // Array of Part Names or IDs
  cost?: number; // Added: Total cost of this specific maintenance event
  errorCode?: string;
  checklistData?: {
      tasks: any[];
      entries: Record<string, any>;
  };
}

export interface Device {
  id: string;
  name: string;
  model: string;
  manufacturer: string;
  type: string; // e.g. "MRI", "Ventilator"
  serialNumber: string;
  image: string;
  location: string; // Display string e.g. "ICU - Bed 1"
  department?: string; // e.g. "ICU"
  status: DeviceStatus;
  isPortable?: boolean; // NEW: Determines if device can be moved to workshop
  purchaseCost?: number; // NEW: Original Price of the device
  installDate: string;
  warrantyExpiry?: string;
  supplierId?: string;
  responsiblePerson?: string; // Nurse or Dept Head
  powerSpecs?: {
      voltage: number;
      current: number;
      frequency: number;
      power?: number; // Watts
  };
  batterySpecs?: {
      hasBattery: boolean;
      type?: string;
      capacitymAh?: number;
      voltage?: number;
      replacementDate?: string;
  };
  calibrationSpecs?: {
      lastDate: string;
      intervalMonths: number;
      tolerancePercent?: number; // +/- % accuracy
  };
  logs: MaintenanceLog[];
  documents?: {
      id: string;
      title: string;
      type: 'Manual' | 'Report' | 'Certificate';
      date: string;
      size: string;
  }[];
}

export interface ServiceRequest {
  id: string;
  deviceId: string;
  deviceName: string;
  location: string;
  department: string;
  issueCategory: string; // 'Power', 'Software', 'Mechanical', etc.
  description: string;
  priority: 'Normal' | 'Urgent' | 'Critical';
  isPatientAffected: boolean;
  requestedBy: string; // Nurse Name
  contactPhone?: string;
  timestamp: string; // ISO
  status: 'Open' | 'In Progress' | 'Closed';
}
