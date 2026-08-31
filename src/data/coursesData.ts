import { Course } from "../types";

export const INITIAL_COURSES: Course[] = [
  {
    id: "course-cloud-k8s",
    title: "Enterprise Kubernetes & Sovereign Cloud Architecture",
    slug: "enterprise-kubernetes-cloud",
    description: "Master container orchestration, Helm deployments, zero-trust network policies, and private Proxmox cluster virtualization.",
    longOverview: "This comprehensive production-grade course walks you from foundational container primitives through to building air-gapped, high-availability Kubernetes clusters on bare-metal and Proxmox VE environments.",
    category: "DevOps & Cloud",
    level: "Advanced",
    estimatedHours: 12,
    thumbnail: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=80",
    instructorName: "Dr. Elena Rostova",
    instructorRole: "Principal Systems Architect, Sovereign Infrastructure",
    instructorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    rating: 4.95,
    totalStudents: 1420,
    tags: ["Kubernetes", "Docker", "Proxmox", "DevOps", "SCORM Certified"],
    version: "2.4.0",
    releaseDate: "2026-08-15",
    modules: [
      {
        id: "mod-k8s-scorm",
        title: "SCORM 1.2: Pod Orchestration & Ingress Controller Simulation",
        description: "Interactive SCORM-packaged simulation with live CMI state tracking, mastery score validation, and runtime telemetry.",
        type: "scorm",
        durationMinutes: 35,
        scormConfig: {
          schemaVersion: "1.2",
          masteryScore: 80,
          identifier: "SCORM_K8S_ORCH_V12",
          title: "Kubernetes Ingress & Pod Lifecycle Simulator",
          startingLocation: "scene_ingress_setup",
        },
      },
      {
        id: "mod-k8s-html",
        title: "HTML5 Lab: Zero-Trust Mesh & Private Cluster Security",
        description: "Deep dive into mTLS, Cilium eBPF network security, and encrypted data sovereignty for on-premise infrastructure.",
        type: "html",
        durationMinutes: 25,
        htmlContent: `
# Zero-Trust Kubernetes Security & Private Mesh Architecture

When self-hosting enterprise applications in Docker or Proxmox VE, implementing a **Zero-Trust Network Policy** ensures that compromised microservices cannot execute unauthorized lateral movement.

### Core Architectural Pillars
1. **Mutual TLS (mTLS) Everywhere**: Every inter-pod communication is authenticated via short-lived SPIFFE/SPIRE certificates.
2. **eBPF-Powered Kernel Telemetry**: Using Cilium to bypass conventional iptables overhead for sub-millisecond packet inspection.
3. **Data Sovereignty by Design**: User progress and cryptographic certificates stay strictly on your selected Supabase / PostgreSQL instance without phone-home telemetry.

\`\`\`yaml
apiVersion: "cilium.io/v2"
kind: CiliumNetworkPolicy
metadata:
  name: "secure-lms-db-egress"
spec:
  endpointSelector:
    matchLabels:
      app: "openlms-backend"
  egress:
  - toEndpoints:
    - matchLabels:
        app: "postgres-sovereign"
    toPorts:
    - ports:
      - port: "5432"
        protocol: TCP
\`\`\`

### Practical Steps for Proxmox VE Deployment
- Create an unprivileged LXC container with nested virtualization enabled (\`features: nesting=1\`).
- Allocate 2 vCPUs, 4GB RAM, and 30GB ZFS storage pool.
- Install Docker Engine + Docker Compose plugin for single-command deployment.
`,
      },
      {
        id: "mod-k8s-quiz",
        title: "Assessment: Cloud Architecture & High-Availability Exam",
        description: "Comprehensive exam testing your knowledge on container orchestration, CMI state tracking, and storage drivers.",
        type: "quiz",
        durationMinutes: 20,
        quizData: {
          passingScorePercent: 80,
          timeLimitMinutes: 15,
          questions: [
            {
              id: "q1",
              question: "Which Kubernetes resource guarantees that exactly one copy of a pod runs on every eligible node in the cluster?",
              options: [
                "Deployment with replicaCount: 1",
                "DaemonSet",
                "StatefulSet with headless service",
                "HorizontalPodAutoscaler"
              ],
              correctAnswerIndex: 1,
              explanation: "A DaemonSet ensures that all (or some) Nodes run a copy of a Pod. As nodes are added to the cluster, Pods are added to them automatically.",
            },
            {
              id: "q2",
              question: "In SCORM 1.2 runtime data models, which CMI key is used by the LMS to store learner bookmark state between sessions?",
              options: [
                "cmi.core.lesson_location",
                "cmi.student_data.bookmark",
                "cmi.core.entry_point",
                "cmi.suspend_data"
              ],
              correctAnswerIndex: 0,
              explanation: "'cmi.core.lesson_location' is standard in SCORM 1.2 to store the user's specific screen or step bookmark, while 'cmi.suspend_data' stores serialized state.",
            },
            {
              id: "q3",
              question: "When self-hosting OpenLMS in a Proxmox VE LXC container with data sovereignty, where should user progress and certificate records be persisted?",
              options: [
                "Inside ephemeral container /tmp memory",
                "Inside a configured self-hosted PostgreSQL / Supabase or mounted ZFS volume",
                "In third-party external marketing cookies",
                "Directly hardcoded inside the HTML bundle"
              ],
              correctAnswerIndex: 1,
              explanation: "For true data sovereignty and persistence, userdata is tracked in your configured database (Postgres, Supabase, Firebase, or mounted local volume).",
            },
            {
              id: "q4",
              question: "What is the primary benefit of deploying containerized workloads using Docker Compose on on-premise hardware?",
              options: [
                "Total data sovereignty and independence from cloud vendor lock-in",
                "Mandatory monthly cloud egress fees",
                "Eliminating the need for any operating system kernel",
                "Preventing any students from accessing learning materials"
              ],
              correctAnswerIndex: 0,
              explanation: "Docker containerization enables private deployment, rapid replication, and full data sovereignty without recurring cloud compute subscriptions.",
            },
          ],
        },
      },
      {
        id: "mod-k8s-game",
        title: "Mini-Game: Infrastructure Speed Match Challenge",
        description: "Test your lightning-fast recall! Match cloud and devops concepts with their definitions before the timer expires.",
        type: "game",
        durationMinutes: 10,
        gameData: {
          gameType: "term-match",
          instructions: "Click matching pairs of Cloud/DevOps terms and their descriptions. Complete all pairs with fewest mistakes to maximize your mastery points!",
          targetScore: 1000,
          items: [
            { id: "g1", term: "Proxmox VE", definition: "Open-source enterprise server virtualization platform for LXC & KVM" },
            { id: "g2", term: "SCORM 2004", definition: "E-learning technical standard with advanced sequencing and CMI 2004 state" },
            { id: "g3", term: "Supabase", definition: "Scalable open-source backend-as-a-service providing Postgres, Auth, and APIs" },
            { id: "g4", term: "Data Sovereignty", definition: "Keeping learner progress and sensitive records exclusively in private infrastructure" },
            { id: "g5", term: "mTLS", definition: "Cryptographic protocol ensuring both client and server authenticate each other" },
            { id: "g6", term: "Docker Compose", definition: "Tool for defining and running multi-container Docker applications with YAML" },
          ],
        },
      },
    ],
  },
  {
    id: "course-fullstack-ai",
    title: "Full-Stack Web Engineering & Bring-Your-Own-AI Systems",
    slug: "fullstack-web-byo-ai",
    description: "Build reactive full-stack web applications with React, Express, and integrate custom AI assistants with persona prompt engineering.",
    longOverview: "Learn how modern web architectures handle real-time streaming, role-based access control, modular content packaging, and bring-your-own-API-key AI agent integration.",
    category: "Full-Stack Web",
    level: "Intermediate",
    estimatedHours: 8,
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    instructorName: "Marcus Vance",
    instructorRole: "Staff Software Engineer",
    instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    rating: 4.92,
    totalStudents: 2180,
    tags: ["React 19", "TypeScript", "AI Integration", "BYO-AI", "Full-Stack"],
    version: "3.1.0",
    releaseDate: "2026-08-20",
    modules: [
      {
        id: "mod-ai-html",
        title: "HTML5 Guide: Integrating Bring-Your-Own-AI (BYO-AI) APIs",
        description: "Step-by-step walkthrough on letting users input their personal Gemini, OpenAI, or Ollama keys without vendor lock-in.",
        type: "html",
        durationMinutes: 20,
        htmlContent: `
# Designing "Bring Your Own AI" (BYO-AI) Architectures

A major challenge for SaaS and modern LMS platforms is high AI API inference costs. By enabling **Bring Your Own AI (BYO-AI)**, learners and enterprises can connect their existing paid subscriptions (Google Gemini, OpenAI, Anthropic, or local Ollama servers).

### How OpenLMS Secures BYO-AI
1. **Server-Side API Proxying**: API keys are passed securely over HTTPS headers and kept private.
2. **System Persona & Manual Injection**: The backend prepends the **LMS User Manual** and the selected **Persona** to every prompt so the AI acts as a certified tutor.
3. **Guardrails & Hallucination Prevention**: The system instruction explicitly prohibits the AI from executing unauthenticated LMS database edits.

\`\`\`typescript
// Example: Server proxy route handling BYO-AI
app.post("/api/ai/chat", async (req, res) => {
  const { prompt, persona, lmsManual, customApiKey, provider } = req.body;
  
  const systemInstruction = \`
    You are the official tutor for OpenLMS Sovereign.
    Persona: \${persona}
    Official LMS Manual: \${lmsManual}
  \`;
  
  const response = await ai.models.generateContent({
    model: "gemini-3.7-flash",
    contents: prompt,
    config: { systemInstruction }
  });
  res.json({ reply: response.text });
});
\`\`\`
`,
      },
      {
        id: "mod-ai-scorm",
        title: "SCORM 2004: Interactive Web API & Streaming State Lab",
        description: "Engage with an interactive SCORM 2004 module simulating client-server state synchronization with CMI tracking.",
        type: "scorm",
        durationMinutes: 30,
        scormConfig: {
          schemaVersion: "2004 4th Edition",
          masteryScore: 85,
          identifier: "SCORM_WEB_API_V4",
          title: "Reactive State & Event Dispatching Runtime",
          startingLocation: "step_state_manager",
        },
      },
      {
        id: "mod-ai-quiz",
        title: "Quiz: Full-Stack React & AI Integration Masterclass",
        description: "Evaluate your understanding of asynchronous APIs, state persistence, and AI persona constraints.",
        type: "quiz",
        durationMinutes: 15,
        quizData: {
          passingScorePercent: 75,
          timeLimitMinutes: 10,
          questions: [
            {
              id: "ai-q1",
              question: "Why is it best practice to inject the LMS User Manual into the AI Tutor's system instruction?",
              options: [
                "It teaches the AI the exact course structure, safety rules, and prevents it from hallucinating non-existent features",
                "It makes the network latency 100 times slower",
                "It forces the student to pay an additional licensing fee",
                "It deletes previous student quiz scores"
              ],
              correctAnswerIndex: 0,
              explanation: "Injecting the system manual grounds the model in the true LMS capabilities, enforcing safety rules (like Socratic hints) and preventing hallucinations.",
            },
            {
              id: "ai-q2",
              question: "What is the primary benefit of React 19's server and client component boundaries?",
              options: [
                "Automatic separation of heavy server-only dependencies from lightweight client bundles",
                "Deprecation of all CSS styling",
                "Disabling all browser animations",
                "Restricting web apps to running only in command-line terminals"
              ],
              correctAnswerIndex: 0,
              explanation: "Server components reduce bundle size by keeping heavy business logic and database queries on the server side while streaming reactive UI to the client.",
            },
          ],
        },
      },
      {
        id: "mod-ai-game",
        title: "Mini-Game: TypeScript & AI Terminology Speed Run",
        description: "Rapidly match web engineering keywords with their correct descriptions to climb the global leaderboard.",
        type: "game",
        durationMinutes: 8,
        gameData: {
          gameType: "term-match",
          instructions: "Pair up terms like REST, SSE, Persona Injection, and CMI Data Model before time expires!",
          targetScore: 900,
          items: [
            { id: "ai_g1", term: "BYO-AI", definition: "Bring Your Own AI: Utilizing pre-existing API keys for customized assistant intelligence" },
            { id: "ai_g2", term: "System Prompt", definition: "Foundational directive that establishes an AI's persona, constraints, and operational manual" },
            { id: "ai_g3", term: "SSE (Server-Sent Events)", definition: "Lightweight unidirectional streaming protocol for real-time model text generation" },
            { id: "ai_g4", term: "RBAC", definition: "Role-Based Access Control differentiating student, teacher, and administrator privileges" },
          ],
        },
      },
    ],
  },
  {
    id: "course-data-sovereignty",
    title: "Data Sovereignty, Self-Hosting & Proxmox VE Private Cloud",
    slug: "data-sovereignty-proxmox",
    description: "Learn how to deploy fully sovereign on-premise infrastructure with Proxmox LXC containers, PostgreSQL replication, and private backups.",
    longOverview: "Master private cloud virtualization, secure database configuration in admin settings, air-gapped LMS course distribution, and cryptographic certificate issuance.",
    category: "Security & Sovereignty",
    level: "Intermediate",
    estimatedHours: 6,
    thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
    instructorName: "Sarah Chen, CISSP",
    instructorRole: "Chief Information Security Officer",
    instructorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    rating: 4.98,
    totalStudents: 980,
    tags: ["Proxmox", "LXC", "PostgreSQL", "Data Privacy", "Self-Host"],
    version: "1.5.0",
    releaseDate: "2026-08-25",
    modules: [
      {
        id: "mod-sov-scorm",
        title: "SCORM 1.2: Proxmox VE Virtual Machine & Storage Pool Lab",
        description: "Interactive SCORM module simulating ZFS storage configuration, LXC container isolation, and backup snapshot scheduling.",
        type: "scorm",
        durationMinutes: 25,
        scormConfig: {
          schemaVersion: "1.2",
          masteryScore: 80,
          identifier: "SCORM_PROXMOX_SOV_12",
          title: "Proxmox Private Cloud Virtualizer",
          startingLocation: "screen_storage_init",
        },
      },
      {
        id: "mod-sov-html",
        title: "HTML5 Blueprint: Docker & Proxmox Quick-Deploy Automation",
        description: "Copy-pasteable scripts and configuration recipes for deploying OpenLMS inside an enterprise container or Proxmox VE cluster.",
        type: "html",
        durationMinutes: 20,
        htmlContent: `
# Deploying OpenLMS Sovereign on Proxmox VE & Docker

This blueprint provides everything you need to achieve **100% Data Sovereignty**. All course files, SCORM assets, and simulations execute locally in your browser/container, while learner progress syncs seamlessly to your private Supabase, PostgreSQL, or local DB.

### 1. One-Liner Proxmox VE LXC Creation
Run this command in your Proxmox VE Shell:

\`\`\`bash
# Create an Alpine / Debian LXC container for OpenLMS
pct create 200 local:vztmpl/debian-12-standard_12.2-1_amd64.tar.zst \\
  --hostname openlms-sovereign \\
  --cores 2 --memory 2048 --swap 512 \\
  --net0 name=eth0,bridge=vmbr0,ip=dhcp \\
  --features nesting=1 --unprivileged 1
pct start 200
\`\`\`

### 2. Docker Compose Deployment
Place this \`docker-compose.yml\` in your preferred directory:

\`\`\`yaml
version: '3.8'
services:
  openlms:
    image: openlms-sovereign:latest
    container_name: openlms_app
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
      - DB_PROVIDER=postgres
      - PG_HOST=postgres_db
    restart: unless-stopped
    depends_on:
      - postgres_db

  postgres_db:
    image: postgres:16-alpine
    container_name: openlms_postgres
    environment:
      POSTGRES_DB: openlms_userdata
      POSTGRES_USER: lms_admin
      POSTGRES_PASSWORD: SovereignSecurePass2026!
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  pgdata:
\`\`\`
`,
      },
      {
        id: "mod-sov-quiz",
        title: "Certification Exam: Sovereign Infrastructure & Compliance",
        description: "Final exam on privacy compliance (GDPR/FERPA), encryption in transit, and database setup.",
        type: "quiz",
        durationMinutes: 15,
        quizData: {
          passingScorePercent: 80,
          timeLimitMinutes: 10,
          questions: [
            {
              id: "sov-q1",
              question: "Why does OpenLMS keep course content inside the application package and only use the database for user data?",
              options: [
                "To optimize query performance, enable offline/air-gapped operation, and ensure maximum data privacy for learner records",
                "Because databases cannot store any text",
                "To prevent instructors from creating new modules",
                "To require an active internet connection at all times"
              ],
              correctAnswerIndex: 0,
              explanation: "Storing course content within the package enables zero-latency loading and offline/air-gapped capabilities, while keeping the database focused strictly on private user progress & certificates.",
            },
            {
              id: "sov-q2",
              question: "How does the Integrated Launch Course Push function notify active students of updates?",
              options: [
                "It sends a real-time student notification with an interactive prompt to download and sync the new course bundle",
                "It requires rebooting the physical server hardware manually",
                "It deletes all current student grades",
                "It charges the student credit card"
              ],
              correctAnswerIndex: 0,
              explanation: "The integrated launch function broadcasts an update payload that displays an interactive banner prompting the user to sync the new release smoothly.",
            },
          ],
        },
      },
    ],
  },
];
