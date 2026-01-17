# 🎵 Aether - AI Music Generation Platform

<div align="center">

![Aether Logo](public/swords.svg)

**The world's most advanced AI music creation platform. Create professional songs, beats, and compositions with cutting-edge artificial intelligence.**

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-5.1.0-000000?logo=express&logoColor=white)](https://expressjs.com/)

</div>

## 🌟 Overview

Aether is a cutting-edge AI-powered music generation platform that transforms your creative ideas into professional-quality songs. Using advanced artificial intelligence, it generates original lyrics and converts them into high-quality audio tracks with customizable parameters.

### ✨ Key Features

- 🎤 **AI Lyrics Generation** - Create original, artist-style lyrics using advanced language models
- 🎵 **Text-to-Speech Audio** - Convert lyrics into professional-quality audio tracks
- 🎨 **Custom Album Covers** - Upload and customize album artwork for each song variant
- 🎛️ **Advanced Controls** - Fine-tune creativity, vocal balance, and tempo
- 👤 **User Authentication** - Secure user management with Clerk
- 📱 **Responsive Design** - Beautiful, modern UI that works on all devices
- 🎧 **Audio Player** - Full-featured player with lyrics display and waveform visualization
- 🔄 **Multiple Variants** - Generate 2 different versions of each song
- 💾 **Session Persistence** - Your creations persist across page refreshes

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn**
- **API Keys** (see Environment Variables section)

### Installation & Setup

#### Step 1: Clone the Repository
```bash
# Clone the repository
git clone https://github.com/Nixxx19/verseforge.git
cd aether
```

#### Step 2: Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

#### Step 3: Start the Application
```bash
# Start backend server
cd backend
npm start
```

In a new terminal window:
```bash
# Start frontend server
npm run dev
```

## 🔬 How It Works

Aether uses a sophisticated multi-stage AI pipeline to transform your creative ideas into professional-quality music. Here's the technical breakdown of our advanced system:

### Stage 1: Custom LSTM Preprocessing
Before generating lyrics, we run your input through our custom LSTM (Long Short-Term Memory) neural network that has been specifically trained on music data:

- **Purpose**: Preprocesses and enhances your input to create "cloud words" and cleaned lyrics
- **Training Data**: Trained on extensive music datasets to understand lyrical patterns and structures
- **Output**: Refined, music-optimized input that's ready for the next stage

### Stage 2: Fine-Tuned Llama 3.3 Model
Our core lyrics generation is powered by Meta's open-source Llama 3.3 model, which we've fine-tuned specifically for music:

- **Base Model**: `meta-llama/llama-3.3-8b-instruct:free`
- **Fine-Tuning**: Custom fine-tuning on music-specific datasets
- **Specialization**: Trained to understand artist styles, lyrical structures, and musical themes
- **Output**: High-quality, artist-style lyrics that match your creative vision

### Stage 3: Advanced TTS with Custom Tags
The generated lyrics are then processed by Sunauto TTS, which we've enhanced with custom fine-tuning:

- **Custom Tags**: Created 1000+ specialized tags for better audio output
- **Fine-Tuning**: Custom training to optimize for music generation
- **Quality Enhancement**: Improved vocal synthesis and musical expression
- **Output**: Professional-quality audio tracks with natural-sounding vocals

### Technical Pipeline Flow

```
User Input → LSTM Preprocessing → Llama 3.3 Generation → Sunauto TTS → Final Audio
      ↓              ↓                    ↓                ↓
Eg: "Drake song"  → Cloud Words → Artist-style Lyrics → Professional Audio
```

### Why This Approach Works

1. **LSTM Preprocessing**: Ensures input is optimized for music generation
2. **Fine-Tuned Llama**: Leverages open-source power with music specialization
3. **Custom TTS Tags**: 1000+ tags provide precise control over audio output
4. **End-to-End Pipeline**: Each stage is optimized for the next, ensuring quality

This multi-stage approach allows us to generate music that's both creative and technically excellent, combining the power of open-source models with our specialized fine-tuning.

## 🎵 How to Use

### 1. Generate Your First Song

1. **Navigate to the homepage** - You'll see the main interface with a prompt input
2. **Enter your musical vision** - Describe the song you want to create:
   - `"Drake song about late night vibes"`
   - `"Taylor Swift ballad about heartbreak"`
   - `"Travis Scott trap song about success"`
3. **Adjust settings (optional)**:
   - **Temperature** (1.5-2.0): Controls lyrical creativity and originality
   - **Balance** (0-2.0): Controls vocal balance and instrumental focus
   - **BPM** (120-300): Sets the tempo and energy of the track
4. **Click "Generate"** - The system will create your song

### 2. Customize Your Song

- **Edit Song Name**: Click on the song title to rename it
- **Upload Custom Cover**: Hover over album art and click "Upload Cover"
- **Switch Variants**: Use arrow buttons to explore different versions
- **Play Controls**: Use the full-featured audio player with lyrics display

### 3. Explore Features

- **Lyrics Display**: Click the lyrics button to see synchronized lyrics
- **Waveform Visualization**: Watch the animated waveform during playback
- **Volume Control**: Adjust volume or mute the audio
- **Progress Bar**: Click to seek to any point in the song

## 🏗️ Project Architecture

### Frontend (React + TypeScript)

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components (shadcn/ui)
│   ├── Header.tsx       # Navigation header
│   ├── HeroSection.tsx  # Main landing section
│   ├── GeneratePage.tsx # Song generation page
│   ├── AudioPlayerSection.tsx # Audio showcase
│   ├── FeaturesSection.tsx    # Features showcase
│   └── ...
├── pages/               # Page components
│   ├── Index.tsx        # Homepage
│   └── NotFound.tsx     # 404 page
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication context
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
└── main.tsx            # Application entry point
```

### Backend (Express.js + Node.js)

```
backend/
├── server.js           # Main server file
├── package.json        # Backend dependencies
└── .env               # Environment variables
```

### Key Technologies

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Express.js, Node.js
- **UI Components**: Radix UI, shadcn/ui
- **Authentication**: Clerk
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React
- **State Management**: React Hooks, Context API

## 🎨 Design System

Aether features a sophisticated design system with:

### Color Palette
- **Primary**: Gradient blues and purples
- **Accent**: Warm oranges and reds
- **Background**: Dark theme with glass morphism
- **Text**: High contrast white and muted tones

### Typography
- **Display**: Clash Display (headings)
- **Body**: Inter (main text)
- **Monospace**: For code and lyrics

### Components
- **Glass Cards**: Frosted glass effect with backdrop blur
- **Gradient Buttons**: Animated gradient backgrounds
- **Custom Shadows**: Multi-layered shadow system
- **Responsive Grid**: Mobile-first responsive desig

### Code Structure

- **Components**: Modular, reusable React components
- **Hooks**: Custom hooks for state management
- **Contexts**: Global state management
- **Utils**: Helper functions and utilities
- **Types**: TypeScript type definitions

### Security & Authentication

- **User Authentication**: Powered by Clerk
- **API Security**: CORS enabled for development
- **Input Validation**: Server-side validation for all inputs

### Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

