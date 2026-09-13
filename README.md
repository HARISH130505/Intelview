# 🚀 Intelview — AI-Powered Interview Intelligence Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/Neon-PostgreSQL-00E599?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge&logo=clerk" alt="Clerk" />
</p>

---

## 📌 Overview

**Intelview** is a comprehensive, production-grade interview intelligence platform that unites real-time web grounding, crowdsourced community interview reports, dynamic question curation, and AI-assisted interview preparation into a single continuous loop:

```text
Company Research (Live Gemini + Google Grounding)
                    ↓
         Company Intelligence & OA Patterns
                    ↓
        Dynamic Question Bank & Topic Heatmaps
                    ↓
       Personalized Study Plan (Target Timeline)
                    ↓
        AI Mock Interview & Turn-by-Turn Feedback
                    ↓
   Interview Experience Submission (AI-extracted)
                    ↓
Feeds Back into Community Question Bank & Company Analytics
```

---

## ✨ Key Features

### 🏢 1. Company Intelligence (End-to-End)
- **Role-Specific Insights**: Filter by company and specific target roles (e.g., `SDE-1`, `SDE-2`, `Frontend Engineer`).
- **Live Gemini 2.5 Flash + Google Grounding**: Automatically searches the live web for fresh interview processes, hiring timelines, and recent question patterns.
- **Smart DB Caching**: Stores verified intelligence in PostgreSQL to deliver sub-50ms responses, with automatic staleness detection and one-click manual refresh.
- **Online Assessment (OA) Patterns**: Detailed platforms (HackerRank, CodeSignal), duration, question count, and scoring cutoffs.
- **Rounds & Compensation**: Complete breakdown of Technical, System Design, and Behavioral rounds, alongside base salary, stock grants, and bonus ranges.

### 📚 2. Dynamic Question Bank
- **60+ Real Interview Questions**: Sourced from FAANG, tier-1 tech companies, and verified community submissions.
- **Multi-Dimensional Filtering**: Search in real-time by keyword, company, target role, topic, difficulty (`EASY` to `VERY HARD`), and question type (`CODING`, `SYSTEM DESIGN`, `BEHAVIORAL`, `CORE CS`, `APTITUDE`).
- **Frequency Counters & Verified Badges**: See exactly how often each question appeared in recent interview cycles.

### ✍️ 3. Crowdsourced Interview Experiences & AI Extraction
- **Structured Submission Flow**: Submit interview experiences with company, role, outcome (Offer / Reject / Pending), difficulty rating, and CTC details.
- **AI Auto-Extraction**: Candidates can paste their raw, unstructured interview stories; Google Gemini automatically extracts the exact interview rounds and individual interview questions directly into the database.
- **Community Feed & Discussions**: Browse, upvote, bookmark, and comment on peer interview experiences.

### 📄 4. Resume Intelligence (ATS Scanner)
- **ATS Compatibility Score**: Upload PDF or DOCX resumes and benchmark them against any target Job Description (JD).
- **Skill Gap Analysis**: Instant visual tags for **Matched Skills** and **Missing Skills**.
- **Actionable Bullet Recommendations**: AI-generated bullet points with quantifiable impact metrics.

### 🤖 5. AI Mock Interviewer
- **Interactive Practice Sessions**: Tailored to chosen companies, roles, and difficulty levels.
- **Turn-by-Turn AI Grading**: Evaluates problem-solving logic, communication clarity, time management, and edge-case handling.
- **Detailed Performance Report**: Generates a summary scorecard with strength/weakness diagnostics and recommended follow-up questions.

### 📅 6. Personalized AI Study Planner
- **Custom Curriculums**: Takes target company, role, target interview date, and daily study hours to build an adaptive day-by-day prep plan.
- **Interactive Progress Tracking**: Check off daily milestones and persist checklist progress directly to the database.

### 📊 7. Hiring Trends & Analytics
- Visual distributions of interview difficulty, topic frequency heatmaps, monthly hiring volume, and offer conversion rates across top tech companies.

---

## 🛠️ Architecture & Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server & Client Components)
- **Library**: React 19
- **Styling**: Tailwind CSS, CSS Modules
- **UI Components**: Radix UI Primitives, Lucide React Icons
- **Data Visualization**: Recharts
- **Animations**: Framer Motion
- **Authentication**: [Clerk](https://clerk.com/)

### Backend
- **Runtime**: Node.js & [Express.js](https://expressjs.com/)
- **Language**: TypeScript (with clean CommonJS build pipeline)
- **Database & ORM**: [Prisma ORM](https://www.prisma.io/) with [Neon Serverless PostgreSQL](https://neon.tech/)
- **AI Models**:
  - `gemini-2.5-flash` with Google Search Grounding for live intelligence
  - `gemini-3.1-flash-lite` for fast structured extraction and scoring
- **File Uploads**: Cloudinary (with local disk fallback) & Multer
- **Security & Networking**: Helmet, CORS, Express Rate Limiting

---

## 📂 Project Structure

```text
Intelview/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (20+ models)
│   │   └── seed.ts             # Comprehensive DB seeder (FAANG companies & questions)
│   ├── src/
│   │   ├── middleware/         # Clerk auth, rate limiting, error handling
│   │   ├── routes/             # Modular Express routers
│   │   │   ├── companies.ts
│   │   │   ├── questions.ts
│   │   │   ├── reports.ts
│   │   │   ├── research.ts     # Live Gemini Search Grounding
│   │   │   ├── mock.ts
│   │   │   ├── planner.ts
│   │   │   ├── resume.ts
│   │   │   └── analytics.ts
│   │   ├── services/           # Business logic & AI integrations
│   │   │   ├── AIService.ts
│   │   │   ├── ResearchService.ts
│   │   │   ├── QuestionService.ts
│   │   │   ├── MockService.ts
│   │   │   ├── PlannerService.ts
│   │   │   └── ResumeService.ts
│   │   ├── utils/              # Prisma client, user resolver
│   │   └── index.ts            # Express application entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── app/
│   │   ├── (auth)/             # Clerk Sign-in & Sign-up routes
│   │   ├── (dashboard)/        # Authenticated platform pages
│   │   │   ├── companies/      # Company directories & detail intelligence
│   │   │   ├── questions/      # Dynamic question bank
│   │   │   ├── reports/        # Interview report feed & AI submit flow
│   │   │   ├── mock-interview/ # AI mock interview simulator
│   │   │   ├── planner/        # Study plan generator & progress tracker
│   │   │   ├── resume/         # ATS resume scanner & JD comparison
│   │   │   ├── bookmarks/      # Saved questions & reports
│   │   │   └── profile/        # User profile & statistics
│   │   ├── globals.css         # Custom tokens & design system
│   │   ├── layout.tsx
│   │   └── page.tsx            # Landing page
│   ├── components/             # Reusable UI & layout components
│   ├── lib/                    # API client (Axios) & helper utilities
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm**
- A **Neon PostgreSQL** database URL (or local PostgreSQL)
- A **Clerk** account for authentication
- A **Google Gemini API Key**

---

### 1. Clone the Repository
```bash
git clone https://github.com/HARISH130505/Intelview.git
cd Intelview
```

---

### 2. Backend Setup

1. **Navigate to backend and install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Initialize Database & Seed Data:**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run prisma:seed
   ```

3. **Start the Backend Dev Server:**
   ```bash
   npm run dev
   ```
   *The backend API will run on `http://localhost:5000`.*

---

### 3. Frontend Setup

1. **Open a new terminal, navigate to frontend, and install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Next.js Development Server:**
   ```bash
   npm run dev
   ```
   *Open [http://localhost:3000](http://localhost:3000) in your browser.*

---

## 📡 Core API Reference

| Method | Endpoint | Description | Auth |
|---|---|---|:---:|
| `GET` | `/api/companies` | List all companies with stats | Public |
| `GET` | `/api/companies/:slug` | Get company detail, reports & questions | Public |
| `GET` | `/api/research/:slug?role=SDE-1` | Live/cached AI research & OA patterns | Public |
| `GET` | `/api/questions` | Filterable dynamic question bank | Public |
| `GET` | `/api/reports` | Community interview experience feed | Public |
| `POST` | `/api/reports/submit` | Submit report with auto-round extraction | Required |
| `POST` | `/api/resume/upload` | Upload resume & run ATS / JD analysis | Required |
| `POST` | `/api/mock/start` | Initialize AI mock interview session | Required |
| `POST` | `/api/mock/:id/answer` | Submit answer for turn-by-turn AI evaluation | Required |
| `POST` | `/api/planner/generate` | Generate personalized preparation roadmap | Required |
| `PATCH`| `/api/planner/:id/progress` | Update checklist progress on study plan | Required |
| `GET` | `/api/analytics/overview` | Global platform metrics & trend charts | Public |

---

## 🛡️ License

This project is licensed under the **MIT License**. Feel free to use, modify, and distribute it for educational or commercial purposes.
