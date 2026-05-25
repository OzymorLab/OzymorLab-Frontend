"use client";

import React from "react";
import Link from "next/link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "neon" | "dark" | "outline" | "ghost";
  href?: string;
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "dark",
  href,
  children,
  className = "",
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 px-5 py-3 text-[13px] font-bold rounded-xl transition-all duration-200 cursor-pointer select-none active:scale-[0.98]";
  
  const variants = {
    neon: "bg-[#e3ff8f] text-[#1f2223] border border-solid border-[#cbeb59] shadow-[0_4px_12px_rgba(227,255,143,0.3)] hover:shadow-[0_6px_18px_rgba(227,255,143,0.5)] hover:bg-[#d6ff5c] hover:translate-y-[-1px] active:translate-y-0",
    dark: "bg-[#1f2223] text-white hover:bg-[#2e3133] hover:translate-y-[-1px] active:translate-y-0 shadow-sm",
    outline: "bg-transparent text-[#1f2223] border border-solid border-[#e5e6e6] hover:bg-[#f2f3f3] hover:border-[#d2d3d3] hover:translate-y-[-1px] active:translate-y-0",
    ghost: "bg-transparent text-[#5f5e5a] hover:bg-[#f2f3f3] hover:text-[#1f2223]",
  };

  const combinedClassName = `${baseStyles} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
};
