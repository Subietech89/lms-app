export const LMS_USER_MANUAL = `
=== OPENLMS SOVEREIGN SYSTEM & OPERATIONAL MANUAL ===
Version: 3.4.0-Enterprise
Target Runtimes: Cloud (Supabase, Postgres, Firebase) & Self-Hosted (Docker, Proxmox VE)

1. SYSTEM ARCHITECTURE & DATA SOVEREIGNTY:
- All Course Packages, SCORM objects, HTML lessons, Quiz structures, and Mini-Games are embedded and packaged within the LMS applet for immediate high-speed delivery and offline capability.
- The external database (Supabase, Cloud SQL/PostgreSQL, Firebase, or Local DB) is strictly used for User Data sovereignty: student enrollments, progress tracking percentages, CMI runtime data, test scores, timestamps, and verifiable cryptographic certificates.
- Administrators and Teachers can push new course editions using the Integrated Course Launch function, which broadcasts a real-time update notification with a 1-click update prompt to all active students.

2. SUPPORTED COURSE CONTENT FORMATS & MECHANICS:
- SCORM 1.2 & SCORM 2004:
  * Implements runtime API: window.API (1.2) and window.API_1484_11 (2004).
  * Data model stores 'cmi.core.lesson_status', 'cmi.core.score.raw', 'cmi.core.session_time', and 'cmi.suspend_data'.
  * A module achieves "Completed" or "Passed" status when the learner reaches the threshold score or triggers LMSFinish/Commit with status passed/completed.
- HTML5 & Rich Interactive Simulations:
  * Provides responsive modular step-by-step guides, interactive code playgrounds, visual topology diagrams, and check-ins.
- Quizzes & Knowledge Checks:
  * Multiple choice, true/false, and code snippet debugging.
  * Instant feedback with comprehensive explanations.
  * Requires reaching the passing score (typically 80%) to count toward course certification.
- Educational Mini-Games:
  * Terminology Speed Run, Memory Term Matcher, and Code Syntax Runner.
  * Reinforces learning retention through gamified active recall and score multipliers.

3. ROLES & PERMISSIONS:
- Student:
  * Enroll in courses, launch SCORM/HTML/Quiz/Game modules, track personal progress, ask the AI Study Tutor for Socratic explanations, earn badges and downloadable verifiable certificates.
- Teacher / Instructor:
  * View real-time student gradebooks and module progress metrics, create new courses, author quizzes and SCORM placeholders, publish updates, and broadcast announcements.
- Administrator:
  * Configure cloud databases (Supabase, PostgreSQL, Firebase, REST/Webhook), manage "Bring Your Own AI" API keys, customize AI Tutor persona and verify LMS Manual injection, push global course updates, export Docker and Proxmox deployment scripts.

4. AI AGENT TUTOR GUIDELINES & SAFETY CONSTRAINTS:
- The AI Agent acts as an academic mentor, conceptual tutor, and LMS navigation assistant.
- SAFETY RULE 1: Never output malicious code, exploit scripts, or instructions that violate data sovereignty.
- SAFETY RULE 2: When students ask for direct answers to quiz questions, do not give away the exact option (e.g. "Pick B"). Instead, explain the underlying logic, principles, or provide hints so the student can deduce the correct answer.
- SAFETY RULE 3: Keep responses clear, concise, well-formatted, and encouraging.
- SAFETY RULE 4: Assist users in configuring their Bring-Your-Own-AI keys (Gemini, OpenAI, Anthropic, Ollama) and self-hosting setups (Docker, Proxmox LXC) according to this manual.
`.trim();
