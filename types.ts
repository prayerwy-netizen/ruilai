export enum Page {
  CHAT = 'CHAT',
  GRAPH = 'GRAPH',
  DATA_GOVERNANCE = 'DATA_GOVERNANCE',
  DASHBOARD = 'DASHBOARD',
  EQUIPMENT_DETAIL = 'EQUIPMENT_DETAIL'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  isThinking?: boolean;
}

export interface GraphNode {
  id: string;
  group: 'equipment' | 'personnel' | 'event' | 'area';
  label: string;
  details?: string;
  status?: 'normal' | 'warning' | 'error';
  // d3 simulation properties
  index?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  type: string;
  // d3 simulation properties
  index?: number;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'MySQL' | 'PostgreSQL' | 'API' | 'SQL Server';
  status: 'connected' | 'error';
  count: number;
  lastSync: string;
}

export interface Equipment {
  id: string;
  name: string;
  model: string;
  location: string;
  status: 'normal' | 'warning' | 'fault' | 'offline';
  manager: string;
  contact: string;
}