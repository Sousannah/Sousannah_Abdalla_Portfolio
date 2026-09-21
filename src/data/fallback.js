/**
 * A snapshot of the site content, used only when the API cannot be reached.
 * The database is the real source of truth — edit content in the dashboard, not
 * here. Regenerate with:  npm run snapshot
 *
 * Taken 2026-09-21.
 */

export const fallbackContent = {
  "profile": {
    "name": "Sousannah Abdalla",
    "firstName": "Sousannah",
    "title": "AI Engineer",
    "roles": [
      "AI Engineer",
      "Technical Lead",
      "Full Stack Developer",
      "Founder of Odenta"
    ],
    "location": "Alexandria, Egypt",
    "email": "sousannahmagdy@icloud.com",
    "phone": "+20 127 690 2211",
    "phoneHref": "+201276902211",
    "whatsapp": "201276902211",
    "linkedin": "https://www.linkedin.com/in/sousannah-abdalla",
    "github": "https://github.com/sousannah",
    "avatarUrl": "/uploads/memoji-sousannah.png",
    "resumeUrl": "/Sousannah-Abdalla-AI-Engineer.pdf",
    "available": true,
    "availabilityNote": "Open to AI engineering and technical lead roles",
    "greeting": "Hey, I'm Sousannah",
    "tagline": "I build AI that talks, sees and ships.",
    "intro": "AI Engineer and Technical Lead with 2+ years building production AI systems and full-stack applications — voice agents, LLM orchestration, RAG, Arabic OCR and computer vision. Founder of Odenta, an AI-powered dental platform deployed as the official system at Alamein International University.",
    "about": [
      "I work at the point where machine learning stops being a notebook and starts being something people depend on. At Healthplans.AI I lead the architecture and delivery of a claim-status voice agent that authenticates members, retrieves real claim records and explains paid, denied or pending decisions in plain language — with the security handling that healthcare data demands.",
      "Before that I founded Odenta, an AI dental management platform now running as the official system at Alamein International University, serving 9,000+ patient records across web and mobile. I own its product strategy, architecture, deployment and stakeholder delivery.",
      "My background runs from fine-tuning vision-language models for Arabic OCR to real-time hand-gesture UAV control, published at IEEE ICUAS 2025. I graduated with a 3.86 GPA in AI engineering and now teach the labs I once sat in."
    ],
    "stats": [
      {
        "value": "2+",
        "label": "Years in production AI"
      },
      {
        "value": "9,000+",
        "label": "Patient records on Odenta"
      },
      {
        "value": "5.0",
        "label": "Fiverr rating, 100% delivery"
      },
      {
        "value": "IEEE",
        "label": "ICUAS 2025 publication"
      }
    ],
    "languages": [
      {
        "name": "Arabic",
        "level": "Native",
        "value": 100
      },
      {
        "name": "English",
        "level": "Professional working proficiency",
        "value": 88
      }
    ],
    "leadership": [
      {
        "title": "Technical Leadership",
        "icon": "compass",
        "accent": "blue",
        "body": "Lead architecture, engineering execution, UAT and delivery for enterprise healthcare voice-agent and FWA initiatives at Healthplans.AI."
      },
      {
        "title": "Product Leadership",
        "icon": "rocket",
        "accent": "indigo",
        "body": "Founded Odenta and own its product roadmap, web and mobile architecture, voice-AI integrations, production deployment and delivery to university and clinic stakeholders."
      },
      {
        "title": "Mentoring",
        "icon": "users",
        "accent": "teal",
        "body": "Teach university AI and computer science labs, and coach competitive programming students in C++ and problem solving."
      }
    ],
    "education": {
      "school": "Alamein International University",
      "degree": "Bachelor of Engineering, Artificial Intelligence",
      "period": "Sep 2021 — Sep 2025",
      "location": "Egypt",
      "gpa": "3.86 / 4.0",
      "coursework": [
        "Machine Learning",
        "Deep Learning",
        "NLP",
        "Computer Vision",
        "Database Systems",
        "Algorithms",
        "Digital Signal Processing"
      ]
    },
    "publication": {
      "title": "Comparative Analysis of Hand Gesture Detection Methods for Edge-Assisted UAV Control",
      "authors": "Abdalla, S.",
      "venue": "IEEE International Conference on Unmanned Aircraft Systems (ICUAS)",
      "year": "2025",
      "link": "https://arxiv.org/abs/2505.17303",
      "id": "arXiv:2505.17303"
    }
  },
  "experiences": [
    {
      "id": 1,
      "company": "Healthplans.AI",
      "role": "AI Engineer & Technical Lead",
      "period": "Sep 2025 — Present",
      "location": "USA · Remote",
      "current": true,
      "accent": "blue",
      "summary": "Leading the architecture and delivery of a production claim-status voice agent and a suite of fraud, waste and abuse agents.",
      "highlights": [
        "Led the architecture, implementation and UAT of a claim-status voice agent that captures provider information, authenticates member and claim data before disclosure, and gives human-like explanations for paid, denied or pending claims.",
        "Owned the end-to-end voice workflow: speech-to-text, text-to-speech, LLM orchestration, API integrations, call-session management and secure healthcare data handling.",
        "Led a suite of Fraud, Waste and Abuse agents that process provider and claims data, detect multiple fraud typologies and produce structured outputs for investigation workflows."
      ],
      "stack": [
        "LLM Orchestration",
        "Speech-to-Text",
        "TTS",
        "RAG",
        "Healthcare APIs",
        "Python"
      ],
      "logoUrl": null,
      "sortOrder": 0,
      "published": true
    },
    {
      "id": 2,
      "company": "Odenta",
      "role": "Founder & Lead Engineer",
      "period": "2025 — Present",
      "location": "Egypt",
      "current": true,
      "accent": "indigo",
      "summary": "Founded and shipped an AI-powered dental management platform now used by universities and clinics.",
      "highlights": [
        "Founded and launched an AI-powered dental management platform used by universities and clinics; delivered its successful Summer 2025 trial and deployment as Alamein International University's official dental system.",
        "Architected and developed the MERN platform for 9,000+ patient records — appointments, tooth charts, X-rays, analytics, reviews, messaging, invoicing and role-based access for clinical and administrative users.",
        "Designed the Odenta Voice architecture, letting clinicians reach schedules, patient history and clinical workflows through secure, human-like voice conversations.",
        "Built the Odenta mobile app in React Native for iOS and Android, extending core clinical and practice management to mobile.",
        "Own product strategy, technical architecture, deployment, stakeholder communication and delivery priorities across web, mobile and AI."
      ],
      "stack": [
        "MERN",
        "React Native",
        "Voice AI",
        "MongoDB",
        "RBAC",
        "Product Strategy"
      ],
      "logoUrl": null,
      "sortOrder": 1,
      "published": true
    },
    {
      "id": 3,
      "company": "Maxbit LLC",
      "role": "AI Engineer",
      "period": "Oct 2025 — Jan 2026",
      "location": "Egypt",
      "current": false,
      "accent": "purple",
      "summary": "Fine-tuned vision-language models for Arabic document understanding at scale.",
      "highlights": [
        "Fine-tuned and evaluated DeepSeek, Qwen2.5 and vision-language models to improve Arabic OCR for national IDs, passports and other identity documents.",
        "Developed real-time speech emotion recognition for live audio and built a DGX monitoring dashboard for GPU, memory, utilisation and workload visibility."
      ],
      "stack": [
        "DeepSeek",
        "Qwen2.5",
        "Arabic OCR",
        "NVIDIA DGX",
        "PyTorch"
      ],
      "logoUrl": null,
      "sortOrder": 2,
      "published": true
    },
    {
      "id": 4,
      "company": "Alamein International University",
      "role": "Teaching Assistant",
      "period": "Sep 2025 — Present",
      "location": "Egypt",
      "current": true,
      "accent": "teal",
      "summary": "Teaching AI and computer science labs, mentoring students through applied projects.",
      "highlights": [
        "Teach AI and computer science labs, guide semester projects, assess technical work and mentor students in applied engineering problem-solving."
      ],
      "stack": [
        "Machine Learning",
        "C++",
        "Mentoring"
      ],
      "logoUrl": null,
      "sortOrder": 3,
      "published": true
    },
    {
      "id": 5,
      "company": "Fiverr",
      "role": "Freelance AI Engineer & Full Stack Developer",
      "period": "Jan 2025 — Present",
      "location": "Remote",
      "current": true,
      "accent": "green",
      "summary": "AI applications, ML integrations and MERN builds for international clients.",
      "highlights": [
        "Deliver AI-powered applications, machine-learning integrations, REST APIs and MERN solutions for international clients while maintaining a 5.0/5.0 rating."
      ],
      "stack": [
        "MERN",
        "REST APIs",
        "ML Integration"
      ],
      "logoUrl": null,
      "sortOrder": 4,
      "published": true
    },
    {
      "id": 6,
      "company": "Zudu AI",
      "role": "AI Engineer",
      "period": "Mar 2025 — May 2025",
      "location": "Remote",
      "current": false,
      "accent": "orange",
      "summary": "Built a human-like voice agent for customer calls.",
      "highlights": [
        "Developed a human-like voice agent for customer calls, improving speech recognition, dialogue flow, response orchestration and automated support interactions."
      ],
      "stack": [
        "Conversational AI",
        "ASR",
        "Dialogue Design"
      ],
      "logoUrl": null,
      "sortOrder": 5,
      "published": true
    },
    {
      "id": 7,
      "company": "Digital Egypt Pioneers Initiative",
      "role": "React Developer Intern",
      "period": "Apr 2024 — Oct 2024",
      "location": "Egypt",
      "current": false,
      "accent": "pink",
      "summary": "Full-stack builds for national digital transformation projects.",
      "highlights": [
        "Built responsive full-stack applications using React, Node.js, JavaScript, REST APIs and reusable UI components for digital transformation projects."
      ],
      "stack": [
        "React",
        "Node.js",
        "REST APIs"
      ],
      "logoUrl": null,
      "sortOrder": 6,
      "published": true
    },
    {
      "id": 8,
      "company": "University of Louisville",
      "role": "AI Engineer Intern",
      "period": "Sep 2023 — Nov 2023",
      "location": "USA",
      "current": false,
      "accent": "red",
      "summary": "Deep learning for non-invasive detection of age-related macular degeneration.",
      "highlights": [
        "Designed deep-learning models for non-invasive age-related macular degeneration detection and severity grading with teams across the USA, Egypt and Spain."
      ],
      "stack": [
        "Medical Imaging",
        "Deep Learning",
        "PyTorch"
      ],
      "logoUrl": null,
      "sortOrder": 7,
      "published": true
    },
    {
      "id": 9,
      "company": "LARRI, University of Louisville",
      "role": "Computer Vision Intern",
      "period": "Jul 2023 — Sep 2023",
      "location": "USA",
      "current": false,
      "accent": "yellow",
      "summary": "Real-time gesture recognition driving UAV control.",
      "highlights": [
        "Built real-time hand-gesture recognition with OpenCV, MediaPipe and YOLO, then integrated gesture-based UAV control using DJI Tello and AirSim."
      ],
      "stack": [
        "OpenCV",
        "MediaPipe",
        "YOLO",
        "DJI Tello",
        "AirSim"
      ],
      "logoUrl": null,
      "sortOrder": 8,
      "published": true
    }
  ],
  "projects": [
    {
      "id": 1,
      "name": "Odenta",
      "category": "Founder · Product",
      "year": "2025",
      "tagline": "The official dental platform at Alamein International University.",
      "description": "An AI-powered dental management platform running in production for universities and clinics. 9,000+ patient records across appointments, interactive tooth charts, X-rays, analytics, invoicing and messaging — with role-based access for clinical and administrative staff, a React Native app for iOS and Android, and a voice layer that lets clinicians reach schedules and patient history by speaking.",
      "outcomes": [
        "Deployed as AIU's official dental system after a successful Summer 2025 trial",
        "9,000+ patient records under management",
        "Web, iOS and Android from one architecture"
      ],
      "stack": [
        "React",
        "Node.js",
        "Express",
        "MongoDB",
        "React Native",
        "Voice AI",
        "RBAC"
      ],
      "accent": "indigo",
      "featured": true,
      "kind": "shipped",
      "link": "https://www.odenta-eg.com/",
      "linkLabel": "Visit odenta-eg.com",
      "coverUrl": "/uploads/odenta-cover.jpg",
      "gallery": [
        "/uploads/odenta-shot-1.jpg",
        "/uploads/odenta-shot-2.jpg"
      ],
      "sortOrder": 0,
      "published": true
    },
    {
      "id": 2,
      "name": "Claim-Status Voice Agent",
      "category": "Healthcare AI",
      "year": "2025",
      "tagline": "A voice agent that authenticates callers and explains their claims.",
      "description": "A production voice agent for US health plans. It captures provider information, authenticates member and claim data before disclosing anything, retrieves the relevant claim records and explains paid, denied or pending decisions the way a person would. I led the architecture, implementation and UAT, and own the end-to-end workflow from speech recognition through LLM orchestration to secure healthcare data handling.",
      "outcomes": [
        "Authentication gate before any claim data is disclosed",
        "Human-like explanations for paid, denied and pending claims",
        "Full call-session management and API integration"
      ],
      "stack": [
        "LLM Orchestration",
        "STT",
        "TTS",
        "Information Retrieval",
        "Healthcare APIs"
      ],
      "accent": "blue",
      "featured": true,
      "kind": "shipped",
      "link": null,
      "linkLabel": null,
      "coverUrl": "/uploads/claim-voice-agent-cover.jpg",
      "gallery": [
        "/uploads/claim-voice-agent-shot-1.jpg",
        "/uploads/claim-voice-agent-shot-2.jpg"
      ],
      "sortOrder": 1,
      "published": true
    },
    {
      "id": 3,
      "name": "Fraud, Waste & Abuse Agents",
      "category": "Applied AI",
      "year": "2025",
      "tagline": "Agents that read claims data and flag what does not add up.",
      "description": "A suite of agents processing provider and claims data to detect multiple fraud typologies, producing structured outputs that feed directly into human investigation workflows rather than stopping at a score.",
      "outcomes": [
        "Multiple fraud typologies detected",
        "Structured output for investigators"
      ],
      "stack": [
        "AI Agents",
        "Claims Data",
        "Python",
        "Structured Extraction"
      ],
      "accent": "red",
      "featured": false,
      "kind": "shipped",
      "link": null,
      "linkLabel": null,
      "coverUrl": "/uploads/fwa-agents-cover.jpg",
      "gallery": [
        "/uploads/fwa-agents-shot-1.jpg",
        "/uploads/fwa-agents-shot-2.jpg"
      ],
      "sortOrder": 2,
      "published": true
    },
    {
      "id": 4,
      "name": "Arabic OCR for Identity Documents",
      "category": "Computer Vision",
      "year": "2025",
      "tagline": "Fine-tuned VLMs for national IDs and passports.",
      "description": "Fine-tuned and evaluated DeepSeek, Qwen2.5 and other vision-language models to lift Arabic OCR accuracy on national IDs, passports and identity documents — a script and document class most off-the-shelf OCR handles badly.",
      "outcomes": [
        "Measured accuracy gains over baseline OCR",
        "Evaluated across several model families"
      ],
      "stack": [
        "DeepSeek",
        "Qwen2.5",
        "Vision-Language Models",
        "Fine-Tuning",
        "PyTorch"
      ],
      "accent": "purple",
      "featured": true,
      "kind": "shipped",
      "link": null,
      "linkLabel": null,
      "coverUrl": "/uploads/arabic-ocr-cover.jpg",
      "gallery": [
        "/uploads/arabic-ocr-shot-1.jpg",
        "/uploads/arabic-ocr-shot-2.jpg"
      ],
      "sortOrder": 3,
      "published": true
    },
    {
      "id": 5,
      "name": "Gesture-Controlled UAV",
      "category": "Research · IEEE",
      "year": "2025",
      "tagline": "Fly a drone with your hands. Published at IEEE ICUAS 2025.",
      "description": "Real-time hand-gesture recognition with OpenCV, MediaPipe and YOLO, integrated into gesture-based UAV control on DJI Tello and AirSim. The comparative analysis of detection methods for edge-assisted control became my IEEE ICUAS 2025 paper.",
      "outcomes": [
        "Published at IEEE ICUAS 2025",
        "Real-time control on physical and simulated drones"
      ],
      "stack": [
        "OpenCV",
        "MediaPipe",
        "YOLO",
        "DJI Tello",
        "AirSim"
      ],
      "accent": "teal",
      "featured": true,
      "kind": "shipped",
      "link": "https://arxiv.org/abs/2505.17303",
      "linkLabel": "Read the paper",
      "coverUrl": "/uploads/gesture-uav-cover.jpg",
      "gallery": [
        "/uploads/gesture-uav-shot-1.jpg",
        "/uploads/gesture-uav-shot-2.jpg"
      ],
      "sortOrder": 4,
      "published": true
    },
    {
      "id": 6,
      "name": "Viatryon",
      "category": "Computer Vision",
      "year": "2024",
      "tagline": "Try on watches and bracelets through your camera.",
      "description": "A MERN and computer-vision virtual try-on platform for watches and bracelets, with real-time wrist detection, scaling and rotation so the product sits correctly on the moving hand.",
      "outcomes": [
        "Real-time wrist tracking",
        "Correct scale and rotation per frame"
      ],
      "stack": [
        "MERN",
        "OpenCV",
        "MediaPipe",
        "React"
      ],
      "accent": "orange",
      "featured": false,
      "kind": "shipped",
      "link": "https://www.viatryon.com/",
      "linkLabel": "Visit the site",
      "coverUrl": "/uploads/viatryon-cover.jpg",
      "gallery": [
        "/uploads/viatryon-shot-1.jpg",
        "/uploads/viatryon-shot-2.jpg"
      ],
      "sortOrder": 5,
      "published": true
    },
    {
      "id": 7,
      "name": "ASL Learning Platform",
      "category": "Computer Vision",
      "year": "2024",
      "tagline": "Live sign-to-text translation, plus a robot that mimics you.",
      "description": "A platform for live gesture-to-text translation and interactive assessment, using pose estimation and keypoint-based control to also drive a human-mimicking robot.",
      "outcomes": [
        "Live sign-to-text translation",
        "Keypoint control of a physical robot"
      ],
      "stack": [
        "Pose Estimation",
        "MediaPipe",
        "Python",
        "Robotics"
      ],
      "accent": "green",
      "featured": false,
      "kind": "shipped",
      "link": null,
      "linkLabel": null,
      "coverUrl": "/uploads/asl-platform-cover.jpg",
      "gallery": [
        "/uploads/asl-platform-shot-1.jpg",
        "/uploads/asl-platform-shot-2.jpg"
      ],
      "sortOrder": 6,
      "published": true
    },
    {
      "id": 8,
      "name": "Macular Degeneration Detection",
      "category": "Medical AI",
      "year": "2023",
      "tagline": "Non-invasive AMD detection and severity grading.",
      "description": "Deep-learning models for non-invasive detection and severity grading of age-related macular degeneration, built with research teams across the USA, Egypt and Spain at the University of Louisville.",
      "outcomes": [
        "Severity grading, not just binary detection",
        "Three-country research collaboration"
      ],
      "stack": [
        "Deep Learning",
        "Medical Imaging",
        "PyTorch",
        "Keras"
      ],
      "accent": "pink",
      "featured": false,
      "kind": "shipped",
      "link": null,
      "linkLabel": null,
      "coverUrl": "/uploads/macular-ai-cover.jpg",
      "gallery": [
        "/uploads/macular-ai-shot-1.jpg",
        "/uploads/macular-ai-shot-2.jpg"
      ],
      "sortOrder": 7,
      "published": true
    },
    {
      "id": 11,
      "name": "Fakturama Image-to-Cash",
      "category": "Applied AI · Automation",
      "year": "2026",
      "tagline": "A photo of a sales order becomes a verified, paid invoice.",
      "description": "Drop in a picture of a sales order and get a saved Order and its linked, paid Invoice inside Fakturama — created by driving the real desktop interface, not by writing to the database behind it. EasyOCR reads the pixels, the reading is re-rendered with its column positions intact, a Groq model structures it under a tool schema, and every total is recomputed in Decimal: if the document's own arithmetic disagrees, nothing is typed anywhere. Ships with a GUI, a CLI, a `doctor` command that checks the environment before a run, and documentation generated from the run reports so its figures cannot drift from what the code did.",
      "outcomes": [
        "155 passing tests, and a doctor command that validates the environment first",
        "Totals recomputed in Decimal, so a bad document stops the run instead of entering it",
        "Every entity resolved or created only when missing, and verified before the next step"
      ],
      "stack": [
        "Python",
        "EasyOCR",
        "Groq",
        "UI Automation",
        "Pytest",
        "Tkinter"
      ],
      "accent": "blue",
      "featured": true,
      "kind": "shipped",
      "link": "https://github.com/Sousannah/fakturama-image-to-cash",
      "linkLabel": "View on GitHub",
      "coverUrl": "/uploads/fakturama-cover.jpg",
      "gallery": [
        "/uploads/fakturama-shot-1.jpg",
        "/uploads/fakturama-shot-2.jpg"
      ],
      "sortOrder": 8,
      "published": true
    },
    {
      "id": 12,
      "name": "VoiceAuth Pro",
      "category": "Applied AI · Security",
      "year": "2026",
      "tagline": "Log in with your voice, with liveness prompts that change every time.",
      "description": "An end-to-end speaker verification platform. Enrolment captures a few minutes of scripted speech, and login pairs a password with a voice check: the ECAPA-TDNN speaker model embeds the recording and admits the user only above a cosine similarity threshold. Randomised liveness prompts mean a stolen recording does not get anyone in. Built as a full product — enrolment, dashboard, re-record flow, waveform visualisation and a light and dark interface.",
      "outcomes": [
        "Speaker verification on a 0.85 cosine similarity threshold",
        "Randomised liveness prompts to defeat replay attacks",
        "Password plus voice, so neither factor stands alone"
      ],
      "stack": [
        "FastAPI",
        "SpeechBrain",
        "ECAPA-TDNN",
        "MongoDB",
        "React",
        "Tailwind",
        "JWT"
      ],
      "accent": "indigo",
      "featured": true,
      "kind": "shipped",
      "link": null,
      "linkLabel": null,
      "coverUrl": "/uploads/voiceauth-pro-cover.jpg",
      "gallery": [
        "/uploads/voiceauth-pro-shot-1.jpg",
        "/uploads/voiceauth-pro-shot-2.jpg"
      ],
      "sortOrder": 9,
      "published": true
    },
    {
      "id": 13,
      "name": "HunyuanOCR Arabic Studio",
      "category": "Computer Vision",
      "year": "2026",
      "tagline": "A working interface for Arabic OCR, from handwriting to LaTeX.",
      "description": "A production web interface over the HunyuanOCR vision model, configured for right-to-left Arabic. Seven task presets — text spotting, document parsing, formula recognition, table parsing, chart parsing, info extraction and translation — stream their output token by token, render Markdown and LaTeX as they arrive, and can be stopped mid-generation. Images are resized automatically against the GPU memory actually available, and a companion Gradio build carries Arabic-tuned bilingual prompts for RTL accuracy.",
      "outcomes": [
        "Seven OCR tasks behind one interface, including handwriting and LaTeX formulas",
        "Token-by-token streaming with a stop control and a live model-status indicator",
        "Automatic image resizing against available GPU memory"
      ],
      "stack": [
        "HunyuanOCR",
        "Python",
        "FastAPI",
        "Gradio",
        "React",
        "CUDA",
        "Transformers"
      ],
      "accent": "purple",
      "featured": true,
      "kind": "shipped",
      "link": "https://github.com/Sousannah/HuayunOCR-Arabic",
      "linkLabel": "View on GitHub",
      "coverUrl": "/uploads/hunyuan-ocr-arabic-cover.jpg",
      "gallery": [
        "/uploads/hunyuan-ocr-arabic-ui-1.jpg",
        "/uploads/hunyuan-ocr-arabic-ui-2.jpg",
        "/uploads/hunyuan-ocr-arabic-ui-3.jpg",
        "/uploads/hunyuan-ocr-arabic-ui-4.jpg",
        "/uploads/hunyuan-ocr-arabic-ui-5.jpg",
        "/uploads/hunyuan-ocr-arabic-ui-6.jpg"
      ],
      "sortOrder": 10,
      "published": true
    },
    {
      "id": 14,
      "name": "Facial Emotion Recognition",
      "category": "Computer Vision",
      "year": "2026",
      "tagline": "Read emotion from a live camera or an uploaded video.",
      "description": "A full-stack emotion recognition system with two modes: a live webcam feed analysed over a WebSocket frame by frame, and uploaded video processed as a batch job with progress tracking. Detected faces are matched against registered reference faces, sessions are stored and replayable, and a dashboard charts emotion over the timeline of each recording. Split across a React client, a Node API and a separate Python inference server so the model work scales independently of the app.",
      "outcomes": [
        "Live and batch analysis behind the same dashboard",
        "Reference-face matching, so results are attributed to a known person",
        "Emotion timelines and statistics per session, not just a single label"
      ],
      "stack": [
        "React",
        "Node.js",
        "FastAPI",
        "MongoDB",
        "WebSockets",
        "OpenCV",
        "FFmpeg"
      ],
      "accent": "pink",
      "featured": false,
      "kind": "shipped",
      "link": null,
      "linkLabel": null,
      "coverUrl": "/uploads/emotion-recognition-cover.jpg",
      "gallery": [
        "/uploads/emotion-recognition-shot-1.jpg",
        "/uploads/emotion-recognition-shot-2.jpg"
      ],
      "sortOrder": 11,
      "published": true
    },
    {
      "id": 15,
      "name": "ForsaHunt",
      "category": "Full Stack · NLP",
      "year": "2025",
      "tagline": "Finds the tenders worth your time, and tells you when they appear.",
      "description": "A tender and opportunity discovery platform. Listings are scored against a profile of the fields you actually work in, using spaCy entity extraction and TF-IDF cosine similarity rather than keyword matching, so a relevant notice still surfaces when it uses different vocabulary. Saved searches run in the background and raise notifications, bookmarks keep a shortlist, and an analytics view shows where the opportunities are concentrating.",
      "outcomes": [
        "Relevance scoring on semantic similarity, not keyword overlap",
        "Saved searches with background notifications",
        "Bookmarks, profiles and an analytics dashboard over the pipeline"
      ],
      "stack": [
        "Flask",
        "SQLAlchemy",
        "spaCy",
        "scikit-learn",
        "React",
        "JWT"
      ],
      "accent": "orange",
      "featured": false,
      "kind": "shipped",
      "link": null,
      "linkLabel": null,
      "coverUrl": "/uploads/forsahunt-cover.jpg",
      "gallery": [
        "/uploads/forsahunt-shot-1.jpg",
        "/uploads/forsahunt-shot-2.jpg"
      ],
      "sortOrder": 12,
      "published": true
    },
    {
      "id": 16,
      "name": "WattWhere",
      "category": "Full Stack",
      "year": "2025",
      "tagline": "A community map of EV charging spots, in two languages.",
      "description": "A client platform where EV drivers find charging points and submit the ones they discover. Suggestions arrive with a photo and a pin dropped on a Leaflet map or taken from the browser's own location, then wait in an admin queue for moderation before they reach the public map. Fully localised in English and German, with Firebase authentication and Cloudinary-backed image handling.",
      "outcomes": [
        "Community submissions gated behind admin moderation",
        "English and German throughout, including form validation",
        "Map pins from a dropped marker or the device location"
      ],
      "stack": [
        "React",
        "Firebase",
        "Leaflet",
        "Express",
        "Cloudinary",
        "i18next",
        "Formik"
      ],
      "accent": "green",
      "featured": false,
      "kind": "shipped",
      "link": null,
      "linkLabel": null,
      "coverUrl": "/uploads/wattwhere-cover.jpg",
      "gallery": [
        "/uploads/wattwhere-shot-1.jpg",
        "/uploads/wattwhere-shot-2.jpg"
      ],
      "sortOrder": 13,
      "published": true
    },
    {
      "id": 17,
      "name": "DGX Cluster Dashboard",
      "category": "ML Infrastructure",
      "year": "2026",
      "tagline": "What the GPU box is actually doing, from anywhere.",
      "description": "A monitoring dashboard for an NVIDIA DGX machine: GPU utilisation and memory per card, CPU, disk and system health, polled through a small proxy API so the metrics service itself is never exposed. Reachable off-site over a Tailscale funnel, which is what makes it useful when the training job is running and nobody is in the room.",
      "outcomes": [
        "Per-GPU utilisation, memory, CPU and disk in one view",
        "Proxy API in front of the metrics service, so it stays off the public internet",
        "Remote access over a Tailscale funnel"
      ],
      "stack": [
        "Flask",
        "React",
        "Tailwind",
        "Tailscale",
        "NVIDIA DGX"
      ],
      "accent": "teal",
      "featured": false,
      "kind": "shipped",
      "link": null,
      "linkLabel": null,
      "coverUrl": "/uploads/dgx-dashboard-cover.jpg",
      "gallery": [
        "/uploads/dgx-dashboard-shot-1.jpg",
        "/uploads/dgx-dashboard-shot-2.jpg"
      ],
      "sortOrder": 14,
      "published": true
    },
    {
      "id": 18,
      "name": "AI Trading Platform",
      "category": "Applied AI",
      "year": "2025",
      "tagline": "An LSTM forecasting stack that runs entirely on your own machine.",
      "description": "A market analysis platform built around on-device inference: an LSTM trained on five years of price history produces 30-day forecasts with confidence intervals, quantised and pruned so it runs on consumer hardware without calling out to a cloud model. Around it sit live price data, portfolio tracking, technical indicators and a signal view. A study in shipping a model as a product rather than a notebook — not investment advice.",
      "outcomes": [
        "LSTM forecasting with confidence intervals, inferring locally",
        "Quantisation and pruning to fit consumer hardware",
        "Live data over WebSockets, with portfolio and indicator views"
      ],
      "stack": [
        "TensorFlow",
        "FastAPI",
        "React",
        "LSTM",
        "WebSockets",
        "yfinance"
      ],
      "accent": "green",
      "featured": false,
      "kind": "shipped",
      "link": "https://github.com/Sousannah/AI-Trading-Platform",
      "linkLabel": "View on GitHub",
      "coverUrl": "/uploads/ai-trading-cover.jpg",
      "gallery": [
        "/uploads/ai-trading-shot-1.jpg",
        "/uploads/ai-trading-shot-2.jpg"
      ],
      "sortOrder": 15,
      "published": true
    },
    {
      "id": 19,
      "name": "MediaPipe Hand Tracking",
      "category": "Open Source",
      "year": "2024",
      "tagline": "The hand-tracking module other people build on. 42 stars.",
      "description": "A compact, reusable hand and finger tracking module over MediaPipe and OpenCV — landmark detection, finger state and tracking, packaged so it drops into another project instead of being copied out of a notebook. It is the most starred thing I have published, and the base layer under the gesture and UAV research.",
      "outcomes": [
        "42 stars and 9 forks on GitHub",
        "Reused as the base layer of the UAV gesture work"
      ],
      "stack": [
        "Python",
        "MediaPipe",
        "OpenCV",
        "NumPy"
      ],
      "accent": "teal",
      "featured": false,
      "kind": "shipped",
      "link": "https://github.com/Sousannah/hand-tracking-using-mediapipe",
      "linkLabel": "View on GitHub",
      "coverUrl": "/uploads/hand-tracking-cover.jpg",
      "gallery": [
        "/uploads/hand-tracking-shot-1.jpg",
        "/uploads/hand-tracking-shot-2.jpg"
      ],
      "sortOrder": 16,
      "published": true
    },
    {
      "id": 20,
      "name": "YOLOv8 Toolkit",
      "category": "Open Source",
      "year": "2024",
      "tagline": "Detection, segmentation, pose and counting, as working references.",
      "description": "A collection of YOLOv8 implementations kept as runnable references rather than snippets: object detection, instance segmentation, pose estimation, multi-object tracking, object counting and custom model training, each isolated so one can be lifted without the rest.",
      "outcomes": [
        "10 stars and 7 forks on GitHub",
        "Six YOLOv8 tasks, each runnable on its own"
      ],
      "stack": [
        "Python",
        "YOLOv8",
        "Ultralytics",
        "OpenCV"
      ],
      "accent": "yellow",
      "featured": false,
      "kind": "shipped",
      "link": "https://github.com/Sousannah/YOLOv8-Projects",
      "linkLabel": "View on GitHub",
      "coverUrl": "/uploads/yolov8-toolkit-cover.jpg",
      "gallery": [
        "/uploads/yolov8-toolkit-shot-1.jpg",
        "/uploads/yolov8-toolkit-shot-2.jpg"
      ],
      "sortOrder": 17,
      "published": true
    },
    {
      "id": 21,
      "name": "Fridge Fusion",
      "category": "Full Stack",
      "year": "2025",
      "tagline": "Recipes built from what is already in your fridge.",
      "description": "A full-stack recipe application: users keep an inventory of the ingredients they have, upload photos of their own dishes, and get recipes matched against what is actually available rather than a shopping list. Express and MongoDB behind JWT authentication and image upload, with a React client on top.",
      "outcomes": [
        "Ingredient-led matching instead of keyword recipe search",
        "Authenticated accounts with user-uploaded photos"
      ],
      "stack": [
        "React",
        "Express",
        "MongoDB",
        "Mongoose",
        "JWT",
        "Multer"
      ],
      "accent": "orange",
      "featured": false,
      "kind": "shipped",
      "link": "https://github.com/Sousannah/Fridge-Fusion",
      "linkLabel": "View on GitHub",
      "coverUrl": "/uploads/fridge-fusion-cover.jpg",
      "gallery": [
        "/uploads/fridge-fusion-shot-1.jpg",
        "/uploads/fridge-fusion-shot-2.jpg"
      ],
      "sortOrder": 18,
      "published": true
    },
    {
      "id": 22,
      "name": "Ask Your Documents",
      "category": "Concept · Applied AI",
      "year": "2026",
      "tagline": "A private assistant that answers from your own files, with citations.",
      "description": "Your contracts, policies, wikis and tickets become something a person can just ask. Every answer links to the passage it came from, conflicting versions get flagged rather than averaged, permissions are checked per user, and a question outside the corpus is refused instead of guessed at. Two to three weeks to a working pilot on your real documents.",
      "outcomes": [
        "Every claim cited back to the source passage",
        "Refuses to answer outside the corpus, so nothing is invented",
        "Connects to SharePoint, Drive, Confluence, Zendesk or a plain folder"
      ],
      "stack": [
        "Python",
        "LLM Orchestration",
        "RAG",
        "Vector Search",
        "FastAPI",
        "React"
      ],
      "accent": "blue",
      "featured": false,
      "kind": "concept",
      "link": null,
      "linkLabel": null,
      "coverUrl": "/uploads/rag-assistant-cover.jpg",
      "gallery": [
        "/uploads/rag-assistant-shot-1.jpg",
        "/uploads/rag-assistant-shot-2.jpg"
      ],
      "sortOrder": 19,
      "published": true
    },
    {
      "id": 23,
      "name": "AI Receptionist",
      "category": "Concept · Voice AI",
      "year": "2026",
      "tagline": "Answers every call, books into your real calendar, never sleeps.",
      "description": "A voice agent for clinics, salons and workshops: it answers, checks live availability, books, reschedules, cancels and sends the confirmation — and hands over to a person the moment the question stops being a booking. The same architecture as the healthcare claim agent I run in production, pointed at a calendar instead of a claims system.",
      "outcomes": [
        "No missed calls, including evenings and weekends",
        "Writes into the calendar you already use",
        "Hands over to a human on anything outside the script"
      ],
      "stack": [
        "STT",
        "TTS",
        "LLM Orchestration",
        "Twilio",
        "Calendar APIs",
        "Node.js"
      ],
      "accent": "indigo",
      "featured": false,
      "kind": "concept",
      "link": null,
      "linkLabel": null,
      "coverUrl": "/uploads/ai-receptionist-cover.jpg",
      "gallery": [
        "/uploads/ai-receptionist-shot-1.jpg",
        "/uploads/ai-receptionist-shot-2.jpg"
      ],
      "sortOrder": 20,
      "published": true
    },
    {
      "id": 24,
      "name": "Invoice & Receipt Automation",
      "category": "Concept · Document AI",
      "year": "2026",
      "tagline": "Photograph the paperwork; it lands in your accounting system.",
      "description": "Invoices and receipts arrive as PDFs, scans or phone photos and come out as posted entries. Totals are recomputed rather than trusted, so a document whose own arithmetic is wrong stops for a human instead of quietly entering the ledger. Anything ambiguous — a new supplier, an odd VAT rate — is queued for review with the reason stated. Built on the pipeline behind Fakturama Image-to-Cash.",
      "outcomes": [
        "Roughly four in five documents posted without anyone touching them",
        "Arithmetic verified before anything is written",
        "Exports to Xero, QuickBooks, DATEV or a plain CSV"
      ],
      "stack": [
        "Python",
        "OCR",
        "LLM Extraction",
        "Decimal Verification",
        "FastAPI",
        "React"
      ],
      "accent": "teal",
      "featured": false,
      "kind": "concept",
      "link": null,
      "linkLabel": null,
      "coverUrl": "/uploads/invoice-automation-cover.jpg",
      "gallery": [
        "/uploads/invoice-automation-shot-1.jpg",
        "/uploads/invoice-automation-shot-2.jpg"
      ],
      "sortOrder": 21,
      "published": true
    },
    {
      "id": 25,
      "name": "Arabic Support Agent",
      "category": "Concept · NLP",
      "year": "2026",
      "tagline": "WhatsApp support that actually understands Egyptian Arabic.",
      "description": "Most support bots fail in this region for one reason: they were trained on Modern Standard Arabic and customers write in dialect. This one handles Egyptian and Gulf Arabic, looks up the real order, applies your business rules, takes the action, and escalates the moment sentiment turns or the request exceeds what it is allowed to approve. Arabic-native, on WhatsApp where your customers already are.",
      "outcomes": [
        "Dialect, not just Modern Standard Arabic",
        "Takes real actions — lookups, address changes, refunds within a limit",
        "Escalates on anger, ambiguity, or an explicit request for a human"
      ],
      "stack": [
        "LLM Orchestration",
        "Arabic NLP",
        "WhatsApp Business API",
        "Python",
        "Function Calling"
      ],
      "accent": "green",
      "featured": false,
      "kind": "concept",
      "link": null,
      "linkLabel": null,
      "coverUrl": "/uploads/arabic-support-bot-cover.jpg",
      "gallery": [
        "/uploads/arabic-support-bot-shot-1.jpg",
        "/uploads/arabic-support-bot-shot-2.jpg"
      ],
      "sortOrder": 22,
      "published": true
    },
    {
      "id": 26,
      "name": "Visual Quality Inspection",
      "category": "Concept · Computer Vision",
      "year": "2026",
      "tagline": "A camera over the line that catches what tired eyes miss.",
      "description": "A camera above the conveyor, a small detector at the edge, and a verdict before the part reaches the next station. Defects are classified by type rather than just flagged, so the dashboard points at the tooling that caused them. Runs on-premise with no cloud round-trip, which is what keeps it inside the cycle time. The YOLO work behind it is already on my GitHub.",
      "outcomes": [
        "Per-part verdict inside the line cycle time",
        "Defects classified by type, so the cause is traceable",
        "Runs on-premise — no images leave the factory"
      ],
      "stack": [
        "YOLOv8",
        "PyTorch",
        "OpenCV",
        "Edge Inference",
        "FastAPI",
        "React"
      ],
      "accent": "red",
      "featured": false,
      "kind": "concept",
      "link": null,
      "linkLabel": null,
      "coverUrl": "/uploads/visual-inspection-cover.jpg",
      "gallery": [
        "/uploads/visual-inspection-shot-1.jpg",
        "/uploads/visual-inspection-shot-2.jpg"
      ],
      "sortOrder": 23,
      "published": true
    },
    {
      "id": 27,
      "name": "CV Screening & Matching",
      "category": "Concept · NLP",
      "year": "2026",
      "tagline": "Rank 300 applicants in a minute, and show your working.",
      "description": "Semantic matching between a role and a pile of CVs, scored on skills, depth and domain rather than keyword overlap — so the right candidate still surfaces when they wrote \"speech recognition\" and you wrote \"ASR\". Every score opens into the lines of the CV that produced it, no demographic signal is used, and the same CV always scores the same. The matching engine is the one behind ForsaHunt, pointed at people instead of tenders.",
      "outcomes": [
        "Semantic matching, so different vocabulary still matches",
        "Every score traceable to quoted lines of the CV",
        "Deterministic and auditable, with no demographic features"
      ],
      "stack": [
        "Python",
        "spaCy",
        "Sentence Transformers",
        "scikit-learn",
        "FastAPI",
        "React"
      ],
      "accent": "purple",
      "featured": false,
      "kind": "concept",
      "link": null,
      "linkLabel": null,
      "coverUrl": "/uploads/cv-matching-cover.jpg",
      "gallery": [
        "/uploads/cv-matching-shot-1.jpg",
        "/uploads/cv-matching-shot-2.jpg"
      ],
      "sortOrder": 24,
      "published": true
    }
  ],
  "skillGroups": [
    {
      "id": 1,
      "name": "AI & Machine Learning",
      "icon": "brain",
      "accent": "blue",
      "skills": [
        "Python",
        "PyTorch",
        "TensorFlow",
        "Keras",
        "Scikit-learn",
        "Deep Learning",
        "Neural Networks",
        "Generative AI",
        "Large Language Models",
        "Fine-Tuning",
        "RAG",
        "Prompt Engineering",
        "AI Agents",
        "FWA Detection",
        "Information Retrieval",
        "Model Evaluation",
        "Recommendation Systems",
        "Ranking"
      ],
      "sortOrder": 0,
      "published": true
    },
    {
      "id": 2,
      "name": "Voice AI & Computer Vision",
      "icon": "mic",
      "accent": "purple",
      "skills": [
        "Conversational AI",
        "Speech-to-Text",
        "Text-to-Speech",
        "Speech Emotion Recognition",
        "OpenCV",
        "YOLO",
        "MediaPipe",
        "OCR",
        "Arabic OCR",
        "Document AI",
        "Object Detection",
        "Image Classification",
        "Pose Estimation"
      ],
      "sortOrder": 1,
      "published": true
    },
    {
      "id": 3,
      "name": "Full Stack & Mobile",
      "icon": "layers",
      "accent": "indigo",
      "skills": [
        "JavaScript",
        "React",
        "React Native",
        "iOS & Android",
        "Tailwind CSS",
        "Node.js",
        "Express.js",
        "MongoDB",
        "MERN Stack",
        "Flask",
        "FastAPI",
        "REST APIs",
        "SQL",
        "Authentication",
        "Role-Based Access Control",
        "Data Processing"
      ],
      "sortOrder": 2,
      "published": true
    },
    {
      "id": 4,
      "name": "Cloud & Engineering",
      "icon": "cloud",
      "accent": "teal",
      "skills": [
        "Docker",
        "Git",
        "AWS",
        "GCP",
        "NVIDIA DGX",
        "Model Serving",
        "GPU Monitoring",
        "API Integration",
        "Agile Delivery",
        "System Architecture",
        "Technical Leadership"
      ],
      "sortOrder": 3,
      "published": true
    }
  ]
};

export default fallbackContent;
