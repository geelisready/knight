import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { CAMPAIGN_MAP } from '../../constants';
import { Swords, Map, Flag, Lock, Info, Skull, Timer } from 'lucide-react';
import { Quest, TerritoryStatus, StatBias } from '../../types';
import { DeploymentModal } from '../modals/DeploymentModal';

export const Missions: React.FC = () => {
  const { territories, activeMissions, dailyQuests } = useGame();
  const [activeTab, setActiveTab] = useState<'campaign' | 'daily'>('campaign');
  const [deployingQuest, setDeployingQuest] = useState<Quest | null>(null);

  const getDifficultyColor = (diff: string) => {
    switch(diff) {
      case 'F': return 'text-stone-400 border-stone-400';
      case 'E': return 'text-green-600 border-green-600';
      case 'D': return 'text-blue-500 border-blue-500';
      case 'C': return 'text-purple-500 border-purple-500';
      case 'B': return 'text-amber-500 border-amber-500';
      case 'A': return 'text-red-500 border-red-500';
      default: return 'text-red-600 border-red-600';
    }
  };

  const renderTacticalAdvice = (bias?: StatBias) => {
     if (!bias) return null;
     return (
         <div className="flex gap-2 text-[10px] mt-2">
             {bias.mobility && <span className="bg-blue-900/30 text-blue-400 px-1.5 py-0.5 rounded border border-blue-800">需机动</span>}
             {bias.range && <span className="bg-green-900/30 text-green-400 px-1.5 py-0.5 rounded border border-green-800">需射程</span>}
             {bias.magic && <span className="bg-purple-900/30 text-purple-400 px-1.5 py-0.5 rounded border border-purple-800">需魔法</span>}
         </div>
     );
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in pb-20 md:pb-0">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-stone-900 p-4 rounded-xl border border-stone-800 sticky top-0 z-10 md:static shadow-md md:shadow-none">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-stone-100 font-serif">作战指挥部</h2>
          <p className="text-stone-500 text-xs md:text-sm">规划战役路线或执行日常委托。</p>
        </div>
        
        <div className="flex gap-2 mt-2 md:mt-0 self-end md:self-auto">
             <button 
                onClick={() => setActiveTab('campaign')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded border transition-all ${activeTab === 'campaign' ? 'bg-red-900/40 border-red-600 text-red-200 shadow-lg' : 'bg-stone-950 border-stone-800 text-stone-500'}`}
             >
                <Map className="w-4 h-4" />
                战役地图
             </button>
             <button 
                onClick={() => setActiveTab('daily')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded border transition-all ${activeTab === 'daily' ? 'bg-amber-900/40 border-amber-600 text-amber-200 shadow-lg' : 'bg-stone-950 border-stone-800 text-stone-500'}`}
             >
                <Swords className="w-4 h-4" />
                日常委托
             </button>
        </div>
      </div>

      {/* Active Operations */}
      {activeMissions.length > 0 && (
          <div className="bg-stone-900 p-4 rounded-xl border border-amber-900/30">
              <h3 className="text-sm font-bold text-amber-500 uppercase mb-3 flex items-center gap-2">
                  <Timer className="w-4 h-4" /> 进行中的行动
              </h3>
              <div className="space-y-2">
                  {activeMissions.map(mission => (
                      <div key={mission.id} className="bg-stone-950 border border-stone-800 rounded p-3 flex justify-between items-center">
                          <div>
                              <div className="font-bold text-stone-200 text-sm">{mission.quest.title}</div>
                              <div className="text-xs text-stone-500">
                                  预计抵达: 第 {mission.arrivalDay} 天
                              </div>
                          </div>
                          <div className="text-xs bg-amber-900/20 text-amber-500 px-2 py-1 rounded border border-amber-900/40 animate-pulse">
                              行军中...
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* Campaign Tab */}
      {activeTab === 'campaign' && (
          <div className="space-y-4">
              <div className="bg-stone-950/50 p-4 rounded border border-stone-800 mb-2">
                 <p className="text-sm text-stone-400 italic font-serif">"我们的目标是收复失地，直到夺回旧王都。"</p>
                 <div className="mt-2 h-2 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
                    <div 
                        className="h-full bg-red-800" 
                        style={{ width: `${(Object.values(territories).filter(s => s === TerritoryStatus.OWNED).length / CAMPAIGN_MAP.length) * 100}%` }}
                    ></div>
                 </div>
              </div>

              {CAMPAIGN_MAP.map((territory, index) => {
                  const status = territories[territory.id];
                  const isLocked = status === TerritoryStatus.LOCKED;
                  const isOwned = status === TerritoryStatus.OWNED;

                  return (
                      <div key={territory.id} className={`relative rounded-xl border p-4 md:p-6 transition-all ${
                          isOwned ? 'bg-stone-900/50 border-stone-800 opacity-70' : 
                          isLocked ? 'bg-stone-950 border-stone-900 grayscale opacity-50' : 
                          'bg-stone-900 border-red-900/30 hover:border-red-700 shadow-md'
                      }`}>
                          {/* Connector Line */}
                          {index < CAMPAIGN_MAP.length - 1 && (
                              <div className="absolute left-8 bottom-[-20px] w-0.5 h-6 bg-stone-800 -z-10 md:left-10"></div>
                          )}

                          <div className="flex justify-between items-start gap-4">
                              <div className="flex items-start gap-4">
                                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 shrink-0 ${
                                      isOwned ? 'bg-stone-800 border-stone-600 text-stone-500' :
                                      isLocked ? 'bg-stone-950 border-stone-800 text-stone-700' :
                                      'bg-red-900 border-red-600 text-white animate-pulse-slow'
                                  }`}>
                                      {isOwned ? <Flag className="w-5 h-5" /> : isLocked ? <Lock className="w-5 h-5" /> : <Skull className="w-6 h-6" />}
                                  </div>
                                  
                                  <div>
                                      <h3 className="text-lg font-bold text-stone-200 font-serif flex items-center gap-2">
                                          {territory.name}
                                          {isOwned && <span className="text-[10px] bg-stone-800 px-1.5 py-0.5 rounded text-stone-400 border border-stone-700">已征服</span>}
                                          {!isLocked && !isOwned && <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getDifficultyColor(territory.difficulty)}`}>等级 {territory.difficulty}</span>}
                                      </h3>
                                      <p className="text-sm text-stone-400 mt-1">{isLocked ? '???' : territory.description}</p>
                                      
                                      {!isLocked && (
                                          <div className="mt-3 flex flex-wrap gap-2">
                                              <div className="bg-stone-950 px-2 py-1 rounded border border-stone-800 text-xs text-amber-500 font-mono">
                                                  奖励: {territory.rewardGold} G
                                              </div>
                                              <div className="bg-stone-950 px-2 py-1 rounded border border-stone-800 text-xs text-stone-400 flex items-center gap-1">
                                                  <Info className="w-3 h-3" />
                                                  <span>{territory.bonusDescription}</span>
                                              </div>
                                          </div>
                                      )}
                                      
                                      {!isLocked && !isOwned && renderTacticalAdvice(territory.combatBias)}
                                  </div>
                              </div>

                              <div className="flex flex-col items-end gap-2">
                                  {!isLocked && !isOwned && (
                                      <button 
                                            onClick={() => setDeployingQuest({
                                                id: territory.id,
                                                title: `收复${territory.name}`,
                                                description: territory.description,
                                                difficulty: territory.difficulty,
                                                requiredPower: territory.requiredPower,
                                                rewardGold: territory.rewardGold,
                                                duration: 1,
                                                dangerLevel: 3,
                                                bias: territory.combatBias,
                                                isCampaign: true,
                                                territoryId: territory.id
                                            })}
                                            className="bg-red-800 hover:bg-red-700 text-stone-100 py-1.5 px-4 rounded font-bold text-sm shadow active:scale-95"
                                        >
                                            出征
                                        </button>
                                  )}
                              </div>
                          </div>
                      </div>
                  );
              })}
          </div>
      )}

      {/* Daily Tab */}
      {activeTab === 'daily' && (
          <div className="grid gap-4">
              {dailyQuests.length === 0 && (
                  <div className="text-center py-10 text-stone-500 italic">
                      今日暂无委托，请等待明日刷新。
                  </div>
              )}
              {dailyQuests.map(quest => (
                    <div key={quest.id} className="bg-stone-900 rounded-xl border border-stone-800 p-4 hover:border-stone-600 transition-colors">
                        <div className="flex justify-between items-start">
                             <div className="flex items-center gap-3">
                                <span className={`w-8 h-8 rounded border-2 flex items-center justify-center font-bold font-serif ${getDifficultyColor(quest.difficulty)} bg-stone-950`}>
                                    {quest.difficulty}
                                </span>
                                <div>
                                    <h3 className="font-bold text-stone-200">{quest.title}</h3>
                                    <p className="text-xs text-stone-500">耗时: {quest.duration} 天 • 危险: {quest.dangerLevel}</p>
                                </div>
                             </div>
                             <div className="text-right">
                                 <div className="text-amber-500 font-mono font-bold">{quest.rewardGold} G</div>
                             </div>
                        </div>
                        
                        <p className="text-sm text-stone-400 mt-2 mb-3">{quest.description}</p>
                        {renderTacticalAdvice(quest.bias)}

                        <div className="mt-3 flex items-center justify-between border-t border-stone-800 pt-3">
                            <span className="text-xs text-stone-500">选择部队以查看胜率</span>
                            <button 
                                onClick={() => setDeployingQuest(quest)}
                                className="bg-stone-800 hover:bg-stone-700 text-stone-200 py-1.5 px-4 rounded text-xs font-medium border border-stone-700"
                            >
                                部署部队
                            </button>
                        </div>
                    </div>
              ))}
          </div>
      )}

      {/* Modals */}
      {deployingQuest && (
          <DeploymentModal 
            quest={deployingQuest} 
            onClose={() => setDeployingQuest(null)} 
          />
      )}

    </div>
  );
};