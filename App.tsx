import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Header } from './components/layout/Header';
import { Overview } from './components/views/Overview';
import { Recruitment } from './components/views/Recruitment';
import { Missions } from './components/views/Missions';
import { Barracks } from './components/views/Barracks';
import { City } from './components/views/City';
import { Settings } from './components/views/Settings';
import { GameLogPanel } from './components/GameLog';
import { LayoutDashboard, Users, Swords, Tent, Castle, Settings as SettingsIcon } from 'lucide-react';
import { EventModal } from './components/modals/EventModal';
import { BattleResultModal } from './components/modals/BattleResultModal';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'city' | 'recruit' | 'missions' | 'barracks' | 'settings'>('overview');
  const { currentEvent, lastBattleResult, handleEventChoice, closeBattleResult } = useGame();

  const renderContent = () => {
    switch(activeTab) {
      case 'overview': return <Overview />;
      case 'city': return <City />;
      case 'recruit': return <Recruitment />;
      case 'missions': return <Missions />;
      case 'barracks': return <Barracks />;
      case 'settings': return <Settings />;
      default: return <Overview />;
    }
  };

  const NavButton = ({ tab, icon: Icon, label }: { tab: typeof activeTab, icon: any, label: string }) => (
    <button 
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap 
      ${activeTab === tab 
        ? 'bg-red-900/30 text-red-100 shadow-sm border border-red-900/50' 
        : 'text-stone-500 hover:text-stone-300 hover:bg-stone-800/50'}`}
    >
      <Icon className={`w-4 h-4 ${activeTab === tab ? 'text-red-400' : ''}`} /> 
      <span>{label}</span>
    </button>
  );

  const MobileNavButton = ({ tab, icon: Icon, label }: { tab: typeof activeTab, icon: any, label: string }) => (
    <button 
      onClick={() => setActiveTab(tab)}
      className={`flex flex-col items-center justify-center py-2 px-1 flex-1
      ${activeTab === tab ? 'text-red-400' : 'text-stone-600'}`}
    >
      <Icon className={`w-5 h-5 mb-1 ${activeTab === tab ? 'text-red-500 fill-red-500/20' : ''}`} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 font-sans selection:bg-red-900/30">
      <Header onSettingsClick={() => setActiveTab('settings')} />
      
      <main className="flex flex-col md:flex-row max-w-7xl mx-auto">
        <div className="flex-1 p-3 md:p-6 min-h-[calc(100vh-80px)] overflow-y-auto scrollbar-hide">
          {/* Desktop Navigation Tabs */}
          <div className="hidden md:flex justify-between items-center mb-6">
            <div className="flex gap-2 bg-stone-900 p-1.5 rounded-xl border border-stone-800 inline-flex">
              <NavButton tab="overview" icon={LayoutDashboard} label="概览" />
              <NavButton tab="city" icon={Castle} label="领地" />
              <NavButton tab="recruit" icon={Users} label="招募" />
              <NavButton tab="missions" icon={Swords} label="委托" />
              <NavButton tab="barracks" icon={Tent} label="兵营" />
            </div>
            
            <button 
              onClick={() => setActiveTab('settings')}
              className={`p-2 rounded-lg transition-colors ${activeTab === 'settings' ? 'text-red-400 bg-red-900/20' : 'text-stone-500 hover:text-stone-300'}`}
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Main View Area */}
          {renderContent()}
        </div>

        {/* Side Log Panel (Desktop only) */}
        <GameLogPanel />
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-stone-900 border-t border-stone-800 pb-safe z-50">
        <div className="flex justify-around items-center">
          <MobileNavButton tab="overview" icon={LayoutDashboard} label="概览" />
          <MobileNavButton tab="city" icon={Castle} label="领地" />
          <MobileNavButton tab="recruit" icon={Users} label="招募" />
          <MobileNavButton tab="missions" icon={Swords} label="委托" />
          <MobileNavButton tab="barracks" icon={Tent} label="兵营" />
        </div>
      </div>

      {/* Global Modals */}
      {currentEvent && (
        <EventModal event={currentEvent} onChoice={handleEventChoice} />
      )}
      {lastBattleResult && (
        <BattleResultModal result={lastBattleResult} onClose={closeBattleResult} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}