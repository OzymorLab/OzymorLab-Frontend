import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import PageTransitionProvider from "./components/PageTransitionProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

const seoMetaTags = Array.from({ length: 160 }, (_, index) => {
  const phrases = [
    "AI grading software",
    "India board grading software",
    "CBSE answer sheet evaluation",
    "ICSE exam evaluation platform",
    "state board grading automation",
    "school assessment analytics",
    "teacher evaluation workflow",
    "rubric based AI grading",
    "multimodal answer checking",
    "OzymorLab exam automation",
    "AI marks moderation",
    "classroom assignment grading",
    "student performance analytics",
    "board exam evaluation software",
    "school admin grading dashboard",
    "automated answer sheet review",
  ];
  const phrase = phrases[index % phrases.length];
  return {
    name: `ozymorlab:seo:${index + 1}`,
    content: `${phrase} for Indian schools, coaching institutes, teachers, principals, and academic operations teams`,
  };
});

export const metadata: Metadata = {
  title: "OzymorLab | AI Grading Software | India's Board Grading Software | CBSE, ICSE & State Board Exam Evaluation",
  description: "OzymorLab is AI grading software for Indian schools, CBSE, ICSE, and state boards with answer sheet evaluation, rubric workflows, analytics, and classroom administration.",
  keywords: [
    "OzymorLab",
    "AI grading software",
    "India board grading software",
    "CBSE grading software",
    "ICSE grading software",
    "state board exam evaluation",
    "AI answer sheet checking",
    "school assessment platform",
    "rubric based grading",
    "teacher evaluation dashboard",
  ],
  openGraph: {
    title: "OzymorLab | AI Grading Software for Indian Board Exams",
    description: "AI-powered grading, classroom assignments, evaluation workflows, and analytics for schools and boards in India.",
    siteName: "OzymorLab",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OzymorLab | AI Grading Software",
    description: "AI grading and board exam evaluation software for Indian schools.",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {seoMetaTags.map((tag) => (
          <meta key={tag.name} name={tag.name} content={tag.content} />
        ))}
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
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <PageTransitionProvider>
          {children}
        </PageTransitionProvider>
      </body>
    </html>
  );
}
