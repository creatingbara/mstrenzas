import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-28 w-full rounded-lg border border-cocoa/20 bg-white px-3 py-3 text-sm outline-none transition focus:border-cocoa focus:ring-2 focus:ring-cocoa/10",
        props.className
      )}
    />
  );
}
