import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
}

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "px-3 py-1.5 text-sm rounded-md font-medium transition-colors shadow-sm",
        variant === "default" && "bg-indigo-600 text-white hover:bg-indigo-700",
        variant === "outline" && "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700",
        className
      )}
      {...props}
    />
  );
}
