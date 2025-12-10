import React from 'react';
import { GameEvent } from '../../types';
import { Scroll, AlertTriangle } from 'lucide-react';

interface EventModalProps {
  event: GameEvent;
  onChoice: (index: number) => void;
}

export const EventModal: React.FC<EventModalProps> = ({ event, onChoice }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
       <div className="bg-stone-900 border-2 border-stone-600 rounded-xl w-full max-w-lg shadow-2xl relative">
          
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-stone-900 p-3 rounded-full border-2 border-stone-600">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>

          <div className="p-8 pt-12 text-center">
              <h2 className="text-2xl font-serif font-bold text-stone-100 mb-4">{event.title}</h2>
              <p className="text-stone-400 leading-relaxed font-serif italic">"{event.description}"</p>
          </div>

          <div className="p-6 space-y-3 bg-stone-950 rounded-b-xl border-t border-stone-800">
              {event.choices.map((choice, idx) => (
                  <button
                    key={idx}
                    onClick={() => onChoice(idx)}
                    className="w-full text-left p-4 rounded border border-stone-700 hover:border-amber-600 hover:bg-stone-900 transition-all group"
                  >
                      <div className="font-bold text-stone-200 group-hover:text-amber-500">{choice.text}</div>
                      <div className="text-xs text-stone-500 mt-1">{choice.effectDescription}</div>
                  </button>
              ))}
          </div>

       </div>
    </div>
  );
};