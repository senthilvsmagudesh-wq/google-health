export type InputType = 'report' | 'symptoms' | 'url' | 'text';

export type ToolId = 
  | 'summary' 
  | 'risk' 
  | 'insights' 
  | 'recommendations' 
  | 'warning_signs' 
  | 'nutrition' 
  | 'breakdown' 
  | 'compare';

export interface Tool {
  id: ToolId;
  name: string;
  icon: string;
  description: string;
}

export interface AnalysisResult {
  type: ToolId;
  content: string; // Markdown or JSON string
  timestamp: number;
}

export interface Finding {
  test: string;
  result: string;
  meaning: string;
  status: 'ok' | 'attention' | 'warning';
}

export interface SimplifiedReport {
  patientInfo?: {
    age?: string;
    duration?: string;
  };
  simpleSummary: {
    headline: string;
    keyPoints: string[];
    match: string;
  };
  findings: Finding[];
  riskAssessment: {
    level: 'Low' | 'Medium' | 'High';
    description: string;
    colorCode: 'green' | 'yellow' | 'red'; 
  };
  potentialCauses: string[];
  actionableAdvice: {
    steps: string[];
    warningSigns: string[];
  };
  visualSummary: {
    symptoms: string[];
    labs: string[];
    overall: string;
  };
}

export interface RiskItem {
  issue: string;
  meaning: string;
}

export interface FutureRisk {
  risk: string;
  description: string;
}

export interface RiskReport {
  overallRisk: {
    level: 'Low' | 'Mild' | 'Moderate' | 'High';
    description: string;
    colorCode: 'green' | 'yellow' | 'orange' | 'red';
  };
  attentionItems: RiskItem[];
  futureRisks: FutureRisk[];
  simpleActions: string[];
  urgentWarnings: string[];
}

export interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
}