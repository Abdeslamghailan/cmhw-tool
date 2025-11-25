# Plan Generator - Bug Analysis & Fix

## 🐛 Issue: Why Empty Values Are Returned

### The Problem

The Plan Generator returns empty output because the **state is not being properly updated after parsing**. Here are the specific issues:

---

## Issue #1: State Update Timing

### Current Code Flow:
```
1. User clicks "Generate New Plan"
2. parsePlan() is called
3. parsePlan() updates state (steps, sessions, limits, etc.)
4. BUT: generatePlan() runs IMMEDIATELY with OLD state values
5. Since old state is empty arrays, generation fails
```

### Why This Happens:
In React, state updates are **asynchronous**. When you call `parsePlan()` and then immediately call `generatePlan()`, the state hasn't been updated yet.

**Current Code (Problematic):**
```javascript
const handleGeneratePlan = () => {
  if (!inputText.trim()) {
    showMessage('Please paste a plan into the text area.', 'warning');
    return;
  }

  if (!parsePlan(inputText)) {  // ❌ Updates state async
    return;
  }

  if (dropsCount <= 0) {
    showMessage('Number of drops must be positive.', 'error');
    return;
  }

  const generatedPlan = generatePlan(dropsCount);  // ❌ Uses OLD state
  // ...
};
```

---

## Issue #2: Missing Return Values from parsePlan

The `parsePlan()` function returns `true/false` but doesn't return the parsed data. The state updates happen inside the function but there's a timing issue.

---

## Issue #3: generateSingleInterval Edge Case

There's a subtle bug where if `currentStart` is already beyond the limit after skipping paused intervals, the function returns `'Limite'` correctly, but the next start position calculation might be incorrect.

---

## 🔧 THE FIX

### Solution: Refactor to Parse and Generate Synchronously

Instead of parsing in one function and generating in another, we need to:
1. Parse the data first
2. Store parsed data in local variables
3. Use those variables for generation (synchronously)

Here's the corrected `handleGeneratePlan()`:

```javascript
const handleGeneratePlan = () => {
  if (!inputText.trim()) {
    showMessage('Please paste a plan into the text area.', 'warning');
    return;
  }

  // ✅ PARSE AND STORE IN LOCAL VARIABLES
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

    // Find limits line (search from bottom up)
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

    // Parse historical intervals
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

    // Parse paused intervals
    parsedPausedIntervals = Array(parsedSessions.length)
      .fill(null)
      .map(() => []);

    for (let lineIdx = limitsIndex + 1; lineIdx < lines.length; lineIdx++) {
      let parts = lines[lineIdx].split('\t');

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

  // ✅ NOW UPDATE STATE AND GENERATE WITH LOCAL VARIABLES
  setSteps(parsedSteps);
  setSessions(parsedSessions);
  setLimits(parsedLimits);
  setPausedIntervals(parsedPausedIntervals);
  setAllGeneratedIntervals(parsedAllGeneratedIntervals);

  if (dropsCount <= 0) {
    showMessage('Number of drops must be positive.', 'error');
    return;
  }

  // ✅ USE LOCAL VARIABLES, NOT STATE
  const generatedPlan = generatePlanWithData(
    dropsCount,
    parsedSteps,
    parsedSessions,
    parsedLimits,
    parsedPausedIntervals,
    parsedAllGeneratedIntervals
  );

  if (generatedPlan) {
    setGeneratedPlanRows(generatedPlan);
    setOutputText(generatedPlan.join('\n'));
    showMessage(`Generated ${dropsCount} drops successfully!`, 'success');
  }
};
```

---

## Complete Refactored generatePlan Function

Create a new function that takes parsed data as parameters:

```javascript
const generatePlanWithData = (
  numDrops,
  stepsData,
  sessionsData,
  limitsData,
  pausedIntervalsData,
  allGeneratedIntervalsData
) => {
  try {
    // Helper functions (same as before but use parameters instead of state)
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
        allGeneratedIntervalsData[sessionIdx][allGeneratedIntervalsData[sessionIdx].length - 1];
      const lastEnd = lastInterval[1];
      const limit = limitsData[sessionIdx];

      let start = lastEnd >= limit ? 1 : lastEnd + 1;
      return findNextValidStartLocal(start, sessionIdx);
    };

    const generateSingleIntervalLocal = (start, step, sessionIdx) => {
      const limit = limitsData[sessionIdx];
      const currentStart = findNextValidStartLocal(start, sessionIdx);
      const proposedEnd = currentStart + step - 1;

      // Check if exceeds limit
      if (proposedEnd > limit) {
        const nextStart = findNextValidStartLocal(1, sessionIdx);
        return ['Limite', nextStart];
      }

      // Check paused intervals
      if (isIntervalInPausedLocal(currentStart, proposedEnd, sessionIdx)) {
        const nextStart = findNextValidStartLocal(proposedEnd + 1, sessionIdx);
        return ['pause', nextStart];
      }

      // Check historical data
      if (isIntervalInPastLocal(currentStart, proposedEnd, sessionIdx)) {
        const nextStart = findNextValidStartLocal(proposedEnd + 1, sessionIdx);
        return ['X', nextStart];
      }

      // Generate valid interval
      const intervalStr = `${currentStart}-${proposedEnd}`;
      const nextStart = findNextValidStartLocal(proposedEnd + 1, sessionIdx);
      return [intervalStr, nextStart];
    };

    // Generate plan
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
```

---

## Why This Fixes the Empty Return

### Before (Broken):
1. Parse (updates state async)
2. Generate immediately (uses empty state) ❌
3. Result: Empty or incorrect output

### After (Fixed):
1. Parse (stores in local variables)
2. Update state
3. Generate with local variables (data is available) ✅
4. Result: Correct output

---

## Summary

**Root Cause**: React's asynchronous state updates + trying to use state immediately after updating it

**Solution**: Parse into local variables, generate using those variables, then update state

**Result**: Consistent, correct output every time

