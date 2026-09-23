export interface SamplePreset {
  id: string;
  name: string;
  category: string;
  badge: string;
  description: string;
  jobDescription: string;
  resume: string;
  expectedTier: string;
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'staff-fullstack-strong',
    name: 'Staff Full-Stack Engineer',
    category: 'Engineering Leadership',
    badge: 'Strong Fit (88%+)',
    description: 'Candidate matches modern Next.js/TypeScript stack, brings unrequested Rust experience & led major cloud cost cuts.',
    expectedTier: 'exceptional',
    jobDescription: `Position: Staff Full-Stack Engineer
Company: CloudScale Dynamics
Location: San Francisco, CA / Remote

About the Role:
We are seeking a Staff Full-Stack Engineer to architect next-generation collaborative cloud applications. You will spearhead our web client architecture, guide distributed API services, and mentor a team of 8 senior engineers.

Requirements:
- 7+ years of professional full-stack software development experience.
- Deep expertise with TypeScript, React / Next.js (App Router, Server Components), and Node.js.
- Strong proficiency in distributed databases (PostgreSQL, Redis, vector search).
- Proven track record architecting microservices and real-time streaming architectures.
- Bachelor's or Master's degree in Computer Science or equivalent engineering discipline.
- Experience conducting system design reviews, leading sprint cycles, and mentoring engineers.
- Strong ownership with measurable impact on latency, scalability, and system uptime.`,
    resume: `ALEXA CHEN
alexa.chen@email.com | (415) 555-0192 | San Francisco, CA | github.com/alexachen

SUMMARY
Staff Software Engineer with 8+ years architecting high-throughput distributed web systems and reactive web platforms. Passionate about developer productivity, performance optimization, and engineering mentorship.

PROFESSIONAL EXPERIENCE

Principal / Staff Engineer | Veloce Cloud Systems (2021 – Present)
- Architected the real-time collaboration engine using Next.js 14, Node.js microservices, and PostgreSQL, supporting 2.4M monthly active users.
- Reduced p99 API latency by 48% (from 320ms to 165ms) by introducing edge caching and Redis pub/sub streaming.
- Led and mentored a cross-functional team of 9 engineers across frontend and platform infrastructure.
- Cut annual AWS infrastructure expenses by $340,000 through query optimization and container right-sizing.
- Proactively introduced Rust-based WebAssembly modules for client-side cryptographic hashing, speeding up file processing by 5x (unsolicited company innovation).

Senior Full-Stack Engineer | Hyperion SaaS (2018 – 2021)
- Led frontend migration from legacy Angular to React & TypeScript, boosting Lighthouse score from 42 to 96.
- Designed resilient GraphQL and REST APIs backed by PostgreSQL and Elasticsearch.
- Mentored 4 junior and mid-level engineers, 3 of whom were promoted under direct guidance.

EDUCATION & CERTIFICATIONS
- B.S. in Computer Science, University of California, Berkeley (2018)
- AWS Certified Solutions Architect – Professional (Active)
- HashiCorp Certified: Terraform Associate

ADDITIONAL SKILLS & HIGHLIGHTS
- Languages: TypeScript, JavaScript, Rust, Python, Go, SQL
- Technologies: React, Next.js, Node.js, Tailwind CSS, Docker, Kubernetes, GraphQL, Redis, Kafka
- Open Source: Core contributor to popular open-source state management library with 14k+ GitHub stars.`,
  },
  {
    id: 'ai-engineer-moderate',
    name: 'AI Platform Engineer',
    category: 'AI / Machine Learning',
    badge: 'Moderate Fit (68%)',
    description: 'Superb ML model & Python skills with standout PyTorch projects, but lacks formal Kubernetes & 5+ yr team lead tenure.',
    expectedTier: 'moderate',
    jobDescription: `Position: Senior AI Platform Engineer
Company: Cerebro Labs
Location: New York, NY

About the Role:
Cerebro Labs is building foundational intelligence tooling for enterprise knowledge graphs. We are hiring a Senior AI Platform Engineer to bridge research models into fault-tolerant production inference engines.

Requirements:
- 5+ years of software engineering experience with at least 3 years deploying machine learning systems in production.
- Advanced Python proficiency and deep expertise with PyTorch, vLLM, TensorRT-LLM, and HuggingFace.
- Hands-on expertise with Kubernetes (EKS/GKE), Helm, and GPU orchestration.
- Demonstrated experience building low-latency model serving pipelines (<50ms TTFT).
- Bachelor's degree in STEM (CS, Math, Data Science, or Physics).
- Track record of mentoring team members and collaborating with research scientists.`,
    resume: `JORDAN RIVERA
jordan.rivera@email.com | New York, NY | linkedin.com/in/jordanrivera-ai

EXPERIENCE
Machine Learning Engineer | NeuraFlow Labs (2022 – Present, 2.5 yrs)
- Deployed high-throughput transformer models using PyTorch, Hugging Face, and vLLM on AWS EC2 GPU instances.
- Optimized model inference throughput by 3.2x using quantization (AWQ/FP8) and TensorRT, reducing inference cost by $80k/quarter.
- Collaborated closely with 4 research scientists to operationalize fine-tuning pipelines on multimodal datasets.
- Implemented automated evaluation harness measuring RAG hallucination rates across 50,000 test cases.

Software Developer | DataVenture Inc. (2020 – 2022, 2 yrs)
- Built Python data ingestion pipelines handling 50GB/day of unstructured financial documents into PostgreSQL and Pinecone.
- Developed REST APIs in FastAPI with automated unit testing and CI/CD via GitHub Actions.

TECHNICAL SKILLS
- Languages: Python, C++, SQL
- Frameworks: PyTorch, FastAPI, Hugging Face, vLLM, LangChain, Ray, Docker
- Note: Basic experience with Docker containers, but limited formal Kubernetes cluster administration.

EDUCATION
- B.S. in Applied Mathematics & Statistics, Columbia University (2020)
- DeepLearning.AI Generative AI for Production Certificate`,
  },
  {
    id: 'junior-dev-gap-heavy',
    name: 'Junior Dev -> Principal Architect',
    category: 'Candidate Growth / Gap Analysis',
    badge: 'Gap Heavy (42%)',
    description: 'Demonstrates candidate gap analysis: highlights specific missing seniority, distributed systems, and team lead milestones.',
    expectedTier: 'gap_heavy',
    jobDescription: `Position: Principal Distributed Systems Architect
Company: Nexus Global Financial
Location: Chicago, IL

About the Role:
Seeking a Principal Architect with 10+ years designing fault-tolerant financial settlement ledgers. You will oversee architectural governance for multi-region active-active transaction platforms handling $10B+ daily volume.

Requirements:
- 10+ years building mission-critical distributed transaction engines.
- Master's or Ph.D. in Computer Science or Distributed Computing.
- Deep expertise in consensus algorithms (Raft, Paxos), Kafka, C++, or Java/Go concurrency.
- Financial regulatory compliance knowledge (SOX, PCI-DSS Level 1).
- Experience leading engineering guilds and advising C-level executives.`,
    resume: `DEVON MILLER
devon.miller@email.com | Chicago, IL

SUMMARY
Enthusiastic Junior Full-Stack Developer with 1.5 years of experience building modern web applications using React, Node.js, and MongoDB. Eager to transition into backend systems.

EXPERIENCE
Junior Frontend Engineer | WebSprint Agency (2023 – Present)
- Developed responsive marketing pages and e-commerce UI components in React and CSS.
- Integrated third-party Stripe payment checkout APIs into Shopify and custom storefronts.
- Fixed cross-browser layout bugs and assisted senior developers with code reviews.

Web Development Intern | LocalTech Solutions (2022 – 2023)
- Built internal dashboard tools using Express.js and SQLite.
- Wrote unit tests in Jest achieving 80% code coverage on core endpoints.

SKILLS
- JavaScript, HTML5, CSS3, React, Node.js, Git, Express.js, MongoDB

EDUCATION
- Associate Degree in Web Development, City College of Chicago (2022)`,
  },
];

export interface SamplePoolCandidate {
  id: string;
  name: string;
  email: string;
  targetRole: string;
  experienceYears: number;
  highlight: string;
  resume: string;
}

export const SAMPLE_CANDIDATE_POOL: SamplePoolCandidate[] = [
  {
    id: 'candidate-alexa-chen',
    name: 'Alexa Chen',
    email: 'alexa.chen@email.com',
    targetRole: 'Staff Full-Stack Engineer',
    experienceYears: 8,
    highlight: '8+ yrs, Next.js 14, Rust WebAssembly, $340k AWS cost cut, team lead',
    resume: `ALEXA CHEN
alexa.chen@email.com | (415) 555-0192 | San Francisco, CA | github.com/alexachen

SUMMARY
Staff Software Engineer with 8+ years architecting high-throughput distributed web systems and reactive web platforms. Passionate about developer productivity, performance optimization, and engineering mentorship.

PROFESSIONAL EXPERIENCE

Principal / Staff Engineer | Veloce Cloud Systems (2021 – Present)
- Architected the real-time collaboration engine using Next.js 14, Node.js microservices, and PostgreSQL, supporting 2.4M monthly active users.
- Reduced p99 API latency by 48% (from 320ms to 165ms) by introducing edge caching and Redis pub/sub streaming.
- Led and mentored a cross-functional team of 9 engineers across frontend and platform infrastructure.
- Cut annual AWS infrastructure expenses by $340,000 through query optimization and container right-sizing.
- Proactively introduced Rust-based WebAssembly modules for client-side cryptographic hashing, speeding up file processing by 5x (unsolicited company innovation).

Senior Full-Stack Engineer | Hyperion SaaS (2018 – 2021)
- Led frontend migration from legacy Angular to React & TypeScript, boosting Lighthouse score from 42 to 96.
- Designed resilient GraphQL and REST APIs backed by PostgreSQL and Elasticsearch.
- Mentored 4 junior and mid-level engineers, 3 of whom were promoted under direct guidance.

EDUCATION & CERTIFICATIONS
- B.S. in Computer Science, University of California, Berkeley (2018)
- AWS Certified Solutions Architect – Professional (Active)
- HashiCorp Certified: Terraform Associate

ADDITIONAL SKILLS & HIGHLIGHTS
- Languages: TypeScript, JavaScript, Rust, Python, Go, SQL
- Technologies: React, Next.js, Node.js, Tailwind CSS, Docker, Kubernetes, GraphQL, Redis, Kafka
- Open Source: Core contributor to popular open-source state management library with 14k+ GitHub stars.`,
  },
  {
    id: 'candidate-marcus-brody',
    name: 'Marcus Brody',
    email: 'marcus.brody@devmail.io',
    targetRole: 'Senior Backend Engineer',
    experienceYears: 6,
    highlight: '6 yrs, Node.js, Go, PostgreSQL, Kafka, distributed systems, CKA certified',
    resume: `MARCUS BRODY
marcus.brody@devmail.io | Austin, TX | github.com/mbrody-backend

SUMMARY
Senior Distributed Systems and Backend Engineer with 6 years experience designing fault-tolerant microservices, Kafka streaming pipelines, and high-concurrency relational data models.

EXPERIENCE

Senior Platform Engineer | Apex Data Streams (2021 – Present)
- Designed and maintained Kafka-based asynchronous ingestion pipeline processing 45,000 events/second with 99.99% SLA.
- Scaled PostgreSQL and Redis database cluster, implementing read replicas and connection pooling for 500k daily queries.
- Spearheaded Kubernetes cluster migration across 3 AWS regions using Terraform and Helm charts.
- Mentored 3 junior software engineers and conducted weekly architecture review meetings.

Backend Software Engineer | CloudVenture Corp (2019 – 2021)
- Built enterprise Node.js and TypeScript microservices communicating over gRPC and REST.
- Implemented OAuth2 / OIDC authentication and RBAC authorization middleware protecting 20+ core microservices.
- Optimized slow SQL aggregation queries, reducing peak database CPU utilization from 85% to 32%.

EDUCATION & CERTIFICATES
- B.S. in Computer Engineering, University of Texas at Austin (2019)
- Certified Kubernetes Administrator (CKA)
- AWS Certified Developer – Associate

TECHNICAL PROFICIENCIES
- Node.js, TypeScript, Go, Python, SQL, Bash
- Kafka, Redis, PostgreSQL, Docker, Kubernetes, Terraform, AWS, gRPC`,
  },
  {
    id: 'candidate-jordan-rivera',
    name: 'Jordan Rivera',
    email: 'jordan.rivera@email.com',
    targetRole: 'Senior AI Platform Engineer',
    experienceYears: 4.5,
    highlight: '4.5 yrs, PyTorch, vLLM, TensorRT-LLM, model serving, Pinecone vector search',
    resume: `JORDAN RIVERA
jordan.rivera@email.com | New York, NY | linkedin.com/in/jordanrivera-ai

EXPERIENCE
Machine Learning Engineer | NeuraFlow Labs (2022 – Present, 2.5 yrs)
- Deployed high-throughput transformer models using PyTorch, Hugging Face, and vLLM on AWS EC2 GPU instances.
- Optimized model inference throughput by 3.2x using quantization (AWQ/FP8) and TensorRT, reducing inference cost by $80k/quarter.
- Collaborated closely with 4 research scientists to operationalize fine-tuning pipelines on multimodal datasets.
- Implemented automated evaluation harness measuring RAG hallucination rates across 50,000 test cases.

Software Developer | DataVenture Inc. (2020 – 2022, 2 yrs)
- Built Python data ingestion pipelines handling 50GB/day of unstructured financial documents into PostgreSQL and Pinecone.
- Developed REST APIs in FastAPI with automated unit testing and CI/CD via GitHub Actions.

TECHNICAL SKILLS
- Languages: Python, C++, SQL
- Frameworks: PyTorch, FastAPI, Hugging Face, vLLM, LangChain, Ray, Docker
- Note: Basic experience with Docker containers, but limited formal Kubernetes cluster administration.

EDUCATION
- B.S. in Applied Mathematics & Statistics, Columbia University (2020)
- DeepLearning.AI Generative AI for Production Certificate`,
  },
  {
    id: 'candidate-elena-rostova',
    name: 'Elena Rostova',
    email: 'elena.rostova@designsystems.net',
    targetRole: 'Staff Frontend & UI Architect',
    experienceYears: 7,
    highlight: '7 yrs, React, Next.js, Design Systems, WCAG 2.1 AAA, web performance',
    resume: `ELENA ROSTOVA
elena.rostova@designsystems.net | Seattle, WA | github.com/elenarostova

PROFESSIONAL SUMMARY
Senior Frontend Architect with 7 years specializing in large-scale multi-brand design systems, accessible UI infrastructure, and micro-frontend architectures with React and Next.js.

WORK EXPERIENCE

Lead Design Systems Engineer | Stellar UI Labs (2021 – Present)
- Architected component design system in React 18, TypeScript, and Tailwind CSS adopted by 35 internal product engineering teams.
- Maintained 100% WCAG 2.1 AA accessibility compliance across all components with automated axe-core CI pipelines.
- Reduced overall web application bundle size by 35% using tree-shaking, modular exports, and dynamic imports.
- Guided 12 frontend engineers across 4 squads in modern component composition and state management patterns.

Senior Frontend Developer | OmniCommerce Inc. (2018 – 2021)
- Spearheaded frontend architecture for storefront handling 800k monthly shoppers with Next.js SSR.
- Reduced Largest Contentful Paint (LCP) from 3.8s to 1.1s, boosting checkout conversion by 14%.
- Integrated Apollo GraphQL client with normalized caching and optimistic UI mutations.

EDUCATION & SKILLS
- B.A. in Digital Arts & Computer Science, University of Washington (2018)
- React, Next.js, TypeScript, Tailwind CSS, Radix UI, Storybook, Jest, Playwright, Figma Tokens`,
  },
  {
    id: 'candidate-devon-miller',
    name: 'Devon Miller',
    email: 'devon.miller@email.com',
    targetRole: 'Junior Web Developer',
    experienceYears: 1.5,
    highlight: '1.5 yrs, React & Node.js junior developer, basic APIs, eager learner',
    resume: `DEVON MILLER
devon.miller@email.com | Chicago, IL

SUMMARY
Enthusiastic Junior Full-Stack Developer with 1.5 years of experience building modern web applications using React, Node.js, and MongoDB. Eager to transition into backend systems.

EXPERIENCE
Junior Frontend Engineer | WebSprint Agency (2023 – Present)
- Developed responsive marketing pages and e-commerce UI components in React and CSS.
- Integrated third-party Stripe payment checkout APIs into Shopify and custom storefronts.
- Fixed cross-browser layout bugs and assisted senior developers with code reviews.

Web Development Intern | LocalTech Solutions (2022 – 2023)
- Built internal dashboard tools using Express.js and SQLite.
- Wrote unit tests in Jest achieving 80% code coverage on core endpoints.

SKILLS
- JavaScript, HTML5, CSS3, React, Node.js, Git, Express.js, MongoDB

EDUCATION
- Associate Degree in Web Development, City College of Chicago (2022)`,
  },
];

