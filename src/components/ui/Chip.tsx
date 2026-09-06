import { ReactNode } from "react";

interface ChipProps {
  children: ReactNode;
  bg?: string;
  color?: string;
  className?: string;
}

export function Chip({ children, bg = "#E7F1F0", color = "#1C6B66", className = "" }: ChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold tracking-wide ${className}`}
      style={{ background: bg, color }}
    >
      {children}
    </span>
  );
}
