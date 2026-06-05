import type { Metadata } from "next";
import LandingPage from "../landing/LandingPage";

export const metadata: Metadata = {
  title: "Features | AI Essay Grader for CBSE ICSE State Boards | OzymorLab",
  description: "Rubric ingestion, AI customization, handwriting OCR, explainable moderation & LMS integration. See how OzymorLab transforms grading.",
  openGraph: {
    title: "Features | OzymorLab AI Essay Grading Platform",
    description: "Rubric-based grading, handwriting OCR, multilingual support & LMS integration for Indian schools.",
  },
};

export default function FeaturePage() {
  return <LandingPage />;
}
