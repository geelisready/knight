import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Settings as SettingsIcon, Save, RefreshCw, ChevronsUp, Skull } from 'lucide-react';

export const Settings: React.FC = () => {
  const { gold, setGold, setCheatPopCapMod, cheatPopCapMod, resetGame } = useGame();
  
  const [localGold, setLocalGold] = useState(gold.toString());
  const [localPopMod, setLocalPopMod] = useState(cheatPopCapMod.toString());

  const handleSave = () => {
    const newGold = parseInt(localGold);
    const newPop = parseInt(localPopMod);
    
    if (!isNaN(newGold)) setGold(newGold);
    if (!isNaN(newPop)) setCheatPopCapMod(newPop);
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in pb-20 md:pb-0">
       <div className="bg-stone-900 p-4 rounded-xl border border-stone-800">
          <h2 className="text-xl md:text-2xl font-bold text-stone-100 font-serif flex items-center gap-2">
             <SettingsIcon className="w-6 h-6" />
             系统设置
          </h2>
       </div>

       {/* Debug / Cheats */}
       <div className="bg-stone-900 rounded-xl border border-red-900/30 overflow-hidden">
          <div className="p-4 border-b border-stone-800 bg-red-950/10">
             <h3 className="font-bold text-red-400 font-serif flex items-center gap-2">
                <Skull className="w-5 h-5" />
                上帝模式 (调试功能)
             </h3>
             <p className="text-xs text-stone-500 mt-1">仅用于测试数值平衡。滥用可能导致游戏失去乐趣。</p>
          </div>
          
          <div className="p-4 space-y-4">
             <div>
                <label className="block text-sm font-medium text-stone-400 mb-1">修改金币</label>
                <div className="flex gap-2">
                   <input 
                      type="number" 
                      value={localGold}
                      onChange={(e) => setLocalGold(e.target.value)}
                      className="bg-stone-950 border border-stone-800 rounded px-3 py-2 text-stone-200 w-full focus:outline-none focus:border-red-800"
                   />
                </div>
             </div>

             <div>
                <label className="block text-sm font-medium text-stone-400 mb-1">额外人口上限修正 (+)</label>
                <div className="flex gap-2">
                   <input 
                      type="number" 
                      value={localPopMod}
                      onChange={(e) => setLocalPopMod(e.target.value)}
                      className="bg-stone-950 border border-stone-800 rounded px-3 py-2 text-stone-200 w-full focus:outline-none focus:border-red-800"
                   />
                </div>
             </div>

             <button 
                onClick={handleSave}
                className="w-full bg-red-800 hover:bg-red-700 text-stone-100 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
             >
                <Save className="w-4 h-4" />
                应用修改
             </button>
          </div>
       </div>

       {/* Reset */}
       <div className="bg-stone-900 rounded-xl border border-stone-800 p-4">
          <h3 className="font-bold text-stone-200 font-serif mb-3">危险区域</h3>
          <button 
             onClick={() => {
                if(confirm('确定要重置所有游戏进度吗？此操作不可撤销。')) {
                   resetGame();
                   setLocalGold('10000');
                   setLocalPopMod('0');
                }
             }}
             className="w-full bg-stone-950 border border-stone-700 hover:bg-red-950/30 hover:border-red-800 text-stone-400 hover:text-red-400 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
          >
             <RefreshCw className="w-4 h-4" />
             重置游戏进度
          </button>
       </div>
    </div>
  );
};