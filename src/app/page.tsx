"use client";

import React, { useState, useEffect } from "react";
import { ozymorLabHtmlBase64 } from "./OzymorLabHtml";

// Safe Base64 decoding for UTF-8 in both SSR and browser contexts
const decodeBase64 = (str: string): string => {
  try {
    if (typeof window === "undefined") {
      return Buffer.from(str, "base64").toString("utf-8");
    }
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder("utf-8").decode(bytes);
  } catch (e) {
    console.error("Failed to decode Base64 landing page:", e);
    return "";
  }
};

export default function HomePage() {
  const [htmlContent, setHtmlContent] = useState<string>("");

  useEffect(() => {
    setHtmlContent(decodeBase64(ozymorLabHtmlBase64));
  }, []);

  if (!htmlContent) {
    return <div className="w-full min-h-screen bg-black" />;
  }

  return (
    <iframe
      srcDoc={htmlContent}
      className="w-screen h-screen border-none m-0 p-0 block"
      style={{
        border: "none",
        width: "100vw",
        height: "100vh",
        display: "block",
        overflow: "hidden"
      }}
      title="OzymorLab Assessment AI Infrastructure"
    />
  );
}
