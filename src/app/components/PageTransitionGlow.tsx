"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function PageTransitionGlow() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <div key={`bar-${pathname}`} className="glowup-topbar" />
      <div key={`radial-${pathname}`} className="glowup-radial-overlay" />
    </>
  );
}
