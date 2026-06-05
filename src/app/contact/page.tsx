import type { Metadata } from "next";
import LandingPage from "../landing/LandingPage";

export const metadata: Metadata = {
  title: "Contact Us | AI Essay Grader for Schools | OzymorLab",
  description: "Get in touch with OzymorLab for demo requests, pilot inquiries & support. We serve CBSE, ICSE & state board institutions.",
  openGraph: {
    title: "Contact OzymorLab | AI Essay Grading Platform",
    description: "Request a demo or start your free institutional pilot today.",
  },
};

export default function ContactPage() {
  return <LandingPage />;
}
