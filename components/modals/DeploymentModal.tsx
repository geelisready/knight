import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { Quest, UnitStatus } from '../../types';
import { Shield, Sword, CheckCircle, Crosshair, Wind, Wand2, AlertTriangle } from 'lucide-react';

interface DeploymentModalProps {
  quest: Quest;
  onClose: () => void;
}

export const DeploymentModal: React.FC<DeploymentModalProps> = ({ quest, onClose }) => {
  const { units, deployArmy } = useGame();
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);

  // Filter available units
  const availableUnits = units.filter(u => u.status === UnitStatus.IDLE);

  // Calculate stats of selected units
  const selectedStats = units
    .filter(u => selectedUnits.includes(u.id))
    .reduce((acc, u) => ({
        power: acc.power + u.power * u.count,
        mobility: acc.mobility + u.mobility * u.count,
        range: acc.range + u.range * u.count,
        magic: acc.magic + u.magic * u.count
    }), { power: 0, mobility: 0, range: 0, magic: 0 });

  // Calculate Win Chance
  const calculateWinChance = () => {
      if (selectedStats.power === 0) return 0;
      
      // Base Chance
      let chance = Math.min(0.95, Math.max(0.05, 0.3 + (selectedStats.power / quest.requiredPower * 0.4)));
      
      const bias = quest.bias;
      if (bias) {
         // Heavy Penalties logic
         if (bias.mobility && bias.mobility > 1) {
             if (selectedStats.mobility === 0) chance *= 0.5;
             else if (selectedStats.mobility < selectedStats.power * 0.2) chance *= 0.8;
             else chance += 0.1; 
         }
         
         if (bias.range && bias.range > 1) {
             if (selectedStats.range === 0) chance *= 0.5;
             else if (selectedStats.range < selectedStats.power * 0.2) chance *= 0.8;
             else chance += 0.1;
         }

         if (bias.magic && bias.magic > 1) {
             if (selectedStats.magic === 0) chance *= 0.5;
             else if (selectedStats.magic < selectedStats.power * 0.2) chance *= 0.8;
             else chance += 0.1;
         }
      }
      return Math.min(0.99, chance) * 100;
  };

  const winChance = calculateWinChance();

  const toggleUnit = (id: string) => {
      setSelectedUnits(prev => 
         prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
      );
  };

  const handleDeploy = () => {
      if (selectedUnits.length === 0) return;
      deployArmy(quest, selectedUnits, winChance);
      onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in safe-area">
      <div className="bg-stone-900 border border-stone-700 rounded-xl w-full max-w-2xl flex flex-col max-h-[85vh] shadow-2xl">
         {/* Header */}
         <div className="p-4 border-b border-stone-800 bg-stone-950 rounded-t-xl flex justify-between items-center shrink-0">
             <div>
                <h3 className="text-xl font-bold text-stone-200 font-serif">部队集结</h3>
                <div className="flex items-center gap-2 text-xs text-stone-500">
                    <span>目标: {quest.title}</span>
                    <span className="text-amber-500 font-mono">推荐战力: {quest.requiredPower}</span>
                </div>
             </div>
             <button onClick={onClose} className="text-stone-500 hover:text-white px-2 py-1">取消</button>
         </div>

         {/* Requirements Alert */}
         {quest.bias && (
             <div className="bg-stone-950/80 p-2 text-xs flex gap-4 justify-center border-b border-stone-800 shrink-0">
                 {quest.bias.mobility && <div className="text-blue-400 flex items-center gap-1"><Wind className="w-3 h-3"/> 需要高机动</div>}
                 {quest.bias.range && <div className="text-green-400 flex items-center gap-1"><Crosshair className="w-3 h-3"/> 需要远程</div>}
                 {quest.bias.magic && <div className="text-purple-400 flex items-center gap-1"><Wand2 className="w-3 h-3"/> 需要魔法</div>}
             </div>
         )}

         {/* Unit Selection List - Scrollable */}
         <div className="flex-1 overflow-y-auto p-4 space-y-2">
             {availableUnits.length === 0 && (
                 <p className="text-center text-stone-600 py-10">没有可用的空闲部队。</p>
             )}
             {availableUnits.map(unit => {
                 const isSelected = selectedUnits.includes(unit.id);
                 return (
                     <div 
                        key={unit.id} 
                        onClick={() => toggleUnit(unit.id)}
                        className={`p-3 rounded border cursor-pointer flex justify-between items-center transition-all ${
                            isSelected ? 'bg-red-900/20 border-red-700' : 'bg-stone-900 border-stone-800 hover:border-stone-600'
                        }`}
                     >
                         <div className="flex items-center gap-3">
                             <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-red-600 border-red-500 text-white' : 'border-stone-600'}`}>
                                 {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                             </div>
                             <div>
                                 <div className="font-bold text-sm text-stone-200">{unit.name}</div>
                                 <div className="text-xs text-stone-500">{unit.count} 人 • 战力 {unit.power}</div>
                             </div>
                         </div>
                         {/* Mini Stats Icons */}
                         <div className="flex gap-3 text-xs text-stone-500">
                             {unit.mobility > 20 && <div className="flex items-center text-blue-500"><Wind className="w-3 h-3 mr-1"/>{unit.mobility}</div>}
                             {unit.range > 20 && <div className="flex items-center text-green-500"><Crosshair className="w-3 h-3 mr-1"/>{unit.range}</div>}
                             {unit.magic > 20 && <div className="flex items-center text-purple-500"><Wand2 className="w-3 h-3 mr-1"/>{unit.magic}</div>}
                         </div>
                     </div>
                 );
             })}
         </div>

         {/* Footer - Prediction & Action */}
         <div className="p-4 border-t border-stone-800 bg-stone-950 rounded-b-xl shrink-0 safe-area-bottom">
             <div className="flex justify-between items-center mb-4">
                 <div className="text-sm text-stone-400">
                     已选: <span className="text-white font-bold">{selectedUnits.length}</span> 支部队
                 </div>
                 <div className="flex items-center gap-4">
                     <div className="text-right">
                         <div className="text-xs text-stone-500 uppercase">总战力</div>
                         <div className="font-bold text-stone-200">{selectedStats.power}</div>
                     </div>
                     <div className="text-right">
                         <div className="text-xs text-stone-500 uppercase">预估胜率</div>
                         <div className={`font-bold text-xl ${winChance > 70 ? 'text-green-500' : winChance > 40 ? 'text-amber-500' : 'text-red-500'}`}>
                             {Math.round(winChance)}%
                         </div>
                     </div>
                 </div>
             </div>
             
             <button 
                onClick={handleDeploy}
                disabled={selectedUnits.length === 0}
                className={`w-full py-3 rounded-lg font-bold text-lg flex items-center justify-center gap-2 ${
                    selectedUnits.length > 0 
                    ? 'bg-red-800 hover:bg-red-700 text-white shadow-lg active:scale-95' 
                    : 'bg-stone-800 text-stone-600 cursor-not-allowed'
                }`}
             >
                 <Sword className="w-5 h-5" />
                 确认出征
             </button>
         </div>
      </div>
    </div>
  );
};