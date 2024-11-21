export interface Customer {
  id: string;
  name: string;
  contact: string;
  notes?: string;
  customerType: 'VIP' | 'Consumer' | 'Business';
  category: string;
  timestamp: string;
  assignedStaff?: string | null;
  servedTimestamp?: string | null;
  appearance?: {
    outfits: Array<{
      type: string;
      color: string;
      hex: string;
    }>;
  };
}

export interface Staff {
  id: string;
  name: string;
  readyTimestamp: string;
  servingCustomer: string | null;
  servingStartTime: string | null;
  onLunch?: boolean;
  lunchStartTime?: string | null;
}
