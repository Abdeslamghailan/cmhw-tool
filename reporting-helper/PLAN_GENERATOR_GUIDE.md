# Plan Generator React App - Setup & Execution Guide

## Overview
This React application is a complete port of the Python Tkinter Plan Generator. It provides the same functionality with a modern web-based interface, allowing you to parse, validate, and generate plan intervals with full constraint checking.

## Project Structure

```
cmhw-tool/
├── reporting-helper/          # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PlanGenerator.js    # Main component (NEW)
│   │   │   ├── PlanGenerator.css   # Styling (NEW)
│   │   │   ├── Navbar.js           # Updated with Plan Generator tab
│   │   │   └── ...other components
│   │   ├── App.js               # Updated
│   │   └── index.js
│   ├── package.json
│   └── README.md
├── consumption-backend/        # Backend (optional)
│   └── ...
```

---

## Prerequisites & Installation

### 1. **System Requirements**
- **Node.js**: v16.0.0 or higher
- **npm**: v8.0.0 or higher (comes with Node.js)
- **Operating System**: Windows, macOS, or Linux

### 2. **Verify Node.js & npm Installation**
```powershell
node --version
npm --version
```

### 3. **Install Dependencies**

Navigate to the reporting-helper directory:
```powershell
cd c:\Users\admin_8\Desktop\Reporter-helper\cmhw-tool\reporting-helper
```

Install required packages:
```powershell
npm install
```

**Note**: All dependencies are already listed in `package.json`:
- React 19.2.0
- React DOM 19.2.0
- React Scripts 5.0.1
- And other supporting libraries

---

## How to Run

### **Option 1: Development Mode (Recommended for Testing)**

From the `reporting-helper` directory:
```powershell
npm start
```

What happens:
- Opens http://localhost:3000 automatically in your default browser
- Hot-reload enabled (changes reflect instantly)
- Development tools and error messages available
- Press `Ctrl+C` to stop

### **Option 2: Production Build**

```powershell
npm run build
```

This creates an optimized production build in the `build/` folder that can be deployed.

---

## Feature Details

### Core Functionality

The Plan Generator component provides:

1. **Plan Parsing**
   - Accepts tab-separated plan data
   - Parses steps, sessions, intervals, limits, and paused intervals
   - Comprehensive error handling with user-friendly messages

2. **Interval Generation**
   - Respects all constraints (limits, paused intervals, historical data)
   - Handles wraparound when limits are reached
   - Avoids overlapping intervals

3. **Output Management**
   - Generated plans displayed in formatted text area
   - One-click clipboard copy functionality
   - Status messages for user feedback

### Input Format

Your plan data should follow this structure (tab-separated):

```
[Steps]
[Session Names]
[Historical Interval 1]
[Historical Interval 2]
...
[Limits]
[Paused Interval 1]
[Paused Interval 2]
...
```

**Example Input:**
```
24	30	20	15
Session1	Session2	Session3	Session4
1-24	1-30	1-20	1-15
25-48	31-60	21-40	16-30
24	60	40	30
x	x	45-50	x
```

---

## Component Code Structure

### **PlanGenerator.js**
- **State Management**: Uses React hooks (useState)
- **Key Methods**:
  - `parsePlan()`: Parses input and extracts plan data
  - `generatePlan()`: Generates new intervals
  - `generateSingleInterval()`: Creates single interval with validation
  - `findNextValidStart()`: Handles paused interval skipping
  - `isIntervalOverlapping()`, `isIntervalInPast()`, `isIntervalInPaused()`: Validation methods

### **PlanGenerator.css**
- **Styling**: Modern, responsive design
- **Features**:
  - Dark mode compatible (if theme toggle enabled)
  - Responsive layout for mobile devices
  - Smooth animations and transitions
  - Status message notifications

---

## Usage Instructions

1. **Launch the Application**
   ```powershell
   npm start
   ```

2. **Navigate to Plan Generator Tab**
   - Click on "Plan Generator" in the navigation bar

3. **Paste Your Plan**
   - Paste your yesterday's plan in the "Paste Your Plan Here" text area
   - Format must be tab-separated

4. **Set Number of Drops**
   - Adjust the "Number of Drops" spinner (1-1000)
   - Default is 24

5. **Generate Plan**
   - Click "Generate New Plan" button
   - Success/error message will appear
   - Generated plan appears in the output area

6. **Copy Results**
   - Click "Copy to Clipboard" button
   - Paste into your tracking system

---

## What Was Ported from Python

### Logic Translation

| Python Tkinter | React Implementation |
|---|---|
| `tkinter.Tk()` | React component with hooks |
| `tkinter.scrolledtext.ScrolledText` | HTML `<textarea>` |
| `tkinter.Spinbox` | HTML `<input type="number">` |
| `tkinter.Button` | HTML `<button>` with onClick |
| `messagebox.showinfo/error` | Status message div with auto-hide |
| Instance variables | React useState hooks |
| GUI layout methods | JSX rendering |
| Event handlers | React event handlers |

### Algorithm Preservation

All core algorithms remain identical:
- ✅ Plan parsing logic
- ✅ Interval overlap detection
- ✅ Paused interval handling
- ✅ Limit boundary checking
- ✅ Historical data validation
- ✅ Wraparound logic

---

## Troubleshooting

### **App Won't Start**
```powershell
# Clear node modules and reinstall
rm -Recurse node_modules
npm install
npm start
```

### **Port 3000 Already in Use**
```powershell
# Kill the process using port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# Then run again
npm start
```

### **Changes Not Reflecting**
- Hard refresh: `Ctrl+Shift+R` (Windows)
- Clear browser cache in Chrome DevTools

### **Paste Functionality Not Working**
- Browser requires HTTPS or localhost for clipboard access
- Using `navigator.clipboard` API (modern, secure)

---

## Performance Notes

- **Parsing**: O(n) where n = number of input lines
- **Generation**: O(drops × sessions × validations)
- **Memory**: Minimal footprint, suitable for large datasets

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Next Steps

1. Test with your actual plan data
2. Verify all constraints are respected
3. Export/integrate generated plans into your workflow
4. Customize styling as needed (edit PlanGenerator.css)

---

## Support & Attribution

- **Original Author**: Abdelali Ketlas
- **React Port**: Fully functional with enhanced UI/UX
- **Version**: 1.0 (Web)
- **Last Updated**: November 25, 2025
