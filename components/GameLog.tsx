import React from 'react';
import { useGame } from '../context/GameContext';

export const GameLogPanel: React.FC = () => {
  const { logs } = useGame();

  const getTypeStyle = (type: string) => {
    switch(type) {
      case 'success': return 'text-green-600 border-l-2 border-green-700 pl-2';
      case 'danger': return 'text-red-500 border-l-2 border-red-700 pl-2';
      case 'warning': return 'text-amber-500 border-l-2 border-amber-600 pl-2';
      default: return 'text-stone-400 border-l-2 border-stone-700 pl-2';
    }
  };

  return (
    <div className="hidden md:flex bg-stone-900 border-l border-stone-800 w-80 flex-col h-[calc(100vh-80px)]">
      <div className="p-4 border-b border-stone-800 bg-stone-900">
        <h3 className="font-bold text-stone-300 text-sm uppercase tracking-wider font-serif">战报日志</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
        {logs.length === 0 && <p className="text-stone-600 italic">暂无记录。</p>}
        {logs.map((log) => (
          <div key={log.id} className={`${getTypeStyle(log.type)} py-1`}>
            <span className="text-stone-600 mr-2">[第{log.day}天]</span>
            {log.message}
          </div>
        ))}
      </div>
    </div>
  );
};