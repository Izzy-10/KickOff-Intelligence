# ⚽ KickOff Intelligence

> AI-powered football match prediction — beyond the scoreline, into the reasoning.

![KickOff Intelligence](https://img.shields.io/badge/IBM-Granite%20Powered-blue?style=flat-square) ![Challenge](https://img.shields.io/badge/BemyApp-June%20Challenge%202025-gold?style=flat-square) ![Status](https://img.shields.io/badge/Status-Live-brightgreen?style=flat-square)

---

## The Problem

Fans can see what happened in football. Scores, highlights, stats — all available. But the question that goes unanswered before a match is: **why will a team win?**

Existing prediction tools give you odds. They don't give you reasoning. They tell you a team has a 65% chance of winning, but not *why* — what tactical factors, strengths, and match context drive that outcome.

---

## The Solution

**KickOff Intelligence** is a web app that takes any two football teams, analyses the match context, and returns a full prediction backed by AI tactical reasoning — powered by **IBM Granite**.

It doesn't just predict a winner. It explains:
- The likely scoreline
- Win/draw probabilities for both teams
- The single most decisive factor
- Each team's key strength
- A 3–4 sentence tactical breakdown of why the outcome is likely

---

## AI / Technical Approach

**IBM Granite** (via the Anthropic-compatible API layer) serves as the reasoning engine. The model receives structured match context — home team, away team, competition, and match stage — and returns a structured JSON prediction covering outcome, probabilities, confidence, and tactical reasoning.

The frontend is built in vanilla HTML, CSS, and JavaScript with no frameworks or dependencies — keeping the prototype lightweight, fast, and deployable anywhere.

**Stack:**
- Frontend: HTML5, CSS3, Vanilla JavaScript
- AI Reasoning: IBM Granite (LLM)
- Hosting: Vercel / GitHub Pages

**Flow:**
```
User inputs match → Prompt built with context → IBM Granite analyses →
JSON response parsed → UI renders prediction + reasoning
```

---

## Why It Matters

Football is the world's sport. In South Africa alone, the PSL draws millions of fans who debate match outcomes every week. KickOff Intelligence gives every fan — not just analysts — access to the kind of tactical reasoning that used to live only in press boxes and coaching rooms.

The app is built to work for **any match globally**: PSL derbies, Champions League finals, AFCON knockouts. The AI adapts its reasoning to the competition and stage.

---

## Features

- ⚽ Enter any two teams — local or global
- 🏆 Select competition (PSL, Premier League, UCL, AFCON, World Cup, and more)
- 🎯 Select match stage (Regular season, Derby, Final, Relegation decider)
- 📊 Animated win probability bar
- 🧠 Typewriter tactical reasoning output
- 📱 Fully responsive — mobile first

---

## Live Demo

🔗 [kickoff-intelligence.vercel.app](#) *(replace with your live URL)*

---

## Setup

No build tools. No npm. Just open the file.

```bash
git clone https://github.com/YOUR_USERNAME/kickoff-intelligence
cd kickoff-intelligence
open index.html
```

Or deploy instantly to Vercel:

```bash
npx vercel
```

---

## Project Structure

```
kickoff-intelligence/
├── index.html       # Full app — UI, logic, API call
└── README.md        # This file
```

---

## Team

**Sizwe Sibiya** — Frontend Developer  
WeThinkCode_ Durban | Co-founder, Sim Wear  
GitHub: [@YOUR_USERNAME](#)

---

## Built For

BemyApp Innovation Challenge — June 2025  
Theme: *AI Inside the Match*  
Powered by IBM Granite

