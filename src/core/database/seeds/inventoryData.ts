
import { InventoryItem } from '../types';

export const INVENTORY_DATA: InventoryItem[] = [
  // --- Local Warehouse Items ---
  {
    id: 'INV-001',
    name: 'Li-ion Battery Pack (High Cap)',
    category: 'Parts',
    condition: 'New',
    warehouseType: 'Main',
    quantity: 12,
    minLevel: 10,
    location: 'WH1-A-2', 
    cost: 150.00
  },
  {
    id: 'INV-002',
    name: 'Main Logic Board V2',
    category: 'Parts',
    condition: 'New',
    warehouseType: 'Main',
    quantity: 3,
    minLevel: 2,
    location: 'WH1-A-SEC',
    cost: 500.00
  },
  {
    id: 'INV-003',
    name: 'LCD Touch Assembly',
    category: 'Parts',
    condition: 'New',
    warehouseType: 'Main',
    quantity: 5,
    minLevel: 3,
    location: 'WH1-B-1',
    cost: 320.00
  },
  {
    id: 'INV-004',
    name: 'Power Supply Unit',
    category: 'Parts',
    condition: 'Refurbished', // Example of salvaged part
    sourceDevice: 'DEV-MRI-OLD-09',
    warehouseType: 'ScrapYard', // Stored in Scrap section
    quantity: 2,
    minLevel: 0,
    location: 'SCRAP-BIN-04',
    cost: 0.00 // Salvaged items usually have 0 cost or estimated value
  },
  {
    id: 'INV-005',
    name: 'Thermal Paste (5g)',
    category: 'Consumables',
    condition: 'New',
    warehouseType: 'Main',
    quantity: 25,
    minLevel: 10,
    location: 'WH1-D-1',
    cost: 15.00
  },
  {
    id: 'INV-006',
    name: 'Flow Sensor X2',
    category: 'Parts',
    condition: 'New',
    warehouseType: 'Department', // Kept in ICU Store
    quantity: 10,
    minLevel: 5,
    location: 'ICU-CAB-1',
    cost: 85.00
  },
  {
    id: 'INV-007',
    name: 'Spo2 Sensor (Adult)',
    category: 'Parts',
    condition: 'New',
    warehouseType: 'Main',
    quantity: 15,
    minLevel: 10,
    location: 'WH1-C-4',
    cost: 45.00
  },
  {
    id: 'INV-008',
    name: 'ECG Thermal Paper',
    category: 'Consumables',
    condition: 'New',
    warehouseType: 'Main',
    quantity: 40,
    minLevel: 20,
    location: 'WH1-B-1',
    cost: 5.00
  },
  // --- External / Central Warehouse Items (For Network Search Simulation) ---
  {
    id: 'EXT-001',
    name: 'MRI Cold Head Kit',
    category: 'Parts',
    condition: 'New',
    warehouseType: 'External', // Located in Central Warehouse
    quantity: 2,
    minLevel: 1,
    location: 'Central-Baghdad',
    cost: 4500.00,
    description: 'Available at HQ Warehouse'
  },
  {
    id: 'EXT-002',
    name: 'CT X-Ray Tube (Dunlee)',
    category: 'Parts',
    condition: 'New',
    warehouseType: 'External', // Located in another hospital
    quantity: 1,
    minLevel: 0,
    location: 'Basra-Hospital-Store',
    cost: 12000.00,
    description: 'Spare unit at Basra Teaching Hospital'
  }
];
