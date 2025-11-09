import React, { useState, useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

const ConsumptionReport = () => {
  const [title, setTitle] = useState('OFFER');
  const [seedsInput, setSeedsInput] = useState('99\n99\n99\n99\n99\n99\n99\n99\n99\n99\n99\n99\n99\n99\n99');
  const [activeInput, setActiveInput] = useState('80\n97\n83\n91\n99\n99\n99\n99\n94\n96\n98\n98\n96\n97\n98');
  const [sessionsOutInput, setSessionsOutInput] = useState('All sessions completed successfully with no issues reported during the campaign period.');
  const [tableData, setTableData] = useState([]);
  const [totals, setTotals] = useState({ seeds: 0, active: 0, blocked: 0 });
  const [isSending, setIsSending] = useState(false);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Replace these with your actual bot token and chat ID
  const BOT_TOKEN = "7798410444:AAE5jRUbMcXQ-ndZp8OUq14Vc27LeR_0BNQ";
  const CHAT_ID = "-1002480536350"; // Replace with your channel username or chat ID
  
  useEffect(() => {
    generateTableAndChart();
  }, []);

  const parseInput = (input) => {
    return input.split('\n')
                .map(value => value.trim())
                .filter(value => value !== '');
  };

  const generateTableAndChart = () => {
    const seedsValues = parseInput(seedsInput);
    const activeValues = parseInput(activeInput);
    
    if (seedsValues.length !== activeValues.length) {
      alert('Error: The number of values in both columns must be the same.');
      return;
    }
    
    let totalSeeds = 0;
    let totalActive = 0;
    let totalBlocked = 0;
    
    const newTableData = seedsValues.map((seeds, i) => {
      const seedsNum = parseInt(seeds) || 0;
      const activeNum = parseInt(activeValues[i]) || 0;
      const blockedNum = seedsNum - activeNum;
      
      totalSeeds += seedsNum;
      totalActive += activeNum;
      totalBlocked += blockedNum;
      
      return {
        dropNumber: i + 1,
        seeds: seedsNum,
        active: activeNum,
        blocked: blockedNum
      };
    });
    
    setTableData(newTableData);
    setTotals({ seeds: totalSeeds, active: totalActive, blocked: totalBlocked });
    generateChart(newTableData);
  };

  const generateChart = (data) => {
    if (!chartRef.current) {
      console.error('Chart canvas not found');
      return;
    }

    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    if (typeof Chart === 'undefined') {
      console.error('Chart.js is not loaded');
      return;
    }

    const ctx = chartRef.current.getContext('2d');
    
    const drops = data.map(row => `Drop ${row.dropNumber}`);
    const activeData = data.map(row => row.active);
    const blockedData = data.map(row => row.blocked);

    try {
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: drops,
          datasets: [
            {
              label: 'Seeds Active',
              data: activeData,
              backgroundColor: 'rgba(33, 150, 243, 0.7)',
              borderColor: 'rgba(33, 150, 243, 1)',
              borderWidth: 1
            },
            {
              label: 'Seeds Blocked',
              data: blockedData,
              backgroundColor: 'rgba(255, 99, 132, 0.7)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Drops'
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Seeds'
              }
            }
          },
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Active vs Blocked Seeds by Drop'
            }
          }
        }
      });
    } catch (error) {
      console.error('Error creating chart:', error);
    }
  };

  const clearData = () => {
    setSeedsInput('');
    setActiveInput('');
    setSessionsOutInput('');
    setTitle('OFFER');
    setTableData([]);
    setTotals({ seeds: 0, active: 0, blocked: 0 });
    
    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }
  };

  const generateHTMLContent = () => {
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

    const activePercentage = Math.round((totalActive/totalSeeds)*100);
    const blockedPercentage = Math.round((totalBlocked/totalSeeds)*100);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} - Consumption Report</title>
<style>
  body {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    background: #f5f7fa;
    color: #2c3e50;
    line-height: 1.6;
    padding: 20px;
  }
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
  .header {
    text-align: center;
    margin-bottom: 20px;
    padding: 15px;
    border-bottom: 2px solid #2196F3;
  }
  .title {
    font-size: 1.6rem;
    font-weight: 700;
    background: linear-gradient(135deg, #2196F3, #00BCD4);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    margin-bottom: 8px;
  }
  .subtitle {
    color: #7f8c8d;
    font-size: 0.8rem;
  }
  .stats-panel {
    background: rgba(33, 150, 243, 0.05);
    border-radius: 12px;
    padding: 12px;
    margin-bottom: 16px;
    border: 1px solid #e1e5e9;
  }
  .stat-item {
    margin-bottom: 8px;
    padding: 6px 0;
    border-bottom: 1px solid #e1e5e9;
    display: flex;
    justify-content: space-between;
  }
  .stat-item:last-child {
    border-bottom: none;
  }
  .stat-value {
    font-weight: 700;
    color: #2196F3;
  }
  .table-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    padding: 16px;
    margin-bottom: 16px;
    border: 1px solid #e1e5e9;
    overflow-x: auto;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11.2px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    overflow: hidden;
  }
  th {
    background: linear-gradient(135deg, #2196F3, #1976D2);
    padding: 12px 10px;
    text-align: left;
    border-bottom: 2px solid #e1e5e9;
    font-weight: 600;
    color: white;
  }
  td {
    padding: 10px;
    border-bottom: 1px solid #e1e5e9;
  }
  tr:last-child td {
    border-bottom: none;
  }
  .totals-row {
    background: linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(0, 188, 212, 0.1));
    font-weight: 600;
  }
  .diagram-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    padding: 16px;
    margin-bottom: 16px;
    border: 1px solid #e1e5e9;
    overflow-x: auto;
  }
  .diagram-title {
    font-size: 0.96rem;
    font-weight: 600;
    margin-bottom: 12px;
    color: #2c3e50;
  }
  .chart-container {
    position: relative;
    width: 224px;
    height: 224px;
    margin: 0 auto;
  }
  .pie-chart {
    width: 100%;
    height: 100%;
    position: relative;
    border-radius: 50%;
    background: conic-gradient(
      #2196F3 0% ${activePercentage}%,
      #FF6B6B ${activePercentage}% 100%
    );
    box-shadow: 
      0 8px 25px rgba(0, 0, 0, 0.1),
      inset 0 0 30px rgba(255, 255, 255, 0.05);
  }
  .chart-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100px;
    height: 100px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10;
    border: 1px solid #e1e5e9;
  }
  .total-count {
    font-size: 1.2rem;
    font-weight: 700;
    color: #00BCD4;
    line-height: 1;
  }
  .total-label {
    font-size: 0.7rem;
    color: #7f8c8d;
    margin-top: 4px;
  }
  .diagram-legend {
    margin-top: 16px;
  }
  .legend-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    padding: 6px 10px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #e1e5e9;
  }
  .legend-color {
    width: 13px;
    height: 13px;
    border-radius: 50%;
    margin-right: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  .legend-label {
    flex: 1;
    font-size: 10.4px;
    font-weight: 500;
  }
  .legend-percentage {
    font-weight: 700;
    color: #00BCD4;
    margin-left: 5px;
    font-size: 10.4px;
  }
  .legend-count {
    font-size: 8.8px;
    color: #7f8c8d;
    margin-left: 5px;
  }
  footer {
    text-align: center;
    margin-top: 24px;
    padding: 12px;
    color: #7f8c8d;
    border-top: 1px solid #e1e5e9;
  }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">${title}</h1>
      <p class="subtitle">Consumption Report - Generated on ${new Date().toLocaleDateString('en-GB')}</p>
    </div>
    
    <div class="stats-panel">
      <div class="stat-item">
        <span>Total Consumption: </span>
        <span class="stat-value">${totalSeeds}</span>
      </div>
      <div class="stat-item">
        <span>Total Seeds Active: </span>
        <span class="stat-value">${totalActive}</span>
      </div>
      <div class="stat-item">
        <span>Total Seeds Blocked: </span>
        <span class="stat-value">${totalBlocked}</span>
      </div>
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
          <div class="legend-color" style="background-color: #2196F3;"></div>
          <span class="legend-label">Active Seeds</span>
          <span class="legend-percentage">${activePercentage}%</span>
          <span class="legend-count">(${totalActive})</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: #FF6B6B;"></div>
          <span class="legend-label">Blocked Seeds</span>
          <span class="legend-percentage">${blockedPercentage}%</span>
          <span class="legend-count">(${totalBlocked})</span>
        </div>
      </div>
    </div>
    
    <div class="table-container">
      <h3>Detailed Data</h3>
      <table>
        <thead>
          <tr>
            <th>Drop N°</th>
            <th>CONSOMMATION SEEDS (ACTIVE+BLOCKED)</th>
            <th>Nbr BOITES ACTIVE/DROP</th>
            <th>Nbr BOITES BLOCKED</th>
            <th>SESSIONS OUT</th>
          </tr>
        </thead>
        <tbody>
          ${seedsValues.map((seeds, i) => {
            const dropNumber = i + 1;
            const active = parseInt(activeValues[i]) || 0;
            const blocked = parseInt(seeds) - active;
            return `
              <tr>
                <td>Drop N° ${dropNumber}</td>
                <td>${seeds}</td>
                <td>${active}</td>
                <td>${blocked}</td>
                <td>${sessionsOutInput}</td>
              </tr>
            `;
          }).join('')}
          <tr class="totals-row">
            <td colspan="2">TOTAL CONSOMMATION: ${totalSeeds}</td>
            <td>TOTAL SEEDS ACTIVE: ${totalActive}</td>
            <td>TOTAL SEEDS BLOCKED: ${totalBlocked}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <footer>
      <p>CMHW</p>
    </footer>
  </div>
</body>
</html>
    `;
  };

  const exportAsHTML = () => {
    const htmlContent = generateHTMLContent();
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_consumption_report.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sendToTelegram = async () => {
    if (!BOT_TOKEN || !CHAT_ID) {
      alert('Please configure BOT_TOKEN and CHAT_ID first.');
      return;
    }
    

    setIsSending(true);
    try {
      const htmlContent = generateHTMLContent();
      const blob = new Blob([htmlContent], { type: "text/html" });
      const formData = new FormData();
      formData.append("chat_id", CHAT_ID);
      formData.append("document", blob, `${title.replace(/\s+/g, "_")}_consumption_report.html`);
      formData.append("caption", `📊 ${title} - Consumption Report\nGenerated on ${new Date().toLocaleDateString()}`);

      const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert('Report sent to Telegram successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to send report: ${errorData.description || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error sending to Telegram:', error);
      alert('Error sending report to Telegram. Please check console for details.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section id="consumption-section" className="content-section active">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 id="dashboard-title" className="dashboard-title">{title}</h1>
          <p className="dashboard-subtitle" id="current-date">
            {new Date().toLocaleDateString('en-GB')}
          </p>
        </div>

        <div className="dashboard-input-section">
          <div className="input-row">
            <label htmlFor="title-input" className="input-label">Title</label>
            <input 
              type="text" 
              className="dashboard-textarea" 
              id="title-input" 
              placeholder="Enter title (e.g., OFFER)" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="results-row">
            <div className="input-row" style={{ flex: 1 }}>
              <label htmlFor="seeds-input" className="input-label">Consommation Seeds (Active + Blocked)</label>
              <textarea 
                className="dashboard-textarea" 
                id="seeds-input" 
                placeholder="Enter values (one per line)"
                value={seedsInput}
                onChange={(e) => setSeedsInput(e.target.value)}
              />
            </div>
            <div className="input-row" style={{ flex: 1 }}>
              <label htmlFor="active-input" className="input-label">Nbr Boites Active/Drop</label>
              <textarea 
                className="dashboard-textarea" 
                id="active-input" 
                placeholder="Enter values (one per line)"
                value={activeInput}
                onChange={(e) => setActiveInput(e.target.value)}
              />
            </div>
            <div className="input-row" style={{ flex: 1 }}>
              <label htmlFor="sessions-out-input" className="input-label">Sessions Out (text for all drops)</label>
              <textarea 
                className="dashboard-textarea" 
                id="sessions-out-input" 
                placeholder="Enter text for sessions out"
                value={sessionsOutInput}
                onChange={(e) => setSessionsOutInput(e.target.value)}
              />
            </div>
          </div>

          <div className="dashboard-buttons">
            <button id="generate-btn" className="btn-generate" onClick={generateTableAndChart}>
              Generate Table & Chart
            </button>
            <button id="clear-btn" className="btn-clear" onClick={clearData}>
              Clear
            </button>
            <button id="export-btn" className="btn-export" onClick={exportAsHTML}>
              Export as HTML
            </button>
            <button 
              id="telegram-btn" 
              className="btn-telegram" 
              onClick={sendToTelegram}
              disabled={isSending}
              style={{
                backgroundColor: '#0088cc',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: isSending ? 'not-allowed' : 'pointer',
                opacity: isSending ? 0.6 : 1
              }}
            >
              {isSending ? 'Sending...' : 'Send to Telegram'}
            </button>
          </div>
        </div>

        <div className="results-row">
          <div className="dashboard-chart-container" style={{ flex: 2 }}>
            <div className="dashboard-chart-header">
              <h3 className="dashboard-chart-title">Consumption Overview</h3>
              <div className="dashboard-stats-panel">
                <div className="dashboard-stat-item">
                  <span>Total Consumption: </span>
                  <span className="dashboard-stat-value" id="total-consumption">
                    {totals.seeds}
                  </span>
                </div>
                <div className="dashboard-stat-item">
                  <span>Total Seeds Active: </span>
                  <span className="dashboard-stat-value" id="total-active">
                    {totals.active}
                  </span>
                </div>
                <div className="dashboard-stat-item">
                  <span>Total Seeds Blocked: </span>
                  <span className="dashboard-stat-value" id="total-blocked">
                    {totals.blocked}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ height: '400px', position: 'relative' }}>
              <canvas id="consumption-chart" ref={chartRef}></canvas>
            </div>
          </div>
        </div>

        <div className="dashboard-table-container">
          <h3 className="dashboard-chart-title">Detailed Data</h3>
          <div className="table-responsive">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Drop N°</th>
                  <th>CONSOMMATION SEEDS (ACTIVE+BLOCKED)</th>
                  <th>Nbr BOITES ACTIVE/DROP</th>
                  <th>Nbr BOITES BLOCKED</th>
                  <th>SESSIONS OUT</th>
                </tr>
              </thead>
              <tbody id="table-body">
                {tableData.map(row => (
                  <tr key={row.dropNumber}>
                    <td>Drop N° {row.dropNumber}</td>
                    <td>{row.seeds}</td>
                    <td>{row.active}</td>
                    <td>{row.blocked}</td>
                    <td>{sessionsOutInput}</td>
                  </tr>
                ))}
                {tableData.length > 0 && (
                  <tr className="totals-row">
                    <td colSpan="2">TOTAL CONSOMMATION: {totals.seeds}</td>
                    <td>TOTAL SEEDS ACTIVE: {totals.active}</td>
                    <td>TOTAL SEEDS BLOCKED: {totals.blocked}</td>
                    <td></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConsumptionReport;