import React, { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  rightElement?: ReactNode;
}

export const Input: React.FC<InputProps> = ({
  type = "text",
  placeholder = "Enter text",
  className = "",
  rightElement,
  ...props
}) => {
  return (
    <div className="relative w-full">
      <input
        type={type}
        placeholder={placeholder}
        className={`px-4 py-2 w-full border-2 shadow-md transition focus:outline-hidden focus:shadow-sm ${props["aria-invalid"]
          ? "border-destructive text-destructive shadow-sm shadow-destructive"
          : "border-black"
          } ${rightElement ? "pr-12" : ""} ${className}`}
        {...props}
      />
      {rightElement && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {rightElement}
        </div>
      )}
    </div>
  );
};
