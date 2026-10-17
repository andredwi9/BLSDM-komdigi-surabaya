export type AgentType = 
  | 'booking_assistant' 
  | 'operations' 
  | 'maintenance' 
  | 'insight' 
  | 'management_brief' 
  | 'knowledge';

export type AutonomyLevel = 
  | 0 // Informasi
  | 1 // Analisis
  | 2 // Draft
  | 3 // Eksekusi Terbatas
  | 'blocked'; // Dilarang

export interface AgentToolCall {
  id: string;
  sessionId: string;
  toolName: 
    | 'search_labs'
    | 'get_booking_calendar'
    | 'check_booking_constraints'
    | 'create_booking_draft'
    | 'submit_booking'
    | 'get_utilization_metrics'
    | 'create_maintenance_draft'
    | 'get_overdue_tickets'
    | 'generate_management_brief'
    | 'send_notification';
  inputSummary: Record<string, any>;
  resultStatus: 'success' | 'warning' | 'error' | 'blocked';
  outputSummary: any;
  timestamp: string;
}

export interface AgentAction {
  id: string;
  userId: string;
  userName: string;
  agentType: AgentType;
  actionType: 'draft_booking' | 'submit_booking' | 'draft_ticket' | 'send_reminder' | 'management_brief';
  targetId?: string;
  payload: any;
  approvalStatus: 'pending_user_confirmation' | 'approved' | 'rejected' | 'executed' | 'cancelled';
  executedAt?: string;
  notes?: string;
}

export interface AgentMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  agentType: AgentType;
  autonomyLevel: AutonomyLevel;
  toolCalls?: AgentToolCall[];
  draftAction?: AgentAction;
  timestamp: string;
  evidenceRefs?: string[];
  feedbackRating?: number;
}

export interface AgentSession {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  startedAt: string;
  endedAt?: string;
  status: 'active' | 'closed';
  title: string;
}

export interface AgentFeedback {
  id: string;
  sessionId: string;
  messageId: string;
  rating: number; // 1 - 5
  category: 'akurasi' | 'kecepatan' | 'relevansi' | 'lainnya';
  comment?: string;
  createdAt: string;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  category: 'SOP' | 'Panduan Lab' | 'Spesifikasi Perangkat' | 'Regulasi';
  version: string;
  owner: string;
  accessLevel: 'public' | 'internal' | 'admin_only';
  updatedAt: string;
  summary: string;
  content: string;
}

export interface AgentInsight {
  id: string;
  period: string;
  insightType: 'utilisasi' | 'peak_hour' | 'no_show' | 'maintenance' | 'kapasitas';
  finding: string;
  evidenceRefs: string[];
  severity: 'info' | 'perhatian' | 'kritis';
  recommendation: string;
  reviewStatus: 'draft' | 'reviewed' | 'approved';
}
