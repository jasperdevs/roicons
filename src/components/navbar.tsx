"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-400" />
          <span className="text-lg font-semibold text-white">RoIcons</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Pricing
          </Link>
          <Link href="/generate">
            <Button size="sm" className="bg-violet-600 hover:bg-violet-500 text-white">
              Generate
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
