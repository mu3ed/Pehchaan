import { HTMLAttributes } from "react";

interface UrduTextProps extends HTMLAttributes<HTMLSpanElement> {
  size?: "sm" | "md" | "lg" | "xl" | "glyph";
}

export function UrduText({ size = "md", className = "", children, ...props }: UrduTextProps) {
  const sizeClasses = {
    sm: "text-[14px]",
    md: "text-[17px]",
    lg: "text-[22px]",
    xl: "text-[26px]",
    glyph: "text-[72px] leading-[2.6] -translate-y-[0.39em]",
  };

  return (
    <span className={`ur ${sizeClasses[size]} ${className}`} {...props}>
      {children}
    </span>
  );
}
