export interface DataMetrics {
  revenue: number;
  users: number;
  riskScore: number;
  efficiency: number;
  warehouseDelay: boolean;
  activeDataset: string;
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
