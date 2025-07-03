export interface User {
  id: number;
  email: string;
  type: string;
}

export interface Stat {
  label: string;
  count?: number;
  value?: string;
  trend: 'up' | 'down' | 'steady';
  icon: string;
  color: string;
}

export interface Activity {
  action: string;
  time: string;
  icon: string;
}

export interface Company {
  id: number;
  name: string;
  current_market: string;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  brands: string;
  status: string;
  report_status: string;
  company_name: string;
  category_name: string;
}

export interface Payment {
  id: number;
  amount: number;
  status: string;
  agent_commission: number;
  created_at: string;
  product_name?: string;
  company_name?: string;
}