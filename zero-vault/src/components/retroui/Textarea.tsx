import React, { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    className?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
    placeholder = "Enter text...",
    className = "",
    ...props
}) => {
    return (
        <textarea
            placeholder={placeholder}
            className={`px-4 py-2 w-full border-2 shadow-md transition focus:outline-hidden focus:shadow-xs min-h-[100px] resize-y ${props["aria-invalid"]
                    ? "border-destructive text-destructive shadow-xs shadow-destructive"
                    : ""
                } ${className}`}
            {...props}
        />
    );
};
