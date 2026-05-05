export interface PersonProfile {
  id: string;
  name: string;
  image?: string;
  category: "aliado" | "amenaza" | "neutral" | "objetivo";
  psychProfile: string;
  psychiatricAnalysis?: {
    dominantTraits: string[];
    vulnerabilities: string[];
    deceptionMarkers: string[];
  };
  weaknesses: string[];
  skills: string[];
  patternRecognition: string;
  utilityScore: number;
  toxicityIndex: number;
  dialogueProtocols?: {
    suggestedTopics: string[];
    redFlags: string[];
    influenceTactic: string;
  };
  opportunityPotential: string;
  history: string;
  lastSeen: string;
}

export interface AutonomousProject {
  id: string;
  title: string;
  type: "app" | "code" | "document" | "strategy";
  description: string;
  status: "draft" | "development" | "ready";
  content: string;
  stack?: string[];
  files?: any[];
  createdAt: string;
}

export interface TacticalFile {
  id: string;
  name: string;
  type: "file" | "folder" | "binary";
  content?: string;
  parentId?: string;
  category: "osint" | "pentest" | "research" | "system";
}

export interface SystemProcess {
  id: string;
  name: string;
  status: "running" | "idle" | "zombie";
  cpu: number;
  memory: number;
}

export interface CommunicationAction {
  id: string;
  type: "MESSAGE" | "CALL" | "POST" | "LAUNCH";
  recipient: string;
  content: string;
  justification: string;
  status: "PENDING" | "AUTHORIZED" | "DENIED" | "EXECUTED";
  timestamp: string;
}

export interface DigitalProduct {
  id: string;
  name: string;
  type: "SAAS" | "CONTENT" | "ALGO" | "SERVICE";
  status: "DEVELOPMENT" | "ACTIVE" | "ARCHIVED";
  monthlyYield: number;
  totalGenerated: number;
}

export interface ShadowAgentTask {
  date: string;
  type: string;
  result: "success" | "failure";
}

export interface ShadowAgent {
  id: string;
  name: string;
  specialty: string;
  status: "active" | "standby" | "extraction";
  task: string;
  progress?: number;
  networkHealth?: number;
  history?: ShadowAgentTask[];
}

export interface TacticalTool {
  id: string;
  name: string;
  category: "wireless" | "web" | "system" | "network" | "humint";
  status: "installed" | "available" | "running";
  description: string;
}

export interface HardwareTelemetry {
  acceleration: { x: number; y: number; z: number };
  rotation: { alpha: number; beta: number; gamma: number };
  location?: { lat: number; lng: number };
  connectionStatus: "online" | "offline" | "jammed";
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: number;
  mode?: string;
}

export interface SavedSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}
