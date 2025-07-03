export type { User } from '../types';

export interface Product {
  id: number;
  name: string;
  brands: string;
  report_status: string;
  status: 'pending' | 'active';
  company_id: number;
  image?: string;
}

export interface Company {
  id: number;
  name: string;
  address: string;
  phone: string;
  whatsapp: string;
  est: string;
  no_emp: number;
  turnover: string;
  gst: string;
  website: string;
  map: string;
  current_market: string;
  user_id: number;
}

export interface Award {
  id: number;
  name: string;
  provider: string;
  description: string;
  image?: string;
  date_issue: string;
  expiry: string;
  type: string;
  status: 'active' | 'inactive';
  to_type: 'company';
  parent: number;
}

export interface Unit {
  id: number;
  name: string;
  address: string;
  capacity: number;
  status: 'active' | 'inactive';
  company_id: number;
}

export interface CompanyImage {
  id: number;
  company_id: number;
  unit_id: number;
  file: string;
  file_type: string;
}

export interface Favorite {
  id: number;
  name: string;
  image: string;
  company_name: string;
  category_name: string;
}