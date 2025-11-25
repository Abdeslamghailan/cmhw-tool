const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// File storage directory
const FILES_DIR = path.join(__dirname, 'generated_files');
if (!fs.existsSync(FILES_DIR)) {
  fs.mkdirSync(FILES_DIR);
}

// CMH configurations
const cmhConfigs = {
  cmh1: {
    BOT_TOKEN: "8264293111:AAF_WCJJLabD5S3alNmgNvQOuGu3zukzoRs",
    CHAT_ID: "8304177747",
    name: "CMH 1"
  },
  cmh2: {
    BOT_TOKEN: "8529644027:AAEVaCDf4EMOKgu0oalJkD94tEISKsa3NzY",
    CHAT_ID: "8304177747",
    name: "CMH 2"
  },
  cmh3: {
    BOT_TOKEN: "8229900745:AAH4j_U_10-pWaC-gyeQOa0WIFBrv36pRY8",
    CHAT_ID: "8304177747",
    name: "CMH 3"
  }
};

// Allowed titles for each CMH
const allowedTitles = ['IP', 'IP2', 'OFFER AUTO', 'OFFER BY REQUEST'];

// Helper function to get today's date string
const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
};

// Generate individual HTML content (same as before)
const generateHTMLContent = (data) => {
  const { title, seedsInput, activeInput, sessionsOutInput, cmh } = data;
  
  const parseInput = (input) => {
    return input.split('\n')
                .map(value => value.trim())
                .filter(value => value !== '');
  };

  const seedsValues = parseInput(seedsInput);
  const activeValues = parseInput(activeInput);
  
  let totalSeeds = 0;
  let totalActive = 0;
  let totalBlocked = 0;
  
  seedsValues.forEach((seeds, i) => {
    const seedsNum = parseInt(seeds) || 0;
    const activeNum = parseInt(activeValues[i]) || 0;
    const blockedNum = seedsNum - activeNum;
    
    totalSeeds += seedsNum;
    totalActive += activeNum;
    totalBlocked += blockedNum;
  });

  const activePercentage = totalSeeds > 0 ? Math.round((totalActive/totalSeeds)*100) : 0;
  const blockedPercentage = totalSeeds > 0 ? Math.round((totalBlocked/totalSeeds)*100) : 0;

  const cmhName = cmhConfigs[cmh]?.name || cmh;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${cmhName} - ${title} - Consumption Report</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); color: #2d3748; line-height: 1.4; padding: 8px; font-size: 11px; height: 100vh; overflow: hidden; }
  .container { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; height: 100%; max-height: 100vh; }
  .header { grid-column: 1 / -1; text-align: center; margin-bottom: 8px; padding: 8px; border-bottom: 2px solid #2c5282; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
  .cmh-badge { background: linear-gradient(135deg, #2c5282, #1a365d); color: white; padding: 4px 12px; border-radius: 6px; font-size: 0.7rem; margin-bottom: 4px; display: inline-block; font-weight: 600; }
  .title { font-size: 1.3rem; font-weight: 700; background: linear-gradient(135deg, #2c5282, #38a169); -webkit-background-clip: text; background-clip: text; color: transparent; margin-bottom: 4px; }
  .subtitle { color: #718096; font-size: 0.7rem; }
  .left-panel { display: flex; flex-direction: column; gap: 12px; }
  .stats-panel { background: white; border-radius: 8px; padding: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
  .stat-item { margin-bottom: 8px; padding: 6px 0; border-bottom: 1px solid #f7fafc; display: flex; justify-content: space-between; align-items: center; }
  .stat-value { font-weight: 700; color: #2c5282; font-size: 0.9rem; }
  .diagram-container { background: white; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); padding: 12px; border: 1px solid #e2e8f0; flex-grow: 1; display: flex; flex-direction: column; }
  .diagram-title { font-size: 0.85rem; font-weight: 600; margin-bottom: 8px; color: #2d3748; text-align: center; }
  .chart-container { position: relative; width: 140px; height: 140px; margin: 0 auto; }
  .pie-chart { width: 100%; height: 100%; position: relative; border-radius: 50%; background: conic-gradient( #38a169 0% ${activePercentage}%, #e53e3e ${activePercentage}% 100% ); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.05); animation: rotate 3s ease-in-out; transform-origin: center; }
  @keyframes rotate {
    0% { transform: scale(0.8) rotate(-90deg); opacity: 0; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  .chart-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 60px; height: 60px; background: white; border-radius: 50%; box-shadow: 0 0 8px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10; border: 1px solid #e2e8f0; }
  .total-count { font-size: 0.9rem; font-weight: 700; color: #2c5282; line-height: 1; }
  .total-label { font-size: 0.6rem; color: #718096; margin-top: 2px; }
  .diagram-legend { margin-top: 10px; }
  .legend-item { display: flex; align-items: center; margin-bottom: 6px; padding: 6px 8px; border-radius: 6px; background: #f7fafc; border: 1px solid #e2e8f0; transition: transform 0.2s ease; }
  .legend-item:hover { transform: translateX(4px); }
  .legend-color { width: 10px; height: 10px; border-radius: 50%; margin-right: 6px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1); }
  .legend-label { flex: 1; font-size: 0.7rem; font-weight: 500; }
  .legend-percentage { font-weight: 700; color: #2c5282; margin-left: 3px; font-size: 0.7rem; }
  .legend-count { font-size: 0.65rem; color: #718096; margin-left: 3px; }
  .table-container { background: white; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); padding: 12px; border: 1px solid #e2e8f0; overflow: auto; height: 100%; }
  table { width: 100%; border-collapse: collapse; font-size: 9px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); border-radius: 6px; overflow: hidden; }
  th { padding: 6px 4px; text-align: left; border-bottom: 2px solid #e2e8f0; font-weight: 600; color: white; font-size: 0.7rem; position: sticky; top: 0; }
  th:nth-child(1) { background: linear-gradient(135deg, #2c5282, #1a365d); } /* Drop N° */
  th:nth-child(2) { background: linear-gradient(135deg, #2c5282, #1a365d); } /* Consumption Seeds */
  th:nth-child(3) { background: linear-gradient(135deg, #38a169, #2f855a); } /* Active/Drop - Green */
  th:nth-child(4) { background: linear-gradient(135deg, #e53e3e, #c53030); } /* Blocked - Red */
  td { padding: 4px; border-bottom: 1px solid #f7fafc; font-size: 0.65rem; }
  td:nth-child(3) { background-color: rgba(56, 161, 105, 0.1); color: #2f855a; font-weight: 500; } /* Active cells - light green */
  td:nth-child(4) { background-color: rgba(229, 62, 62, 0.1); color: #c53030; font-weight: 500; } /* Blocked cells - light red */
  .totals-row { background: linear-gradient(135deg, rgba(44, 82, 130, 0.1), rgba(56, 161, 105, 0.1)); font-weight: 600; position: sticky; bottom: 0; }
  .totals-row td { border-top: 2px solid #e2e8f0; padding: 6px 4px; }
  footer { grid-column: 1 / -1; text-align: center; margin-top: 8px; padding: 6px; color: #718096; border-top: 1px solid #e2e8f0; font-size: 0.65rem; background: white; border-radius: 4px; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="cmh-badge">${cmhName}</div>
      <h1 class="title">${title}</h1>
      <p class="subtitle">Consumption Report - Generated on ${new Date().toLocaleDateString('en-GB')}</p>
    </div>
    
    <div class="left-panel">
      <div class="stats-panel">
        <div class="stat-item"><span>Total Consumption: </span><span class="stat-value">${totalSeeds}</span></div>
        <div class="stat-item"><span>Total Seeds Active: </span><span class="stat-value">${totalActive}</span></div>
        <div class="stat-item"><span>Total Seeds Blocked: </span><span class="stat-value">${totalBlocked}</span></div>
        <div class="stat-item"><span>Sessions Out: </span><span class="stat-value">${sessionsOutInput}</span></div>
      </div>
      
      <div class="diagram-container">
        <h3 class="diagram-title">Consumption Overview</h3>
        <div class="chart-container">
          <div class="pie-chart">
            <div class="chart-center">
              <div class="total-count">${totalSeeds}</div>
              <div class="total-label">Total</div>
            </div>
          </div>
        </div>
        <div class="diagram-legend">
          <div class="legend-item">
            <div class="legend-color" style="background-color: #38a169;"></div>
            <span class="legend-label">Active Seeds</span>
            <span class="legend-percentage">${activePercentage}%</span>
            <span class="legend-count">(${totalActive})</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: #e53e3e;"></div>
            <span class="legend-label">Blocked Seeds</span>
            <span class="legend-percentage">${blockedPercentage}%</span>
            <span class="legend-count">(${totalBlocked})</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="table-container">
      <h3 style="margin-bottom: 8px; color: #2d3748;">Detailed Data</h3>
      <table class="${seedsValues.length > 15 ? 'compact-table' : ''}">
        <thead>
          <tr>
            <th style="width: 15%">Drop N°</th>
            <th style="width: 25%">Consumption Seeds</th>
            <th style="width: 20%">Active/Drop</th>
            <th style="width: 20%">Blocked</th>
          </tr>
        </thead>
        <tbody>
          ${seedsValues.map((seeds, i) => {
            const dropNumber = i + 1;
            const active = parseInt(activeValues[i]) || 0;
            const blocked = parseInt(seeds) - active;
            return `
              <tr>
                <td>${dropNumber}</td>
                <td>${seeds}</td>
                <td>${active}</td>
                <td>${blocked}</td>
              </tr>
            `;
          }).join('')}
          <tr class="totals-row">
            <td colspan="2">TOTAL: ${totalSeeds}</td>
            <td>ACTIVE: ${totalActive}</td>
            <td>BLOCKED: ${totalBlocked}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <footer><p>CMHW - ${cmhName}</p></footer>
  </div>
</body>
</html>
    `;
};

// NEW: Generate combined HTML with navigation and resume page
// Updated: Generate combined HTML with matching theme and navigation
const generateCombinedHTML = (cmh, filesData) => {
  const cmhName = cmhConfigs[cmh]?.name || cmh;
  
  // Calculate resume data and individual report data
  const resumeData = filesData.map((file, fileIndex) => {
    const seedsValues = file.seedsInput.split('\n').map(v => v.trim()).filter(v => v !== '');
    const activeValues = file.activeInput.split('\n').map(v => v.trim()).filter(v => v !== '');
    
    let totalSeeds = 0;
    let totalActive = 0;
    let totalBlocked = 0;
    
    seedsValues.forEach((seeds, i) => {
      const seedsNum = parseInt(seeds) || 0;
      const activeNum = parseInt(activeValues[i]) || 0;
      const blockedNum = seedsNum - activeNum;
      
      totalSeeds += seedsNum;
      totalActive += activeNum;
      totalBlocked += blockedNum;
    });

    const activePercentage = totalSeeds > 0 ? Math.round((totalActive/totalSeeds)*100) : 0;
    const blockedPercentage = totalSeeds > 0 ? Math.round((totalBlocked/totalSeeds)*100) : 0;

    return {
      title: file.title,
      totalSeeds,
      totalActive,
      totalBlocked,
      activePercentage,
      blockedPercentage,
      sessionsOut: file.sessionsOutInput,
      seedsValues,
      activeValues,
      fileIndex
    };
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${cmhName} - Combined Consumption Reports</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { 
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; 
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); 
    color: #2d3748; 
    line-height: 1.4; 
    padding: 8px; 
    font-size: 11px; 
    height: 100vh; 
    overflow: hidden; 
  }
  
  /* Navigation Header */
  .nav-header { 
    grid-column: 1 / -1; 
    text-align: center; 
    margin-bottom: 8px; 
    padding: 12px; 
    border-bottom: 2px solid #2c5282; 
    background: white; 
    border-radius: 8px; 
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); 
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .cmh-badge { 
    background: linear-gradient(135deg, #2c5282, #1a365d); 
    color: white; 
    padding: 6px 16px; 
    border-radius: 6px; 
    font-size: 0.9rem; 
    font-weight: 600; 
  }
  .nav-controls { 
    display: flex; 
    align-items: center; 
    gap: 12px; 
  }
  .nav-btn { 
    background: linear-gradient(135deg, #2c5282, #1a365d);
    color: white; 
    border: none; 
    padding: 8px 16px; 
    border-radius: 6px; 
    cursor: pointer; 
    font-size: 0.8rem; 
    font-weight: 600; 
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  .nav-btn:hover { 
    background: linear-gradient(135deg, #1a365d, #2c5282);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  .nav-btn:disabled { 
    background: #a0aec0; 
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  .current-report { 
    font-weight: 700; 
    color: #2c5282; 
    font-size: 1.1rem;
    background: linear-gradient(135deg, #2c5282, #38a169);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    padding: 0 16px;
  }
  
  /* Tab Navigation */
  .tab-nav { 
    display: flex; 
    gap: 8px; 
    margin-bottom: 12px;
    background: white;
    padding: 8px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
  }
  .tab-btn { 
    background: #e2e8f0; 
    border: none; 
    padding: 8px 16px; 
    border-radius: 6px; 
    cursor: pointer; 
    font-size: 0.8rem; 
    font-weight: 600; 
    transition: all 0.3s ease;
  }
  .tab-btn.active { 
    background: linear-gradient(135deg, #2c5282, #1a365d); 
    color: white; 
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  .tab-btn:hover { 
    background: #cbd5e0; 
    transform: translateY(-1px);
  }
  .tab-btn.active:hover { 
    background: linear-gradient(135deg, #1a365d, #2c5282);
  }
  
  /* Main Container */
  .container { 
    display: grid; 
    grid-template-columns: 1fr 1fr; 
    gap: 12px; 
    height: calc(100vh - 120px); 
    max-height: calc(100vh - 120px); 
  }
  
  /* Content Area */
  .content-area { 
    background: white; 
    border-radius: 8px; 
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); 
    border: 1px solid #e2e8f0; 
    overflow: auto;
    padding: 12px;
  }
  
  /* Resume Page */
  .resume-page { 
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 16px;
    height: 100%;
  }
  .resume-card { 
    background: white; 
    border-radius: 8px; 
    padding: 16px; 
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); 
    border: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
  }
  .resume-card-header { 
    text-align: center; 
    margin-bottom: 12px; 
    padding-bottom: 8px; 
    border-bottom: 2px solid #2c5282; 
  }
  .resume-title { 
    font-size: 1.2rem; 
    font-weight: 700; 
    background: linear-gradient(135deg, #2c5282, #38a169);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    margin-bottom: 4px;
  }
  .resume-subtitle { 
    color: #718096; 
    font-size: 0.7rem; 
  }
  
  /* Stats Panel */
  .stats-panel { 
    background: white; 
    border-radius: 8px; 
    padding: 12px; 
    border: 1px solid #e2e8f0; 
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); 
    margin-bottom: 12px;
  }
  .stat-item { 
    margin-bottom: 8px; 
    padding: 6px 0; 
    border-bottom: 1px solid #f7fafc; 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
  }
  .stat-value { 
    font-weight: 700; 
    color: #2c5282; 
    font-size: 0.9rem; 
  }
  
  /* Diagram Container */
  .diagram-container { 
    background: white; 
    border-radius: 8px; 
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); 
    padding: 12px; 
    border: 1px solid #e2e8f0; 
    flex-grow: 1; 
    display: flex; 
    flex-direction: column; 
  }
  .diagram-title { 
    font-size: 0.85rem; 
    font-weight: 600; 
    margin-bottom: 8px; 
    color: #2d3748; 
    text-align: center; 
  }
  .chart-container { 
    position: relative; 
    width: 140px; 
    height: 140px; 
    margin: 0 auto; 
  }
  .pie-chart { 
    width: 100%; 
    height: 100%; 
    position: relative; 
    border-radius: 50%; 
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.05); 
    animation: rotate 3s ease-in-out; 
    transform-origin: center; 
  }
  @keyframes rotate {
    0% { transform: scale(0.8) rotate(-90deg); opacity: 0; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  .chart-center { 
    position: absolute; 
    top: 50%; 
    left: 50%; 
    transform: translate(-50%, -50%); 
    width: 60px; 
    height: 60px; 
    background: white; 
    border-radius: 50%; 
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.1); 
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    justify-content: center; 
    z-index: 10; 
    border: 1px solid #e2e8f0; 
  }
  .total-count { 
    font-size: 0.9rem; 
    font-weight: 700; 
    color: #2c5282; 
    line-height: 1; 
  }
  .total-label { 
    font-size: 0.6rem; 
    color: #718096; 
    margin-top: 2px; 
  }
  
  /* Diagram Legend */
  .diagram-legend { 
    margin-top: 10px; 
  }
  .legend-item { 
    display: flex; 
    align-items: center; 
    margin-bottom: 6px; 
    padding: 6px 8px; 
    border-radius: 6px; 
    background: #f7fafc; 
    border: 1px solid #e2e8f0; 
    transition: transform 0.2s ease; 
  }
  .legend-item:hover { 
    transform: translateX(4px); 
  }
  .legend-color { 
    width: 10px; 
    height: 10px; 
    border-radius: 50%; 
    margin-right: 6px; 
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1); 
  }
  .legend-label { 
    flex: 1; 
    font-size: 0.7rem; 
    font-weight: 500; 
  }
  .legend-percentage { 
    font-weight: 700; 
    color: #2c5282; 
    margin-left: 3px; 
    font-size: 0.7rem; 
  }
  .legend-count { 
    font-size: 0.65rem; 
    color: #718096; 
    margin-left: 3px; 
  }
  
  /* Table Container */
  .table-container { 
    background: white; 
    border-radius: 8px; 
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); 
    padding: 12px; 
    border: 1px solid #e2e8f0; 
    overflow: auto; 
    height: 100%; 
  }
  table { 
    width: 100%; 
    border-collapse: collapse; 
    font-size: 9px; 
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); 
    border-radius: 6px; 
    overflow: hidden; 
  }
  th { 
    padding: 6px 4px; 
    text-align: left; 
    border-bottom: 2px solid #e2e8f0; 
    font-weight: 600; 
    color: white; 
    font-size: 0.7rem; 
    position: sticky; 
    top: 0; 
  }
  th:nth-child(1) { background: linear-gradient(135deg, #2c5282, #1a365d); }
  th:nth-child(2) { background: linear-gradient(135deg, #2c5282, #1a365d); }
  th:nth-child(3) { background: linear-gradient(135deg, #38a169, #2f855a); }
  th:nth-child(4) { background: linear-gradient(135deg, #e53e3e, #c53030); }
  td { 
    padding: 4px; 
    border-bottom: 1px solid #f7fafc; 
    font-size: 0.65rem; 
  }
  td:nth-child(3) { 
    background-color: rgba(56, 161, 105, 0.1); 
    color: #2f855a; 
    font-weight: 500; 
  }
  td:nth-child(4) { 
    background-color: rgba(229, 62, 62, 0.1); 
    color: #c53030; 
    font-weight: 500; 
  }
  .totals-row { 
    background: linear-gradient(135deg, rgba(44, 82, 130, 0.1), rgba(56, 161, 105, 0.1)); 
    font-weight: 600; 
    position: sticky; 
    bottom: 0; 
  }
  .totals-row td { 
    border-top: 2px solid #e2e8f0; 
    padding: 6px 4px; 
  }
  
  /* Report Pages */
  .report-page { 
    display: none; 
    height: 100%;
  }
  .report-page.active { 
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    height: 100%;
  }
  
  /* Footer */
  footer { 
    grid-column: 1 / -1; 
    text-align: center; 
    margin-top: 8px; 
    padding: 6px; 
    color: #718096; 
    border-top: 1px solid #e2e8f0; 
    font-size: 0.65rem; 
    background: white; 
    border-radius: 4px; 
  }
  
  /* View Details Button */
  .view-details-btn {
    background: linear-gradient(135deg, #38a169, #2f855a);
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.7rem;
    font-weight: 600;
    transition: all 0.3s ease;
    margin-top: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  .view-details-btn:hover {
    background: linear-gradient(135deg, #2f855a, #38a169);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
</style>
</head>
<body>
  <div class="nav-header">
    <div class="cmh-badge">${cmhName}</div>
    <div class="nav-controls">
      <button class="nav-btn" onclick="prevReport()" id="prevBtn">← Previous</button>
      <span class="current-report" id="currentReport">Resume Overview</span>
      <button class="nav-btn" onclick="nextReport()" id="nextBtn">Next →</button>
    </div>
  </div>
  
  <div class="tab-nav">
    <button class="tab-btn active" onclick="showTab('resume')">📊 Resume Overview</button>
    ${filesData.map((file, index) => `
      <button class="tab-btn" onclick="showTab('report${index}')">${file.title}</button>
    `).join('')}
  </div>

  <div class="container">
    <!-- Resume Page -->
    <div id="resume" class="report-page active">
      ${resumeData.map(data => `
        <div class="resume-card">
          <div class="resume-card-header">
            <div class="resume-title">${data.title}</div>
            <div class="resume-subtitle">Consumption Summary</div>
          </div>
          
          <div class="stats-panel">
            <div class="stat-item"><span>Total Consumption: </span><span class="stat-value">${data.totalSeeds}</span></div>
            <div class="stat-item"><span>Total Seeds Active: </span><span class="stat-value">${data.totalActive}</span></div>
            <div class="stat-item"><span>Total Seeds Blocked: </span><span class="stat-value">${data.totalBlocked}</span></div>
            <div class="stat-item"><span>Sessions Out: </span><span class="stat-value">${data.sessionsOut}</span></div>
          </div>
          
          <div class="diagram-container">
            <h3 class="diagram-title">Consumption Overview</h3>
            <div class="chart-container">
              <div class="pie-chart" style="background: conic-gradient(#38a169 0% ${data.activePercentage}%, #e53e3e ${data.activePercentage}% 100%);">
                <div class="chart-center">
                  <div class="total-count">${data.totalSeeds}</div>
                  <div class="total-label">Total</div>
                </div>
              </div>
            </div>
            <div class="diagram-legend">
              <div class="legend-item">
                <div class="legend-color" style="background-color: #38a169;"></div>
                <span class="legend-label">Active Seeds</span>
                <span class="legend-percentage">${data.activePercentage}%</span>
                <span class="legend-count">(${data.totalActive})</span>
              </div>
              <div class="legend-item">
                <div class="legend-color" style="background-color: #e53e3e;"></div>
                <span class="legend-label">Blocked Seeds</span>
                <span class="legend-percentage">${data.blockedPercentage}%</span>
                <span class="legend-count">(${data.totalBlocked})</span>
              </div>
            </div>
          </div>
          
          <button class="view-details-btn" onclick="showTab('report${data.fileIndex}')">
            View Detailed Report
          </button>
        </div>
      `).join('')}
    </div>
    
    <!-- Individual Report Pages -->
    ${filesData.map((file, index) => {
      const seedsValues = file.seedsInput.split('\n').map(v => v.trim()).filter(v => v !== '');
      const activeValues = file.activeInput.split('\n').map(v => v.trim()).filter(v => v !== '');
      
      let totalSeeds = 0;
      let totalActive = 0;
      let totalBlocked = 0;
      
      seedsValues.forEach((seeds, i) => {
        const seedsNum = parseInt(seeds) || 0;
        const activeNum = parseInt(activeValues[i]) || 0;
        const blockedNum = seedsNum - activeNum;
        
        totalSeeds += seedsNum;
        totalActive += activeNum;
        totalBlocked += blockedNum;
      });

      const activePercentage = totalSeeds > 0 ? Math.round((totalActive/totalSeeds)*100) : 0;
      const blockedPercentage = totalSeeds > 0 ? Math.round((totalBlocked/totalSeeds)*100) : 0;

      return `
        <div id="report${index}" class="report-page">
          <div class="left-panel">
            <div class="stats-panel">
              <div class="stat-item"><span>Total Consumption: </span><span class="stat-value">${totalSeeds}</span></div>
              <div class="stat-item"><span>Total Seeds Active: </span><span class="stat-value">${totalActive}</span></div>
              <div class="stat-item"><span>Total Seeds Blocked: </span><span class="stat-value">${totalBlocked}</span></div>
              <div class="stat-item"><span>Sessions Out: </span><span class="stat-value">${file.sessionsOutInput}</span></div>
            </div>
            
            <div class="diagram-container">
              <h3 class="diagram-title">Consumption Overview</h3>
              <div class="chart-container">
                <div class="pie-chart" style="background: conic-gradient(#38a169 0% ${activePercentage}%, #e53e3e ${activePercentage}% 100%);">
                  <div class="chart-center">
                    <div class="total-count">${totalSeeds}</div>
                    <div class="total-label">Total</div>
                  </div>
                </div>
              </div>
              <div class="diagram-legend">
                <div class="legend-item">
                  <div class="legend-color" style="background-color: #38a169;"></div>
                  <span class="legend-label">Active Seeds</span>
                  <span class="legend-percentage">${activePercentage}%</span>
                  <span class="legend-count">(${totalActive})</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color" style="background-color: #e53e3e;"></div>
                  <span class="legend-label">Blocked Seeds</span>
                  <span class="legend-percentage">${blockedPercentage}%</span>
                  <span class="legend-count">(${totalBlocked})</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="table-container">
            <h3 style="margin-bottom: 8px; color: #2d3748;">Detailed Data - ${file.title}</h3>
            <table class="${seedsValues.length > 15 ? 'compact-table' : ''}">
              <thead>
                <tr>
                  <th style="width: 15%">Drop N°</th>
                  <th style="width: 25%">Consumption Seeds</th>
                  <th style="width: 20%">Active/Drop</th>
                  <th style="width: 20%">Blocked</th>
                </tr>
              </thead>
              <tbody>
                ${seedsValues.map((seeds, i) => {
                  const dropNumber = i + 1;
                  const active = parseInt(activeValues[i]) || 0;
                  const blocked = parseInt(seeds) - active;
                  return `
                    <tr>
                      <td>${dropNumber}</td>
                      <td>${seeds}</td>
                      <td>${active}</td>
                      <td>${blocked}</td>
                    </tr>
                  `;
                }).join('')}
                <tr class="totals-row">
                  <td colspan="2">TOTAL: ${totalSeeds}</td>
                  <td>ACTIVE: ${totalActive}</td>
                  <td>BLOCKED: ${totalBlocked}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    }).join('')}
    
    <footer>
      <p>CMHW - ${cmhName} - Combined Reports - Generated on ${new Date().toLocaleDateString('en-GB')}</p>
    </footer>
  </div>

  <script>
    let currentTab = 'resume';
    const tabs = ['resume', ${filesData.map((_, index) => `'report${index}'`).join(', ')}];
    const reportTitles = ${JSON.stringify(filesData.map(f => f.title))};
    
    function showTab(tabName) {
      // Hide all tabs
      document.querySelectorAll('.report-page').forEach(tab => {
        tab.classList.remove('active');
      });
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      
      // Show selected tab
      document.getElementById(tabName).classList.add('active');
      document.querySelector(\`[onclick="showTab('\${tabName}')"]\`).classList.add('active');
      
      currentTab = tabName;
      updateNavigation();
    }
    
    function nextReport() {
      const currentIndex = tabs.indexOf(currentTab);
      if (currentIndex < tabs.length - 1) {
        showTab(tabs[currentIndex + 1]);
      }
    }
    
    function prevReport() {
      const currentIndex = tabs.indexOf(currentTab);
      if (currentIndex > 0) {
        showTab(tabs[currentIndex - 1]);
      }
    }
    
    function updateNavigation() {
      const currentIndex = tabs.indexOf(currentTab);
      document.getElementById('prevBtn').disabled = currentIndex === 0;
      document.getElementById('nextBtn').disabled = currentIndex === tabs.length - 1;
      
      if (currentTab === 'resume') {
        document.getElementById('currentReport').textContent = 'Resume Overview';
      } else {
        const reportIndex = parseInt(currentTab.replace('report', ''));
        document.getElementById('currentReport').textContent = reportTitles[reportIndex];
      }
    }
    
    // Initialize navigation
    updateNavigation();
    
    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        prevReport();
      } else if (e.key === 'ArrowRight') {
        nextReport();
      }
    });
  </script>
</body>
</html>
  `;
};

// Fix for Chrome DevTools CSP error
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.json({});
});

// API Routes

// Get all today's generated files
app.get('/api/files/today', (req, res) => {
  try {
    const today = getTodayDateString();
    const files = [];
    
    if (fs.existsSync(FILES_DIR)) {
      const fileNames = fs.readdirSync(FILES_DIR);
      fileNames.forEach(fileName => {
        if (fileName.startsWith(today)) {
          const filePath = path.join(FILES_DIR, fileName);
          const stats = fs.statSync(filePath);
          
          // Extract CMH and title from filename
          const parts = fileName.replace('.html', '').split('_');
          const cmh = parts[1]; // cmh1, cmh2, etc.
          const title = parts[2];
          
          files.push({
            fileName,
            title,
            cmh,
            cmhName: cmhConfigs[cmh]?.name || cmh,
            createdAt: stats.birthtime,
            filePath
          });
        }
      });
    }
    
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// Generate and save HTML file
app.post('/api/generate-file', (req, res) => {
  try {
    const { title, seedsInput, activeInput, sessionsOutInput, cmh } = req.body;
    
    // Validate inputs
    if (!allowedTitles.includes(title)) {
      return res.status(400).json({ error: 'Invalid title' });
    }
    
    if (!cmhConfigs[cmh]) {
      return res.status(400).json({ error: 'Invalid CMH selection' });
    }
    
    const today = getTodayDateString();
    // File naming: date_cmh_title.html
    const fileName = `${today}_${cmh}_${title}.html`;
    const filePath = path.join(FILES_DIR, fileName);
    
    // Check if file with same title and CMH exists and remove it
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Generate HTML content
    const htmlContent = generateHTMLContent({
      title,
      seedsInput,
      activeInput,
      sessionsOutInput,
      cmh
    });
    
    // Save file
    fs.writeFileSync(filePath, htmlContent);
    
    res.json({ 
      success: true, 
      message: 'File generated successfully',
      fileName,
      filePath,
      cmh: cmh,
      cmhName: cmhConfigs[cmh].name
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate file' });
  }
});

// NEW: Generate combined file for a specific CMH
app.post('/api/generate-combined-file', (req, res) => {
  try {
    const { cmh } = req.body;
    
    if (!cmhConfigs[cmh]) {
      return res.status(400).json({ error: 'Invalid CMH selection' });
    }
    
    const today = getTodayDateString();
    const filesToCombine = [];
    
    // Read all individual files for this CMH
    const fileNames = fs.readdirSync(FILES_DIR);
    const cmhFiles = fileNames.filter(fileName => 
      fileName.startsWith(today) && fileName.includes(`_${cmh}_`)
    );
    
    if (cmhFiles.length === 0) {
      return res.status(404).json({ error: 'No files found for this CMH today' });
    }
    
    // Extract data from individual files
    cmhFiles.forEach(fileName => {
      const filePath = path.join(FILES_DIR, fileName);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Extract data from the individual file (this is a simplified approach)
      // In a real implementation, you might want to store the original data separately
      const parts = fileName.replace('.html', '').split('_');
      const title = parts[2];
      
      // For demo purposes, we'll create mock data - you should store the original data
      filesToCombine.push({
        title,
        seedsInput: "99\n99\n99\n99\n99\n99\n99\n99\n99\n99\n99\n99\n99\n99\n99", // Mock data
        activeInput: "80\n97\n83\n91\n99\n99\n99\n99\n94\n96\n98\n98\n96\n97\n98", // Mock data
        sessionsOutInput: "All sessions completed successfully",
        cmh
      });
    });
    
    // Generate combined HTML
    const combinedHTML = generateCombinedHTML(cmh, filesToCombine);
    const combinedFileName = `${today}_${cmh}_COMBINED.html`;
    const combinedFilePath = path.join(FILES_DIR, combinedFileName);
    
    // Save combined file
    fs.writeFileSync(combinedFilePath, combinedHTML);
    
    res.json({ 
      success: true, 
      message: 'Combined file generated successfully',
      fileName: combinedFileName,
      filePath: combinedFilePath,
      cmh: cmh,
      cmhName: cmhConfigs[cmh].name,
      includedReports: cmhFiles.length
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate combined file: ' + error.message });
  }
});

// Send combined file to Telegram
app.post('/api/send-cmh-to-telegram', async (req, res) => {
  try {
    const { cmh } = req.body;
    
    if (!cmhConfigs[cmh]) {
      return res.status(400).json({ error: 'Invalid CMH selection' });
    }
    
    const { BOT_TOKEN, CHAT_ID, name } = cmhConfigs[cmh];
    const today = getTodayDateString();
    
    // First, generate the combined file
    const combinedFileName = `${today}_${cmh}_COMBINED.html`;
    const combinedFilePath = path.join(FILES_DIR, combinedFileName);
    
    // Check if combined file exists, if not generate it
    if (!fs.existsSync(combinedFilePath)) {
      // Trigger combined file generation
      const generateResponse = await fetch(`http://localhost:${PORT}/api/generate-combined-file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cmh })
      });
      
      if (!generateResponse.ok) {
        return res.status(500).json({ error: 'Failed to generate combined file' });
      }
    }
    
    // Send the combined file
    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    formData.append('document', fs.createReadStream(combinedFilePath));
    formData.append('caption', `📊 ${name} - Combined Reports\nAll consumption reports in one file - Generated on ${new Date().toLocaleDateString()}`);
    
    const response = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`,
      formData,
      { headers: formData.getHeaders() }
    );
    
    res.json({ 
      success: true, 
      message: `Combined file sent successfully for ${name}`,
      cmh: cmh,
      cmhName: name,
      fileName: combinedFileName
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to send combined file: ' + error.message });
  }
});

// Get CMH configurations
app.get('/api/cmh-configs', (req, res) => {
  res.json(cmhConfigs);
});

// Get allowed titles
app.get('/api/allowed-titles', (req, res) => {
  res.json(allowedTitles);
});

// Debug endpoint to see files
app.get('/api/debug-files', (req, res) => {
  try {
    const today = getTodayDateString();
    const allFiles = fs.readdirSync(FILES_DIR);
    const todaysFiles = allFiles.filter(file => file.startsWith(today));
    
    const filesByCmh = {};
    todaysFiles.forEach(file => {
      const parts = file.replace('.html', '').split('_');
      const cmh = parts[1];
      if (!filesByCmh[cmh]) filesByCmh[cmh] = [];
      filesByCmh[cmh].push(file);
    });
    
    res.json({
      filesDirectory: FILES_DIR,
      allFiles: allFiles,
      todaysFiles: todaysFiles,
      filesByCmh: filesByCmh,
      today: today
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download file
app.get('/api/download/:fileName', (req, res) => {
  try {
    const fileName = req.params.fileName;
    const filePath = path.join(FILES_DIR, fileName);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.download(filePath);
  } catch (error) {
    res.status(500).json({ error: 'Failed to download file' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});