"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-[#2e3135] bg-[#191b20]/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-base font-bold text-white tracking-tight">
          RoIcons
        </Link>
        <div className="flex items-center gap-5">
          <Link href="/#pricing" className="text-sm text-[#8b8d91] hover:text-white transition-colors">
            Pricing
          </Link>
          <Link href="/generate">
            <Button size="sm" className="bg-[#2f53f7] hover:bg-[#2545d4] text-white text-sm h-9 px-5 rounded-lg">
              Generate
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
