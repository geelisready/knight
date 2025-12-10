import { UnitType, UnitCategory, UnitConfig, Quest, BuildingType, BuildingConfig, SoldierQuality, Territory, TerritoryStatus, CommanderRarity, GameEvent } from './types';

export const INITIAL_GOLD = 10000;

export const BASE_POPULATION_CAP = 200; 
export const DAILY_RECRUIT_PERCENT = 0.1;
export const TAVERN_REFRESH_DAYS = 3;

export const QUALITY_STATS: Record<SoldierQuality, { multiplier: number, name: string, prob: number }> = {
  [SoldierQuality.ROOKIE]: { multiplier: 1.0, name: '新兵', prob: 0.70 },
  [SoldierQuality.VETERAN]: { multiplier: 1.2, name: '老兵', prob: 0.25 },
  [SoldierQuality.ELITE]: { multiplier: 1.5, name: '精锐', prob: 0.05 },
};

export const TRAINING_DAYS = 3;
export const BATCH_SIZE = 20;

// --- Commander Generation Data ---
export const RARITY_CONFIG: Record<CommanderRarity, { color: string, minStat: number, maxStat: number, costMult: number, prob: number }> = {
  [CommanderRarity.N]: { color: 'text-stone-400', minStat: 1, maxStat: 5, costMult: 1, prob: 0.5 },
  [CommanderRarity.R]: { color: 'text-blue-400', minStat: 4, maxStat: 10, costMult: 3, prob: 0.35 },
  [CommanderRarity.SR]: { color: 'text-purple-400', minStat: 8, maxStat: 18, costMult: 8, prob: 0.12 },
  [CommanderRarity.SSR]: { color: 'text-amber-500', minStat: 15, maxStat: 30, costMult: 20, prob: 0.03 },
};

export const COMMANDER_TITLES = [
  '铁壁', '游侠', '智者', '狂战', '守护者', '先锋', '灰烬', '黎明', '暗影', '荣耀', '审判'
];
export const COMMANDER_NAMES = [
  '加雷斯', '艾拉', '罗兰德', '齐格飞', '贞德', '亚瑟', '兰斯洛特', '高文', '特里斯坦', '贝德维尔',
  '凯', '加拉哈德', '帕西瓦尔', '博斯', '杰兰特', '拉莫洛克'
];

// --- Campaign Map ---
export const CAMPAIGN_MAP: Territory[] = [
  {
    id: 't_start',
    name: '霜风堡外围',
    description: '清理聚集在堡垒周边的低级魔物，确保据点安全。',
    requiredPower: 300,
    difficulty: 'F',
    rewardGold: 1000,
    bonusDescription: '声望开启，基础税收 +50',
    passiveIncome: 50,
    unlocks: ['t_village'],
    combatBias: { power: 1.0 }
  },
  {
    id: 't_village',
    name: '晨光村',
    description: '一座被兽人占据的村庄。夺回它将为我们提供稳定的兵源和税收。',
    requiredPower: 1500,
    difficulty: 'D',
    rewardGold: 3000,
    bonusDescription: '每日税收 +200，人口上限 +50',
    passiveIncome: 200,
    passivePopCap: 50,
    unlocks: ['t_mine', 't_forest'],
    combatBias: { power: 1.0 } // Balanced fight
  },
  {
    id: 't_mine',
    name: '黑铁矿坑',
    description: '重要的战略资源点。地形狭窄，适合步兵推进。',
    requiredPower: 4000,
    difficulty: 'C',
    rewardGold: 5000,
    bonusDescription: '每日税收 +500',
    passiveIncome: 500,
    unlocks: ['t_fort'],
    combatBias: { power: 1.2, mobility: 0.5 } // Low mobility effectiveness, pure power needed
  },
  {
    id: 't_forest',
    name: '低语森林',
    description: '精灵与魔物混杂的区域。需要高机动部队进行游击战。',
    requiredPower: 3500,
    difficulty: 'C',
    rewardGold: 4000,
    bonusDescription: '招募魔物/精灵类单位成功率提升（暂未实装），人口上限 +30',
    passivePopCap: 30,
    unlocks: [],
    combatBias: { mobility: 2.0, range: 1.5 } // High mobility/range favored
  },
  {
    id: 't_fort',
    name: '风息要塞',
    description: '一座坚固的军事堡垒。必须使用重火力攻坚。',
    requiredPower: 10000,
    difficulty: 'A',
    rewardGold: 15000,
    bonusDescription: '人口上限 +200，解锁高级兵种科技（暂未实装）',
    passivePopCap: 200,
    unlocks: ['t_capital'],
    combatBias: { range: 2.5, magic: 1.5, mobility: 0.2 } // Siege warfare: Needs Range/Magic, Cavalry useless
  },
  {
    id: 't_capital',
    name: '旧王都废墟',
    description: '决战之地。夺回人类的荣耀！',
    requiredPower: 50000,
    difficulty: 'SS',
    rewardGold: 100000,
    bonusDescription: '游戏通关',
    passiveIncome: 5000,
    unlocks: [],
    combatBias: { power: 1.0, magic: 1.0, range: 1.0, mobility: 1.0 }
  }
];

// Replaced sample quests with templates for generation
export const QUEST_TEMPLATES: Partial<Quest>[] = [
  { title: '物资护送', description: '协助商队穿过危险区域。需要高机动性快速通过。', difficulty: 'E', rewardGold: 800, duration: 1, dangerLevel: 2, bias: { mobility: 2.0 } },
  { title: '阵地防守', description: '死守据点直到援军抵达。需要重火力覆盖。', difficulty: 'D', rewardGold: 1500, duration: 1, dangerLevel: 3, bias: { range: 1.5, power: 1.2 } },
  { title: '驱散魔雾', description: '森林中出现了诡异的雾气。需要魔法单位进行净化。', difficulty: 'C', rewardGold: 2500, duration: 2, dangerLevel: 3, bias: { magic: 2.5 } },
  { title: '剿灭匪徒', description: '清理附近的强盗营地。常规作战。', difficulty: 'E', rewardGold: 500, duration: 1, dangerLevel: 1, bias: { power: 1.0 } },
  { title: '夜间侦查', description: '潜入敌后收集情报。需要极高的机动性。', difficulty: 'D', rewardGold: 1200, duration: 1, dangerLevel: 2, bias: { mobility: 2.5 } },
  { title: '攻城支援', description: '协助友军攻打小型堡垒。需要远程火力。', difficulty: 'C', rewardGold: 3000, duration: 3, dangerLevel: 4, bias: { range: 2.0 } },
  { title: '猎杀魔兽', description: '一只强大的魔兽正在肆虐。推荐使用魔法攻击。', difficulty: 'B', rewardGold: 5000, duration: 2, dangerLevel: 5, bias: { magic: 2.0 } },
];

export const UNIT_CONFIGS: Record<UnitType, UnitConfig> = {
  [UnitType.INFANTRY]: { type: UnitType.INFANTRY, category: UnitCategory.BASIC, name: '普通步兵', cost: 50, maintenance: 2, power: 10, mobility: 10, range: 0, magic: 0, description: '均衡的步兵单位。', bonuses: [] },
  [UnitType.ENGINEER]: { type: UnitType.ENGINEER, category: UnitCategory.SPECIAL, name: '工兵', cost: 120, maintenance: 6, power: 11, mobility: 10, range: 0, magic: 0, description: '擅长攻城和建造防御工事。', bonuses: ['战力+10%', '攻城效率+30%'] },
  [UnitType.SCOUT]: { type: UnitType.SCOUT, category: UnitCategory.SPECIAL, name: '侦察兵', cost: 100, maintenance: 5, power: 8, mobility: 50, range: 5, magic: 0, description: '负责情报收集，机动性极高。', bonuses: ['机动+50%', '委托成功率+15%'] },
  [UnitType.MEDIC]: { type: UnitType.MEDIC, category: UnitCategory.SPECIAL, name: '医疗兵', cost: 150, maintenance: 7, power: 5, mobility: 10, range: 0, magic: 5, description: '战场救护单位，能大幅减少伤亡。', bonuses: ['战斗减员-50%', '精力恢复+100%'] },
  [UnitType.CBRN]: { type: UnitType.CBRN, category: UnitCategory.SPECIAL, name: '防化兵', cost: 180, maintenance: 8, power: 12, mobility: 10, range: 10, magic: 0, description: '对抗瘟疫和毒气类魔物的专家。', bonuses: ['免疫Debuff', '特殊环境伤害+30%'] },
  [UnitType.SPECIAL_FORCES]: { type: UnitType.SPECIAL_FORCES, category: UnitCategory.SPECIAL, name: '特种部队', cost: 300, maintenance: 15, power: 20, mobility: 20, range: 10, magic: 0, description: '执行高难度任务的精英单位。', bonuses: ['全属性+20%'] },
  [UnitType.HEAVY_INFANTRY]: { type: UnitType.HEAVY_INFANTRY, category: UnitCategory.SPECIAL, name: '重甲步兵', cost: 150, maintenance: 8, power: 20, mobility: 8, range: 0, magic: 0, description: '身披重甲，正面作战能力极强。', bonuses: ['战力+20%', '机动-20%', '精力消耗+30%'] },
  [UnitType.LIGHT_CAVALRY]: { type: UnitType.LIGHT_CAVALRY, category: UnitCategory.CAVALRY, name: '轻骑兵', cost: 200, maintenance: 10, power: 12, mobility: 80, range: 0, magic: 0, description: '快速机动，适合侦查和骚扰。', bonuses: ['机动+80%', '战力+10%'] },
  [UnitType.HEAVY_CAVALRY]: { type: UnitType.HEAVY_CAVALRY, category: UnitCategory.CAVALRY, name: '重骑兵', cost: 350, maintenance: 18, power: 25, mobility: 40, range: 0, magic: 0, description: '冲锋突破，正面作战强悍。', bonuses: ['战力+40%', '机动+40%', '精力消耗+20%'] },
  [UnitType.BEAST_CAVALRY]: { type: UnitType.BEAST_CAVALRY, category: UnitCategory.CAVALRY, name: '魔兽骑兵', cost: 500, maintenance: 25, power: 30, mobility: 60, range: 0, magic: 20, description: '骑乘魔兽作战，拥有极强的威慑力。', bonuses: ['战力+50%', '士气+30%', '魔抗+20%'] },
  [UnitType.MUSKETEER]: { type: UnitType.MUSKETEER, category: UnitCategory.RANGED, name: '火枪兵', cost: 180, maintenance: 9, power: 15, mobility: 10, range: 50, magic: 0, description: '远程火器部队，穿透力强。', bonuses: ['远程+50%', '破甲伤害+30%'] },
  [UnitType.ARTILLERY]: { type: UnitType.ARTILLERY, category: UnitCategory.RANGED, name: '重炮兵', cost: 400, maintenance: 20, power: 40, mobility: 5, range: 80, magic: 0, description: '攻城利器，对建筑有毁灭性打击。', bonuses: ['远程+80%', '攻城伤害+100%', '机动-40%'] },
  [UnitType.MAGE]: { type: UnitType.MAGE, category: UnitCategory.MAGIC, name: '魔法兵', cost: 450, maintenance: 22, power: 25, mobility: 10, range: 30, magic: 100, description: '施放战斗魔法，克制魔物。', bonuses: ['魔法+100%', '对魔物+50%', '精力消耗+40%'] }
};

export const BUILDING_CONFIGS: Record<BuildingType, BuildingConfig> = {
  [BuildingType.BARRACKS]: { type: BuildingType.BARRACKS, name: '兵营', baseCost: 2000, costMultiplier: 1.5, description: '扩建兵营以容纳更多士兵。', effectDescription: '每级 +100 最大人口上限' },
  [BuildingType.MARKET]: { type: BuildingType.MARKET, name: '市场', baseCost: 800, costMultiplier: 1.6, description: '繁荣的市场能带来稳定的税收。', effectDescription: '每级 +150 每日税收' },
  [BuildingType.HOSPITAL]: { type: BuildingType.HOSPITAL, name: '野战医院', baseCost: 1000, costMultiplier: 1.8, description: '为伤员提供及时救治。', effectDescription: '每级降低 5% 任务死亡率' },
  [BuildingType.WALLS]: { type: BuildingType.WALLS, name: '城墙', baseCost: 2000, costMultiplier: 2.0, description: '坚固的城墙是安全的保障。', effectDescription: '每级增加任务失败时的撤退成功率' }
};

export const getUnitScaleName = (count: number): string => {
  if (count <= 20) return '班';
  if (count <= 50) return '小队';
  if (count <= 100) return '排';
  if (count <= 250) return '连';
  if (count <= 500) return '营';
  if (count <= 1000) return '团';
  if (count <= 2500) return '旅';
  if (count <= 5000) return '师';
  if (count <= 10000) return '军';
  return '集团军';
};

// --- Random Events Definitions ---
export const RANDOM_EVENTS: GameEvent[] = [
  {
    id: 'evt_refugees',
    title: '难民潮',
    description: '一群逃避战乱的难民聚集在要塞外，请求庇护。他们虽然贫穷，但其中可能有一些青壮年劳力。',
    choices: [
      {
        text: '接纳他们',
        effectDescription: '人口 +20，金币 -200，声望 +10',
        action: (state) => ({})
      },
      {
        text: '驱逐他们',
        effectDescription: '声望 -10',
        action: (state) => ({})
      }
    ]
  },
  {
    id: 'evt_merchant',
    title: '黑市商人',
    description: '一位行踪诡秘的商人希望能在这个动荡时期向你的部队兜售一些"特别"的物资。',
    choices: [
      {
        text: '购买军备物资',
        effectDescription: '金币 -1000，声望 +50',
        action: (state) => ({})
      },
      {
        text: '征收保护费',
        effectDescription: '金币 +500，声望 -20',
        action: (state) => ({})
      },
      {
        text: '赶走他',
        effectDescription: '无事发生',
        action: (state) => ({})
      }
    ]
  },
  {
    id: 'evt_festival',
    title: '丰收庆典',
    description: '虽然战火纷飞，但附近的村民依然希望能举办一个小型的庆典来祈祷和平。',
    choices: [
      {
        text: '赞助庆典',
        effectDescription: '金币 -500，声望 +30',
        action: (state) => ({})
      },
      {
        text: '禁止聚集',
        effectDescription: '声望 -10',
        action: (state) => ({})
      }
    ]
  }
];