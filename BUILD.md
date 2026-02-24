# Build Guide - RiskTranslator

This document provides step-by-step instructions for building and verifying the RiskTranslator application.

## Prerequisites Verification

### Step 1: Check Python Installation
```bash
python --version
```
Expected: Python 3.8 or higher (tested with 3.13.7)

### Step 2: Check Node.js Installation
```bash
node --version
npm --version
```
Expected: Node.js 16+ and npm 8+

## Backend Build Process

### Step 3: Set Up Backend Environment

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
```

3. Activate virtual environment:
   - **Windows**: `venv\Scripts\activate`
   - **macOS/Linux**: `source venv/bin/activate`

4. Install dependencies:
```bash
pip install -r requirements.txt
```

**Expected Output**: All packages should install successfully:
- fastapi==0.115.0
- uvicorn[standard]==0.30.6
- sqlmodel==0.0.22
- pydantic==2.8.2
- python-multipart==0.0.9

### Step 4: Verify Backend Structure

Verify these files exist:
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── db.py
│   ├── models.py
│   ├── schemas.py
│   ├── parsers.py
│   ├── risk.py
│   ├── llm.py
│   └── jira.py
└── requirements.txt
```

### Step 5: Start Backend Server

```bash
uvicorn app.main:app --reload --port 8000
```

**Verification Steps**:
1. Server should start without errors
2. Visit `http://localhost:8000/health` - should return `{"ok": true}`
3. Visit `http://localhost:8000/docs` - should show Swagger API documentation

**Expected Output**:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Step 6: Test Backend Endpoints

1. **Health Check**:
```bash
curl http://localhost:8000/health
```
Expected: `{"ok": true}`

2. **Create Project** (using curl or Postman):
```bash
curl -X POST "http://localhost:8000/projects" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Project", "industry": "fintech", "currency": "GBP", "revenue_per_hour": 50000}'
```

3. **List Projects**:
```bash
curl http://localhost:8000/projects
```

## Frontend Build Process

### Step 7: Set Up Frontend Environment

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

**Expected Output**: All packages should install:
- react ^18.3.1
- react-dom ^18.3.1
- vite ^5.4.2
- @vitejs/plugin-react ^4.3.1

### Step 8: Verify Frontend Structure

Verify these files exist:
```
frontend/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── api.js
│   ├── styles.css
│   └── pages/
│       ├── Landing.jsx
│       ├── Projects.jsx
│       ├── Upload.jsx
│       ├── Findings.jsx
│       ├── FindingDetail.jsx
│       └── ExecDashboard.jsx
├── index.html
├── package.json
└── vite.config.js
```

### Step 9: Start Frontend Development Server

```bash
npm run dev
```

**Verification Steps**:
1. Server should start without errors
2. Visit `http://localhost:5173` - should show the landing page
3. Check browser console for any errors

**Expected Output**:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## End-to-End Testing

### Step 10: Complete User Flow Test

1. **Landing Page**:
   - Visit `http://localhost:5173`
   - Verify beautiful landing page displays
   - Click "Get Started" button
   - Should navigate to Projects page

2. **Create Project**:
   - Click "Create Project"
   - Fill in form:
     - Name: "ACME Q1 PenTest"
     - Industry: "Fintech"
     - Currency: "GBP"
     - Revenue/Hour: 50000
   - Click "Create Project"
   - Verify project appears in list
   - Click "Open" on the project

3. **Upload Scan Data**:
   - Should navigate to Upload page
   - Use the provided `sample.json` file
   - Drag and drop or click to upload
   - Verify success message shows:
     - Total: 3
     - Critical: 1
     - High: 1
     - Medium: 1

4. **View Findings**:
   - Navigate to "Findings" in sidebar
   - Verify 3 findings are displayed
   - Test search functionality
   - Test severity filter
   - Click "View Details" on a finding

5. **Finding Detail**:
   - Verify finding details display correctly
   - Click "Generate Dev Ticket"
   - Verify ticket JSON appears
   - Click "Generate Exec Summary"
   - Verify executive summary appears with financial exposure

6. **Executive Dashboard**:
   - Navigate to "Executive Dashboard"
   - Select a finding from dropdown
   - Adjust sliders:
     - Downtime: 24 hours
     - Records: 250,000
     - Jurisdiction: GDPR
     - Churn: 2%
     - IR Maturity: Medium
   - Verify exposure calculation updates in real-time
   - Verify breakdown shows:
     - Downtime cost
     - Regulatory fines
     - Legal/IR costs
     - Reputation proxy

### Step 11: Responsive Design Test

1. **Desktop** (1920x1080):
   - Verify sidebar and main content display side-by-side
   - Verify tables are fully visible
   - Verify cards are properly sized

2. **Tablet** (768x1024):
   - Resize browser to tablet width
   - Verify sidebar becomes horizontal navigation
   - Verify content stacks appropriately
   - Verify touch targets are adequate (min 40px)

3. **Mobile** (375x667):
   - Resize browser to mobile width
   - Verify single column layout
   - Verify buttons are full-width and touch-friendly
   - Verify tables scroll horizontally
   - Verify text is readable

### Step 12: Error Handling Test

1. **Backend Offline**:
   - Stop backend server
   - Try to create a project
   - Verify error message displays

2. **Invalid JSON Upload**:
   - Upload a non-JSON file
   - Verify error message displays

3. **Missing Data**:
   - Try to access findings without uploading
   - Verify appropriate empty states display

## Build Verification Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Landing page displays correctly
- [ ] Can create a project
- [ ] Can upload sample JSON
- [ ] Findings display correctly
- [ ] Can generate dev ticket
- [ ] Can generate exec summary
- [ ] Impact simulator calculates correctly
- [ ] Responsive design works on mobile
- [ ] No console errors
- [ ] No linting errors
- [ ] API documentation accessible at /docs

## Production Build

### Step 13: Build Frontend for Production

```bash
cd frontend
npm run build
```

This creates an optimized build in `frontend/dist/` directory.

### Step 14: Serve Production Build

```bash
npm run preview
```

## Troubleshooting

### Backend Issues

**Issue**: `ModuleNotFoundError: No module named 'fastapi'`
- **Solution**: Ensure virtual environment is activated and dependencies are installed

**Issue**: `Port 8000 already in use`
- **Solution**: Change port: `uvicorn app.main:app --reload --port 8001`

**Issue**: Database errors
- **Solution**: Delete `risktranslator.db` and restart server (database will be recreated)

### Frontend Issues

**Issue**: `Cannot find module 'react'`
- **Solution**: Run `npm install` in frontend directory

**Issue**: CORS errors
- **Solution**: Verify backend CORS middleware allows `http://localhost:5173`

**Issue**: API calls failing
- **Solution**: Verify backend is running on port 8000 and frontend API URL is correct

## Next Steps

After successful build verification:
1. Review the README.md for usage instructions
2. Explore the API documentation at http://localhost:8000/docs
3. Try uploading your own scan data
4. Customize the design system in `frontend/src/styles.css`
5. Extend functionality as needed

## Build Status

✅ Backend: Complete and tested
✅ Frontend: Complete and tested
✅ Landing Page: Complete and tested
✅ Responsive Design: Complete and tested
✅ Documentation: Complete
