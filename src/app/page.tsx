"use client";

import React, { useState, useEffect } from "react";
import { ozymorLabHtml } from "./OzymorLabHtml";

export default function HomePage() {
  const [htmlContent, setHtmlContent] = useState<string>("");

  useEffect(() => {
    setHtmlContent(ozymorLabHtml);
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

