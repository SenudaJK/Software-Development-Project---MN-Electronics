import { Repair, RepairStatus } from '../types/Repair';

// Helper function to generate dates
const getDateBefore = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

const getDateAfter = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

// Mock repair data
export const mockRepairs: Repair[] = [
  {
    id: 'REP-1001',
    userId: '1',
    deviceType: 'Smartphone',
    deviceBrand: 'Apple',
    deviceModel: 'iPhone 13 Pro',
    issueDescription: 'Screen cracked, not responding to touch',
    status: 'in_progress',
    statusUpdates: [
      {
        id: 'SU-1001-1',
        timestamp: getDateBefore(5),
        status: 'pending',
        description: 'Repair request received',
      },
      {
        id: 'SU-1001-2',
        timestamp: getDateBefore(4),
        status: 'diagnosed',
        description: 'Diagnosis complete: Screen assembly needs replacement',
        technician: 'Mike Johnson',
      },
      {
        id: 'SU-1001-3',
        timestamp: getDateBefore(2),
        status: 'in_progress',
        description: 'Replacement parts arrived, repair in progress',
        technician: 'Mike Johnson',
      },
    ],
    estimatedCompletionDate: getDateAfter(2),
    cost: {
      diagnostic: 25,
      parts: 179,
      labor: 75,
      total: 279,
    },
    createdAt: getDateBefore(5),
    updatedAt: getDateBefore(2),
  },
  {
    id: 'REP-1002',
    userId: '1',
    deviceType: 'Laptop',
    deviceBrand: 'Dell',
    deviceModel: 'XPS 15',
    issueDescription: 'Won\'t power on, battery may be dead',
    status: 'completed',
    statusUpdates: [
      {
        id: 'SU-1002-1',
        timestamp: getDateBefore(20),
        status: 'pending',
        description: 'Repair request received',
      },
      {
        id: 'SU-1002-2',
        timestamp: getDateBefore(19),
        status: 'diagnosed',
        description: 'Diagnosis complete: Battery and charging port need replacement',
        technician: 'Sarah Williams',
      },
      {
        id: 'SU-1002-3',
        timestamp: getDateBefore(17),
        status: 'awaiting_parts',
        description: 'Ordered replacement battery and charging port',
        technician: 'Sarah Williams',
      },
      {
        id: 'SU-1002-4',
        timestamp: getDateBefore(12),
        status: 'in_progress',
        description: 'Parts received, repair in progress',
        technician: 'Sarah Williams',
      },
      {
        id: 'SU-1002-5',
        timestamp: getDateBefore(10),
        status: 'completed',
        description: 'Repair completed, device fully functional',
        technician: 'Sarah Williams',
      },
      {
        id: 'SU-1002-6',
        timestamp: getDateBefore(9),
        status: 'ready_for_pickup',
        description: 'Device ready for pickup',
      },
      {
        id: 'SU-1002-7',
        timestamp: getDateBefore(7),
        status: 'delivered',
        description: 'Device picked up by customer',
      },
    ],
    estimatedCompletionDate: getDateBefore(10),
    warranty: {
      isWarranty: true,
      expiryDate: getDateAfter(90),
    },
    cost: {
      diagnostic: 0,
      parts: 145,
      labor: 85,
      total: 230,
    },
    createdAt: getDateBefore(20),
    updatedAt: getDateBefore(7),
  },
  {
    id: 'REP-1003',
    userId: '1',
    deviceType: 'Desktop',
    deviceBrand: 'Custom',
    deviceModel: 'Gaming PC',
    issueDescription: 'Random shutdowns during gaming, possible overheating',
    status: 'diagnosed',
    statusUpdates: [
      {
        id: 'SU-1003-1',
        timestamp: getDateBefore(2),
        status: 'pending',
        description: 'Repair request received',
      },
      {
        id: 'SU-1003-2',
        timestamp: getDateBefore(1),
        status: 'diagnosed',
        description: 'Diagnosis complete: CPU cooler failing, thermal paste needs reapplication',
        technician: 'David Chen',
      },
    ],
    estimatedCompletionDate: getDateAfter(5),
    cost: {
      diagnostic: 35,
      parts: 85,
      labor: 65,
      total: 185,
    },
    createdAt: getDateBefore(2),
    updatedAt: getDateBefore(1),
  },
];

// Available device types for booking
export const deviceTypes = [
  { id: 'microwave', name: 'Microwave', icon: 'microwave' },
  { id: 'blender', name: 'Blender', icon: 'blender' },
  { id: 'fan', name: 'Fan', icon: 'fan' },
  { id: 'dvd', name: 'DVD Player', icon: 'dvd' },
  { id: 'rice-cooker', name: 'Rice Cooker', icon: 'rice-cooker' },
  { id: 'amp', name: 'Amplifier', icon: 'amp' },
  { id: 'tv', name: 'TV', icon: 'television' },
  { id: 'other', name: 'Other Device', icon: 'cpu' },
];

// Common repair issues for each device type
export const commonIssues = {
  smartphone: [
    'Screen replacement',
    'Battery replacement',
    'Charging port repair',
    'Water damage',
    'Software issues',
    'Camera repair',
  ],
  laptop: [
    'Screen replacement',
    'Battery replacement',
    'Keyboard replacement',
    'Fan/cooling issue',
    'Hard drive/SSD upgrade',
    'Water damage',
  ],
  desktop: [
    'Hardware upgrade',
    'Power supply replacement',
    'Virus/malware removal',
    'Data recovery',
    'Performance optimization',
    'Custom build',
  ],
  tablet: [
    'Screen replacement',
    'Battery replacement',
    'Charging port repair',
    'Software issues',
    'Button repair',
  ],
  microwave: [
    'Door not closing properly',
    'Not heating',
    'Turntable not spinning',
    'Touchpad unresponsive',
    'Unusual noise',
  ],
  blender: [
    'Motor not working',
    'Blade replacement',
    'Leaking from base',
    'Control panel issues',
    'Jar cracked',
  ],
  fan: [
    'Not spinning',
    'Remote control issue',
    'Speed control problem',
    'Oscillation fault',
    'Unusual noise',
  ],
  dvd: [
    'Disc not reading',
    'Drawer not opening',
    'No display output',
    'Remote not working',
    'No sound',
  ],
  'rice-cooker': [
    'Not heating',
    'Lid not closing properly',
    'Timer malfunction',
    'Inner pot damaged',
    'Power issue',
  ],
  amp: [
    'No sound output',
    'Distorted sound',
    'Channel selection issue',
    'Power problem',
    'Input/output port repair',
  ],
  gaming: [
    'Disc reader repair',
    'Controller repair',
    'Power issue',
    'HDMI port repair',
    'Overheating issue',
  ],
  other: [
    'Diagnostic service',
    'Hardware repair',
    'Software issue',
    'Performance problem',
    'Custom service',
  ],
};

// Available time slots for booking
export const availableTimeSlots = [
  { id: '1', date: getDateAfter(1), times: ['09:00', '11:00', '14:00', '16:00'] },
  { id: '2', date: getDateAfter(2), times: ['09:00', '10:00', '13:00', '15:00', '17:00'] },
  { id: '3', date: getDateAfter(3), times: ['10:00', '12:00', '14:00', '16:00'] },
  { id: '4', date: getDateAfter(4), times: ['09:00', '11:00', '14:00', '16:00'] },
  { id: '5', date: getDateAfter(5), times: ['10:00', '13:00', '15:00', '17:00'] },
];