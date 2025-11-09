import React, { useState, useRef, useEffect } from 'react';
import { TYPES, COLORS } from '../utils/constants';
import '../styles/App.css';

const BlockedEmails = () => {
  const [input, setInput] = useState('');
  const [results, setResults] = useState(null);
  const diagramRef = useRef(null);

  const processEmails = () => {
    const lines = input.trim().split("\n").filter(l => l.trim() !== "");
    const grouped = {};
    const allLinesOutput = [];

    TYPES.forEach(type => grouped[type] = []);

    lines.forEach(line => {
      const parts = line.split(",");
      if (parts.length >= 5) {
        const status = parts[2].trim();
        const email = parts[3].trim();
        if (email && status) {
          allLinesOutput.push(`${email}\t${status}`);
          if (TYPES.includes(status)) {
            grouped[status].push(email);
          }
        }
      }
    });

    setResults({
      allLinesOutput,
      grouped,
      totalEmails: allLinesOutput.length
    });
  };

  const copyToClipboard = async (text, buttonRef) => {
    try {
      await navigator.clipboard.writeText(text);
      
      // Show "Copied!" feedback
      if (buttonRef && buttonRef.current) {
        const originalHTML = buttonRef.current.innerHTML;
        buttonRef.current.innerHTML = `
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Copied!
        `;
        
        setTimeout(() => {
          if (buttonRef.current) {
            buttonRef.current.innerHTML = originalHTML;
          }
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const captureDiagramScreenshot = async () => {
    if (!diagramRef.current) {
      alert('No diagram available to capture');
      return;
    }

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(diagramRef.current, {
        backgroundColor: getComputedStyle(document.body).getPropertyValue('--bg-color'),
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const link = document.createElement('a');
      link.download = 'blocked-emails-diagram.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Screenshot capture failed:', error);
    }
  };

  const typesWithData = results ? TYPES.filter(type => results.grouped[type].length > 0) : [];

  return (
    <section id="emails-section" className="content-section active">
      <section className="input-section">
        <textarea 
          id="input" 
          placeholder="Paste your blocked email data here (CSV format with at least 5 columns)..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button 
          id="processBtn" 
          className="process-btn"
          onClick={processEmails}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Analyze Blocked Emails
        </button>
      </section>

      <section className="results-section" id="result">
        {!results ? (
          <div className="empty-state">
            <svg width="51" height="51" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 7C4 5.34315 5.34315 4 7 4H17C18.6569 4 20 5.34315 20 7V17C20 18.6569 18.6569 20 17 20H7C5.34315 20 4 18.6569 4 17V7Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 8H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M8 16H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <h3>No data processed yet</h3>
            <p>Paste your blocked email data in the text area above and click "Analyze Blocked Emails"</p>
          </div>
        ) : results.totalEmails === 0 ? (
          <div className="empty-state">
            <svg width="51" height="51" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M15 9L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3>No valid blocked emails found</h3>
            <p>Please check your data format and try again</p>
          </div>
        ) : (
          <>
            <div className="results-row">
              <DiagramSection 
                results={results} 
                typesWithData={typesWithData}
                onCaptureScreenshot={captureDiagramScreenshot}
                ref={diagramRef}
              />
              <AllEmailsBlock 
                allLinesOutput={results.allLinesOutput}
                onCopy={copyToClipboard}
              />
            </div>

            <TypesSection 
              grouped={results.grouped}
              typesWithData={typesWithData}
              onCopy={copyToClipboard}
            />
          </>
        )}
      </section>
    </section>
  );
};

const DiagramSection = React.forwardRef(({ results, typesWithData, onCaptureScreenshot }, ref) => {
  const totalEmails = results.totalEmails;
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // Calculate segments with exact 180° total
  let startAngle = 0;
  const segments = [];
  
  // First calculate total angle to ensure it's exactly 180°
  let totalAngle = 0;
  typesWithData.forEach(type => {
    const segmentAngle = (results.grouped[type].length / totalEmails) * 180;
    totalAngle += segmentAngle;
  });
  
  const adjustmentFactor = 180 / totalAngle;
  
  typesWithData.forEach((type, index) => {
    const percentage = (results.grouped[type].length / totalEmails) * 100;
    let segmentAngle = (results.grouped[type].length / totalEmails) * 180 * adjustmentFactor;
    
    segments.push({
      type,
      angle: segmentAngle,
      startAngle,
      color: COLORS[index % COLORS.length],
      count: results.grouped[type].length,
      percentage: percentage.toFixed(1)
    });
    
    startAngle += segmentAngle;
  });

  const handleSegmentMouseEnter = (segment, event) => {
    setHoveredSegment(segment);
    setTooltipPosition({
      x: event.nativeEvent.offsetX + 10,
      y: event.nativeEvent.offsetY + 10
    });
  };

  const handleSegmentMouseMove = (event) => {
    if (hoveredSegment) {
      setTooltipPosition({
        x: event.nativeEvent.offsetX + 10,
        y: event.nativeEvent.offsetY + 10
      });
    }
  };

  const handleSegmentMouseLeave = () => {
    setHoveredSegment(null);
  };

  return (
    <div className="diagram-section" ref={ref}>
      <div className="block-header">
        <h2 className="diagram-title">Blocked Email Distribution</h2>
        <button className="screenshot-btn" onClick={onCaptureScreenshot}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Save Diagram
        </button>
      </div>
      
      <div className="diagram-container">
        <div className="chart-container">
          <div className="half-pie-chart">
            <div className="chart-center">
              <div className="total-count">{totalEmails}</div>
              <div className="total-label">Blocked</div>
            </div>
            {segments.map((segment, index) => (
              <div
                key={segment.type}
                className="chart-segment"
                style={{
                  background: `conic-gradient(from ${segment.startAngle}deg at 50% 100%, ${segment.color} 0deg ${segment.angle}deg, transparent ${segment.angle}deg)`,
                  transform: `rotate(${segment.startAngle}deg)`,
                  animationDelay: `${index * 0.1}s`
                }}
                onMouseEnter={(e) => handleSegmentMouseEnter(segment, e)}
                onMouseMove={handleSegmentMouseMove}
                onMouseLeave={handleSegmentMouseLeave}
              />
            ))}
            {hoveredSegment && (
              <div 
                className="segment-tooltip"
                style={{
                  left: `${tooltipPosition.x}px`,
                  top: `${tooltipPosition.y}px`
                }}
              >
                {hoveredSegment.type}: {hoveredSegment.count} ({hoveredSegment.percentage}%)
              </div>
            )}
          </div>
        </div>
        
        <DiagramLegend 
          segments={segments} 
          typesWithData={typesWithData}
          results={results}
        />
        
        <StatsSummary results={results} typesWithData={typesWithData} />
      </div>
    </div>
  );
});

const DiagramLegend = ({ segments, typesWithData, results }) => {
  const [highlightedSegment, setHighlightedSegment] = useState(null);

  const handleLegendMouseEnter = (segmentIndex) => {
    setHighlightedSegment(segmentIndex);
  };

  const handleLegendMouseLeave = () => {
    setHighlightedSegment(null);
  };

  return (
    <div className="diagram-legend">
      {segments.map((segment, index) => (
        <div 
          key={segment.type} 
          className="legend-item"
          onMouseEnter={() => handleLegendMouseEnter(index)}
          onMouseLeave={handleLegendMouseLeave}
        >
          <div className="legend-color" style={{ backgroundColor: segment.color }}></div>
          <span className="legend-label">{segment.type}</span>
          <span className="legend-percentage">{segment.percentage}%</span>
          <span className="legend-count">({segment.count})</span>
        </div>
      ))}
    </div>
  );
};

const AllEmailsBlock = ({ allLinesOutput, onCopy }) => {
  const copyBtnRef = useRef(null);

  const handleCopy = () => {
    onCopy(allLinesOutput.join("\n"), copyBtnRef);
  };

  return (
    <div className="all-emails-block">
      <div className="block-header">
        <h2 className="block-title">
          All Blocked Emails
          <span className="type-count">{allLinesOutput.length}</span>
        </h2>
        <button className="copy-btn" onClick={handleCopy} ref={copyBtnRef}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Copy All
        </button>
      </div>
      <div className="email-list">
        {allLinesOutput.join("\n")}
      </div>
    </div>
  );
};

const TypesSection = ({ grouped, typesWithData, onCopy }) => (
  <div className="types-section">
    <h2 className="section-title">Categorized by Block Type</h2>
    <div className="types-grid">
      {typesWithData.map(type => (
        <TypeCard
          key={type}
          type={type}
          emails={grouped[type]}
          onCopy={onCopy}
        />
      ))}
    </div>
  </div>
);

const TypeCard = ({ type, emails, onCopy }) => {
  const copyBtnRef = useRef(null);

  const handleCopy = () => {
    onCopy(emails.join("\n"), copyBtnRef);
  };

  return (
    <div className="type-card">
      <div className="type-header">
        <div className="type-name">{type}</div>
        <div className="type-count">{emails.length}</div>
      </div>
      <div className="type-list">
        {emails.join("\n")}
      </div>
      <button 
        className="copy-btn" 
        onClick={handleCopy}
        ref={copyBtnRef}
        style={{
          marginTop: '10px',
          alignSelf: 'flex-end'
        }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5" stroke="currentColor" strokeWidth="2"/>
        </svg>
        Copy
      </button>
    </div>
  );
};

const StatsSummary = ({ results, typesWithData }) => {
  const totalEmails = results.totalEmails;
  const largestType = typesWithData.reduce((max, type) => 
    results.grouped[type].length > results.grouped[max].length ? type : max, typesWithData[0]
  );
  const largestPercentage = ((results.grouped[largestType].length / totalEmails) * 100).toFixed(1);
  const avgPerType = (totalEmails / typesWithData.length).toFixed(1);

  return (
    <div className="stats-summary">
      <div className="stat-item">
        <div className="stat-value">{typesWithData.length}</div>
        <div className="stat-label">Block Types</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">{largestPercentage}%</div>
        <div className="stat-label">Largest Group</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">{avgPerType}</div>
        <div className="stat-label">Avg per Type</div>
      </div>
    </div>
  );
};

export default BlockedEmails;