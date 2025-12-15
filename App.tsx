import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';
import KnowledgeGraph from './components/KnowledgeGraph';
import DataGovernance from './components/DataGovernance';
import Dashboard from './components/Dashboard';
import EquipmentDetail from './components/EquipmentDetail';
import { Page } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.CHAT);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const renderContent = () => {
    switch (currentPage) {
      case Page.CHAT:
        return (
            <ChatInterface 
                onNavigate={setCurrentPage} 
                setSelectedEquipmentId={setSelectedEquipmentId}
            />
        );
      case Page.GRAPH:
        return <KnowledgeGraph isDarkMode={isDarkMode} />;
      case Page.DATA_GOVERNANCE:
        return <DataGovernance />;
      case Page.DASHBOARD:
        return <Dashboard isDarkMode={isDarkMode} />;
      case Page.EQUIPMENT_DETAIL:
        return (
            <EquipmentDetail 
                id={selectedEquipmentId || ''} 
                onBack={() => setCurrentPage(Page.CHAT)} // Default back to chat for now
            />
        );
      default:
        return <ChatInterface onNavigate={setCurrentPage} setSelectedEquipmentId={setSelectedEquipmentId} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Sidebar activePage={currentPage} onNavigate={setCurrentPage} />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        <main className="flex-1 overflow-auto relative">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;