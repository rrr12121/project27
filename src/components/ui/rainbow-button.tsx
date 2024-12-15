import React from "react";

import { cn } from "../../lib/utils";

interface RainbowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function RainbowButton({ children, ...props }: RainbowButtonProps) {
  return (
    <button
      className={cn(
        "w-full h-11 px-8 py-2 inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 relative group animate-rainbow cursor-pointer border-0 bg-[length:400%] text-primary-foreground [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent]",

        // before styles
        "before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,#ff0000,#ff7f00,#ffff00,#00ff00,#0000ff,#8b00ff,#ff00ff,#ff0000)] before:bg-[length:400%] before:[filter:blur(calc(0.8*1rem))]",

        // light mode colors
        "bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,#ff0000,#ff7f00,#ffff00,#00ff00,#0000ff,#8b00ff,#ff00ff,#ff0000)]",

        // dark mode colors
        "dark:bg-[linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,#ff0000,#ff7f00,#ffff00,#00ff00,#0000ff,#8b00ff,#ff00ff,#ff0000)]",
      )}
      {...props}
    >
      {children}
    </button>
  );
}
