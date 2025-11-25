import React from 'react';
import ThemeToggle from './ThemeToggle';

const Navbar = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'emails', label: 'Blocked Emails Analyzer' },
    { id: 'consumption', label: 'Consumption Dashboard' },
    { id: 'sessions', label: 'Recheck Blocked Emails' },
    { id: 'plan', label: 'Plan Generator' }
  ];

  return (
    <div className="nav-tabs">
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </div>
      ))}
      <ThemeToggle />
    </div>
  );
};

export default Navbar;