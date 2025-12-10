import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { UNIT_CONFIGS, DAILY_RECRUIT_PERCENT, BATCH_SIZE } from '../../constants';
import { UnitType, UnitCategory } from '../../types';
import { Coins, Activity, Zap, Users, ShieldAlert, Crosshair, Wind, Wand2, Shield, Info } from 'lucide-react';

export const Recruitment: React.FC = () => {
  const { gold, recruitUnit, totalSoldiers, maxPopulation, recruitedToday } = useGame();
  
  const [selectedCategory, setSelectedCategory] = useState<UnitCategory | 'ALL'>('ALL');
  const [recruitAmounts, setRecruitAmounts] = useState<Record<string, number>>({});

  const categories = Object.values(UnitCategory);
  const dailyCap = Math.floor(maxPopulation * DAILY_RECRUIT_PERCENT);
  const remainingDaily = Math.max(0, dailyCap - recruitedToday);
  const remainingPop = maxPopulation - totalSoldiers;
  
  // Effective limit is min of (Space in Barracks, Daily Quota left)
  const effectiveLimit = Math.min(remainingPop, remainingDaily);

  const handleRecruit = (type: UnitType) => {
    const amount = recruitAmounts[type] || BATCH_SIZE;
    recruitUnit(type, amount);
  };

  const handleAmountChange = (type: UnitType, val: number) => {
     // Ensure multiple of BATCH_SIZE
     const validVal = Math.max(BATCH_SIZE, Math.ceil(val / BATCH_SIZE) * BATCH_SIZE);
     setRecruitAmounts(prev => ({ ...prev, [type]: validVal }));
  };

  const getCategoryIcon = (cat: UnitCategory) => {
     switch(cat) {
        case UnitCategory.BASIC: return <Shield className="w-4 h-4" />;
        case UnitCategory.SPECIAL: return <Activity className="w-4 h-4" />;
        case UnitCategory.CAVALRY: return <Wind className="w-4 h-4" />;
        case UnitCategory.RANGED: return <Crosshair className="w-4 h-4" />;
        case UnitCategory.MAGIC: return <Wand2 className="w-4 h-4" />;
        default: return <Users className="w-4 h-4" />;
     }
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in pb-20 md:pb-0">
      
      {/* Header Info */}
      <div className="bg-stone-900 p-4 rounded-xl border border-stone-800 sticky top-0 z-10 md:static shadow-lg md:shadow-none">
        <div className="flex justify-between items-start mb-4">
            <div>
               <h2 className="text-xl md:text-2xl font-bold text-stone-100 font-serif">征兵处</h2>
               <p className="text-xs text-stone-500 hidden md:block">根据作战需求招募不同兵种</p>
            </div>
            <div className="text-amber-500 font-mono bg-stone-950 px-3 py-1.5 rounded border border-stone-800 flex items-center gap-2">
                <Coins className="w-4 h-4" />
                <span>{gold.toLocaleString()}</span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs md:text-sm">
            <div className={`p-2 rounded border flex items-center justify-between ${remainingPop > 0 ? 'bg-stone-950 border-stone-800' : 'bg-red-900/20 border-red-800'}`}>
                <span className="text-stone-500">总人口容量</span>
                <span className={remainingPop > 0 ? 'text-stone-200' : 'text-red-400'}>{totalSoldiers} / {maxPopulation}</span>
            </div>
            <div className={`p-2 rounded border flex items-center justify-between ${remainingDaily > 0 ? 'bg-stone-950 border-stone-800' : 'bg-amber-900/20 border-amber-800'}`}>
                <span className="text-stone-500">今日招募限额</span>
                <span className={remainingDaily > 0 ? 'text-stone-200' : 'text-amber-500'}>{recruitedToday} / {dailyCap}</span>
            </div>
        </div>
      </div>
      
      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
         <button 
           onClick={() => setSelectedCategory('ALL')}
           className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-colors ${selectedCategory === 'ALL' ? 'bg-stone-100 text-stone-900 border-stone-100' : 'bg-stone-900 text-stone-500 border-stone-800'}`}
         >
           全部
         </button>
         {categories.map(cat => (
             <button 
               key={cat}
               onClick={() => setSelectedCategory(cat)}
               className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border flex items-center gap-1.5 transition-colors ${selectedCategory === cat ? 'bg-red-900 text-white border-red-700' : 'bg-stone-900 text-stone-500 border-stone-800'}`}
             >
               {getCategoryIcon(cat)}
               {cat}
             </button>
         ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.values(UnitType).map((type) => {
          const config = UNIT_CONFIGS[type];
          if (!config) return null;
          if (selectedCategory !== 'ALL' && config.category !== selectedCategory) return null;

          const amount = recruitAmounts[type] || BATCH_SIZE;
          const totalCost = config.cost * amount;
          const canAfford = gold >= totalCost;
          const hasSpace = effectiveLimit >= amount;
          const isDisabled = !canAfford || !hasSpace;

          return (
            <div key={type} className="bg-stone-900 rounded-xl border border-stone-800 overflow-hidden flex flex-col group hover:border-stone-600 transition-colors">
              <div className="p-4 flex-1">
                <div className="flex justify-between items-start mb-2">
                   <div>
                       <h3 className="text-lg font-bold text-stone-100 font-serif">{config.name}</h3>
                       <span className="text-[10px] text-stone-500 uppercase tracking-wider">{config.category}</span>
                   </div>
                   <div className="text-right">
                       <div className="text-amber-500 font-bold font-mono text-sm">{config.cost} G</div>
                       <div className="text-[10px] text-stone-600">/ 人</div>
                   </div>
                </div>
                
                <p className="text-stone-400 text-xs mb-3 min-h-[32px]">{config.description}</p>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-1 text-[10px] bg-stone-950 p-2 rounded border border-stone-800 mb-3">
                    <div className="text-center">
                        <div className="text-red-500 font-bold">{config.power}</div>
                        <div className="text-stone-600 scale-90">战力</div>
                    </div>
                    <div className="text-center">
                        <div className="text-blue-400 font-bold">{config.mobility}</div>
                        <div className="text-stone-600 scale-90">机动</div>
                    </div>
                    <div className="text-center">
                        <div className="text-green-400 font-bold">{config.range}</div>
                        <div className="text-stone-600 scale-90">射程</div>
                    </div>
                    <div className="text-center">
                        <div className="text-purple-400 font-bold">{config.magic}</div>
                        <div className="text-stone-600 scale-90">魔力</div>
                    </div>
                </div>

                {/* Bonuses */}
                {config.bonuses && config.bonuses.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {config.bonuses.map((bonus, idx) => (
                            <span key={idx} className="text-[10px] bg-stone-800 text-stone-300 px-1.5 py-0.5 rounded border border-stone-700">
                                {bonus}
                            </span>
                        ))}
                    </div>
                )}
              </div>

              {/* Action Area */}
              <div className="p-3 bg-stone-950 border-t border-stone-800 flex items-center gap-3">
                 <div className="flex items-center gap-1 bg-stone-900 rounded border border-stone-800 px-2 py-1">
                     <button 
                        className="text-stone-400 hover:text-white px-1"
                        onClick={() => handleAmountChange(type, Math.max(BATCH_SIZE, amount - BATCH_SIZE))}
                     >-</button>
                     <span className="font-mono text-sm text-stone-200 w-8 text-center">{amount}</span>
                     <button 
                        className="text-stone-400 hover:text-white px-1"
                        onClick={() => handleAmountChange(type, amount + BATCH_SIZE)}
                     >+</button>
                 </div>
                 
                 <button
                  onClick={() => handleRecruit(type)}
                  disabled={isDisabled}
                  className={`flex-1 py-2 px-3 rounded text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    !isDisabled 
                      ? 'bg-red-800 hover:bg-red-700 text-stone-100 border border-red-700 active:scale-95' 
                      : 'bg-stone-800 text-stone-600 cursor-not-allowed border border-stone-700'
                  }`}
                >
                  {isDisabled ? (
                      !hasSpace ? <span className="text-xs">名额不足</span> : <span className="text-xs">资金不足</span>
                  ) : (
                      <>
                        <Coins className="w-3 h-3" />
                        <span>{totalCost}</span>
                      </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};