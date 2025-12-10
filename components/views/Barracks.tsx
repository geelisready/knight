import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { UnitType, TrainingStatus, SoldierQuality, UnitCategory, UnitStatus, Unit } from '../../types';
import { UNIT_CONFIGS, getUnitScaleName } from '../../constants';
import { Shield, Sword, Heart, Clock, Loader2, Award, Flag, Users, CheckSquare, Square, Merge } from 'lucide-react';

export const Barracks: React.FC = () => {
  const { units, totalSoldiers, mergeUnits } = useGame();
  const [activeTab, setActiveTab] = useState<UnitCategory>('ALL' as any);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);

  // Derived state for filtered units
  const categories = ['ALL', ...Object.values(UnitCategory)];
  
  const filteredUnits = units.filter(u => {
      if (activeTab === 'ALL' as any) return true;
      return UNIT_CONFIGS[u.type].category === activeTab;
  }).sort((a, b) => {
      // Sort by Type then Scale (Count)
      if (a.type !== b.type) return a.type.localeCompare(b.type);
      return b.count - a.count;
  });

  const handleSelect = (id: string) => {
      setSelectedUnits(prev => 
         prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
      );
  };

  const handleMerge = () => {
      mergeUnits(selectedUnits);
      setSelectedUnits([]);
  };

  // Helper to check if merge is valid (same type, idle)
  const canMerge = selectedUnits.length >= 2 && selectedUnits.every(id => {
      const u = units.find(unit => unit.id === id);
      const first = units.find(unit => unit.id === selectedUnits[0]);
      return u && first && u.type === first.type && u.status === UnitStatus.IDLE && first.status === UnitStatus.IDLE;
  });

  // Helper to get quality badge color
  const getQualityStyle = (q: SoldierQuality) => {
      switch(q) {
          case SoldierQuality.ROOKIE: return 'bg-stone-800 text-stone-400 border-stone-700';
          case SoldierQuality.VETERAN: return 'bg-blue-900/30 text-blue-400 border-blue-800';
          case SoldierQuality.ELITE: return 'bg-amber-900/30 text-amber-500 border-amber-800';
      }
  };

  const getQualityName = (q: SoldierQuality) => {
    switch(q) {
        case SoldierQuality.ROOKIE: return '新兵';
        case SoldierQuality.VETERAN: return '老兵';
        case SoldierQuality.ELITE: return '精锐';
    }
  };

  // Group by type for better visualization
  const unitsByType = filteredUnits.reduce((acc, unit) => {
      const type = unit.type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(unit);
      return acc;
  }, {} as Record<UnitType, Unit[]>);

  if (units.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-stone-900 rounded-xl border border-stone-800 border-dashed mx-4 mt-4">
        <Shield className="w-12 h-12 text-stone-700 mb-4" />
        <h3 className="text-xl font-medium text-stone-400 font-serif">兵营空空如也</h3>
        <p className="text-stone-600 mt-2 text-sm">请前往招募中心征召士兵。</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in pb-20 md:pb-0">
      
      {/* Header & Controls */}
      <div className="bg-stone-900 p-4 rounded-xl border border-stone-800 sticky top-0 z-10 md:static shadow-lg md:shadow-none">
          <div className="flex justify-between items-center mb-4">
            <div>
                <h2 className="text-xl font-bold text-stone-100 font-serif">部队编制</h2>
                <p className="text-xs text-stone-500">总兵力: {totalSoldiers} 人</p>
            </div>
            
            {selectedUnits.length > 0 && (
                <button 
                   onClick={handleMerge}
                   disabled={!canMerge}
                   className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                       canMerge 
                       ? 'bg-amber-700 hover:bg-amber-600 text-white shadow-lg' 
                       : 'bg-stone-800 text-stone-600 cursor-not-allowed'
                   }`}
                >
                   <Merge className="w-4 h-4" />
                   合并番号 ({selectedUnits.length})
                </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button 
                  onClick={() => setActiveTab('ALL' as any)}
                  className={`px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap border transition-colors ${activeTab === 'ALL' as any ? 'bg-stone-100 text-stone-900 border-stone-100' : 'bg-stone-950 text-stone-500 border-stone-800'}`}
              >
                  全部
              </button>
              {Object.values(UnitCategory).map(cat => (
                  <button 
                      key={cat}
                      onClick={() => setActiveTab(cat)}
                      className={`px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap border transition-colors ${activeTab === cat ? 'bg-red-900 text-white border-red-700' : 'bg-stone-950 text-stone-500 border-stone-800'}`}
                  >
                      {cat}
                  </button>
              ))}
          </div>
      </div>

      <div className="space-y-6">
        {Object.keys(unitsByType).map((typeKey) => {
            const type = typeKey as UnitType;
            const typeUnits = unitsByType[type];
            if (typeUnits.length === 0) return null;
            const config = UNIT_CONFIGS[type];

            return (
                <div key={type} className="space-y-2">
                    <h3 className="text-stone-500 text-xs font-bold uppercase tracking-wider px-2 border-l-2 border-red-900/50">
                        {config.name} ({typeUnits.length} 支部队)
                    </h3>
                    
                    <div className="grid gap-3">
                        {typeUnits.map((unit) => {
                            const isTraining = unit.status === UnitStatus.TRAINING;
                            const isDeployed = unit.status === UnitStatus.DEPLOYED;
                            const isSelected = selectedUnits.includes(unit.id);
                            
                            return (
                                <div 
                                    key={unit.id} 
                                    onClick={() => handleSelect(unit.id)}
                                    className={`bg-stone-900 rounded-lg border shadow-sm overflow-hidden cursor-pointer transition-all hover:border-stone-600
                                        ${isDeployed ? 'border-amber-900/40 opacity-80' : 'border-stone-800'}
                                        ${isSelected ? 'border-red-600 ring-1 ring-red-600 bg-stone-900/80' : ''}
                                    `}
                                >
                                    {/* Header */}
                                    <div className="px-4 py-3 flex justify-between items-start bg-stone-950/30">
                                        <div className="flex items-center gap-3">
                                            {/* Checkbox */}
                                            <div className={`text-stone-600 ${isSelected ? 'text-red-500' : ''}`}>
                                                {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded flex items-center justify-center border bg-stone-900 ${config.category === UnitCategory.SPECIAL ? 'border-red-800 text-red-500' : 'border-stone-600 text-stone-400'}`}>
                                                    <Sword className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-stone-200 font-bold font-serif text-sm md:text-base flex items-center gap-2">
                                                        {unit.name}
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getQualityStyle(unit.quality)}`}>
                                                            {getQualityName(unit.quality)}
                                                        </span>
                                                    </h4>
                                                    <div className="text-xs text-stone-500 flex items-center gap-2 mt-0.5">
                                                        <span className="text-stone-300 font-mono">{unit.count} 人</span>
                                                        <span className="bg-stone-800 px-1 rounded text-[10px]">{getUnitScaleName(unit.count)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col items-end gap-1">
                                            {isTraining && (
                                                <div className="flex items-center gap-1.5 text-amber-500 bg-amber-950/20 px-2 py-0.5 rounded border border-amber-900/50">
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                    <span className="text-xs font-mono">训练中: {unit.trainingDaysLeft}天</span>
                                                </div>
                                            )}

                                            {isDeployed && (
                                                <div className="flex items-center gap-1.5 text-red-400 bg-red-950/20 px-2 py-0.5 rounded border border-red-900/50">
                                                    <Flag className="w-3 h-3" />
                                                    <span className="text-xs font-mono">出征中</span>
                                                </div>
                                            )}
                                            
                                            {!isTraining && !isDeployed && (
                                                 <span className="text-[10px] text-green-600 bg-green-900/10 px-2 py-0.5 rounded border border-green-900/30">
                                                     待命
                                                 </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Detailed Stats Row */}
                                    <div className="px-4 py-2 border-t border-stone-800 grid grid-cols-4 gap-2 bg-stone-950/50">
                                        <div className="text-center">
                                            <p className="text-[10px] text-stone-600 uppercase">战力</p>
                                            <p className={`font-mono font-bold text-sm ${isTraining ? 'text-stone-500' : 'text-stone-300'}`}>
                                                {isTraining ? Math.floor(unit.power * 0.6) : unit.power} 
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] text-stone-600 uppercase">机动</p>
                                            <p className="font-mono text-stone-400 text-sm font-bold">{unit.mobility}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] text-stone-600 uppercase">射程</p>
                                            <p className="font-mono text-stone-400 text-sm">{unit.range}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] text-stone-600 uppercase">魔力</p>
                                            <p className="font-mono text-stone-300 text-sm">{unit.magic}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};