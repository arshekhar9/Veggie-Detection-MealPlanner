# Veggie Detection Meal Planner

An AI-powered meal planning app that detects vegetables from a photo and generates a personalised weekly meal plan.

## Features

- **Veggie Detection** — Upload a photo of your vegetables and Claude Vision identifies them automatically
- **Weekly Meal Plan** — Generates recipes for Monday, Wednesday, and Friday based on what you have
- **User Profile** — Set dietary restrictions, cuisine preferences, pantry staples, and servings
- **Streaming Chat** — Ask follow-up questions, swap recipes, or request a shopping list
- **Voice Interface** — Speak your questions and hear responses read back to you

## Getting Started

1. Clone the repo and install dependencies:
   ```bash
   cd app && npm install
   ```

2. Add your Anthropic API key:
   ```bash
   cp .env.local.example .env.local
   # edit .env.local and add your ANTHROPIC_API_KEY
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Stack

- **Next.js 16** (App Router) — frontend and API routes
- **Claude API** — vegetable detection (vision) and meal plan generation
- **SQLite** — user profile storage
- **Web Speech API** — browser-native STT and TTS
- **Tailwind CSS** — styling
