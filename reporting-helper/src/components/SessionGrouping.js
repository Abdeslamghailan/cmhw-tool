import React, { useState, useEffect, useRef } from 'react';

const SessionGrouping = () => {
  const [inputText, setInputText] = useState('');
  const [sessions, setSessions] = useState({});
  const [sessionCount, setSessionCount] = useState(0);
  const [theme, setTheme] = useState('dark');
  const notificationRef = useRef(null);

  // Theme toggle functionality
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };

  // Show notification
  const showNotification = (message, type = 'success') => {
    if (notificationRef.current) {
      const notification = notificationRef.current;
      notification.textContent = message;
      notification.className = 'notification';
      
      if (type === 'error') {
        notification.style.background = '#e74c3c';
      } else {
        notification.style.background = '#2ecc71';
      }
      
      notification.classList.add('show');
      
      setTimeout(() => {
        notification.classList.remove('show');
      }, 3000);
    }
  };

  // Load example data
  const loadExample = () => {
    const exampleData = `CMH1_P_IP_4,9763,RECHECK_PLS,braianarce2@gmail.com ,06-11-2025 9-36
CMH1_P_IP_4,9789,RECHECK_PLS,marie76880@gmail.com ,06-11-2025 9-42
CMH1_P_IP_4,9800,recheck_plss,migena.iris@gmail.com ,06-11-2025 9-44
CMH1_P_IP_4,9827,RECHECK_PLS,alla.lazarenko.72@gmail.com ,06-11-2025 9-49
CMH1_P_IP_4,9832,RECHECK_PLS,sadrkmia1984@gmail.com ,06-11-2025 9-52
CMH1_P_IP_4,9846,recheck_plss,mohammadhabib0009@gmail.com ,06-11-2025 9-55
CMH1_P_IP_4,9851,RECHECK_PLS,rubelrashed884@gmail.com ,06-11-2025 9-55
CMH1_P_IP_4,9849,recheck_pls,farhadhossain863934@gmail.com ,06-11-2025 9-55
CMH1_P_IP_4,9858,RECHECK_PLS,com.enginear.sahadat@gmail.com ,06-11-2025 9-56
CMH1_P_IP_4,9855,recheck_plss,mobinsarfaraz379@gmail.com ,06-11-2025 9-56
CMH1_P_IP_4,9876,RECHECK_PLS,danilpavlenko2015@gmail.com ,06-11-2025 9-59
CMH1_P_IP_4,9881,recheck_plss,nusritnusrit2636@gmail.com ,06-11-2025 10-2
CMH1_P_IP_4,9879,RECHECK_PLS,tanishazaman6562@gmail.com ,06-11-2025 10-2
CMH1_P_IP_4,9890,recheck_pls,mdshariful7619@gmail.com ,06-11-2025 10-2
CMH1_P_IP_4,9898,RECHECK_PLS,luanandre100@gmail.com ,06-11-2025 10-5
CMH1_P_IP_4,9904,RECHECK_PLS,hmuhaembuyhla@gmail.com ,06-11-2025 10-6
CMH1_P_IP_4,9921,recheck_plss,lamthilan238@gmail.com ,06-11-2025 10-10
CMH1_P_IP_4,9924,recheck_plss,chutuan8742@gmail.com ,06-11-2025 10-11
CMH1_P_IP_4,9925,recheck_plss,mdraja5555555@gmail.com ,06-11-2025 10-14
CMH1_P_IP_4,9940,recheck_plss,nejumdebnath@gmail.com ,06-11-2025 10-14
CMH1_P_IP_4,9937,RECHECK_PLS,mdnoyon20565@gmail.com ,06-11-2025 10-14
CMH1_P_IP_4,9957,RECHECK_PLS,coroelizabet@gmail.com ,06-11-2025 10-18
CMH1_P_IP_4,9964,recheck_plss,romelcossio@gmail.com ,06-11-2025 10-18
CMH1_P_IP_4,9965,RECHECK_PLS,nicolasaraca568@gmail.com ,06-11-2025 10-19
,9962,recheck_plss,rossemarycamacho84@gmail.com ,06-11-2025 10-20
CMH1_P_IP_4,9972,recheck_pls,santoesteban47@gmail.com ,06-11-2025 10-22
CMH1_P_IP_4,9975,RECHECK_PLS,lianitaaguilera@gmail.com ,06-11-2025 10-22
CMH1_P_IP_4,9976,RECHECK_PLS,rocabadobray@gmail.com ,06-11-2025 10-22
CMH1_P_IP_4,9985,RECHECK_PLS,acamachohayakawa@gmail.com ,06-11-2025 10-25
CMH1_P_IP_4,10018,recheck_plss,nora.1975.nmt@gmail.com ,06-11-2025 10-31
CMH1_P_IP_4,10012,RECHECK_PLS,jordan.cuellar18@gmail.com ,06-11-2025 10-31
CMH1_P_IP_4,10023,recheck_pls,rominajustiniano4@gmail.com ,06-11-2025 10-32
CMH1_P_IP_4,18,RECHECK_PLS,plounfakir15@gmail.com ,06-11-2025 10-41
CMH1_P_IP_4,25,RECHECK_PLS,frazieralford2088121@gmail.com ,06-11-2025 10-44
CMH1_P_IP_4,26,RECHECK_PLS,barnomax000@gmail.com ,06-11-2025 10-45
CMH1_P_IP_4,34,recheck_plss,sajuraj0007@gmail.com ,06-11-2025 10-45
CMH1_P_IP_4,56,recheck_pls,tuan0949166841@gmail.com ,06-11-2025 10-51
CMH1_P_IP_4,65,recheck_plss,unnan3323@gmail.com ,06-11-2025 10-51
CMH1_P_IP_4,68,RECHECK_PLS,sureesuree0624252436@gmail.com ,06-11-2025 10-54
CMH1_P_IP_4,83,RECHECK_PLS,badsha0230@gmail.com ,06-11-2025 10-57
CMH1_P_IP_4,85,RECHECK_PLS,connercarrell@gmail.com ,06-11-2025 10-57
CMH1_P_IP_4,108,RECHECK_PLS,to24121989@gmail.com ,06-11-2025 11-1
CMH1_P_IP_4,100,recheck_plss,jubayerjubayer4836@gmail.com ,06-11-2025 11-1
CMH1_P_IP_4,113,recheck_plss,md.emamul614@gmail.com ,06-11-2025 11-3
CMH1_P_IP_4,132,recheck_pls,mdm076013@gmail.com ,06-11-2025 11-7
CMH1_P_IP_4,143,RECHECK_PLS,mdmonirhossainabcdefgh@gmail.com ,06-11-2025 11-10
CMH1_P_IP_4,160,RECHECK_PLS,thuphan2061982@gmail.com ,06-11-2025 11-13
CMH1_P_IP_4,176,recheck_pls,shaplaroy1997@gmail.com ,06-11-2025 11-17
CMH1_P_IP_4,183,RECHECK_PLS,mdlablusarder744@gmail.com ,06-11-2025 11-17
CMH1_P_IP_4,244,RECHECK_PLS,imtiazuddinahmedrakib1976@gmail.com ,06-11-2025 11-30
CMH1_P_IP_4,243,RECHECK_PLS,quoctrung13101992@gmail.com ,06-11-2025 11-30
CMH1_P_IP_4,262,RECHECK_PLS,nargish4344@gmail.com ,06-11-2025 11-34
CMH1_P_IP_4,258,recheck_plss,khansetu212@gmail.com ,06-11-2025 11-34
CMH1_P_IP_4,281,RECHECK_PLS,arnobnaskar12@gmail.com ,06-11-2025 11-39
CMH1_P_IP_4,296,RECHECK_PLS,thakris5566@gmail.com ,06-11-2025 11-43`;
    
    setInputText(exampleData);
    showNotification('Example data loaded');
  };

  // Clear input and output
  const clearData = () => {
    setInputText('');
    setSessions({});
    setSessionCount(0);
    showNotification('Cleared all data');
  };

  // Process the input data
  const processData = () => {
    const text = inputText.trim();
    if (!text) {
      showNotification('Please enter some data first', 'error');
      return;
    }
    
    const lines = text.split('\n');
    const sessionData = {};
    
    // Process each line and group by session
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      
      // Remove quotes if present
      if (line.startsWith('"') && line.endsWith('"')) {
        line = line.substring(1, line.length - 1);
      }
      
      const parts = line.split(',');
      if (parts.length >= 2) {
        const session = parts[0].trim();
        const num = parts[1].trim();
        
        if (session && num) {
          // Initialize session if it doesn't exist
          if (!sessionData[session]) {
            sessionData[session] = [];
          }
          
          // Add number to session
          sessionData[session].push(num);
        }
      }
    }
    
    if (Object.keys(sessionData).length === 0) {
      showNotification('No valid sessions found in the input', 'error');
      return;
    }
    
    setSessions(sessionData);
    setSessionCount(Object.keys(sessionData).length);
    showNotification(`Processed ${Object.keys(sessionData).length} sessions`);
  };

  // Copy group to clipboard
  const copyGroup = (sessionName, groupIndex, groupNumbers) => {
    navigator.clipboard.writeText(groupNumbers.join('\n'))
      .then(() => {
        showNotification(`Copied Group ${groupIndex + 1} from ${sessionName}`);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        showNotification('Failed to copy to clipboard', 'error');
      });
  };

  return (
    <section id="session-section" className="content-section active">
      <div className="container">

        <section className="input-section">
          <textarea 
            id="inputText" 
            placeholder="Paste your CSV data here... Each line should contain comma-separated values. Example: &#10;CMH1_P_IP_4,9763,RECHECK_PLS,braianarce2@gmail.com ,06-11-2025 9-36&#10;CMH1_P_IP_4,9789,RECHECK_PLS,marie76880@gmail.com ,06-11-2025 9-42"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <div className="button-group">
            <button id="processBtn" className="process-btn" onClick={processData}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Process Data
            </button>
            <button id="clearBtn" className="clear-btn" onClick={clearData}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Clear
            </button>
            <button id="exampleBtn" className="example-btn" onClick={loadExample}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12H12M12 12H15M12 12V9M12 12V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Load Example
            </button>
          </div>
        </section>

        <section className="output-section">
          <div className="output-header">
            <h2 className="output-title">Session Groups</h2>
            <div className="session-count">Sessions: <span id="sessionCount">{sessionCount}</span></div>
          </div>
          
          <div id="sessionsContainer" className="sessions-container">
            {sessionCount === 0 ? (
              <div className="empty-state">
                <svg width="51" height="51" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 7C4 5.34315 5.34315 4 7 4H17C18.6569 4 20 5.34315 20 7V17C20 18.6569 18.6569 20 17 20H7C5.34315 20 4 18.6569 4 17V7Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 8H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M8 16H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <h3>No data processed yet</h3>
                <p>Paste your CSV data in the text area above and click "Process Data"</p>
              </div>
            ) : (
              Object.keys(sessions).map(sessionName => (
                <SessionGroup 
                  key={sessionName}
                  sessionName={sessionName}
                  numbers={sessions[sessionName]}
                  onCopyGroup={copyGroup}
                />
              ))
            )}
          </div>
        </section>

        <footer>
          <p>CMHW</p>
        </footer>
      </div>

      <div className="notification" ref={notificationRef}>Copied to clipboard!</div>
    </section>
  );
};

// Individual Session Group Component
const SessionGroup = ({ sessionName, numbers, onCopyGroup }) => {
  const [currentGroup, setCurrentGroup] = useState(0);
  const carouselRef = useRef(null);

  // Group numbers into sets of 15
  const numberGroups = [];
  for (let i = 0; i < numbers.length; i += 15) {
    numberGroups.push(numbers.slice(i, i + 15));
  }

  const totalGroups = numberGroups.length;

  const updateCarousel = (groupIndex) => {
    setCurrentGroup(groupIndex);
    if (carouselRef.current) {
      carouselRef.current.style.transform = `translateX(-${groupIndex * 100}%)`;
    }
  };

  const handlePrev = () => {
    if (currentGroup > 0) {
      updateCarousel(currentGroup - 1);
    }
  };

  const handleNext = () => {
    if (currentGroup < totalGroups - 1) {
      updateCarousel(currentGroup + 1);
    }
  };

  const handleDotClick = (index) => {
    updateCarousel(index);
  };

  // Touch swipe support
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    carouselRef.current.dataset.startX = touch.clientX;
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    carouselRef.current.dataset.endX = touch.clientX;
  };

  const handleTouchEnd = () => {
    const startX = parseFloat(carouselRef.current.dataset.startX);
    const endX = parseFloat(carouselRef.current.dataset.endX);
    const diff = startX - endX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentGroup < totalGroups - 1) {
        // Swipe left - go to next group
        updateCarousel(currentGroup + 1);
      } else if (diff < 0 && currentGroup > 0) {
        // Swipe right - go to previous group
        updateCarousel(currentGroup - 1);
      }
    }
  };

  return (
    <div className="session-group" data-session-name={sessionName}>
      <div className="session-header">
        <div className="session-name">{sessionName}</div>
        <div className="session-count-badge">{numbers.length}</div>
      </div>
      
      <div className="carousel-container">
        <div 
          className="carousel"
          ref={carouselRef}
          data-current-group={currentGroup}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {numberGroups.map((group, index) => (
            <div key={index} className="number-group">
              <div className="group-title">Group {index + 1}</div>
              <div className="number-list">
                {group.map((number, numIndex) => (
                  <div key={numIndex} className="number-item">{number}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="session-navigation">
        <button 
          className="session-nav-btn" 
          onClick={handlePrev}
          disabled={currentGroup === 0}
        >
          &#8249;
        </button>
        
        <div className="session-dots">
          {numberGroups.map((_, index) => (
            <div
              key={index}
              className={`session-dot ${index === currentGroup ? 'active' : ''}`}
              onClick={() => handleDotClick(index)}
            />
          ))}
        </div>
        
        <button 
          className="session-nav-btn" 
          onClick={handleNext}
          disabled={currentGroup === totalGroups - 1}
        >
          &#8250;
        </button>
      </div>
      
      <div className="group-count">
        Group {currentGroup + 1} of {totalGroups}
      </div>
      
      <button 
        className="session-copy-btn"
        onClick={() => onCopyGroup(sessionName, currentGroup, numberGroups[currentGroup])}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5" stroke="currentColor" strokeWidth="2"/>
        </svg>
        Copy Current Group
      </button>
    </div>
  );
};

export default SessionGrouping;