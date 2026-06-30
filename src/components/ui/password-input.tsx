"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

export function PasswordInput({ className, disabled, ...props }: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        disabled={disabled}
        type={visible ? "text" : "password"}
        className={cn(
          "min-h-11 w-full rounded-lg border border-cocoa/20 bg-white px-3 pr-12 text-sm outline-none transition focus:border-cocoa focus:ring-2 focus:ring-cocoa/10 disabled:cursor-not-allowed disabled:opacity-70",
          className
        )}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg text-cocoa/75 transition hover:bg-cocoa/10 hover:text-cocoa disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={visible ? "Ocultar contrasena" : "Mostrar contrasena"}
        aria-pressed={visible}
        disabled={disabled}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
