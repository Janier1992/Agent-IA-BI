export interface BusinessDNA {
  industria: string;
  procesoPrincipal: string;
  subprocesos: string[];
  entidadesPrincipales: string[];
  objetivosInferidos: string[];
}

export interface DataMetrics {
  revenue: number;
  users: number;
  riskScore: number;
  efficiency: number;
  warehouseDelay: boolean;
  activeDataset: string;
  businessDNA?: BusinessDNA;
}

export interface AgentState {
  id: "orchestrator" | "scientist" | "researcher" | "data_engineer" | "analyst";
  name: string;
  role: string;
  status: "idle" | "planning" | "thinking" | "processing" | "completed";
  cognitiveLoad: number;
  avatarColor: string;
}

export interface AgentCollaborationLog {
  agentId: string;
  agentName: string;
  message: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
  simulated?: boolean;
  hasVarianceChart?: boolean;
  impact?: string;
  delta?: string;
  confidence?: string;
  collaborationLogs?: AgentCollaborationLog[];
}


export interface ValidationLog {
  id: string;
  time: string;
  category: "Sistema" | "Escaneo" | "Análisis" | "Seguridad" | "Integridad" | "Alerta";
  message: string;
}

export interface DataConnector {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  premium?: boolean;
  suggested?: boolean;
  relevance?: string;
  type: "SQL" | "Cloud" | "API" | "ERP" | "Sheets" | "CRM";
}

export interface AssetAllocation {
  category: string;
  value: number;
  roi: number;
  recommendation: string;
  status: "ESTABLE" | "AJUSTAR" | "ESTRATÉGICO";
}
