import type { Metadata } from "next";
import LandingPage from "../landing/LandingPage";

export const metadata: Metadata = {
  title: "About OzymorLab | AI Essay Grading for Indian Education Boards",
  description: "Learn how OzymorLab uses AI to grade essays for CBSE, ICSE & state boards. Supporting 22 Indian languages with per-criterion scoring.",
  openGraph: {
    title: "About OzymorLab | AI Essay Grader for Indian Schools",
    description: "AI-powered essay grading built for Indian education boards. Multilingual, rubric-based, evidence-backed scores.",
  },
};

export default function AboutPage() {
  return <LandingPage />;
}
