# 🚀 Quick Start Guide

## Fastest Way to Run the App

### Option 1: Use the Start Script (Easiest)

```bash
./start.sh
```

That's it! Both servers will start automatically.

### Option 2: Manual Start

```bash
# In the project root
npm run dev
```

This runs both frontend and backend simultaneously.

### Option 3: Separate Terminals

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## Access the Application

Once running:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

---

## First-Time Setup

If dependencies aren't installed yet:

```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

---

## Demo with Sample Documents

1. Open http://localhost:3000
2. Upload sample documents:
   - **Original**: `sample-docs/original-loan-agreement.txt`
   - **Amended**: `sample-docs/amended-loan-agreement.txt`
3. Click "Compare Documents"
4. Explore the results!

---

## Optional: OpenAI Integration

For enhanced AI-powered explanations:

1. Get an API key from https://platform.openai.com/
2. Add it to `backend/.env`:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```
3. Restart the backend server

**Note**: The app works great without OpenAI using rule-based analysis!

---

## Troubleshooting

### Port Already in Use

If port 3000 or 5000 is busy:

**Backend**: Edit `backend/.env` and change `PORT=5000` to another port  
**Frontend**: Edit `frontend/vite.config.ts` and change the server port

### Dependencies Issues

```bash
# Clean install
rm -rf node_modules frontend/node_modules backend/node_modules
npm install
cd frontend && npm install
cd ../backend && npm install
```

---

## Need Help?

Check out:
- `README.md` - Full documentation
- `DEMO_GUIDE.md` - Demo script for presentations
- Sample documents in `sample-docs/`

---

**Happy analyzing! 📊**
