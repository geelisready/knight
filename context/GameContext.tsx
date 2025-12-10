import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GameState, Unit, UnitType, GameLog, Quest, BuildingType, Commander, SoldierQuality, TrainingStatus, TerritoryStatus, CommanderRarity, ActiveMission, UnitStatus, BattleResult, GameEvent } from '../types';
import { 
  INITIAL_GOLD, UNIT_CONFIGS, BUILDING_CONFIGS, 
  BASE_POPULATION_CAP, QUALITY_STATS, TRAINING_DAYS, DAILY_RECRUIT_PERCENT,
  getUnitScaleName, CAMPAIGN_MAP, RARITY_CONFIG, COMMANDER_NAMES, COMMANDER_TITLES, TAVERN_REFRESH_DAYS, RANDOM_EVENTS,
  QUEST_TEMPLATES
} from '../constants';

interface GameContextType extends GameState {
  totalPower: number;
  totalSoldiers: number;
  maxPopulation: number;
  dailyMaintenance: number;
  dailyIncome: number;
  
  // Advanced Stats
  armyStats: {
    power: number;
    mobility: number;
    range: number;
    magic: number;
  };

  recruitUnit: (type: UnitType, quantity: number) => void;
  advanceTime: () => void;
  deployArmy: (quest: Quest, selectedUnitIds: string[], winChance: number) => void;
  resetGame: () => void;
  upgradeBuilding: (type: BuildingType) => void;
  recruitCommander: (commanderId: string) => void;
  refreshTavern: () => void;
  mergeUnits: (unitIds: string[]) => void;
  
  // UI Handlers
  handleEventChoice: (choiceIndex: number) => void;
  closeBattleResult: () => void;
  
  // Debug functions
  setGold: (amount: number) => void;
  setCheatPopCapMod: (amount: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const INITIAL_TERRITORIES: Record<string, TerritoryStatus> = {};
CAMPAIGN_MAP.forEach(t => {
  INITIAL_TERRITORIES[t.id] = TerritoryStatus.LOCKED;
});
INITIAL_TERRITORIES['t_start'] = TerritoryStatus.AVAILABLE;

// Generate initial daily quests
const generateInitialQuests = () => {
    return [
        { ...QUEST_TEMPLATES[0], id: 'dq_init_1', requiredPower: 500 } as Quest,
        { ...QUEST_TEMPLATES[3], id: 'dq_init_2', requiredPower: 300 } as Quest
    ];
};

const INITIAL_STATE: GameState = {
  day: 1,
  gold: INITIAL_GOLD,
  reputation: 0,
  units: [],
  commanders: [],
  tavernCommanders: [],
  buildings: {
    [BuildingType.BARRACKS]: 0,
    [BuildingType.MARKET]: 0,
    [BuildingType.HOSPITAL]: 0,
    [BuildingType.WALLS]: 0,
  },
  territories: INITIAL_TERRITORIES,
  activeMissions: [],
  dailyQuests: generateInitialQuests(),
  currentEvent: null,
  lastBattleResult: null,
  logs: [{ id: 'init', day: 1, message: '欢迎来到霜风堡，指挥官。异界裂隙已开启，请尽快整军备战！', type: 'info' }],
  completedQuests: 0,
  recruitedToday: 0,
  lastTavernRefreshDay: 0,
  debugMode: false,
  cheatPopCapMod: 0
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<GameState>(INITIAL_STATE);

  // --- Logic Helpers ---

  const generateCommander = (): Commander => {
    const roll = Math.random();
    let rarity = CommanderRarity.N;
    let accumulatedProb = 0;

    for (const r of [CommanderRarity.N, CommanderRarity.R, CommanderRarity.SR, CommanderRarity.SSR]) {
       accumulatedProb += RARITY_CONFIG[r].prob;
       if (roll <= accumulatedProb) {
         rarity = r;
         break;
       }
    }

    const config = RARITY_CONFIG[rarity];
    const baseCost = 1000;
    
    // Generate Stats
    const genStat = () => Math.floor(Math.random() * (config.maxStat - config.minStat + 1)) + config.minStat;
    
    const name = COMMANDER_NAMES[Math.floor(Math.random() * COMMANDER_NAMES.length)];
    const title = COMMANDER_TITLES[Math.floor(Math.random() * COMMANDER_TITLES.length)];

    return {
      id: Math.random().toString(36).substr(2, 9),
      name,
      title,
      rarity,
      cost: Math.floor(baseCost * config.costMult),
      level: 1,
      stats: {
        command: genStat(),
        valor: genStat(),
        strategy: genStat()
      },
      description: `一位拥有[${rarity}]级潜力的指挥官。`
    };
  };

  const generateDailyQuests = (currentPop: number) => {
    // Number of quests scales with population, min 3, max 10
    const count = Math.min(10, Math.max(3, Math.floor(currentPop / 50) + 2));
    const newQuests: Quest[] = [];
    
    for(let i=0; i<count; i++) {
        const template = QUEST_TEMPLATES[Math.floor(Math.random() * QUEST_TEMPLATES.length)];
        
        // 20% chance to keep the bias requirements, otherwise remove them for normal quests
        const keepBias = Math.random() < 0.2;
        
        // Scale power requirement with player population slightly, but keep variance
        // Base difficulty multiplier: F=1, E=2, D=3...
        const diffMult = {'F':0.5, 'E':1, 'D':2, 'C':3, 'B':4, 'A':6, 'S':10, 'SS':20}[template.difficulty || 'E'] || 1;
        
        // Random variation 0.8 - 1.2
        const varMult = 0.8 + Math.random() * 0.4;
        
        // Simple power scaling logic for infinite play
        const basePower = 300 * diffMult * (1 + (state.day / 100)); // gets harder over time
        
        newQuests.push({
            ...template,
            id: `dq_${state.day}_${i}`,
            requiredPower: Math.floor(basePower * varMult),
            bias: keepBias ? template.bias : undefined
        } as Quest);
    }
    return newQuests;
  };

  useEffect(() => {
    if (state.tavernCommanders.length === 0) {
       refreshTavernInternal();
    }
  }, []);

  const refreshTavernInternal = (currentState = state) => {
     const newCmds = [generateCommander(), generateCommander(), generateCommander()];
     setState(prev => ({
       ...prev,
       tavernCommanders: newCmds,
       lastTavernRefreshDay: prev.day
     }));
     return newCmds;
  };

  const refreshTavern = () => refreshTavernInternal();

  // --- Derived Stats Calculation ---

  const getCommanderBonus = () => {
    return state.commanders.reduce((acc, cmd) => ({
      command: acc.command + cmd.stats.command,
      valor: acc.valor + cmd.stats.valor,
      strategy: acc.strategy + cmd.stats.strategy,
    }), { command: 0, valor: 0, strategy: 0 });
  };

  const commanderBonus = getCommanderBonus();

  const getTerritoryBonuses = () => {
    let income = 0;
    let pop = 0;
    CAMPAIGN_MAP.forEach(t => {
      if (state.territories[t.id] === TerritoryStatus.OWNED) {
        if (t.passiveIncome) income += t.passiveIncome;
        if (t.passivePopCap) pop += t.passivePopCap;
      }
    });
    return { income, pop };
  };

  const territoryBonus = getTerritoryBonuses();
  const totalSoldiers = state.units.reduce((acc, unit) => acc + unit.count, 0);

  const maxPopulation = BASE_POPULATION_CAP 
    + (state.buildings[BuildingType.BARRACKS] * 100) 
    + (commanderBonus.command * 10)
    + territoryBonus.pop
    + state.cheatPopCapMod;

  const armyStats = state.units.reduce((acc, unit) => {
    const trainingMod = unit.status === UnitStatus.TRAINING ? 0.6 : 1.0;
    const count = unit.count;
    return {
      power: acc.power + (unit.power * count * trainingMod),
      mobility: acc.mobility + (unit.mobility * count * trainingMod),
      range: acc.range + (unit.range * count * trainingMod),
      magic: acc.magic + (unit.magic * count * trainingMod),
    };
  }, { power: 0, mobility: 0, range: 0, magic: 0 });

  armyStats.power = Math.floor(armyStats.power * (1 + commanderBonus.valor * 0.05));
  const totalPower = armyStats.power;

  const dailyMaintenance = state.units.reduce((acc, unit) => {
    const config = UNIT_CONFIGS[unit.type];
    return acc + (config.maintenance * unit.count);
  }, 0);

  const dailyIncome = (state.buildings[BuildingType.MARKET] * 150) + territoryBonus.income;

  const addLog = (message: string, type: GameLog['type'] = 'info') => {
    setState(prev => ({ ...prev, logs: [{ id: Math.random().toString(36).substr(2, 9), day: prev.day, message, type }, ...prev.logs].slice(0, 50) }));
  };

  // --- Actions ---

  const advanceTime = () => {
    setState(prev => {
      // Advance by 1 Day directly
      let nextDay = prev.day + 1;
      let nextGold = prev.gold;
      let nextRecruitedToday = 0; // Reset daily limit
      let nextUnits = [...prev.units];
      let nextActiveMissions = [...prev.activeMissions];
      let battleResult: BattleResult | null = null;
      let nextTerritories = { ...prev.territories };
      let nextReputation = prev.reputation;
      let nextCompletedQuests = prev.completedQuests;
      let nextEvent = prev.currentEvent;
      let nextDailyQuests = prev.dailyQuests;

      // 1. Process Missions (Arriving today)
      const finishedMissions = nextActiveMissions.filter(m => m.arrivalDay <= nextDay);
      const remainingMissions = nextActiveMissions.filter(m => m.arrivalDay > nextDay);

      finishedMissions.forEach(mission => {
         const isVictory = Math.random() < mission.winChance;
         const lossMod = prev.buildings[BuildingType.HOSPITAL] * 0.01;
         
         const losses: { unitName: string, count: number }[] = [];
         
         nextUnits = nextUnits.map(unit => {
             if (mission.deployedUnitIds.includes(unit.id)) {
                 let newUnit = { ...unit, status: UnitStatus.IDLE };
                 if (newUnit.count > 0) {
                     let lossPercent = isVictory ? 0.05 : 0.15;
                     lossPercent = Math.max(0.01, lossPercent - lossMod);
                     lossPercent = lossPercent * (0.5 + Math.random());
                     
                     const lossCount = Math.ceil(newUnit.count * lossPercent);
                     if (lossCount > 0) {
                         losses.push({ unitName: newUnit.name, count: lossCount });
                         newUnit.count = Math.max(0, newUnit.count - lossCount);
                     }
                 }
                 return newUnit;
             }
             return unit;
         }).filter(u => u.count > 0);

         if (isVictory) {
             nextGold += mission.quest.rewardGold;
             nextReputation += mission.quest.dangerLevel * 10;
             nextCompletedQuests += 1;
             
             if (mission.quest.isCampaign && mission.quest.territoryId) {
                nextTerritories[mission.quest.territoryId] = TerritoryStatus.OWNED;
                const territory = CAMPAIGN_MAP.find(t => t.id === mission.quest.territoryId);
                if (territory && territory.unlocks) {
                    territory.unlocks.forEach(unlockId => {
                        if (nextTerritories[unlockId] === TerritoryStatus.LOCKED) {
                            nextTerritories[unlockId] = TerritoryStatus.AVAILABLE;
                        }
                    });
                }
             }
         }

         battleResult = {
             questTitle: mission.quest.title,
             isVictory,
             rewardGold: isVictory ? mission.quest.rewardGold : 0,
             losses,
             territoryUnlocked: (isVictory && mission.quest.isCampaign) ? mission.quest.title : undefined
         };
      });

      nextActiveMissions = remainingMissions;
      
      // 2. Daily Economy
      const maintenanceCost = nextUnits.reduce((acc, unit) => acc + (UNIT_CONFIGS[unit.type].maintenance * unit.count), 0);
      let terIncome = 0;
      CAMPAIGN_MAP.forEach(t => { if (nextTerritories[t.id] === TerritoryStatus.OWNED) terIncome += (t.passiveIncome || 0); });
      const totalIncome = (prev.buildings[BuildingType.MARKET] * 150) + terIncome;
      nextGold = nextGold - maintenanceCost + totalIncome;

      // 3. Training
      nextUnits = nextUnits.map(unit => {
        if (unit.status === UnitStatus.TRAINING) {
          const newDays = unit.trainingDaysLeft - 1;
          if (newDays <= 0) {
            return { ...unit, trainingDaysLeft: 0, status: UnitStatus.IDLE, trainingStatus: TrainingStatus.READY };
          }
          return { ...unit, trainingDaysLeft: newDays };
        }
        return unit;
      });

      // 4. Quest Refresh
      const currentPop = nextUnits.reduce((acc, u) => acc + u.count, 0);
      nextDailyQuests = generateDailyQuests(currentPop);

      // 5. Events
      if (Math.random() < 0.15 && !nextEvent) {
          const randomEvent = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
          nextEvent = randomEvent;
      }

      return {
        ...prev,
        day: nextDay,
        gold: nextGold,
        units: nextUnits,
        territories: nextTerritories,
        activeMissions: nextActiveMissions,
        dailyQuests: nextDailyQuests,
        lastBattleResult: battleResult || prev.lastBattleResult,
        currentEvent: nextEvent,
        recruitedToday: nextRecruitedToday,
        reputation: nextReputation,
        completedQuests: nextCompletedQuests
      };
    });
  };

  const deployArmy = (quest: Quest, selectedUnitIds: string[], winChance: number) => {
      setState(prev => {
          const arrivalDay = prev.day + quest.duration;
          
          const newMission: ActiveMission = {
              id: Math.random().toString(36).substr(2, 9),
              quest,
              deployedUnitIds: selectedUnitIds,
              startDay: prev.day,
              arrivalDay,
              winChance: winChance / 100
          };

          const nextUnits = prev.units.map(u => {
              if (selectedUnitIds.includes(u.id)) {
                  return { ...u, status: UnitStatus.DEPLOYED };
              }
              return u;
          });

          // Remove the quest from dailyQuests if it's there
          const nextDailyQuests = prev.dailyQuests.filter(q => q.id !== quest.id);

          addLog(`部队出发前往 ${quest.title}，预计于第 ${arrivalDay} 天抵达。`, 'info');

          return {
              ...prev,
              activeMissions: [...prev.activeMissions, newMission],
              units: nextUnits,
              dailyQuests: nextDailyQuests
          };
      });
  };

  const handleEventChoice = (choiceIndex: number) => {
      setState(prev => {
          if (!prev.currentEvent) return prev;
          
          let nextGold = prev.gold;
          let nextReputation = prev.reputation;
          let nextUnits = [...prev.units];
          
          // Simplified hardcoded effect logic for MVP
          if (prev.currentEvent.id === 'evt_refugees') {
             if (choiceIndex === 0) { // Accept
                 nextGold -= 200;
                 nextReputation += 10;
                 const refugeeUnit: Unit = {
                     id: Math.random().toString(36), type: UnitType.INFANTRY, name: '民兵义勇军', count: 20, quality: SoldierQuality.ROOKIE, status: UnitStatus.TRAINING, trainingDaysLeft: 3,
                     power: 5, mobility: 5, range: 0, magic: 0, morale: 80, stamina: 80
                 };
                 nextUnits.push(refugeeUnit);
                 addLog('难民加入了我们的行列。', 'success');
             } else {
                 nextReputation -= 10;
             }
          } else if (prev.currentEvent.id === 'evt_merchant') {
             if (choiceIndex === 0) { // Buy
                 nextGold -= 1000;
                 nextReputation += 50; 
             } else if (choiceIndex === 1) { // Extort
                 nextGold += 500;
                 nextReputation -= 20;
             }
          } else if (prev.currentEvent.id === 'evt_festival') {
             if (choiceIndex === 0) {
                 nextGold -= 500;
                 nextReputation += 30;
             } else {
                 nextReputation -= 10;
             }
          }

          return {
              ...prev,
              gold: nextGold,
              reputation: nextReputation,
              units: nextUnits,
              currentEvent: null
          };
      });
  };

  const mergeUnits = (unitIds: string[]) => {
      setState(prev => {
          const targets = prev.units.filter(u => unitIds.includes(u.id));
          if (targets.length < 2) return prev;
          
          const type = targets[0].type;
          const totalCount = targets.reduce((sum, u) => sum + u.count, 0);
          
          let primary = targets[0];
          targets.forEach(u => {
              if (u.count > primary.count) primary = u;
          });

          const config = UNIT_CONFIGS[type];
          const qualityInfo = QUALITY_STATS[primary.quality];
          const scaleName = getUnitScaleName(totalCount);
          const newName = `${qualityInfo.name}${config.name}${scaleName}`;

          const newUnit: Unit = {
              ...primary,
              id: Math.random().toString(36).substr(2, 9),
              count: totalCount,
              name: newName,
              status: UnitStatus.IDLE 
          };

          const remainingUnits = prev.units.filter(u => !unitIds.includes(u.id));
          
          addLog(`将 ${targets.length} 支部队合并为 ${newName} (${totalCount}人)。`, 'info');

          return {
              ...prev,
              units: [...remainingUnits, newUnit]
          };
      });
  };

  const closeBattleResult = () => {
      setState(prev => ({ ...prev, lastBattleResult: null }));
  };

  const recruitUnit = (type: UnitType, quantity: number) => {
    const dailyCap = Math.floor(maxPopulation * DAILY_RECRUIT_PERCENT);
    
    if (totalSoldiers + quantity > maxPopulation) {
      addLog(`人口已达上限 (${maxPopulation})。请升级兵营或攻占村庄。`, 'warning');
      return;
    }

    if (state.recruitedToday + quantity > dailyCap) {
        addLog(`今日招募名额已用尽。`, 'warning');
        return;
    }

    const config = UNIT_CONFIGS[type];
    const totalCost = config.cost * quantity;

    if (state.gold < totalCost) {
      addLog(`金币不足。`, 'warning');
      return;
    }

    const roll = Math.random();
    let quality = SoldierQuality.ROOKIE;
    if (roll > 0.95) quality = SoldierQuality.ELITE;
    else if (roll > 0.70) quality = SoldierQuality.VETERAN;

    const qualityStats = QUALITY_STATS[quality];
    const multiplier = qualityStats.multiplier;

    const newUnit: Unit = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      name: `${qualityStats.name}${config.name}${getUnitScaleName(quantity)}`,
      count: quantity,
      quality,
      status: UnitStatus.TRAINING,
      trainingDaysLeft: TRAINING_DAYS,
      power: Math.floor(config.power * multiplier),
      mobility: Math.floor(config.mobility * multiplier),
      range: config.range,
      magic: Math.floor(config.magic * multiplier),
      morale: 100,
      stamina: 100
    };

    setState(prev => ({
      ...prev,
      gold: prev.gold - totalCost,
      units: [...prev.units, newUnit],
      recruitedToday: prev.recruitedToday + quantity
    }));

    addLog(`征召了 ${quantity} 名 ${qualityStats.name}${config.name}。`, 'success');
  };

  const upgradeBuilding = (type: BuildingType) => {
    const config = BUILDING_CONFIGS[type];
    const currentLevel = state.buildings[type];
    const cost = Math.floor(config.baseCost * Math.pow(config.costMultiplier, currentLevel));

    if (state.gold < cost) {
      addLog(`金币不足。`, 'warning');
      return;
    }

    setState(prev => ({
      ...prev,
      gold: prev.gold - cost,
      buildings: { ...prev.buildings, [type]: prev.buildings[type] + 1 }
    }));
    addLog(`升级了 ${config.name}。`, 'success');
  };

  const recruitCommander = (commanderId: string) => {
    const cmd = state.tavernCommanders.find(c => c.id === commanderId);
    if (!cmd) return;

    if (state.gold < cmd.cost) {
      addLog(`无法支付 ${cmd.name} 的佣金。`, 'warning');
      return;
    }

    setState(prev => ({
      ...prev,
      gold: prev.gold - cmd.cost,
      commanders: [...prev.commanders, cmd],
      tavernCommanders: prev.tavernCommanders.filter(c => c.id !== commanderId)
    }));
    addLog(`成功招募了 ${cmd.name}！`, 'success');
  };

  const resetGame = () => {
    setState(INITIAL_STATE);
  };

  const setGold = (val: number) => setState(p => ({ ...p, gold: val }));
  const setCheatPopCapMod = (val: number) => setState(p => ({ ...p, cheatPopCapMod: val }));

  return (
    <GameContext.Provider value={{
      ...state,
      totalPower,
      totalSoldiers,
      maxPopulation,
      dailyMaintenance,
      dailyIncome,
      armyStats,
      recruitUnit,
      advanceTime,
      deployArmy,
      resetGame,
      upgradeBuilding,
      recruitCommander,
      refreshTavern,
      handleEventChoice,
      closeBattleResult,
      setGold,
      setCheatPopCapMod,
      mergeUnits
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};