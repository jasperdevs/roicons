"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/[0.06] bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-mono text-sm font-bold tracking-tight text-white">
          RoIcons
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/#pricing" className="font-mono text-xs text-zinc-500 hover:text-white transition-colors">
            pricing
          </Link>
          <Link href="/generate">
            <Button size="sm" className="bg-white text-black hover:bg-zinc-200 font-mono text-xs h-8">
              generate
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
