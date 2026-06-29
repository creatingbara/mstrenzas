import * as React from "react";
import { cn } from "@/lib/utils";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "min-h-11 w-full rounded-lg border border-cocoa/20 bg-white px-3 text-sm outline-none transition focus:border-cocoa focus:ring-2 focus:ring-cocoa/10",
        props.className
      )}
    />
  );
}
