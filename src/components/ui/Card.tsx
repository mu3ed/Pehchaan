import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-white border border-[#E3E8EF] rounded-[18px] p-[18px] ${className}`}
    >
      {children}
    </div>
  );
}
