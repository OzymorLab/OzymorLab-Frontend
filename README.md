# Edexia AIOS Teacher Dashboard

Welcome to the **Edexia Frontend**, the central command center for teachers and evaluators utilizing the Edexia Assessment Intelligence Operating System.

## What is this repository?
This repository contains the Next.js frontend application that serves as the visual interface for the entire Edexia AI platform. 

It is designed with a strict "refined institutional" design language. To convey academic credibility, we use zero gradients, strictly `0.5px` borders, tabular-numeric data, and a single accent color (Edexia Purple). 

### Core Features:
- **Live Asynchronous Queue**: The dashboard maintains a live polling connection to the FastAPI backend. As student answer sheets are processed by Celery and S3 in the background, the UI updates their status in real-time.
- **Dynamic Step-Trace Panel**: When a graded student row is clicked, a slide-over evaluation panel animates in. It breaks down the AI's logic step-by-step, showing exactly *why* marks were awarded, and displays explicit SymPy Mathematical validations alongside the LLM's reasoning.
- **Visual Grade Bars**: Custom CSS componentry automatically scales and colors progress bars based on the student's percentile.
- **System Reliability Tracking**: The Right-Rail dashboard tracks the latency and drift of the underlying LLM models and YOLOv8 diagram services.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Library**: React 18 + TypeScript
- **Styling**: Tailwind CSS v4 (with extensive custom CSS variables mapping the Edexia Design System)
- **Icons**: Lucide React

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the live Teacher Dashboard.
