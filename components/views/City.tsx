import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { BUILDING_CONFIGS, RARITY_CONFIG, TAVERN_REFRESH_DAYS } from '../../constants';
import { BuildingType, CommanderRarity } from '../../types';
import { Coins, Hammer, Crown, RefreshCw, UserPlus, Clock } from 'lucide-react';

export const City: React.FC = () => {
  const { gold, buildings, upgradeBuilding, recruitCommander, commanders, tavernCommanders, lastTavernRefreshDay, day, refreshTavern } = useGame();
  const [activeSection, setActiveSection] = useState<'buildings' | 'tavern'>('buildings');

  const buildingTypes = Object.values(BuildingType);

  const getRarityStyle = (rarity: CommanderRarity) => {
      const config = RARITY_CONFIG[rarity];
      return config.color;
  };

  const getRarityBadge = (rarity: CommanderRarity) => {
     switch(rarity) {
         case CommanderRarity.N: return 'bg-stone-800 text-stone-400 border-stone-600';
         case CommanderRarity.R: return 'bg-blue-900/30 text-blue-400 border-blue-600';
         case CommanderRarity.SR: return 'bg-purple-900/30 text-purple-400 border-purple-600';
         case CommanderRarity.SSR: return 'bg-amber-900/30 text-amber-500 border-amber-600';
     }
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in pb-20 md:pb-0">
      
      <div className="flex justify-between items-center bg-stone-900 p-4 rounded-xl border border-stone-800 sticky top-0 z-10 md:static">
        <div>
           <h2 className="text-xl md:text-2xl font-bold text-stone-100 font-serif">领地中心</h2>
           <p className="text-xs text-stone-500 hidden md:block">建设基础设施，招募传奇指挥官</p>
        </div>
        <div className="flex gap-2">
             <button 
                onClick={() => setActiveSection('buildings')}
                className={`px-3 py-1.5 text-sm rounded border transition-colors ${activeSection === 'buildings' ? 'bg-amber-900/40 border-amber-600 text-amber-200' : 'bg-stone-950 border-stone-800 text-stone-500'}`}
             >
                设施
             </button>
             <button 
                onClick={() => setActiveSection('tavern')}
                className={`px-3 py-1.5 text-sm rounded border transition-colors ${activeSection === 'tavern' ? 'bg-red-900/40 border-red-600 text-red-200' : 'bg-stone-950 border-stone-800 text-stone-500'}`}
             >
                酒馆
             </button>
        </div>
      </div>

      <div className="text-amber-500 font-mono bg-stone-950 px-4 py-2 rounded-lg border border-stone-800 flex items-center justify-between gap-2 md:hidden">
          <span className="text-xs text-stone-500 uppercase">当前资金</span>
          <div className="flex items-center gap-2">
             <Coins className="w-4 h-4" />
             <span>{gold.toLocaleString()}</span>
          </div>
      </div>

      {activeSection === 'buildings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {buildingTypes.map((type) => {
              const config = BUILDING_CONFIGS[type];
              const currentLevel = buildings[type];
              const upgradeCost = Math.floor(config.baseCost * Math.pow(config.costMultiplier, currentLevel));
              const canAfford = gold >= upgradeCost;

              return (
                <div key={type} className="bg-stone-900 rounded-xl border border-stone-800 overflow-hidden flex flex-col group hover:border-amber-900/50 transition-colors">
                  <div className="p-5 flex-1 relative">
                     <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                         <Hammer className="w-20 h-20" />
                     </div>
                     
                     <div className="flex justify-between items-start mb-2 relative z-10">
                        <h3 className="text-lg font-bold text-stone-200 font-serif">{config.name}</h3>
                        <span className="text-xs font-mono bg-amber-900/20 text-amber-500 px-2 py-0.5 rounded border border-amber-900/50 uppercase">
                           Lv. {currentLevel}
                        </span>
                     </div>
                     
                     <p className="text-stone-400 text-sm mb-4 min-h-[40px] relative z-10">{config.description}</p>
                     
                     <div className="bg-stone-950/50 p-3 rounded border border-stone-800 relative z-10">
                         <p className="text-xs text-stone-500 uppercase mb-1">当前效果</p>
                         <p className="text-sm text-stone-300">{config.effectDescription}</p>
                     </div>
                  </div>

                  <div className="p-4 bg-stone-950 border-t border-stone-800">
                    <button
                      onClick={() => upgradeBuilding(type)}
                      disabled={!canAfford}
                      className={`w-full py-2 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all text-sm uppercase tracking-wider ${
                        canAfford 
                          ? 'bg-amber-700 hover:bg-amber-600 text-stone-100 shadow-lg active:scale-95 border border-amber-600' 
                          : 'bg-stone-800 text-stone-600 cursor-not-allowed border border-stone-700'
                      }`}
                    >
                      <Hammer className="w-4 h-4" />
                      <span>升级 ({upgradeCost} G)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
      )}

      {activeSection === 'tavern' && (
          <div className="space-y-6">
             {/* Owned Commanders */}
             {commanders.length > 0 && (
                <div>
                   <h3 className="text-stone-400 font-serif text-sm uppercase tracking-wider mb-2">已招募将领</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       {commanders.map(cmd => (
                           <div key={cmd.id} className="bg-stone-900 p-3 rounded-lg border border-red-900/30 flex items-center gap-3">
                               <div className={`w-10 h-10 rounded-full flex items-center justify-center border bg-stone-950 font-serif font-bold ${getRarityStyle(cmd.rarity)}`}>
                                   {cmd.name[0]}
                               </div>
                               <div>
                                   <div className="flex items-center gap-2">
                                       <span className="font-bold text-stone-200">{cmd.name}</span>
                                       <span className={`text-[10px] px-1 rounded border ${getRarityBadge(cmd.rarity)}`}>{cmd.rarity}</span>
                                   </div>
                                   <div className="text-xs text-stone-500 flex gap-2">
                                       <span>统:{cmd.stats.command}</span>
                                       <span>武:{cmd.stats.valor}</span>
                                       <span>智:{cmd.stats.strategy}</span>
                                   </div>
                               </div>
                           </div>
                       ))}
                   </div>
                </div>
             )}

             {/* Tavern Pool */}
             <div>
                <div className="flex justify-between items-center mb-2">
                   <h3 className="text-stone-400 font-serif text-sm uppercase tracking-wider">今日访客</h3>
                   <div className="flex items-center gap-2 text-xs text-stone-500">
                       <Clock className="w-3 h-3" />
                       <span>{Math.max(0, TAVERN_REFRESH_DAYS - (day - lastTavernRefreshDay))} 天后刷新</span>
                       {/* Manual Refresh Debug Button if needed */}
                       {/* <button onClick={refreshTavern}><RefreshCw className="w-3 h-3" /></button> */}
                   </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {tavernCommanders.length === 0 && (
                        <div className="text-center py-8 text-stone-600 italic border border-dashed border-stone-800 rounded">
                            今天酒馆里空无一人...
                        </div>
                    )}
                    {tavernCommanders.map((cmd) => {
                        const canAfford = gold >= cmd.cost;
                        return (
                            <div key={cmd.id} className={`bg-stone-900 rounded-xl border p-4 flex flex-col md:flex-row gap-4 relative overflow-hidden transition-all border-stone-800 hover:border-stone-600`}>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className={`text-lg font-bold font-serif ${RARITY_CONFIG[cmd.rarity].color}`}>{cmd.name}</h3>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${getRarityBadge(cmd.rarity)}`}>
                                            {cmd.rarity}
                                        </span>
                                        <span className="text-xs text-stone-500 italic">"{cmd.title}"</span>
                                    </div>
                                    <p className="text-stone-400 text-sm mb-4">{cmd.description}</p>
                                    
                                    <div className="flex gap-4 text-xs md:text-sm">
                                        <div className="flex flex-col items-center p-2 bg-stone-950 rounded border border-stone-800 min-w-[60px]">
                                            <span className="text-stone-500 mb-1">统率</span>
                                            <span className="font-bold text-stone-200">{cmd.stats.command}</span>
                                        </div>
                                        <div className="flex flex-col items-center p-2 bg-stone-950 rounded border border-stone-800 min-w-[60px]">
                                            <span className="text-red-500 mb-1">勇武</span>
                                            <span className="font-bold text-stone-200">{cmd.stats.valor}</span>
                                        </div>
                                        <div className="flex flex-col items-center p-2 bg-stone-950 rounded border border-stone-800 min-w-[60px]">
                                            <span className="text-blue-500 mb-1">智谋</span>
                                            <span className="font-bold text-stone-200">{cmd.stats.strategy}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-end justify-end md:w-48">
                                    <button
                                        onClick={() => recruitCommander(cmd.id)}
                                        disabled={!canAfford}
                                        className={`w-full py-2 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all text-sm ${
                                            canAfford
                                            ? 'bg-stone-100 text-stone-900 hover:bg-white'
                                            : 'bg-stone-800 text-stone-600 cursor-not-allowed'
                                        }`}
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        <span>雇佣 ({cmd.cost} G)</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
             </div>
          </div>
      )}
    </div>
  );
};