import React, { useState } from 'react';
import './PlanGenerator.css';

const PlanGenerator = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [dropsCount, setDropsCount] = useState(24);
  const [generatedPlanRows, setGeneratedPlanRows] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');

  // State for parsed data
  const [steps, setSteps] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [limits, setLimits] = useState([]);
  const [pausedIntervals, setPausedIntervals] = useState([]);
  const [allGeneratedIntervals, setAllGeneratedIntervals] = useState([]);

  const showMessage = (message, type = 'info') => {
    setStatusMessage(message);
    setStatusType(type);
    setTimeout(() => {
      setStatusMessage('');
      setStatusType('');
    }, 4000);
  };

  const generatePlanWithData = (
    numDrops,
    stepsData,
    sessionsData,
    limitsData,
    pausedIntervalsData,
    allGeneratedIntervalsData
  ) => {
    try {
      // Helper functions using local data parameters
      const isIntervalOverlappingLocal = (start, end, intervals) => {
        for (const [intervalStart, intervalEnd] of intervals) {
          if (start <= intervalEnd && intervalStart <= end) {
            return true;
          }
        }
        return false;
      };

      const isIntervalInPastLocal = (start, end, sessionIdx) => {
        for (const [histStart, histEnd] of allGeneratedIntervalsData[sessionIdx]) {
          if (histStart <= start && end <= histEnd) {
            return true;
          }
        }
        return false;
      };

      const isIntervalInPausedLocal = (start, end, sessionIdx) => {
        return isIntervalOverlappingLocal(start, end, pausedIntervalsData[sessionIdx]);
      };

      const findNextValidStartLocal = (currentStart, sessionIdx) => {
        const limit = limitsData[sessionIdx];
        const pausedList = pausedIntervalsData[sessionIdx];

        if (pausedList.length === 0) {
          return currentStart > limit ? 1 : currentStart;
        }

        const sortedPaused = [...pausedList].sort((a, b) => a[0] - b[0]);

        let changed = true;
        let newStart = currentStart;

        while (changed) {
          changed = false;
          for (const [pausedStart, pausedEnd] of sortedPaused) {
            if (pausedStart <= newStart && newStart <= pausedEnd) {
              newStart = pausedEnd + 1;
              changed = true;

              if (newStart > limit) {
                newStart = 1;
                for (const [ps, pe] of sortedPaused) {
                  if (ps <= newStart && newStart <= pe) {
                    newStart = pe + 1;
                    if (newStart > limit) {
                      newStart = 1;
                    }
                    break;
                  }
                }
              }
              break;
            }
          }
        }

        return newStart;
      };

      const getNextStartPositionLocal = (sessionIdx) => {
        if (allGeneratedIntervalsData[sessionIdx].length === 0) {
          return 1;
        }

        const lastInterval =
          allGeneratedIntervalsData[sessionIdx][
            allGeneratedIntervalsData[sessionIdx].length - 1
          ];
        const lastEnd = lastInterval[1];
        const limit = limitsData[sessionIdx];

        let start = lastEnd >= limit ? 1 : lastEnd + 1;
        return findNextValidStartLocal(start, sessionIdx);
      };

      const generateSingleIntervalLocal = (start, step, sessionIdx) => {
        const limit = limitsData[sessionIdx];
        const currentStart = findNextValidStartLocal(start, sessionIdx);
        const proposedEnd = currentStart + step - 1;

        if (proposedEnd > limit) {
          const nextStart = findNextValidStartLocal(1, sessionIdx);
          return ['Limite', nextStart];
        }

        if (isIntervalInPausedLocal(currentStart, proposedEnd, sessionIdx)) {
          const nextStart = findNextValidStartLocal(proposedEnd + 1, sessionIdx);
          return ['pause', nextStart];
        }

        if (isIntervalInPastLocal(currentStart, proposedEnd, sessionIdx)) {
          const nextStart = findNextValidStartLocal(proposedEnd + 1, sessionIdx);
          return ['X', nextStart];
        }

        const intervalStr = `${currentStart}-${proposedEnd}`;
        const nextStart = findNextValidStartLocal(proposedEnd + 1, sessionIdx);
        return [intervalStr, nextStart];
      };

      // Generate the plan
      const currentPositions = Array(sessionsData.length)
        .fill(null)
        .map((_, i) => getNextStartPositionLocal(i));

      const newPlan = [];

      for (let drop = 0; drop < numDrops; drop++) {
        const rowIntervals = [];

        for (let sessionIdx = 0; sessionIdx < sessionsData.length; sessionIdx++) {
          const currentPos = currentPositions[sessionIdx];
          const step = stepsData[sessionIdx];

          const [intervalStr, nextStart] = generateSingleIntervalLocal(
            currentPos,
            step,
            sessionIdx
          );

          rowIntervals.push(intervalStr);
          currentPositions[sessionIdx] = nextStart;
        }

        newPlan.push(rowIntervals.join('\t'));
      }

      return newPlan;
    } catch (error) {
      showMessage(`Generation Error: ${error.message}`, 'error');
      return null;
    }
  };

  // ✅ MAIN FIX: Parse and generate in one handler function
  const handleGeneratePlan = () => {
    if (!inputText.trim()) {
      showMessage('Please paste a plan into the text area.', 'warning');
      return;
    }

    // Parse into local variables FIRST
    let parsedSteps = [];
    let parsedSessions = [];
    let parsedLimits = [];
    let parsedPausedIntervals = [];
    let parsedAllGeneratedIntervals = [];

    try {
      const lines = inputText
        .trim()
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      if (lines.length < 4) {
        throw new Error('Plan must have at least 4 lines: steps, sessions, intervals, limits');
      }

      // Parse steps (line 1)
      try {
        parsedSteps = lines[0].split('\t').map(step => {
          const val = parseInt(step.trim());
          if (isNaN(val)) throw new Error(`Invalid number: ${step}`);
          return val;
        });
      } catch (e) {
        throw new Error(`Invalid steps format: ${e.message}`);
      }

      // Parse sessions (line 2)
      parsedSessions = lines[1].split('\t').map(session => session.trim());

      if (parsedSteps.length !== parsedSessions.length) {
        throw new Error(
          `Steps count (${parsedSteps.length}) doesn't match sessions count (${parsedSessions.length})`
        );
      }

      // Find limits line (search from bottom up for a line with all integers)
      let limitsIndex = -1;
      for (let i = lines.length - 1; i > 1; i--) {
        try {
          const parts = lines[i].split('\t');
          if (parts.length !== parsedSessions.length) continue;

          const testLimits = [];
          for (const part of parts) {
            if (part.trim()) {
              const val = parseInt(part.trim());
              if (isNaN(val)) throw new Error();
              testLimits.push(val);
            }
          }

          if (testLimits.length === parsedSessions.length) {
            limitsIndex = i;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (limitsIndex === -1) {
        throw new Error('Could not find valid limits line');
      }

      // Parse limits
      parsedLimits = [];
      lines[limitsIndex].split('\t').forEach(part => {
        if (part.trim()) {
          const val = parseInt(part.trim());
          parsedLimits.push(isNaN(val) ? 0 : val);
        } else {
          parsedLimits.push(0);
        }
      });

      // Parse historical intervals (lines 2 to limitsIndex-1)
      parsedAllGeneratedIntervals = Array(parsedSessions.length)
        .fill(null)
        .map(() => []);

      for (let lineIdx = 2; lineIdx < limitsIndex; lineIdx++) {
        const parts = lines[lineIdx].split('\t');
        if (parts.length !== parsedSessions.length) continue;

        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          if (part.includes('-')) {
            try {
              const [start, end] = part.split('-').map(x => parseInt(x.trim()));
              if (!isNaN(start) && !isNaN(end)) {
                parsedAllGeneratedIntervals[i].push([start, end]);
              }
            } catch (e) {
              continue;
            }
          }
        }
      }

      // Parse paused intervals (all lines after limits)
      parsedPausedIntervals = Array(parsedSessions.length)
        .fill(null)
        .map(() => []);

      for (let lineIdx = limitsIndex + 1; lineIdx < lines.length; lineIdx++) {
        let parts = lines[lineIdx].split('\t');

        // Pad with 'x' if needed
        while (parts.length < parsedSessions.length) {
          parts.push('x');
        }

        for (let i = 0; i < parsedSessions.length; i++) {
          let part = parts[i] ? parts[i].trim() : 'x';

          if (part && part.toLowerCase() !== 'x') {
            try {
              const partClean = part.replace(/\s+/g, '');
              if (partClean.includes('-')) {
                const [start, end] = partClean.split('-').map(x => parseInt(x));
                if (isNaN(start) || isNaN(end)) throw new Error();
                if (start > end) throw new Error(`Start > end: ${start}-${end}`);
                parsedPausedIntervals[i].push([start, end]);
              } else {
                const val = parseInt(partClean);
                if (isNaN(val)) throw new Error();
                parsedPausedIntervals[i].push([val, val]);
              }
            } catch (e) {
              throw new Error(`Invalid paused interval format '${part}': ${e.message}`);
            }
          }
        }
      }
    } catch (error) {
      showMessage(`Parsing Error: ${error.message}`, 'error');
      return;
    }

    // Validate drops count
    if (dropsCount <= 0) {
      showMessage('Number of drops must be positive.', 'error');
      return;
    }

    // ✅ NOW GENERATE WITH PARSED LOCAL DATA
    const generatedPlan = generatePlanWithData(
      dropsCount,
      parsedSteps,
      parsedSessions,
      parsedLimits,
      parsedPausedIntervals,
      parsedAllGeneratedIntervals
    );

    if (generatedPlan) {
      // Update state for display purposes
      setSteps(parsedSteps);
      setSessions(parsedSessions);
      setLimits(parsedLimits);
      setPausedIntervals(parsedPausedIntervals);
      setAllGeneratedIntervals(parsedAllGeneratedIntervals);

      setGeneratedPlanRows(generatedPlan);
      setOutputText(generatedPlan.join('\n'));
      showMessage(`Generated ${dropsCount} drops successfully!`, 'success');
    }
  };

  const handleCopyToClipboard = () => {
    if (generatedPlanRows) {
      navigator.clipboard.writeText(outputText).then(() => {
        showMessage('Plan copied to clipboard!', 'success');
      });
    } else {
      showMessage('No plan to copy.', 'warning');
    }
  };

  return (
    <div className="plan-generator">
      <div className="instructions">
        <p>
          Paste your 'Yesterday's plan + steps + sessions names + intervals + limits + paused intervals.'
        </p>
      </div>

      <div className="input-section">
        <label htmlFor="planInput">Paste Your Plan Here:</label>
        <textarea
          id="planInput"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste your plan here..."
          rows="12"
          cols="80"
        />
      </div>

      <div className="controls">
        <label htmlFor="dropsInput">
          Number of Drops:
          <input
            id="dropsInput"
            type="number"
            min="1"
            max="1000"
            value={dropsCount}
            onChange={(e) => setDropsCount(parseInt(e.target.value) || 1)}
          />
        </label>

        <button onClick={handleGeneratePlan} className="btn btn-primary">
          Generate New Plan
        </button>

        <button
          onClick={handleCopyToClipboard}
          className="btn btn-secondary"
          disabled={!generatedPlanRows}
        >
          Copy to Clipboard
        </button>
      </div>

      {statusMessage && (
        <div className={`status-message ${statusType}`}>
          {statusMessage}
        </div>
      )}

      <div className="output-section">
        <label htmlFor="planOutput">Generated New Plan:</label>
        <textarea
          id="planOutput"
          value={outputText}
          readOnly
          placeholder="Generated plan will appear here..."
          rows="12"
          cols="80"
        />
      </div>
    </div>
  );
};

export default PlanGenerator;
