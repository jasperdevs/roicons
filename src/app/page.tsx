import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Zap, Download, Wand2 } from "lucide-react";
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
    features: ["3 icon generations", "PNG export", "Background removal", "Auto-resize"],
    cta: "Get Started",
    gradient: "pricing-free",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "$4.99",
    period: "one-time",
    description: "For small projects",
    icons: 15,
    features: ["15 icon generations", "PNG export", "Background removal", "Auto-resize", "Commercial use"],
    cta: "Buy Starter",
    gradient: "pricing-starter",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$12.99",
    period: "one-time",
    description: "Best value",
    icons: 50,
    features: ["50 icon generations", "PNG export", "Background removal", "Auto-resize", "Commercial use", "Priority queue"],
    cta: "Buy Pro",
    gradient: "pricing-pro",
    highlighted: true,
  },
  {
    name: "Business",
    price: "$29.99",
    period: "one-time",
    description: "For teams & studios",
    icons: 150,
    features: ["150 icon generations", "PNG export", "Background removal", "Auto-resize", "Commercial use", "Priority queue", "Bulk export"],
    cta: "Buy Business",
    gradient: "pricing-business",
    highlighted: false,
  },
];

function IconCard({ icon }: { icon: string }) {
  return (
    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[#232527] p-3 sm:h-24 sm:w-24">
      <Image
        src={`/icons/${encodeURIComponent(icon)}`}
        alt={icon.replace(" Outline 256.png", "")}
        width={56}
        height={56}
        className="pointer-events-none select-none"
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
    <div className="min-h-screen bg-[#191b20] text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-32 pb-10 overflow-hidden">
        {/* Subtle glow behind hero */}
        <div className="pointer-events-none absolute top-20 left-1/2 -translate-x-1/2 h-[400px] w-[600px] rounded-full bg-[#2f53f7]/10 blur-[120px]" />

        <h1 className="relative max-w-3xl text-center text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          Generate icons{" "}
          <span className="text-[#2f53f7]">instantly</span>
        </h1>
        <p className="relative mt-5 max-w-lg text-center text-base text-[#8b8d91] leading-relaxed">
          Describe what you need, get a clean icon in seconds. Background removed, perfectly sized, ready to use.
        </p>
        <div className="relative mt-8 flex gap-3">
          <Link href="/generate">
            <Button size="lg" className="bg-[#2f53f7] hover:bg-[#2545d4] text-white text-sm px-7 h-11 rounded-lg gap-2">
              Start Generating <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/#pricing">
            <Button size="lg" variant="outline" className="border-[#2e3135] text-[#8b8d91] hover:bg-[#232527] hover:text-white text-sm h-11 rounded-lg">
              View Pricing
            </Button>
          </Link>
        </div>
      </section>

      {/* Icon Marquee */}
      <section className="py-14 space-y-3">
        <MarqueeRow icons={row1Icons} />
        <MarqueeRow icons={row2Icons} reverse />
      </section>

      {/* Features */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold mb-10">How it works</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Wand2,
                title: "Describe it",
                desc: "Type what you want. A golden sword, a blue potion, a pixel heart. The AI handles the rest.",
              },
              {
                icon: Zap,
                title: "Generate it",
                desc: "Your icon is generated in seconds. Background is automatically removed and the icon is perfectly sized.",
              },
              {
                icon: Download,
                title: "Download it",
                desc: "Get a clean transparent PNG ready to drop into your game, app, or project. That simple.",
              },
            ].map((feature) => (
              <div key={feature.title} className="rounded-xl bg-[#232527] p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#2f53f7]/10">
                  <feature.icon className="h-5 w-5 text-[#2f53f7]" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1.5">{feature.title}</h3>
                <p className="text-sm text-[#8b8d91] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Simple Pricing</h2>
            <p className="mt-2 text-sm text-[#8b8d91]">Pay once, generate icons. No subscriptions.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`${tier.gradient} relative flex flex-col rounded-xl bg-[#232527] p-5 transition-all duration-300 cursor-pointer ${
                  tier.highlighted ? "ring-2 ring-[#2f53f7]" : ""
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-[#2f53f7] px-3 py-1 text-xs font-semibold text-white">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-base font-semibold text-white">{tier.name}</h3>
                <p className="text-xs text-[#8b8d91]">{tier.description}</p>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-white">{tier.price}</span>
                  {tier.period && (
                    <span className="ml-1 text-xs text-[#8b8d91]">{tier.period}</span>
                  )}
                </div>
                <p className="mt-1 text-xs text-[#8b8d91]">{tier.icons} icons included</p>
                <ul className="mt-5 flex-1 space-y-2">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-[#bbbdc0]">
                      <Check className="h-3.5 w-3.5 shrink-0 text-[#2f53f7]" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/generate" className="mt-6">
                  <Button
                    className={`w-full rounded-lg h-9 text-sm ${
                      tier.highlighted
                        ? "bg-[#2f53f7] hover:bg-[#2545d4] text-white"
                        : "bg-white/10 hover:bg-white/15 text-white"
                    }`}
                  >
                    {tier.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2e3135] px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="text-sm font-semibold text-[#8b8d91]">RoIcons</span>
          <p className="text-xs text-[#555]">AI-powered icon generation</p>
        </div>
      </footer>
    </div>
  );
}
