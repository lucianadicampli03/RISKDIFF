# 🔍 Amendment Insight Engine

> **A fintech application that identifies and explains material changes between loan agreements**

Built for Financial Industry Hackathon 2026

---

## 🎯 Value Proposition

### The Problem
Financial institutions process hundreds of loan amendments annually. Manually reviewing amended loan agreements to identify material changes is:
- **Time-consuming**: Hours per document for legal and credit teams
- **Error-prone**: Easy to miss critical changes in dense legal text
- **Inconsistent**: Different analysts may interpret changes differently
- **Resource-intensive**: Requires expensive legal expertise for every review

### Our Solution
The Amendment Insight Engine automates the comparison of original and amended loan agreements, providing:

✅ **Automated Clause Detection**: Intelligently parses legal documents into structured sections  
✅ **Semantic Comparison**: Identifies added, removed, and modified clauses  
✅ **Plain-English Explanations**: Translates legal changes into business impact  
✅ **Risk Assessment**: Classifies changes as Low, Medium, or High risk  
✅ **Beneficiary Analysis**: Shows whether changes favor Borrower, Lender, or are Neutral  
✅ **Executive Summary**: One-sentence overview of amendment's overall impact  

### Target Users
- **Credit Analysts**: Quick risk assessment of amendments
- **Loan Officers**: Understanding commercial implications
- **Legal Teams**: Pre-screening before detailed review
- **Risk Managers**: Portfolio-wide amendment tracking
- **Auditors**: Compliance verification

---

## 🚀 Features

### 1. **Document Upload**
- Drag-and-drop interface for PDF and TXT files
- Support for original agreement + amendment/restatement
- File validation and size limits (10MB)

### 2. **Intelligent Parsing**
- Extracts clauses using pattern recognition
- Identifies section numbers and titles
- Works with various document formats

### 3. **Semantic Diff Engine**
- Compares clauses by meaning, not just text
- Detects additions, deletions, and modifications
- Calculates similarity scores

### 4. **Explanation Engine**
- AI-powered analysis (GPT-4) with rule-based fallback
- Generates plain-English explanations
- Identifies economic vs. operational changes
- Assesses commercial impact

### 5. **Results Dashboard**
- **Summary Banner**: Key metrics at a glance
  - Total changes
  - High-risk count
  - Borrower vs. Lender favorable changes
- **Interactive Filters**
  - Filter by risk level (High/Medium/Low)
  - Filter by clause type (Interest Rate, Covenants, etc.)
- **Expandable Change Cards**
  - Before/After comparison
  - Impact analysis
  - Risk and beneficiary badges

---

## 🏗️ Technical Architecture

### Frontend
- **React 18** + **TypeScript**
- **Vite** for fast builds
- **TailwindCSS** for professional UI
- **Framer Motion** for animations
- **React Router** for navigation
- **Axios** for API calls

### Backend
- **Node.js** + **Express**
- **TypeScript** for type safety
- **pdf-parse** for PDF extraction
- **OpenAI API** for AI explanations (optional)
- **Multer** for file uploads

### Key Services
1. **Parser Service**: Extracts structured clauses from documents
2. **Diff Engine**: Compares documents and identifies changes
3. **Explanation Engine**: Generates business-focused analysis

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Optional: OpenAI API key for enhanced explanations

### Quick Start

```bash
# Clone or navigate to the project directory
cd loan-amendment-diff-engine

# Install root dependencies
npm install

# Install frontend and backend dependencies
cd frontend && npm install
cd ../backend && npm install
cd ..

# Set up environment variables (backend)
cd backend
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY (optional)

# Return to root and start both servers
cd ..
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

### Alternative: Run Separately

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## 🎬 Demo Instructions

### Using Sample Documents

We've included realistic sample loan documents in the `sample-docs/` folder:

1. **Original Loan Agreement** (`original-loan-agreement.txt`)
   - $5M business loan
   - 7% fixed interest rate
   - Flexible covenants
   - 5-year term

2. **Amended Agreement** (`amended-loan-agreement.txt`)
   - Changed to variable rate (SOFR + 3.5%)
   - Added prepayment penalty
   - Tightened financial covenants
   - Shortened maturity by 2 years
   - Added personal guarantees
   - Restricted dividends

### Demo Flow (3 minutes)

**Step 1: Upload (30 seconds)**
- Upload `original-loan-agreement.txt` as Original
- Upload `amended-loan-agreement.txt` as Amended
- Click "Compare Documents"

**Step 2: Executive Summary (30 seconds)**
- Highlight the summary banner showing:
  - 12+ material changes detected
  - 3+ High-risk changes
  - Lender-favorable shift

**Step 3: Filter & Explore (1 minute)**
- Click "High Risk" filter to show critical changes
- Point out Interest Rate change (Fixed → Variable)
- Show Prepayment clause (new penalty added)
- Demonstrate Covenant changes (tightened requirements)

**Step 4: Deep Dive (1 minute)**
- Expand a high-risk change card
- Show Before/After comparison
- Read the plain-English explanation
- Point out Risk Level and Beneficiary badges

### Key Demo Points

✨ **Emphasize Speed**: "What would take hours manually is done in seconds"  
✨ **Highlight Clarity**: "Technical legal changes translated to business impact"  
✨ **Show Risk Focus**: "Automatically prioritizes what matters most"  
✨ **Demonstrate Filtering**: "Find exactly what you need quickly"  

---

## 🎨 UI/UX Design Principles

### Professional Fintech Aesthetic
- Clean, minimal design
- Financial services color palette (blues, grays)
- High contrast for readability
- Clear information hierarchy

### Judge-Friendly Features
- **No jargon**: Plain English throughout
- **Visual clarity**: Color-coded changes (green/yellow/red)
- **Scannable**: Key info visible without expanding
- **Progressive disclosure**: Details available on click

### Desktop-Optimized
- Split-screen comparisons
- Multi-column layouts
- Hover states and transitions
- No mobile optimization needed (desktop-first)

---

## 🔧 Configuration

### API Base URL (Deployment)

By default the frontend calls `/api/compare`. In production, set an environment variable so the UI can reach your backend:

```
VITE_API_BASE_URL=https://your-backend.example.com
```

Then rebuild the frontend.

### AI Explanations (Optional)

The app works with rule-based explanations by default. For enhanced AI-powered analysis, you can use either:

**Option A: Free local AI with Ollama (recommended for demos)**
1. Install Ollama: https://ollama.com
2. Run a model locally:
   ```bash
   ollama run llama3.1
   ```
3. (Optional) Set environment variables in `backend/.env`:
   ```
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=llama3.1
   ```
4. Restart the backend

**Option B: OpenAI (paid)**

1. Get an API key from [OpenAI Platform](https://platform.openai.com/)
2. Add to `backend/.env`:
   ```
   OPENAI_API_KEY=sk-...
   ```
3. Restart the backend server

**Benefits of AI mode:**
- More nuanced explanations
- Better context understanding
- Industry-specific insights

**Note**: The app gracefully falls back to rule-based explanations if no AI is available.

---

## 📊 Sample Output

### Changes Detected
- ✅ **Interest Rate Modified** (High Risk, Lender-Favorable)
  - Before: 7% fixed
  - After: SOFR + 3.5% (variable) with 6% floor
  - Impact: Increases borrower's interest rate exposure

- ✅ **Prepayment Terms Modified** (High Risk, Lender-Favorable)
  - Before: No penalty
  - After: 2% penalty within 24 months
  - Impact: Restricts borrower's refinancing options

- ✅ **Personal Guarantee Added** (High Risk, Lender-Favorable)
  - New requirement for CEO/CFO guarantees
  - Impact: Increases personal liability for executives

- ✅ **Maturity Date Changed** (Medium Risk, Lender-Favorable)
  - Before: January 15, 2030
  - After: January 15, 2028
  - Impact: Accelerates repayment timeline by 2 years

---

## 🛠️ Development

### Project Structure
```
loan-amendment-diff-engine/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── types/           # TypeScript definitions
│   │   └── App.tsx          # Main app component
│   └── package.json
├── backend/                  # Node.js backend
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   │   ├── parser.ts           # Document parsing
│   │   │   ├── diffEngine.ts       # Comparison logic
│   │   │   └── explanationEngine.ts # AI/rule-based analysis
│   │   └── index.ts         # Server entry
│   └── package.json
├── sample-docs/              # Demo loan documents
└── README.md
```

### Key Files
- **Parser** (`backend/src/services/parser.ts`): Clause extraction logic
- **Diff Engine** (`backend/src/services/diffEngine.ts`): Comparison algorithm
- **Explanation Engine** (`backend/src/services/explanationEngine.ts`): Analysis generation
- **Results Page** (`frontend/src/pages/ResultsPage.tsx`): Main dashboard

### Extending the App

**Add new clause types:**
Edit `identifyClauseType()` in `parser.ts`

**Customize risk rules:**
Modify `generateRuleBasedExplanation()` in `explanationEngine.ts`

**Improve parsing:**
Enhance regex patterns in `extractClauses()` function

---

## 🎯 Hackathon Pitch Points

### Why This Wins

1. **Solves Real Pain**: Banks spend $$$$ on manual document review
2. **Immediate Value**: Works out of the box with sample docs
3. **Scalable**: Can extend to any contract type (leases, M&A, etc.)
4. **AI + Rules**: Smart fallback ensures reliability
5. **Enterprise-Ready**: Professional UI, TypeScript throughout
6. **Demo-Friendly**: 3-minute pitch perfectly showcases value

### Potential Business Model
- **SaaS Pricing**: $X per comparison or monthly subscription
- **Enterprise License**: Unlimited comparisons for large banks
- **API Access**: Integration with loan management systems
- **White Label**: Branded solution for financial institutions

### Next Steps (Post-Hackathon)
- PDF annotation export for audit trails
- Multi-document comparison (original + multiple amendments)
- Integration with document management systems (DocuSign, etc.)
- Machine learning for custom clause classification
- Regulatory compliance checking (Basel III, Dodd-Frank, etc.)

---

## 📄 License

This project is built for the Financial Industry Hackathon 2026.

---

## 👥 Contact

Built by a team passionate about transforming financial operations through technology.

**Demo Questions?** Just ask! 🚀

---

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- React and TypeScript communities
- Financial services professionals who validated the problem

---

**Made with ❤️ for the fintech community**
