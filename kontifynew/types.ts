export const LeadStatus = {
  Pending: 'pending',
  Assigned: 'assigned',
  Rejected: 'rejected',
  Completed: 'completed',
} as const;

export type LeadStatus = (typeof LeadStatus)[keyof typeof LeadStatus];

export type UserRole = 'admin' | 'asesor';

export type FiscalSpecialization = "Impuestos Corporativos" | "Personas Físicas" | "Comercio Exterior e IVA" | "Nómina y Seguridad Social" | "General";

export interface AssignmentHistory {
  asesorId: number;
  assignedAt: string;
  assignedBy: number; // Admin's ID
}

export interface Lead {
  id: number;
  name: string;
  email: string;
  query_details: string;
  status: LeadStatus;
  asesor_id: number | null;
  created_at: string;
  source: 'chatbot' | 'manual';
  assignment_history: AssignmentHistory[];
}

export interface Asesor {
  id: number;
  name:string;
  email: string;
  password_hash: string; // To simulate a secure login
  role: UserRole;
  specialization: FiscalSpecialization;
  status: 'active' | 'inactive';
  billing_status: 'active' | 'pending_payment' | 'expired';
  renewal_date: string;
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string | React.ReactNode;
  timestamp: number;
}

export interface AIAnalysis {
  summary: string;
  priority: 'Low' | 'Medium' | 'High';
  suggested_specialization: FiscalSpecialization;
}

export interface AuditLog {
  id: number;
  timestamp: string;
  userId: number;
  userName: string;
  action: string;
  details: string;
}