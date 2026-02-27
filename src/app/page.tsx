import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, Download, ArrowRight, Check } from "lucide-react";
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
    features: ["3 icon generations", "1K resolution", "PNG download", "Background removal"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "$4.99",
    period: "one-time",
    description: "For small projects",
    icons: 15,
    features: ["15 icon generations", "1K resolution", "PNG download", "Background removal", "Commercial use"],
    cta: "Buy Starter",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$12.99",
    period: "one-time",
    description: "Best value",
    icons: 50,
    features: ["50 icon generations", "1K resolution", "PNG download", "Background removal", "Commercial use", "Priority generation"],
    cta: "Buy Pro",
    highlighted: true,
  },
  {
    name: "Business",
    price: "$29.99",
    period: "one-time",
    description: "For teams & studios",
    icons: 150,
    features: ["150 icon generations", "1K resolution", "PNG download", "Background removal", "Commercial use", "Priority generation", "Bulk download"],
    cta: "Buy Business",
    highlighted: false,
  },
];

function IconCard({ icon }: { icon: string }) {
  return (
    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 sm:h-28 sm:w-28">
      <Image
        src={`/icons/${encodeURIComponent(icon)}`}
        alt={icon.replace(" Outline 256.png", "")}
        width={64}
        height={64}
        className="pointer-events-none select-none"
      />
    </div>
  );
}

function MarqueeRow({ icons, reverse = false }: { icons: string[]; reverse?: boolean }) {
  // Duplicate enough times to fill the screen and loop seamlessly
  const items = [...icons, ...icons, ...icons, ...icons];
  return (
    <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <div
        className={`flex gap-4 ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
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
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-32 pb-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent" />
        <Badge variant="secondary" className="mb-6 bg-violet-500/10 text-violet-300 border-violet-500/20">
          AI-Powered Icon Generation
        </Badge>
        <h1 className="max-w-3xl text-center text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
          Icons made{" "}
          <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            instantly
          </span>
        </h1>
        <p className="mt-6 max-w-lg text-center text-lg text-zinc-400">
          Describe what you need. Get a clean, custom icon in seconds.
          No design skills required.
        </p>
        <div className="mt-10 flex gap-4">
          <Link href="/generate">
            <Button size="lg" className="bg-violet-600 hover:bg-violet-500 text-white gap-2 px-8">
              Start Generating <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/#pricing">
            <Button size="lg" variant="outline" className="border-white/10 text-white hover:bg-white/5">
              View Pricing
            </Button>
          </Link>
        </div>
      </section>

      {/* Icon Marquee */}
      <section className="py-16 space-y-4">
        <MarqueeRow icons={row1Icons} />
        <MarqueeRow icons={row2Icons} reverse />
      </section>

      {/* Features */}
      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
          {[
            {
              icon: Sparkles,
              title: "AI Generated",
              desc: "Powered by state-of-the-art image generation. Describe any icon you can imagine.",
            },
            {
              icon: Zap,
              title: "Instant Results",
              desc: "Get your icon in seconds, not days. No back-and-forth with designers.",
            },
            {
              icon: Download,
              title: "Clean PNGs",
              desc: "Transparent backgrounds, ready to use. Download and drop into your project.",
            },
          ].map((feature) => (
            <Card key={feature.title} className="border-white/5 bg-white/[0.02]">
              <CardContent className="pt-6">
                <feature.icon className="mb-3 h-8 w-8 text-violet-400" />
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm text-zinc-400">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Simple pricing</h2>
            <p className="mt-3 text-zinc-400">Pay once, generate icons. No subscriptions.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.name}
                className={`relative flex flex-col border-white/5 bg-white/[0.02] ${
                  tier.highlighted ? "border-violet-500/50 ring-1 ring-violet-500/20" : ""
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-violet-600 text-white">Most Popular</Badge>
                  </div>
                )}
                <CardContent className="flex flex-1 flex-col pt-6">
                  <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
                  <p className="text-sm text-zinc-500">{tier.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-white">{tier.price}</span>
                    {tier.period && (
                      <span className="ml-1 text-sm text-zinc-500">{tier.period}</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-zinc-400">{tier.icons} icons</p>
                  <ul className="mt-6 flex-1 space-y-2">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-zinc-300">
                        <Check className="h-4 w-4 shrink-0 text-violet-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/generate" className="mt-6">
                    <Button
                      className={`w-full ${
                        tier.highlighted
                          ? "bg-violet-600 hover:bg-violet-500 text-white"
                          : "bg-white/5 hover:bg-white/10 text-white"
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
      <footer className="border-t border-white/5 px-6 py-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Sparkles className="h-4 w-4 text-violet-400" />
            RoIcons
          </div>
          <p className="text-sm text-zinc-600">Built with AI</p>
        </div>
      </footer>
    </div>
  );
}
