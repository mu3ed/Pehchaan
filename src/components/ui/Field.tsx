import { InputHTMLAttributes, forwardRef } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, className = "", ...props }, ref) => {
    return (
      <div
        className={`border-[1.5px] border-[#E3E8EF] rounded-[14px] bg-white px-4 py-3
          focus-within:border-[#1C6B66] focus-within:shadow-[0_0_0_4px_#E7F1F0]
          transition-all ${className}`}
      >
        <label className="block text-[11px] font-bold tracking-wider uppercase text-[#6B7686] mb-1">
          {label}
        </label>
        <input
          ref={ref}
          className="w-full border-none outline-none bg-transparent text-[17px] font-semibold text-[#131A23] tracking-tight"
          {...props}
        />
      </div>
    );
  }
);

Field.displayName = "Field";
export { Field };
