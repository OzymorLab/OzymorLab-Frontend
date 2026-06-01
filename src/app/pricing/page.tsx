import type { Metadata } from "next";
import LandingPage from "../landing/LandingPage";

export const metadata: Metadata = {
  title: "Pricing | AI Essay Grader Pilot Plans | OzymorLab",
  description: "Start your institutional pilot for free. Flexible plans for startups, mid-size schools & enterprise districts. 50 free credits included.",
  openGraph: {
    title: "Pricing | OzymorLab AI Grading Plans",
    description: "Free pilot credits, flexible plans for Indian schools of all sizes. Get started today.",
  },
};

export default function PricingPage() {
  return <LandingPage />;
}
