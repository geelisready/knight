import React from 'react';
import { BattleResult } from '../../types';
import { Trophy, Skull, Coins, MapPin, X } from 'lucide-react';

interface BattleResultModalProps {
  result: BattleResult;
  onClose: () => void;
}

export const BattleResultModal: React.FC<BattleResultModalProps> = ({ result, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
      <div className={`bg-stone-900 border-2 rounded-xl w-full max-w-lg overflow-hidden ${result.isVictory ? 'border-amber-600' : 'border-stone-700'}`}>
          
          <div className={`p-6 text-center ${result.isVictory ? 'bg-gradient-to-b from-amber-900/50 to-stone-900' : 'bg-stone-950'}`}>
              {result.isVictory ? (
                  <div className="flex flex-col items-center">
                      <Trophy className="w-16 h-16 text-amber-500 mb-2 animate-bounce" />
                      <h2 className="text-3xl font-serif font-bold text-amber-400 tracking-wider">大 捷</h2>
                      <p className="text-stone-400 mt-2">我们在 {result.questTitle} 的行动中取得了胜利！</p>
                  </div>
              ) : (
                  <div className="flex flex-col items-center">
                      <Skull className="w-16 h-16 text-stone-600 mb-2" />
                      <h2 className="text-3xl font-serif font-bold text-stone-500 tracking-wider">战 败</h2>
                      <p className="text-stone-600 mt-2">我们在 {result.questTitle} 的行动遭受了挫折。</p>
                  </div>
              )}
          </div>

          <div className="p-6 space-y-4">
              {/* Rewards */}
              {result.isVictory && (
                  <div className="flex gap-4 justify-center">
                      <div className="bg-stone-950 p-3 rounded border border-stone-800 flex items-center gap-2 px-6">
                          <Coins className="w-5 h-5 text-amber-500" />
                          <div className="text-amber-200 font-bold">+{result.rewardGold} G</div>
                      </div>
                      {result.territoryUnlocked && (
                           <div className="bg-red-950/30 p-3 rounded border border-red-900/50 flex items-center gap-2 px-6">
                              <MapPin className="w-5 h-5 text-red-500" />
                              <div className="text-red-200 font-bold">领地收复</div>
                          </div>
                      )}
                  </div>
              )}

              {/* Losses */}
              <div className="bg-stone-950 p-4 rounded-lg border border-stone-800">
                  <h4 className="text-xs text-stone-500 uppercase font-bold mb-2">战斗损失</h4>
                  {result.losses.length === 0 ? (
                      <p className="text-stone-400 text-sm italic">无人员阵亡。</p>
                  ) : (
                      <ul className="space-y-1">
                          {result.losses.map((loss, idx) => (
                              <li key={idx} className="flex justify-between text-sm">
                                  <span className="text-stone-300">{loss.unitName}</span>
                                  <span className="text-red-500 font-mono">-{loss.count}</span>
                              </li>
                          ))}
                      </ul>
                  )}
              </div>
          </div>

          <div className="p-4 bg-stone-950 border-t border-stone-800">
              <button 
                onClick={onClose}
                className="w-full bg-stone-800 hover:bg-stone-700 text-stone-200 py-3 rounded-lg font-bold"
              >
                  关闭战报
              </button>
          </div>
      </div>
    </div>
  );
};