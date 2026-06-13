# 🧠 Insight AI — Adaptive Document Understanding Platform

Insight AI is a full-stack web application that uses the **Google Gemini API** to provide adaptive, multi-format document understanding and learning. Upload any document, paste a URL, or connect a GitHub repository — and get instant AI-powered summaries, explanations, mind maps, quizzes, and more.

## ✨ Features

### Core Capabilities
- **📄 Multi-Format Ingestion** — PDF, DOCX, PPTX, TXT, CSV, images (PNG/JPG), GitHub repos, URLs
- **📊 Smart Overview** — Auto-generated reading time, complexity level, key concepts, sentiment analysis
- **🎯 Explain Like I'm...** — Adaptive explanations for 4 audience levels (Beginner, Student, Professional, Developer)
- **🧠 Mind Map Generator** — Interactive visual concept trees with expand/collapse
- **💬 AI Tutor Mode** — Chat with your documents, with conversation history and suggested prompts
- **📝 Quiz Mode** — MCQs with scoring, flashcards with flip animation, interview questions
- **🖼️ Visual Insights** — AI analysis of charts, diagrams, and images using Gemini Vision
- **⚡ Smart Summaries** — 30-second, 3-minute, and 10-minute summaries at the click of a button
- **🎯 Actionable Outputs** — Content-type-aware structured outputs (research findings, code architecture, etc.)
- **🔄 Cross-Document Comparison** — Side-by-side AI-powered document comparison with follow-up questions

### Technical Highlights
- Response caching — revisiting tabs doesn't re-trigger API calls
- Retry with exponential backoff for transient API errors
- JSON repair logic for malformed structured outputs
- Loading skeletons for every AI-generated section

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| AI | Google Gemini API (`@google/generative-ai` SDK) |
| Database | JSON file store (lightweight, no native deps) |
| File Parsing | pdf-parse, mammoth, officeparser |

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ installed
- **Gemini API Key** — Get one from [Google AI Studio](https://aistudio.google.com/apikey)

### 1. Clone and Configure

```bash
git clone <your-repo-url>
cd Hack2Skill13june-Project
```

### 2. Set Environment Variables

Create a `.env` file in the project root (already created if cloning from this repo):

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL_FLASH=gemini-1.5-flash
GEMINI_MODEL_PRO=gemini-1.5-pro
PORT=3001
```

> ⚠️ **Never commit your API key!** The `.env` file is already in `.gitignore`.

### 3. Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 4. Start the Application

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd server
npm start
```
The server starts at `http://localhost:3001`

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```
The app opens at `http://localhost:5173`

## 📁 Project Structure

```
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Document/      # OverviewTab, ExplainTab, MindMapTab, 
│   │   │   │                  # ChatTab, QuizTab, VisualInsightsTab,
│   │   │   │                  # SmartSummary, ActionableOutputs
│   │   │   ├── Layout/        # Navbar, Sidebar, DashboardLayout
│   │   │   └── Upload/        # UploadModal
│   │   ├── context/           # AppContext (global state)
│   │   ├── pages/             # HomePage, DashboardPage, DocumentPage,
│   │   │                      # ComparePage, HistoryPage, UploadPage
│   │   ├── services/          # API client
│   │   └── App.jsx            # Router setup
│   └── vite.config.js         # Vite + Tailwind config
│
├── server/                    # Express backend
│   ├── routes/                # documents, analysis, chat
│   ├── services/              # geminiService, fileParser,
│   │                          # urlExtractor, githubService
│   ├── db/                    # JSON file store
│   └── server.js              # Entry point
│
├── .env                       # API keys (gitignored)
├── .gitignore
└── README.md
```

## 🔑 Gemini Model Selection

| Task | Model | Why |
|------|-------|-----|
| Quick summaries, chat | gemini-1.5-flash | Fast, low cost |
| Mind maps, quizzes, overviews | gemini-1.5-pro | Better structured output |
| Image analysis | gemini-1.5-flash | Multimodal support |

Models are configurable via `GEMINI_MODEL_FLASH` and `GEMINI_MODEL_PRO` environment variables.

## 📜 License

MIT