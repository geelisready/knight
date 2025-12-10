import React from 'react';
import { useGame } from '../../context/GameContext';
import { Users, Activity, Map } from 'lucide-react';
import { CAMPAIGN_MAP } from '../../constants';
import { TerritoryStatus } from '../../types';

export const Overview: React.FC = () => {
  const { units, maxPopulation, totalSoldiers, advanceTime, commanders, dailyIncome, dailyMaintenance, territories } = useGame();

  const netIncome = dailyIncome - dailyMaintenance;
  const numUnits = units.length;
  const ownedTerritories = Object.values(territories).filter(t => t === TerritoryStatus.OWNED).length;

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in pb-20 md:pb-0">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Total Forces */}
        <div className="bg-stone-900 p-4 rounded-xl border border-stone-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-16 h-16 text-stone-400" />
          </div>
          <div className="relative z-10">
            <p className="text-stone-500 text-xs font-medium uppercase tracking-wider">总兵力 / 上限</p>
            <h3 className="text-2xl md:text-3xl font-bold text-stone-200 mt-1 font-serif">
                {totalSoldiers} <span className="text-base text-stone-500">/ {maxPopulation}</span>
            </h3>
            <div className="mt-2 text-xs text-stone-500">
               番号: {numUnits} 个 | 指挥官: {commanders.length} 名
            </div>
          </div>
        </div>

        {/* Economy */}
        <div className="bg-stone-900 p-4 rounded-xl border border-stone-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="w-16 h-16 text-amber-500" />
          </div>
          <div className="relative z-10">
            <p className="text-stone-500 text-xs font-medium uppercase tracking-wider">每日财政</p>
            <h3 className={`text-2xl md:text-3xl font-bold mt-1 font-serif ${netIncome >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {netIncome >= 0 ? '+' : ''}{netIncome}
            </h3>
            <p className="text-xs text-stone-500 mt-2">
               税收 {dailyIncome} - 维护 {dailyMaintenance}
            </p>
          </div>
        </div>

        {/* Territories */}
        <div className="bg-stone-900 p-4 rounded-xl border border-stone-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Map className="w-16 h-16 text-red-500" />
          </div>
          <div className="relative z-10">
            <p className="text-stone-500 text-xs font-medium uppercase tracking-wider">领地进度</p>
            <h3 className="text-2xl md:text-3xl font-bold text-red-500 mt-1 font-serif">
                {ownedTerritories} <span className="text-base text-stone-600">/ {CAMPAIGN_MAP.length}</span>
            </h3>
            <div className="w-full bg-stone-800 h-1 mt-3 rounded-full overflow-hidden">
                <div className="bg-red-600 h-full" style={{ width: `${(ownedTerritories / CAMPAIGN_MAP.length) * 100}%` }}></div>
            </div>
          </div>
        </div>
        
        {/* Status / Action */}
        <div className="bg-stone-900 p-4 rounded-xl border border-stone-800 shadow-sm flex flex-col justify-between">
           <div>
              <p className="text-stone-500 text-xs font-medium uppercase tracking-wider">指挥行动</p>
              <div className="mt-2 flex items-center gap-2">
                 <span className="text-stone-400 text-xs">结算所有任务与收益</span>
              </div>
           </div>
           
           <button 
             onClick={advanceTime}
             className="w-full mt-4 bg-red-800 hover:bg-red-700 text-stone-100 py-2 px-4 rounded-lg font-medium transition-colors shadow-lg shadow-red-900/20 active:scale-95 text-sm border border-red-700"
           >
             进入下一天 &rarr;
           </button>
        </div>
      </div>

      {/* Intelligence Report */}
      <div className="bg-stone-900 rounded-xl border border-stone-800 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-stone-800 flex justify-between items-center bg-stone-950/50">
          <h3 className="text-base md:text-lg font-bold text-stone-200 font-serif flex items-center gap-2">
             <span className="w-1 h-4 bg-red-600 inline-block"></span>
             最新情报
          </h3>
        </div>
        <div className="p-4 md:p-6">
          <div className="space-y-4">
             <div className="p-4 bg-stone-950 rounded border border-stone-800 relative">
               <div className="absolute -left-1 top-4 w-1 h-8 bg-amber-700"></div>
               <p className="text-stone-300 italic text-sm md:text-base font-serif leading-relaxed">
                 "报告指挥官：所有部队现在按日进行结算。每次推进时间都将结算当天的收入、训练进度和战斗结果。请在推进时间前确保所有部队已派遣就位。"
               </p>
               <p className="text-stone-600 text-xs mt-3 text-right uppercase tracking-widest">— 情报官</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};