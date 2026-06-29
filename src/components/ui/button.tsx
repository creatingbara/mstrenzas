import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline";
};

export function buttonStyles({ className, variant = "primary" }: { className?: string; variant?: ButtonProps["variant"] } = {}) {
  return cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cocoa/40 disabled:pointer-events-none disabled:opacity-50",
    variant === "primary" && "bg-cocoa text-white shadow-soft hover:bg-plum",
    variant === "secondary" && "bg-gold text-ink hover:bg-nude",
    variant === "outline" && "border border-cocoa/25 bg-white text-ink hover:border-cocoa hover:bg-cream",
    variant === "ghost" && "bg-transparent text-ink hover:bg-cream",
    className
  );
}

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={buttonStyles({ className, variant })}
      {...props}
    />
  );
}
