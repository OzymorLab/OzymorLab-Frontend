"use client";

import { usePathname } from "next/navigation";
import PageTransitionGlow from "./PageTransitionGlow";

export default function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <PageTransitionGlow />
      <div key={pathname} className="page-transition-wrapper">
        {children}
      </div>
    </>
  );
}
