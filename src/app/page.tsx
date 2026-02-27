import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Navbar } from "@/components/navbar";

const row1Icons = [
  "Rocket Outline 256.png",
  "Parachute Blue Outline 256.png",
  "Beam Sword Orange Outline 256.png",
  "Knife Obsidian Outline 256.png",
  "Location Pin Yellow Outline 256.png",
  "Banhammer Outline 256.png",
];

const row2Icons = [
  "Arrow Right Outline 256.png",
  "Club Outline 256.png",
  "Connection Bars High Outline 256.png",
  "Phone Battery Full 2 Outline 256.png",
  "Undo Outline 256.png",
  "Trademark Sign Outline 256.png",
  "0 Outline 256.png",
  "Phone Battery Low Outline 256.png",
  "Phone Battery Medium Outline 256.png",
];

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "Try it out",
    icons: 3,
    features: ["3 generations", "1K resolution", "PNG export", "BG removal"],
    cta: "start",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "$4.99",
    period: "one-time",
    description: "For small projects",
    icons: 15,
    features: ["15 generations", "1K resolution", "PNG export", "BG removal", "Commercial use"],
    cta: "buy starter",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$12.99",
    period: "one-time",
    description: "Best value",
    icons: 50,
    features: ["50 generations", "1K resolution", "PNG export", "BG removal", "Commercial use", "Priority queue"],
    cta: "buy pro",
    highlighted: true,
  },
  {
    name: "Business",
    price: "$29.99",
    period: "one-time",
    description: "For teams",
    icons: 150,
    features: ["150 generations", "1K resolution", "PNG export", "BG removal", "Commercial use", "Priority queue", "Bulk export"],
    cta: "buy business",
    highlighted: false,
  },
];

function IconCard({ icon }: { icon: string }) {
  return (
    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 sm:h-24 sm:w-24">
      <Image
        src={`/icons/${encodeURIComponent(icon)}`}
        alt={icon.replace(" Outline 256.png", "")}
        width={56}
        height={56}
        className="pointer-events-none select-none opacity-80"
      />
    </div>
  );
}

function MarqueeRow({ icons, reverse = false }: { icons: string[]; reverse?: boolean }) {
  const items = [...icons, ...icons, ...icons, ...icons];
  return (
    <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div
        className={`flex gap-3 ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
        style={{ width: "max-content" }}
      >
        {items.map((icon, i) => (
          <IconCard key={`${icon}-${i}`} icon={icon} />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20">
      <Navbar />

      {/* Dither noise overlay for the hero area */}
      <div className="relative">
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: "128px 128px",
          }}
        />

        {/* Hero */}
        <section className="relative z-10 flex flex-col items-center justify-center px-6 pt-32 pb-8">
          {/* ASCII decoration */}
          <pre className="mb-6 font-mono text-[10px] leading-tight text-zinc-700 select-none hidden sm:block">
{`    ┌─────────────────────────────┐
    │  ██▀█▀██  icon generation  │
    └─────────────────────────────┘`}
          </pre>

          <h1 className="max-w-2xl text-center font-mono text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            icons on{" "}
            <span className="text-zinc-500">demand</span>
          </h1>

          <p className="mt-5 max-w-md text-center font-mono text-sm text-zinc-600 leading-relaxed">
            describe it. generate it. download it.<br />
            no designer needed. no waiting.
          </p>

          <div className="mt-8 flex gap-3">
            <Link href="/generate">
              <Button size="lg" className="bg-white text-black hover:bg-zinc-200 font-mono text-xs px-8 h-10">
                generate {"->"}
              </Button>
            </Link>
            <Link href="/#pricing">
              <Button size="lg" variant="outline" className="border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white font-mono text-xs h-10">
                pricing
              </Button>
            </Link>
          </div>

          {/* Terminal-style info */}
          <div className="mt-8 font-mono text-[10px] text-zinc-700">
            <span className="text-zinc-500">$</span> roicons --model nano-banana-pro --res 1k --bg-remove
          </div>
        </section>

        {/* Icon Marquee */}
        <section className="relative z-10 py-12 space-y-3">
          <MarqueeRow icons={row1Icons} />
          <MarqueeRow icons={row2Icons} reverse />
        </section>
      </div>

      {/* Features - ASCII style */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="grid gap-px sm:grid-cols-3 border border-white/[0.06] rounded-lg overflow-hidden">
            {[
              { title: "generate", desc: "AI-powered. Describe any icon. Get results in seconds." },
              { title: "clean", desc: "Auto background removal. Transparent PNGs, ready to ship." },
              { title: "resize", desc: "Auto-cropped and fitted. Perfectly sized, no stretching." },
            ].map((feature) => (
              <div key={feature.title} className="bg-white/[0.02] p-6">
                <h3 className="font-mono text-xs font-bold text-white mb-2">{`> ${feature.title}`}</h3>
                <p className="font-mono text-[11px] text-zinc-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <h2 className="font-mono text-2xl font-bold sm:text-3xl">pricing</h2>
            <p className="mt-2 font-mono text-xs text-zinc-600">pay once. no subscriptions. no bs.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.name}
                className={`relative flex flex-col border-white/[0.06] bg-white/[0.02] ${
                  tier.highlighted ? "border-white/20 ring-1 ring-white/10" : ""
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-white px-3 py-0.5 font-mono text-[10px] font-bold text-black">
                      popular
                    </span>
                  </div>
                )}
                <CardContent className="flex flex-1 flex-col pt-5">
                  <h3 className="font-mono text-xs font-bold text-white">{tier.name}</h3>
                  <p className="font-mono text-[10px] text-zinc-600">{tier.description}</p>
                  <div className="mt-3">
                    <span className="font-mono text-3xl font-bold text-white">{tier.price}</span>
                    {tier.period && (
                      <span className="ml-1 font-mono text-[10px] text-zinc-600">{tier.period}</span>
                    )}
                  </div>
                  <p className="mt-0.5 font-mono text-[10px] text-zinc-500">{tier.icons} icons</p>
                  <ul className="mt-4 flex-1 space-y-1.5">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 font-mono text-[10px] text-zinc-400">
                        <Check className="h-3 w-3 shrink-0 text-zinc-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/generate" className="mt-5">
                    <Button
                      className={`w-full font-mono text-[10px] h-8 ${
                        tier.highlighted
                          ? "bg-white text-black hover:bg-zinc-200"
                          : "bg-white/5 hover:bg-white/10 text-zinc-300"
                      }`}
                    >
                      {tier.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="font-mono text-[10px] text-zinc-700">RoIcons</span>
          <span className="font-mono text-[10px] text-zinc-800">built different</span>
        </div>
      </footer>
    </div>
  );
}
