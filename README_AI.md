# Campuslytics — AI Placement Intelligence Platform

Campuslytics has been upgraded with the **AI Placement Intelligence** module, introducing dual copilots for recruiters and students powered by a shared Google Gemini AI backend with deterministic fallback heuristics.

```
                    AI PLACEMENT INTELLIGENCE
                 ┌────────────┴────────────┐
                 │                         │
                 ▼                         ▼
          RECRUITER COPILOT          STUDENT COPILOT
                 │                         │
          AI Resume Screening       Smart Skill Gap
                 │                         │
          Candidate Insights        Learning Roadmap
```

---

## 🚀 Key Modules & Capabilities

### 1. Recruiter Copilot (`/company/ai-copilot` & `/tpo/ai-copilot`)
- **Automated AI Resume Screening**: Evaluates candidates directly against specific drive job descriptions.
- **Top Ranked Candidates Table**:
  - Candidates ranked by AI Match Score (0–100%).
  - Shows ATS parsability score, matched keywords, and missing requirement pills.
  - Candidate executive summary & key strengths.
  - **Recruiter in Full Control**: Status changer dropdown (Applied, Shortlisted, Interview, Selected, Rejected) enables AI-assisted, human-decided hiring.
- **Candidate Dimension Comparison Chart**:
  - Horizontal grouped bar chart comparing top candidates across 4 core dimensions:
    - **Technical Skills**
    - **Culture Fit**
    - **Communication**
    - **Experience**
- **AI Job Match Report Modal**:
  - Match Score circular badge, ATS Score %, Keyword Coverage %.
  - Metric Breakdown bars (Skill Match, Experience, Requirement Fit).
  - Missing skills highlighted in red badges.
  - Interactive Skill Heatmap progress comparison.
  - Recharts Radar Chart mapping candidate profile to job requirements.
  - PDF/Print export support.

### 2. Student Copilot (`/student/ai-skill-gap`)
- **The 3 Core Guidance Questions**:
  1. ❓ **"Why am I not eligible?"**: Pinpoints exact cutoff and skill mismatches across campus drives.
  2. 🎯 **"How do I become eligible?"**: Targeted action steps to turn near-match drives into eligible ones.
  3. 🚀 **"What should I learn next?"**: Identifies high-demand technologies that unlock the highest volume of placement opportunities.
- **Placement Drive Opportunity Breakdown**:
  - **Eligible drives**: Count of open drives immediately available to apply.
  - **Near-match drives**: Drives where candidate is missing only 1–2 criteria.
  - **Missed opportunities**: Drives requiring substantial skill expansion.
  - Total Gap, Average Gap, Critical Gaps, and Strengths metrics.
- **High-Demand Missing Skills Ranking**:
  - Prioritizes skills based on how many drives demand them (e.g., Node.js missing in 10 drives, Docker in 9 drives, TypeScript in 5 drives).
- **Skills Radar Chart**:
  - Real-time comparison between **Current Level** and **Expected Level** across 6 competency dimensions: Technical Fit, Communication, Leadership, Domain Knowledge, Problem Solving, Teamwork.
- **Skill Competency Heatmap Cards**:
  - Detailed cards with status badges (`meets`, `below`, `critical`) and numerical gap percentages.
- **4-Week AI Placement Learning Roadmap**:
  - Dynamic week-by-week curriculum tailored to student's exact skill gaps.
  - Interactive checkboxes to track completed tasks.
  - Milestone project specifications for portfolio building.
  - One-click "Regenerate with AI" button.
- **Drive-by-Drive Opportunity Inspector**:
  - Complete list of active campus drives with one-click "View AI Gap Report".

### 3. Shared AI Foundation Backend
- **Unified Gemini AI Service** (`backend/src/services/geminiService.js`):
  - Uses `@google/genai` with `gemini-2.5-flash` (or `gemini-1.5-flash`).
  - Structured JSON schema generation.
  - **Zero-Crash Heuristic Fallback Engine**: If `GEMINI_API_KEY` is not provided or rate limits are reached, the system runs a deterministic rules and keyword engine that provides consistent structured analysis.
- **MongoDB Persistence**:
  - `AiCandidateAnalysis`: Caches candidate screening reports per drive.
  - `StudentRoadmap`: Stores and updates individual student roadmaps and task states.

---

## 🛠️ Step-by-Step Guide: How to Run in Your System

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **MongoDB**: MongoDB Atlas cloud cluster (already pre-configured in `.env`) or local MongoDB instance

---

### Step 1: Backend Setup & Seed
1. Open a terminal / PowerShell window and navigate to the backend directory:
   ```bash
   cd campuslytics/backend
   ```
2. Install backend dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Configure environment variables in `campuslytics/backend/.env`:
   ```ini
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   MONGO_URI=mongodb+srv://marketmingle:sunakshi8@marketmingle.bo3m1tr.mongodb.net/campuslytics?appName=marketmingle
   JWT_SECRET=campuslytics_super_secret_jwt_key_2026
   JWT_EXPIRES_IN=7d
   STORAGE_DRIVER=local

   # Optional: Add your Gemini API Key for LLM-powered insights
   # (If left blank, the built-in intelligent heuristic engine runs automatically)
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   ```
4. **Seed the database** with enriched candidates and drives:
   ```bash
   npm run seed
   ```
   *(This creates sample students like Aditi Sharma, Rahul Sharma, Emily Chen, and drives like Google Frontend Developer Drive, Amazon SDE Intern, etc.)*

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend API will run on `http://localhost:5000`.

---

### Step 2: Frontend Setup
1. Open a **new** terminal / PowerShell window and navigate to the frontend directory:
   ```bash
   cd campuslytics/frontend
   ```
2. Install frontend dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 👥 Demo Login Credentials

All demo accounts use the password: `Password@123`

| Role | Email | Features to Explore |
|---|---|---|
| **Student** (Rahul Sharma) | `student@campuslytics.com` | **AI Skill Gap & Roadmap**, Eligibility Simulator, Browse Drives, Job Match Reports |
| **Recruiter** (Google) | `google@campuslytics.com` | **AI Recruiter Copilot**, Top Ranked Candidates for Frontend Developer Drive, Dimension Comparison Chart, Shortlisting |
| **Recruiter** (Microsoft) | `microsoft@campuslytics.com` | Cloud & DevOps Drive, Candidate screening |
| **Recruiter** (Amazon) | `amazon@campuslytics.com` | SDE Intern Drive, Applicant reviews |
| **TPO / Admin** | `tpo@campuslytics.com` | **AI Placement Intel**, Student Management, Drive Analytics |

---



To verify all AI endpoints and database models in isolation:
```bash
cd campuslytics/backend
npm run test:ai

