import React, { useState } from 'react';
import Navbar from './components/Navbar';
import BlockedEmails from './components/BlockedEmails';
import ConsumptionReport from './components/ConsumptionReport';
import SessionGrouping from './components/SessionGrouping';
import { ThemeProvider } from './hooks/useTheme';
import './styles/App.css';

function App() {
  const [activeTab, setActiveTab] = useState('emails');

  const renderContent = () => {
    switch (activeTab) {
      case 'emails':
        return <BlockedEmails />;
      case 'consumption':
        return <ConsumptionReport />;
      case 'sessions':
        return <SessionGrouping />;
      default:
        return <BlockedEmails />;
    }
  };

  return (
    <ThemeProvider>
      <div className="container">
        <header>
          <h1>Reporter helper</h1>
          <p className="subtitle">simplify your work</p>
        </header>

        <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
        
        {renderContent()}

        <footer>
          <p>CMHW</p>
        </footer>
      </div>
    </ThemeProvider>
  );
}

export default App;