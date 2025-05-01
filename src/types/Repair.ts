export type RepairStatus = 
  | 'pending' 
  | 'diagnosed'
  | 'in_progress'
  | 'awaiting_parts'
  | 'completed'
  | 'ready_for_pickup'
  | 'delivered';

export interface RepairStatusUpdate {
  id: string;
  timestamp: string;
  status: RepairStatus;
  description: string;
  technician?: string;
}

export interface Repair {
  id: string;
  userId: string;
  deviceType: string;
  deviceBrand: string;
  deviceModel: string;
  issueDescription: string;
  images?: string[];
  status: RepairStatus;
  statusUpdates: RepairStatusUpdate[];
  estimatedCompletionDate: string;
  warranty?: {
    isWarranty: boolean;
    expiryDate?: string;
  };
  cost?: {
    diagnostic: number;
    parts: number;
    labor: number;
    total: number;
  };
  createdAt: string;
  updatedAt: string;
}