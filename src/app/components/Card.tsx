"use client";

import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "white" | "gray" | "dark";
  hoverable?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  variant = "white",
  hoverable = true,
  children,
  className = "",
  ...props
}) => {
  const baseStyles = "p-6 rounded-2xl border border-solid transition-all duration-300 overflow-hidden";
  
  const variants = {
    white: "bg-white border-[#e5e6e6] text-[#1f2223] shadow-[0_1px_3px_rgba(0,0,0,0.02)]",
    gray: "bg-[#f9fafa] border-[#e5e6e6] text-[#1f2223] shadow-inner",
    dark: "bg-[#1f2223] border-[#2e3133] text-white shadow-xl",
  };

  const hoverStyles = hoverable
    ? "hover:translate-y-[-4px] hover:shadow-[0_12px_24px_rgba(0,0,0,0.04)] hover:border-[#d2d3d3]"
    : "";

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
