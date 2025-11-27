import React, { useState, useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

const ConsumptionReport = () => {
  const [title, setTitle] = useState('OFFER AUTO');
  const [seedsInput, setSeedsInput] = useState('99\n99\n99\n99\n99\n99\n99\n99\n99\n99\n99\n99\n99\n99\n99');
  const [activeInput, setActiveInput] = useState('80\n97\n83\n91\n99\n99\n99\n99\n94\n96\n98\n98\n96\n97\n98');
  const [sessionsOutInput, setSessionsOutInput] = useState('0');
  const [tableData, setTableData] = useState([]);
  const [totals, setTotals] = useState({ seeds: 0, active: 0, blocked: 0 });
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCMH, setSelectedCMH] = useState('cmh1');
  const [todayFiles, setTodayFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Available titles
  const availableTitles = ['IP', 'IP2', 'OFFER AUTO', 'OFFER BY REQUEST'];

  // generateTableAndChart is stable for our usage here; we intentionally run it once on mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    generateTableAndChart();
    fetchTodayFiles();
  }, []);

  const fetchTodayFiles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/files/today');
      const files = await response.json();
      setTodayFiles(files);
    } catch (error) {
      console.error('Failed to fetch today\'s files:', error);
    }
  };

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
              backgroundColor: 'rgba(5, 150, 105, 0.7)',
              borderColor: 'rgba(5, 150, 105, 1)',
              borderWidth: 1
            },
            {
              label: 'Seeds Blocked',
              data: blockedData,
              backgroundColor: 'rgba(220, 38, 38, 0.7)',
              borderColor: 'rgba(220, 38, 38, 1)',
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
    setTitle('OFFER AUTO');
    setTableData([]);
    setTotals({ seeds: 0, active: 0, blocked: 0 });
    
    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }
  };

const generateAndSaveFile = async () => {
  if (!availableTitles.includes(title)) {
    alert('Please select a valid title from the dropdown');
    return;
  }

  setIsGenerating(true);
  try {
    const response = await fetch('http://localhost:5000/api/generate-file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        seedsInput,
        activeInput,
        sessionsOutInput,
        cmh: selectedCMH  // ← ADD THIS LINE
      }),
    });

    const result = await response.json();

    if (result.success) {
      alert('File generated and saved successfully!');
      fetchTodayFiles(); // Refresh the files list
    } else {
      alert('Failed to generate file: ' + result.error);
    }
  } catch (error) {
    console.error('Error generating file:', error);
    alert('Error generating file. Please check console for details.');
  } finally {
    setIsGenerating(false);
  }
};

const sendToTelegram = async () => {
  setIsSending(true);
  try {
    const response = await fetch('http://localhost:5000/api/send-cmh-to-telegram', {  // ← Changed endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cmh: selectedCMH
        // Remove sendAll parameter - new endpoint sends all files for that CMH
      }),
    });

    const result = await response.json();

    if (result.success) {
      alert(`Successfully sent ${result.message}!`);
    } else {
      alert('Failed to send files: ' + result.error);
    }
  } catch (error) {
    console.error('Error sending to Telegram:', error);
    alert('Error sending files. Please check console for details.');
  } finally {
    setIsSending(false);
  }
};

  const downloadFile = async (fileName) => {
    try {
      const response = await fetch(`http://localhost:5000/api/download/${fileName}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to download file');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file');
    }
  };

  const deleteFile = async (fileName) => {
    if (!window.confirm('Are you sure you want to delete this file? This cannot be undone.')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/files/${encodeURIComponent(fileName)}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (response.ok) {
        alert('File deleted');
        fetchTodayFiles();
        if (selectedFile && selectedFile.fileName === fileName) setSelectedFile(null);
      } else {
        alert('Failed to delete file: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file');
    }
  };

  return (
    <section id="consumption-section" className="content-section active">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Consumption Report Generator</h1>
          <p className="dashboard-subtitle">
            {new Date().toLocaleDateString('en-GB')}
          </p>
        </div>

        {/* Today's Generated Files */}
        <div className="files-panel" style={{
          background: 'white',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px',
          border: '1px solid #e1e5e9'
        }}>
          <h3 style={{ marginBottom: '10px', color: '#2c3e50' }}>Today's Generated Files</h3>
          {todayFiles.length === 0 ? (
            <p style={{ color: 'var(--muted-color)', fontStyle: 'italic' }}>No files generated today</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {todayFiles.map((file, index) => (
                <div key={index} style={{
                  background: 'var(--bg-color)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: '700', color: 'var(--text-color)' }}>{file.cmhName}</span>
                    <span style={{ fontSize: '12px', color: 'var(--muted-color)' }}>{file.title}</span>
                  </div>
                  <button 
                    onClick={() => downloadFile(file.fileName)}
                    style={{
                      background: 'var(--secondary)',
                      color: 'var(--light-text)',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Download
                  </button>
                  <button
                    onClick={() => deleteFile(file.fileName)}
                    style={{
                      background: 'var(--accent)',
                      color: 'var(--light-text)',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-input-section">
          <div className="input-row">
            <label htmlFor="title-select" className="input-label">Report Title</label>
            <select 
              id="title-select"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                border: '2px solid var(--border-color)',
                borderRadius: 'var(--border-radius)',
                padding: '10px',
                background: 'var(--card-bg)',
                color: 'var(--text-color)',
                transition: 'var(--transition)',
                fontSize: '11.2px',
                fontWeight: '600'
              }}
            >
              {availableTitles.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="input-row">
            <label htmlFor="cmh-select" className="input-label">Select CMH</label>
            <select 
              id="cmh-select"
              value={selectedCMH}
              onChange={(e) => setSelectedCMH(e.target.value)}
              style={{
                border: '2px solid var(--border-color)',
                borderRadius: 'var(--border-radius)',
                padding: '10px',
                background: 'var(--card-bg)',
                color: 'var(--text-color)',
                transition: 'var(--transition)',
                fontSize: '11.2px',
                fontWeight: '600'
              }}
            >
              <option value="cmh1">CMH 1</option>
              <option value="cmh2">CMH 2</option>
              <option value="cmh3">CMH 3</option>
              <option value="cmh1">CMH 5</option>
              <option value="cmh2">CMH 6</option>
              <option value="cmh3">CMH 8</option>
              <option value="cmh1">CMH 9</option>
              <option value="cmh2">CMH 12</option>
              <option value="cmh3">CMH 16</option>
            </select>
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
            <button 
              id="save-btn" 
              className="btn-save" 
              onClick={generateAndSaveFile}
              disabled={isGenerating}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 'var(--border-radius)',
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                opacity: isGenerating ? 0.6 : 1
              }}
            >
              {isGenerating ? 'Saving...' : 'Save to Backend'}
            </button>
            <button 
              id="telegram-btn" 
              className="btn-telegram" 
              onClick={sendToTelegram}
              disabled={isSending || todayFiles.length === 0}
              style={{
                backgroundColor: '#0088cc',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 'var(--border-radius)',
                cursor: (isSending || todayFiles.length === 0) ? 'not-allowed' : 'pointer',
                opacity: (isSending || todayFiles.length === 0) ? 0.6 : 1
              }}
            >
              {isSending ? `Sending...` : `Send ${selectedCMH.toUpperCase()} Files`}  {/* ← Updated text */}
            </button>
          </div>
        </div>

        {/* Rest of your existing JSX for chart and table remains the same */}
        <div className="results-row">
          <div className="dashboard-chart-container" style={{ flex: 2 }}>
            <div className="dashboard-chart-header">
              <h3 className="dashboard-chart-title">Consumption Overview</h3>
              <div className="dashboard-stats-panel">
                <div className="dashboard-stat-item">
                  <span>Total Consumption: </span>
                  <span className="dashboard-stat-value">
                    {totals.seeds}
                  </span>
                </div>
                <div className="dashboard-stat-item">
                  <span>Total Seeds Active: </span>
                  <span className="dashboard-stat-value">
                    {totals.active}
                  </span>
                </div>
                <div className="dashboard-stat-item">
                  <span>Total Seeds Blocked: </span>
                  <span className="dashboard-stat-value">
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
