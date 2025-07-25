import type { ReactNode } from "react";

export interface User {
  id: number;
  type: string;
  signup_type: string;
  role: string;
  position: ReactNode;
  joinDate: string | number | Date;
  phone: string | number | readonly string[] | undefined;
  department: string | number | readonly string[] | undefined;
  address: string | number | readonly string[] | undefined;
  name: string;
  dob: string;
  email: string;
  photo: string;
  image?: string;
  workLocation: string;
  kycStatus: 'pending' | 'active' | 'rejected' | null;
  govIdName: string;
  govIdNumber: string;
}

export interface Company {
  id: number; // Changed from string to number
  name: string;
  current_market: string; // Changed from ReactNode to string
  created_at: string;
  status: string; // e.g., "pending", "under_review", "active"
  logo?: string; // Optional, changed from any
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  address?: string;
  description?: string;
  brands?: string;
  companyId?: string; // Likely not needed, as id serves this purpose
  categoryId?: string;
}

export interface Product {
  id: number;
  name: string;
  brands: string;
  company_name: string;
  category_name: string;
  status: 'pending' | 'active' | 'info_requested';
  report_status: 'none' | 'intake_pending' | 'intake_completed' | 'ground_pending' | 'ground_completed';
  intake_form_completed?: boolean;
  ground_questionnaire_completed?: boolean;
}

export interface ProductProgress {
  product_id: number;
  intake_form_completed: boolean;
  ground_questionnaire_completed: boolean;
}

export interface Payment {
  created_at: string | number | Date;
  agent_commission: any;
  product_name: string;
  company_name: string;
  date: ReactNode;
  paymentMethod: string;
  id: string;
  productId: string;
  companyId: string;
  productName: string;
  companyName: string;
  amount: number;
  status: 'pending' | 'completed';
  agentCommission: number;
}

export interface Wallet {
  balance: number;
}

export interface WithdrawalDetails {
  method: 'upi' | 'bank' | '';
  upiId?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
}

export interface FormData {
  // Personal Information
  fullName: string;
  dateOfBirth: string;
  gender: string;
  mobileNumber: string;
  emailAddress: string;
  currentAddress: string;
  permanentAddress: string;
  
  // Government Identification
  govIdType: string;
  idNumber: string;
  
  // Bank Details
  bankAccount: string;
  ifscCode: string;
  bankName: string;
  
  // Education & Experience
  highestQualification: string;
  institution: string;
  yearOfCompletion: string;
  yearsOfExperience: string;
  currentOccupation: string;
  references: string;
  
  // Professional Details
  primarySectors: string;
  regionsCovered: string;
  languagesSpoken: string;
  clientBaseSize: string;
  expectedAuditVolume: string;
  
  // Technical Capabilities
  devicesAvailable: string;
  internetQuality: string;
  digitalToolComfort: string;
  
  // Background Check
  criminalRecord: string;
  criminalDetails: string;
  conflictOfInterest: string;
  acceptCodeOfConduct: string;
  
  // Training Preferences
  trainingWillingness: string;
  trainingMode: string;
  availability: string;
  
  // Additional Information
  additionalSkills: string;
  comments: string;
}

export interface Files {
  photo: string | null; // Changed to string for URLs
  selfie: string | null;
  cancelledCheque: string | null;
  certifications: string | null;
  resume: string | null;
  otherDocuments: string[];
}

export type FormFieldName = keyof FormData | keyof Files;

export interface FieldConfig {
  name: FormFieldName;
  label: string;
  type: 'text' | 'date' | 'email' | 'textarea' | 'file' | 'select' | 'checkbox' | 'radio';
  required?: boolean;
  accept?: string;
  multiple?: boolean;
  options?: string[];
}

export interface SectionConfig {
  title: string;
  description?: string;
  fields: FieldConfig[];
}


export interface Stat {
  label: string;
  count?: number;
  value?: number;
  icon: string;
  color: string;
  trend: 'up' | 'down' | 'neutral';
  name?: string;
  change?: string;
  changeType?: 'positive' | 'negative';
}

export interface Activity {
  action: string;
  time: string;
  icon: string;
}