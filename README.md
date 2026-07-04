# 🛡️ Project Shield

**AI-Powered Scam Detection for Indian Citizens**

Project Shield is an AI-driven safety platform designed to protect Indians from digital fraud, impersonation scams, and "Digital Arrest" schemes. It provides real-time analysis of suspicious messages, voice monitoring during calls, and visual mapping of fraud networks—turning reactive reporting into proactive prevention.

---

## ✨ Key Features

### 🔍 1. Fraud Analyzer (Smart Chat Interface)

- **AI Text Analysis:** Paste any suspicious SMS, WhatsApp message, or email. Groq Llama 3.3 instantly detects impersonation, urgency, and financial requests.
- **Voice & Audio Upload:** Upload MP3/WAV recordings or use the built-in mic to record a call. Groq Whisper transcribes the audio, and the AI analyzes it for scam patterns.
- **Actionable Outputs:** Receive a clear risk badge (HIGH / MEDIUM / LOW), a forensic breakdown of red flags, and highlighted suspicious phrases.
- **Evidence-Ready Reports:** Download a PDF incident report or generate a formatted warning message to share with family and friends.

### 🎤 2. Live Shield (Real-Time Call Monitoring)

- **Live Voice Monitoring:** Place your phone on speaker during a suspicious call while Project Shield listens to your side of the conversation.
- **Inference Engine:** Infers the scammer's intent from the victim's responses using AI.
- **Instant Alerts:** Displays desktop notifications and warning alerts whenever scam indicators are detected.
- **Privacy-First:** Only the user's voice is processed; the caller's voice is never recorded.

### 🗺️ 3. Network Map (Fraud Intelligence)

- Interactive fraud network visualization built with **D3.js**
- Displays scam campaigns and fraud relationships using force-directed graphs
- Highlights scam clusters such as Digital Arrest scams and courier fraud rings

### 🏠 4. Home Dashboard

- Live cybercrime statistics
- Scam awareness for WhatsApp, Instagram, and Phone scams
- Links to official MHA, RBI, and NCRB resources

---

## 🧠 Tech Stack

### Frontend

- React 18
- Vite
- Tailwind CSS

### UI & State Management

- Zustand
- Framer Motion
- Lucide React

### AI & Machine Learning

- Groq SDK
- Llama 3.3-70B
- Whisper Large V3

### Data Visualization

- D3.js

### Utilities

- jsPDF
- React Router DOM

---

# 🚀 Getting Started

## Prerequisites

- Node.js 18+
- npm or Yarn
- Groq API Key

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/project-shield.git
cd project-shield
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root.

```env
VITE_GROQ_API_KEY=your_groq_api_key_here
```

### 4. Start the Development Server

```bash
npm run dev
```

### 5. Open the Application

```
http://localhost:5173
```

---

# 📁 Project Structure

```text
project-shield/
│
├── public/
│   └── shield-icon.svg
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── lib/
│   └── styles/
│
├── .env
├── index.html
├── package.json
└── README.md
```

---

# 🎥 Demo Video

> Add your Loom / YouTube demo link here.

---

# 📝 License

This project was developed for the **ET AI Hackathon 2026** and is intended for educational and demonstration purposes.

---

# 🙏 Acknowledgments

- **Groq** for Llama 3.3-70B and Whisper Large V3
- **Ministry of Home Affairs (MHA)**
- **National Crime Records Bureau (NCRB)**
- **Reserve Bank of India (RBI)**
- **ET AI Hackathon 2026**