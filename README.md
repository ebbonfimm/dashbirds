# Dashbirds 🐦

Dashbirds is a modern, high-performance web application designed for marketing and data analysis, featuring an AI-powered conversational interface.

## Features

- **Premium Landing Page:** A stunning welcome page with a "glassmorphism" aesthetic, dynamic yellow/black color schemes, and custom sliding animations.
- **Interactive AI Chat:** A ChatGPT-like interface utilizing OpenAI's `gpt-3.5-turbo` model with native streaming for real-time text generation.
- **Dynamic Particle Background:** A highly optimized HTML5 Canvas background that renders an interactive, data-inspired grid. The grid reacts to mouse movement, creating glowing trails that beautifully integrate with the UI.
- **Modern UX/UI:** Designed with meticulous attention to detail including backdrop blurs, fluid layout transitions, and pixel-perfect alignments.

## Tech Stack

- React
- TypeScript
- Vite
- OpenAI API
- Lucide React (Icons)

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ebbonfimm/dashbirds.git
   cd dashbirds
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add your OpenAI API key:
   ```
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## Architecture Notes

The AI integration currently runs client-side for rapid development and demonstration purposes. For a production deployment, the OpenAI API calls should be migrated to a backend service to securely protect the API key.

---
*In data we trust, in marketing we believe.*
