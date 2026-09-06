import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "game";
  color?: string;
  edgeColor?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", color, edgeColor, className = "", children, ...props }, ref) => {
    if (variant === "game") {
      return (
        <button
          ref={ref}
          className={`rounded-[22px] text-white font-extrabold tracking-tight
            transition-transform duration-[80ms] ease-[cubic-bezier(.3,.8,.4,1)]
            active:translate-y-[5px] active:shadow-[0_1px_0_var(--edge,#D95A15)]
            ${className}`}
          style={{
            background: color || "var(--orange, #FF7A2F)",
            boxShadow: `0 6px 0 ${edgeColor || "var(--orange-d, #D95A15)"}`,
            ["--edge" as string]: edgeColor || "#D95A15",
          }}
          {...props}
        >
          {children}
        </button>
      );
    }

    if (variant === "secondary") {
      return (
        <button
          ref={ref}
          className={`inline-flex items-center justify-center gap-2 min-h-[46px] rounded-[15px]
            bg-white border-[1.5px] border-[#C8DAD8] px-5 py-2 text-[#1C6B66] text-[14.5px] font-semibold leading-tight
            transition-all hover:bg-[#F6FBFA] active:scale-[.975] active:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C6B66]
            ${className}`}
          {...props}
        >
          {children}
        </button>
      );
    }

    if (variant === "ghost") {
      return (
        <button
          ref={ref}
          className={`inline-flex items-center justify-center gap-2 min-h-[46px] rounded-[15px]
            bg-transparent border-[1.5px] border-[#E3E8EF] px-5 py-2 text-[#1C6B66] text-[14.5px] font-semibold leading-tight
            transition-all hover:bg-white active:scale-[.975] active:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C6B66]
            ${className}`}
          {...props}
        >
          {children}
        </button>
      );
    }

    // primary
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 w-full min-h-[56px] rounded-[15px]
          bg-[#1C6B66] px-6 py-3 text-white text-[16px] font-semibold leading-tight tracking-wide
          shadow-[0_6px_18px_-8px_rgba(28,107,102,.75)]
          transition-all hover:bg-[#155C58] active:scale-[.975] active:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C6B66]
          ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
