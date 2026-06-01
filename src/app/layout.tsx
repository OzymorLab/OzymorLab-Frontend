import type { Metadata } from "next";
import "./globals.css";
import PageTransitionProvider from "./components/PageTransitionProvider";

// Comprehensive SEO keywords for OzymorLab AI Essay Grader
const ozymorlabSeoKeywords = [
  // Main keywords
  "AI essay grader India",
  "automatic essay grading India",
  "AI grading tool for teachers India",
  "online answer checker India",
  "free essay checker India",
  "rubric based grading tool India",
  "AI assessment tool Indian schools",
  "student answer evaluation AI India",
  "AI marks checker India",
  "essay evaluation software India",
  "AI feedback on answers India",
  "automated grading system India",
  "practice essay grading free India",
  "answer sheet checking AI",
  "AI powered grading platform India",
  "best AI grading tool India 2025",
  "essay grading software free India",
  "online marks checker for students India",
  "CBSE essay grader online",
  "CBSE answer checker free",
  "CBSE Class 10 essay grader",
  "CBSE Class 12 answer evaluation",
  "ICSE essay grader India",
  "ICSE answer checker online",
  "Maharashtra SSC essay grader",
  "UP Board answer checker",
  "Rajasthan Board essay grader",
  "Tamil Nadu Board answer evaluation",
  "Karnataka SSLC essay checker",
  "Kerala Board answer checker online",
  "West Bengal Board essay grader",
  "AP Board answer evaluation AI",
  "Telangana Board essay checker",
  "MP Board answer checker Hindi",
  "Bihar Board essay grader",
  "NIOS answer evaluation online",
  "CBSE marking scheme AI",
  "Hindi essay grader AI online",
  "English essay grader India",
  "biology diagram grader India",
  "chemistry equation checker India",
  "maths step checker India AI",
  "physics derivation checker India",
  "history essay grader CBSE India",
  "geography answer checker India",
  "science answer evaluation India",
  "social science essay grader CBSE",
  "economics answer checker India",
  "political science essay grader India",
  "Sanskrit answer checker India",
  "computer science answer checker India",
  "long answer question checker India",
  "short answer checker India AI",
  "MCQ checker India AI",
  "multilingual essay grader India",
  "Hindi medium student answer grader",
  "Tamil medium answer evaluation",
  "bilingual answer checker India",
  "AI grading tool for teachers India",
  "teacher grading assistant India",
  "student self evaluation AI India",
  "school grading software India",
  "coaching institute grading AI India",
  "private tutor grading tool India",
  "independent teacher grading tool India",
  "home tutor answer checking tool India",
  "board exam student practice tool India",
  "AI answer checker for Class 10 students",
  "AI answer checker for Class 12 students",
  // Educational content keywords
  "how to grade essays faster India",
  "what is rubric based grading India",
  "AI in education India 2025",
  "how to improve essay writing CBSE",
  "best way to practice CBSE board exam answers",
  "CBSE board exam preparation",
  "reduce teacher workload India AI",
  "consistent marking for Indian schools",
  "free tools for Indian students exam prep",
  "Turnitin alternative India",
  "Gradescope alternative India",
  "AI grading accuracy India",
  "school performance analytics India AI",
  "digital assessment tools India",
  "EdTech tools for teachers India 2025",
  "NEP 2020 assessment tool India",
  // Language-specific keywords
  "Hindi nibandh checker online free",
  "Tamil essay grader online",
  "Telugu answer checker AI",
  "Bengali essay grader online",
  "Marathi answer checker online",
  "Gujarati essay grader AI",
  "Kannada answer checker AI",
  "Malayalam essay grader online",
  "Punjabi answer checker AI",
  "Odia essay grader online",
  "Urdu answer evaluation AI India",
  "regional language answer checker India",
  "Devanagari script answer checker AI",
  "mother tongue answer grader India",
  "vernacular language essay checker India",
  "22 languages AI grading",
  // OSM (On-Screen Marking) related keywords
  "OSM CBSE exam",
  "on-screen marking evaluator",
  "OSM answer sheet evaluator",
  "AI OSM evaluator India",
  "on-screen marking checker",
  "OSM grading system India",
  "on-screen marking software",
  "OSM vs traditional marking",
  "on-screen marking vs paper marking",
  "how does OSM marking work",
  "OSM CBSE examination",
  "on-screen marking ICSE",
  "OSM marking scheme",
  "on-screen marking board exam",
  "OSM answer evaluation AI",
  "automated OSM marking",
  "OSM marking reliability",
  "on-screen marking process",
  "OSM examiner tool India",
  "on-screen marking advantages",
  "OSM digital marking system",
  "on-screen marking vs offline marking",
  "how to check OSM answers",
  "OSM marking and evaluation",
  "on-screen marking efficiency",
  "OSM marking speed",
  "digital answer sheet evaluation",
  "computer-based marking India",
  "on-screen marking accuracy",
  "OSM marking benefits",
  "electronic answer sheet evaluation",
  "AI powered OSM evaluation",
  "on-screen marking platform",
  "OSM marking time duration",
  "how to use OSM marking system",
];

export const metadata: Metadata = {
  title: "Free AI Essay Grader India | CBSE ICSE State Boards | OzymorLab - Grade Essays Instantly",
  description: "Grade essays instantly with AI. Supports CBSE, ICSE & all State Boards. Per-criterion scores with evidence. 22 Indian languages. Free 50 credits. Try now.",
  keywords: ozymorlabSeoKeywords,
  openGraph: {
    title: "Free AI Essay Grader India | CBSE ICSE State Boards | OzymorLab",
    description: "Grade student essays in seconds with AI. CBSE, ICSE, State & Open boards. Multilingual support. Get started free.",
    siteName: "OzymorLab",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Essay Grader India | OzymorLab",
    description: "AI-powered essay grading for Indian students and teachers. CBSE, ICSE, all boards.",
  },
  icons: {
    icon: "/icon.svg",
  },
  alternates: {
    canonical: "https://ozymorlab.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD structured data for SEO
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "OzymorLab - AI Essay Grader",
    "description": "AI-powered essay grading platform for Indian schools, CBSE, ICSE, and state boards. Supports 22 Indian languages with per-criterion marking and evidence-backed scores.",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web",
    "softwareVersion": "1.0",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR",
      "description": "Free 50 credits for new users"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250"
    },
    "author": {
      "@type": "Organization",
      "name": "OzymorLab",
      "url": "https://ozymorlab.vercel.app"
    },
    "isPartOf": {
      "@type": "EducationalOrganization",
      "name": "Educational Assessment Platform for India"
    }
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "OzymorLab",
    "url": "https://ozymorlab.vercel.app",
    "logo": "https://ozymorlab.vercel.app/logo.png",
    "description": "AI essay grading platform for Indian schools and students",
    "sameAs": [
      "https://twitter.com/ozymorlab",
      "https://linkedin.com/company/ozymorlab"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "availableLanguage": ["en", "hi", "ta", "te", "ml", "kn", "mr"]
    },
    "areaServed": "IN"
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://ozymorlab.vercel.app" },
      { "@type": "ListItem", "position": 2, "name": "About", "item": "https://ozymorlab.vercel.app/about" },
      { "@type": "ListItem", "position": 3, "name": "Feature", "item": "https://ozymorlab.vercel.app/feature" },
      { "@type": "ListItem", "position": 4, "name": "Pricing", "item": "https://ozymorlab.vercel.app/pricing" },
      { "@type": "ListItem", "position": 5, "name": "Contact", "item": "https://ozymorlab.vercel.app/contact" },
      { "@type": "ListItem", "position": 6, "name": "Blog", "item": "https://ozymorlab.vercel.app/blog" },
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is OzymorLab?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "OzymorLab is an AI-powered essay grading platform designed for Indian schools and educational boards. It uses artificial intelligence to automatically evaluate student essays, short answers, and exam responses with per-criterion scores and evidence-backed feedback."
        }
      },
      {
        "@type": "Question",
        "name": "How does the AI essay grading work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Teachers upload answer scripts or student responses, define rubrics or marking schemes, and OzymorLab's AI evaluates each answer against the criteria. It provides per-criterion scores, confidence levels, and specific evidence from the student's response to justify each grade."
        }
      },
      {
        "@type": "Question",
        "name": "Which Indian education boards are supported?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "OzymorLab supports CBSE, ICSE, and all major Indian state boards including Maharashtra SSC, UP Board, Rajasthan Board, Tamil Nadu Board, Karnataka SSLC, Kerala Board, West Bengal Board, AP Board, Telangana Board, MP Board, Bihar Board, and NIOS."
        }
      },
      {
        "@type": "Question",
        "name": "How many languages does OzymorLab support?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "OzymorLab supports 22 Indian languages including Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, Urdu, Sanskrit, and English. Students can write answers in their mother tongue and get evaluated in the same language."
        }
      },
      {
        "@type": "Question",
        "name": "How accurate is the AI grading?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "OzymorLab's AI achieves high accuracy through rubric grounding — aligning AI scores with precise school rubric constraints. Every grade includes a confidence score, and teachers can review, modify, or override any AI-generated grade. The system is designed for explainability, not black-box evaluation."
        }
      },
      {
        "@type": "Question",
        "name": "Is there a free plan available?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, new users get 50 free credits to try OzymorLab. Institutional pilots are also available for schools and coaching institutes. Contact us for custom pricing for startups, mid-size schools, and enterprise districts."
        }
      },
      {
        "@type": "Question",
        "name": "Does OzymorLab support handwriting recognition?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, OzymorLab includes handwriting OCR support for cursive and printed handwriting, including mathematical equations and scientific diagrams. It transcribes handwritten responses before evaluation."
        }
      },
      {
        "@type": "Question",
        "name": "Can OzymorLab integrate with existing school systems?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, OzymorLab integrates with popular LMS platforms including Canvas and Blackboard. Grades and feedback can be seamlessly published to your existing systems."
        }
      }
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />

        {/* Additional Meta Tags for SEO */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="author" content="OzymorLab" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="ie=edge" />

        {/* Geo Tags for India */}
        <meta name="geo.position" content="20.5937;78.9629" />
        <meta name="ICBM" content="20.5937, 78.9629" />
        <meta name="geo.placename" content="India" />
        <meta name="geo.region" content="IN" />

        {/* Additional OpenGraph for rich snippets */}
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:locale:alternate" content="hi_IN" />
        <meta property="og:locale:alternate" content="ta_IN" />
        <meta property="og:locale:alternate" content="te_IN" />
        <meta property="og:locale:alternate" content="ml_IN" />

        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {typeof window === "undefined" && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  const savedTheme = localStorage.getItem('theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const theme = savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : (prefersDark ? 'dark' : 'light');
                  document.documentElement.classList.add(theme);
                  document.documentElement.setAttribute('data-theme', theme);
                })();
              `
            }}
          />
        )}
      </head>
      <body className="antialiased">
        <PageTransitionProvider>
          {children}
        </PageTransitionProvider>
      </body>
    </html>
  );
}
