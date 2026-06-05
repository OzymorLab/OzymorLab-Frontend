import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "OSM (On-Screen Marking) & AI Answer Sheet Evaluator | CBSE ICSE | OzymorLab",
    description: "Learn about OSM (On-Screen Marking) for CBSE, ICSE & State Boards. Understand how AI answer sheet evaluators help practice OSM exams. 83% accuracy. 22 languages.",
    keywords: [
        "OSM CBSE exam",
        "on-screen marking evaluator",
        "OSM answer sheet evaluator",
        "AI OSM evaluator India",
        "on-screen marking checker",
        "OSM grading system",
        "OSM vs traditional marking",
        "on-screen marking vs paper marking",
        "how does OSM marking work",
        "CBSE on-screen marking",
        "OSM marking scheme",
        "AI answer sheet evaluation",
        "OSM marking reliability",
        "digital answer sheet evaluation",
        "computer-based marking India",
    ],
    openGraph: {
        title: "OSM (On-Screen Marking) Explained | AI Answer Sheet Evaluator | OzymorLab",
        description: "Complete guide to OSM marking for Indian board exams. Learn how AI evaluation helps you practice for CBSE, ICSE, and state board exams.",
        type: "article",
        locale: "en_IN",
    },
    twitter: {
        card: "summary_large_image",
        title: "OSM Evaluator - Practice with AI for Board Exams",
        description: "Understand On-Screen Marking and practice with AI. Get exam-ready for CBSE, ICSE, and state boards.",
    },
};

export default function OSMLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
