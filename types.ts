export enum UnitCategory {
  BASIC = '基础步兵',
  SPECIAL = '特殊兵种',
  CAVALRY = '骑兵系',
  RANGED = '远程火力',
  MAGIC = '魔法兵种'
}

export enum UnitType {
  INFANTRY = 'Infantry',
  ENGINEER = 'Engineer',
  SCOUT = 'Scout',
  MEDIC = 'Medic',
  CBRN = 'CBRN',
  SPECIAL_FORCES = 'SpecialForces',
  HEAVY_INFANTRY = 'HeavyInfantry',
  LIGHT_CAVALRY = 'LightCavalry',
  HEAVY_CAVALRY = 'HeavyCavalry',
  BEAST_CAVALRY = 'BeastCavalry',
  MUSKETEER = 'Musketeer',
  ARTILLERY = 'Artillery',
  MAGE = 'Mage'
}

export enum SoldierQuality {
  ROOKIE = 'Rookie',   // 100%
  VETERAN = 'Veteran', // 120%
  ELITE = 'Elite'      // 150%
}

export enum TrainingStatus {
  TRAINING = 'Training',
  READY = 'Ready'
}

export enum UnitStatus {
  IDLE = 'Idle',
  TRAINING = 'Training',
  DEPLOYED = 'Deployed'
}

export enum BuildingType {
  BARRACKS = 'Barracks',
  MARKET = 'Market',
  HOSPITAL = 'Hospital',
  WALLS = 'Walls'
}

export enum CommanderRarity {
  N = 'N',
  R = 'R',
  SR = 'SR',
  SSR = 'SSR'
}

export enum TerritoryStatus {
  LOCKED = 'Locked',
  AVAILABLE = 'Available', // Can be attacked
  OWNED = 'Owned'
}

export interface StatBias {
  power?: number;    // Weight for raw power (default 1.0)
  mobility?: number; // Weight for mobility
  range?: number;    // Weight for range
  magic?: number;    // Weight for magic
}

export interface UnitConfig {
  type: UnitType;
  category: UnitCategory;
  name: string;
  cost: number;
  maintenance: number;
  power: number;
  mobility: number;
  range: number;
  magic: number;
  description: string;
  bonuses?: string[];
}

export interface BuildingConfig {
  type: BuildingType;
  name: string;
  baseCost: number;
  costMultiplier: number; 
  description: string;
  effectDescription: string;
}

// For Tavern generation
export interface CommanderTemplate {
  name: string;
  title: string;
}

export interface Commander {
  id: string;
  name: string;
  title: string;
  rarity: CommanderRarity;
  cost: number;
  level: number;
  stats: {
    command: number;
    valor: number;
    strategy: number;
  };
  description: string;
}

export interface Territory {
  id: string;
  name: string;
  description: string;
  requiredPower: number; // Suggested power
  difficulty: 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS';
  rewardGold: number;
  bonusDescription: string;
  unlocks?: string[]; // IDs of next territories
  
  // Permanent Bonuses on conquer
  passiveIncome?: number;
  passivePopCap?: number;
  
  combatBias?: StatBias; // e.g. Needs high mobility
}

export interface Unit {
  id: string;
  type: UnitType;
  name: string;
  count: number;
  quality: SoldierQuality;
  status: UnitStatus; // NEW: idle, training, deployed
  trainingDaysLeft: number;
  power: number;
  mobility: number;
  range: number;
  magic: number;
  morale: number; 
  stamina: number; 
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  difficulty: 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS';
  requiredPower: number;
  rewardGold: number;
  duration: number; 
  dangerLevel: number; 
  bias?: StatBias; // Combat type bias
  isCampaign?: boolean; // Is this a territory attack?
  territoryId?: string;
}

export interface ActiveMission {
  id: string;
  quest: Quest;
  deployedUnitIds: string[];
  startDay: number;
  arrivalDay: number; // When it finishes
  winChance: number;
}

export interface BattleResult {
  questTitle: string;
  isVictory: boolean;
  rewardGold: number;
  losses: { unitName: string, count: number }[];
  territoryUnlocked?: string;
}

export interface GameEventChoice {
  text: string;
  effectDescription: string; // e.g. "Gold -500, Reputation +10"
  action: (state: GameState) => Partial<GameState>;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  choices: GameEventChoice[];
}

export interface GameLog {
  id: string;
  day: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
}

export interface GameState {
  day: number;
  gold: number;
  reputation: number;
  
  units: Unit[];
  commanders: Commander[]; // Owned
  tavernCommanders: Commander[]; // Available to hire
  buildings: Record<BuildingType, number>;
  territories: Record<string, TerritoryStatus>; // Map Progress
  
  activeMissions: ActiveMission[];
  dailyQuests: Quest[]; // NEW: Daily generated quests
  currentEvent: GameEvent | null;
  lastBattleResult: BattleResult | null;
  
  recruitedToday: number;
  lastTavernRefreshDay: number;
  
  logs: GameLog[];
  completedQuests: number;

  debugMode: boolean;
  cheatPopCapMod: number;
}