# Recruiter Dashboard Redesign: Atomic Design System, Multi-JD Workflows & Above-the-Fold Architecture

## 1. Design Read & Aesthetic Stance

Following the directives from `design-taste-frontend`, `ui-ux-pro-max`, and `frontend-design`:

- **Design Read**: *"Reading this as: Modern Recruitment Intelligence Cockpit for Talent Acquisition Leads & Engineering Hiring Managers, with a Nordic Utilitarian Precision language, leaning toward Tailwind v4 tokens + Geist/system typography + high-density above-the-fold command layout."*
- **The Three Dials**:
  - `DESIGN_VARIANCE: 5` (Structured, high-order consistency, predictable information hierarchy)
  - `MOTION_INTENSITY: 4` (Restrained, high-speed micro-interactions, spring transitions on active pills and drawer reveals, strictly honoring `prefers-reduced-motion`)
  - `VISUAL_DENSITY: 7` (Cockpit layout: information-dense, minimal wasted space, no oversized fluffy cards, data metrics breathe cleanly with hairlines and crisp tokens)
- **DFII (Design Feasibility & Impact Index)**:
  - Aesthetic Impact: 4/5
  - Context Fit: 5/5
  - Implementation Feasibility: 5/5
  - Performance Safety: 5/5
  - Consistency Risk: 1/5
  - **DFII Score: 18 - 1 = 17 / 15 (Excellent - proceed with discipline)**
- **Differentiation Anchor**:
  *"If screenshotted with the logo removed, recognized by the surgical above-the-fold JD benchmark command bar, dual-tone qualification pills with live confidence ratings, and modular question assignment matrix instead of generic AI card lists."*
- **Anti-Slop Discipline**:
  - NO generic AI-purple/neon gradients.
  - NO emoji icons (only consistent Lucide SVG icons with `strokeWidth={1.75}`).
  - NO placeholder-as-label.
  - NO 2000px single-scroll stack where primary actions disappear below the fold.
  - Button text fits strictly on one line with tactile active state (`active:scale-[0.98]`).

---

## 2. Core Problem & User Workflow Requirements

Currently, `RecruiterCockpit` is a single long vertical scroll stack (Job Description Card -> Weighting Sliders -> Bulk Upload Zone -> Leaderboard Table -> giant modal dialogs). This creates major usability friction:
1. **Recruiter cannot manage multiple JDs**: JDs are currently hardcoded to 3 static presets with no easy way to create, persist, or switch between distinct roles.
2. **Questions are not assigned per JD**: In a real recruiting workflow, each role has a specific qualification rubric (e.g. Staff Full-Stack has distributed systems + architecture questions, while AI Platform has GPU orchestration + PyTorch questions).
3. **Bulk upload is disconnected from the JD context**: Recruiter should clearly see: *"Classifying N resumes against [Active JD] using [M assigned questions]"*.
4. **Dossier is hard to access quickly**: Needs to be a seamless deep-dive slide-out/modal with quoted resume proofs, dimension breakdown, and shortlisting.
5. **Above-the-fold layout missing**: Primary metrics, role benchmark switcher, and workflow triggers should be immediately actionable without scrolling.

---

## 3. Proposed User Experience & Layout Architecture

### 3.1 Above-The-Fold Recruitment Command Header (`JDCommandHeader`)
At the very top of the dashboard, recruiter immediately sees:
- **Active Job Benchmark Picker**: Fast pill/dropdown switcher to toggle between roles (e.g., *Staff Full-Stack*, *AI Platform Engineer*, or *+ Add New Role*).
- **Benchmark Summary Strip**:
  - Role Title, Seniority/Location tags
  - Assigned Rubric Status (`5 questions assigned • 4 categories`)
  - Applicant Pool Status (`X candidates evaluated • Avg score Y%`)
- **Primary Action Group**:
  - `+ Add New JD` (opens streamlined JD creation modal/drawer)
  - `Configure Questions` (quick trigger to assign/unassign questions for this JD)
  - `Bulk Upload Resumes` (quick drop/upload trigger)

### 3.2 High-Efficiency Workspace Views (Segmented Navigation)
Instead of an endless single-column scroll, the recruiter toggles seamlessly between 3 focused, state-synchronized tabs above the fold:
1. **Leaderboard & Ranked Talent** (Default / Primary):
   - Executive search, verdict filters (`Fast-Track`, `Screening`, `Review Gaps`, `Starred`), CSV export.
   - Ranked candidate rows with score badge, grade, verdict chip, quote count, and 1-click **Dossier** trigger.
   - Quick action to run batch or load sample pool.
2. **Job Description & Assigned Questions**:
   - Side-by-side or split layout:
     - Left: Full JD text viewer and inline editor.
     - Right: Question assignment matrix. Shows which questions are assigned to this JD, ability to toggle on/off, change weights, pick from question bank, or create a new custom question.
3. **Bulk Ingestion Deck**:
   - Multi-file dropzone (.pdf, .txt, .md), batch paste text parser, queue manager with char/token previews, and 1-click "Classify Pool against [Active JD]" button.

### 3.3 Candidate Dossier (`CandidateDossierModal` / Drawer)
When a recruiter clicks "Dossier" on any candidate:
- Recruiter executive summary & fit verdict.
- Direct quoted evidence from resume categorized by dimension (positive vs gap impact).
- Category score breakdown bars (Technical, Experience, Education, Soft Skills).
- Raw resume viewer with search highlight.
- 1-click candidate shortlisting / star.

---

## 4. Atomic Design System Hierarchy

We will structure clean, reusable atomic components under `src/components/recruiter/` and `src/components/ui/`:

### Atoms
- `src/components/recruiter/atoms/ScoreBadge.tsx`: Minimal numeric badge with grade chip (`A+`, `A`, `B`, `C`, `D`) and color tokens.
- `src/components/recruiter/atoms/VerdictPill.tsx`: Strict WCAG AA compliant verdict pill (`Fast-Track Interview`, `Proceed to Screening`, `Evaluate Gaps`, `Unlikely Fit`).
- `src/components/recruiter/atoms/MetricCounter.tsx`: Compact metric stat display (`Avg Score: 82%`, `Starred: 3`).
- `src/components/recruiter/atoms/DimensionChip.tsx`: Minimal category badge with subtle accent dot and label.

### Molecules
- `src/components/recruiter/molecules/JDPickerPills.tsx`: Clean horizontal segmented selector for active job roles with status indicators.
- `src/components/recruiter/molecules/QuestionAssignmentCard.tsx`: Compact question row showing title, dimension tag, type (`score`/`noul`), assigned switch, and weight slider.
- `src/components/recruiter/molecules/CandidateRowItem.tsx`: High-density candidate row with rank, monogram avatar, score, verdict, quote snippet, star action, and dossier button.
- `src/components/recruiter/molecules/IngestionQueueItem.tsx`: Queue file card with size, parsed status, and delete action.

### Organisms
- `src/components/recruiter/organisms/JDCommandHeader.tsx`: Above-the-fold command bar with active JD details, quick stats, and primary action buttons.
- `src/components/recruiter/organisms/JDCriteriaWorkbench.tsx`: Unified JD editor & question assignment matrix for the active job.
- `src/components/recruiter/organisms/NewJDModal.tsx`: Clean dialog to create a new Job Description with auto-assigned default questions or custom rubric.
- `src/components/recruiter/organisms/BulkIngestionDeck.tsx`: Modern drag-and-drop file ingestion and paste zone.
- `src/components/recruiter/organisms/CandidateLeaderboardDeck.tsx`: Searchable, filterable candidate leaderboard with empty state and export.
- `src/components/recruiter/organisms/CandidateDossierModal.tsx`: Refined candidate dossier deep-dive.

### Template
- `src/components/recruiter/RecruiterCockpit.tsx`: Root recruiter container wiring up multi-JD state, question assignments per JD, candidate pool per JD, and seamless tab switching.

---

## 5. Data Model & State Management

We will enhance the data models in `src/types/job.ts` and `src/types/evaluation.ts`:

```typescript
export interface JobRole {
  id: string;
  title: string;
  department: string;
  location: string;
  description: string;
  assignedQuestionIds: string[]; // List of question IDs active for this specific JD
  weights: DimensionWeights;      // Custom category weights for this JD
  isCustom?: boolean;
}
```

### Initial Built-in JDs:
1. **Staff Full-Stack Engineer** (CloudScale Dynamics) - 6 questions assigned (Full-stack architecture, API performance, cloud cost optimization, Rust/Wasm, team mentorship, communication).
2. **Senior AI Platform Engineer** (Cerebro Labs) - 6 questions assigned (PyTorch/ML serving, Kubernetes/GPU orchestration, research collaboration, latency optimization, degree/math, ownership).
3. **Principal Distributed Systems Architect** (Nexus Global) - 6 questions assigned (Consensus protocols, high-concurrency systems, regulatory compliance, executive stakeholder communication, advanced tenure).

Recruiter can add **any custom JD** via `+ Add New Job Description`, paste the text, and choose which questions to assign!

---

## 6. Verification Plan

### Automated Verification
- Run `npm run lint` to guarantee zero ESLint or TypeScript errors.
- Run `npm run build` to verify Next.js App Router compilation.

### Manual Verification Flow
1. **Above-the-fold Check**: Verify that on 1440x900 and 1920x1080 screens, the active JD switcher, summary metrics, and main view tabs are visible in the primary viewport without initial scroll.
2. **Add a JD Flow**:
   - Click `+ New Role` / `Add JD`.
   - Input title ("Staff DevOps Architect"), department, location, and JD text.
   - Verify it appears in the JD selector and becomes the active benchmark.
3. **Assign Questions Flow**:
   - Switch to `Job & Rubric` tab.
   - Toggle questions on/off for this JD.
   - Add a new custom question to the role.
   - Verify assigned question count updates dynamically in the header.
4. **Bulk Ingestion & Classification Flow**:
   - Switch to `Bulk Upload` tab or click `Load Sample Pool`.
   - Run batch classification.
   - Verify candidates are classified specifically against the active JD + assigned question set.
5. **Leaderboard & Dossier Deep-Dive**:
   - Inspect ranked candidates, filter by verdict and search by candidate name.
   - Open Candidate Dossier, verify quoted evidence chips, category breakdown, and shortlist toggle.
   - Export CSV and verify data.
