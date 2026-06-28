
export interface JointAngle {
  name: string;
  current: number;
  healthy: [number, number]; // [min, max]
  status: 'optimal' | 'warning' | 'critical';
}

export interface PoseAnalysis {
  timestamp: number;
  angles: Record<string, number>;
  feedback: string[];
  score: number;
}

export interface User {
  username: string;
  isLoggedIn: boolean;
}

export enum AppState {
  LOGIN = 'login',
  DASHBOARD = 'dashboard',
  VIDEO_DEMO = 'video_demo',
  LIVE_DEMO = 'live_demo',
  RESULTS = 'results'
}
