import React from 'react';
import { useGame } from '../../context/GameContext';
import { Coins, Calendar, Skull, Shield, Settings as SettingsIcon, Users } from 'lucide-react';

export const Header: React.FC<{ onSettingsClick?: () => void }> = ({ onSettingsClick }) => {
  const { gold, day, totalPower, dailyMaintenance, totalSoldiers, maxPopulation } = useGame();

  return (
    <header className="bg-stone-900 border-b border-red-900/50 p-3 md:p-4 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-row justify-between items-center">
        {/* Logo Area */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="bg-red-800 p-1.5 rounded border border-red-600">
            <Shield className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-base md:text-xl font-bold text-stone-100 leading-tight font-serif tracking-wide">吉尼泰美骑士团</h1>
            <p className="text-[10px] md:text-xs text-stone-500 uppercase tracking-widest hidden md:block">霜风堡边境指挥所</p>
          </div>
        </div>

        {/* Stats Area */}
        <div className="flex items-center gap-2 md:gap-4 bg-stone-950 px-3 py-1.5 md:px-6 md:py-2 rounded-lg border border-stone-800 overflow-x-auto scrollbar-hide">
          
          {/* Gold */}
          <div className="flex flex-col md:flex-row md:items-center md:gap-2 shrink-0">
             <div className="flex items-center gap-1.5 text-amber-500" title="金币">
                <Coins className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="font-mono font-bold text-sm md:text-base">{gold.toLocaleString()}</span>
             </div>
             <span className="text-[10px] text-stone-600 hidden md:inline">(-{dailyMaintenance})</span>
          </div>

          <div className="h-6 w-px bg-stone-800 hidden md:block shrink-0"></div>

          {/* Population - NEW */}
          <div className="flex flex-col md:flex-row md:items-center md:gap-2 shrink-0">
             <div className="flex items-center gap-1.5 text-stone-300" title="人口">
                <Users className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="font-mono font-bold text-sm md:text-base">{totalSoldiers}/{maxPopulation}</span>
             </div>
          </div>

          <div className="h-6 w-px bg-stone-800 hidden md:block shrink-0"></div>

          {/* Power */}
          <div className="flex items-center gap-1.5 text-red-400 shrink-0" title="战斗力">
            <Skull className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="font-mono font-bold text-sm md:text-base">{totalPower.toLocaleString()}</span>
          </div>

          <div className="h-6 w-px bg-stone-800 hidden md:block shrink-0"></div>

          {/* Day */}
          <div className="flex items-center gap-1.5 text-stone-300 shrink-0" title="日期">
            <Calendar className="w-3.5 h-3.5" />
            <span className="font-mono text-sm">Day {day}</span>
          </div>
        </div>

        {onSettingsClick && (
          <button onClick={onSettingsClick} className="ml-2 text-stone-500 hover:text-stone-300 md:hidden">
            <SettingsIcon className="w-5 h-5" />
          </button>
        )}

      </div>
    </header>
  );
};