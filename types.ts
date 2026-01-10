export enum GameView {
  MENU = 'MENU',
  LEVEL_1 = 'LEVEL_1',
  LEVEL_2 = 'LEVEL_2',
  LEVEL_3 = 'LEVEL_3',
  LEADERBOARD = 'LEADERBOARD',
}

export interface UserState {
  score: number;
  level1Complete: boolean;
  level2Complete: boolean;
  level3Complete: boolean;
  username: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'ai';
}

// Level 1 Types
export interface MatterEntity {
  id: string;
  name: string;
  type: 'material' | 'consciousness'; // 'material' = Vật chất, 'consciousness' = Ý thức
  description: string;
  category: string; // e.g., 'Vật lý', 'Tâm trí', 'Trừu tượng'
}

// Level 2 Types
export interface SkillNode {
  id: string;
  label: string;
  x: number;
  y: number;
  status: 'locked' | 'unlocked' | 'completed';
  parents: string[];
  description: string;
  question?: string;
}

// Level 3 Types
export interface CityStats {
  material: number; // Steel, Food
  consciousness: number; // Education, Culture
  population: number;
  stability: number; // 0-100%
}
