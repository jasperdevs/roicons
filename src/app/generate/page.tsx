"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles,
  Download,
  Loader2,
  Eraser,
  ImageIcon,
  Minus,
  Plus,
  Square,
  RectangleHorizontal,
  RectangleVertical,
} from "lucide-react";

type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

const aspectRatios: { value: AspectRatio; label: string; icon: typeof Square }[] = [
  { value: "1:1", label: "1:1", icon: Square },
  { value: "16:9", label: "16:9", icon: RectangleHorizontal },
  { value: "9:16", label: "9:16", icon: RectangleVertical },
  { value: "4:3", label: "4:3", icon: RectangleHorizontal },
  { value: "3:4", label: "3:4", icon: RectangleVertical },
];

type GeneratedIcon = {
  id: string;
  originalUrl: string;
  cleanUrl: string | null;
  status: "generating" | "removing-bg" | "done" | "error";
};

type GenerationGroup = {
  id: string;
  prompt: string;
  timestamp: Date;
  aspectRatio: AspectRatio;
  removeBg: boolean;
  icons: GeneratedIcon[];
};

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [numImages, setNumImages] = useState(1);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [removeBg, setRemoveBg] = useState(true);
  const [groups, setGroups] = useState<GenerationGroup[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (feedRef.current && groups.length > 0) {
      feedRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [groups.length]);

  async function generateSingleIcon(
    groupId: string,
    iconId: string,
    promptText: string,
    ratio: AspectRatio,
    shouldRemoveBg: boolean
  ) {
    try {
      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText, aspectRatio: ratio }),
      });

      if (!genRes.ok) throw new Error("Generation failed");
      const genData = await genRes.json();

      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? {
                ...g,
                icons: g.icons.map((icon) =>
                  icon.id === iconId
                    ? {
                        ...icon,
                        originalUrl: genData.imageUrl,
                        status: shouldRemoveBg ? "removing-bg" : "done",
                      }
                    : icon
                ),
              }
            : g
        )
      );

      if (shouldRemoveBg) {
        const bgRes = await fetch("/api/remove-bg", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: genData.imageUrl }),
        });

        if (bgRes.ok) {
          const bgData = await bgRes.json();
          setGroups((prev) =>
            prev.map((g) =>
              g.id === groupId
                ? {
                    ...g,
                    icons: g.icons.map((icon) =>
                      icon.id === iconId
                        ? { ...icon, cleanUrl: bgData.imageUrl, status: "done" }
                        : icon
                    ),
                  }
                : g
            )
          );
        } else {
          setGroups((prev) =>
            prev.map((g) =>
              g.id === groupId
                ? {
                    ...g,
                    icons: g.icons.map((icon) =>
                      icon.id === iconId ? { ...icon, status: "done" } : icon
                    ),
                  }
                : g
            )
          );
        }
      }
    } catch {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? {
                ...g,
                icons: g.icons.map((icon) =>
                  icon.id === iconId ? { ...icon, status: "error" } : icon
                ),
              }
            : g
        )
      );
    }
  }

  async function handleGenerate() {
    if (!prompt.trim() || isGenerating) return;

    const groupId = Date.now().toString();
    const icons: GeneratedIcon[] = Array.from({ length: numImages }, (_, i) => ({
      id: `${groupId}-${i}`,
      originalUrl: "",
      cleanUrl: null,
      status: "generating" as const,
    }));

    const newGroup: GenerationGroup = {
      id: groupId,
      prompt: prompt.trim(),
      timestamp: new Date(),
      aspectRatio,
      removeBg,
      icons,
    };

    setGroups((prev) => [newGroup, ...prev]);
    setIsGenerating(true);

    await Promise.all(
      icons.map((icon) =>
        generateSingleIcon(groupId, icon.id, prompt.trim(), aspectRatio, removeBg)
      )
    );

    setIsGenerating(false);
  }

  async function handleDownload(url: string, filename: string) {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${filename}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, "_blank");
    }
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="flex w-72 shrink-0 flex-col border-r border-white/[0.06] bg-[#0f0f0f]">
        {/* Logo */}
        <div className="flex h-14 items-center gap-2 border-b border-white/[0.06] px-5">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-400" />
            <span className="text-sm font-semibold text-white">RoIcons</span>
          </Link>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto p-5">
          {/* Number of images */}
          <div className="mb-5">
            <label className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Images
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setNumImages(Math.max(1, numImages - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-6 text-center text-sm font-medium tabular-nums">{numImages}</span>
              <button
                onClick={() => setNumImages(Math.min(4, numImages + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="mb-5">
            <label className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Aspect Ratio
            </label>
            <div className="flex gap-1.5">
              {aspectRatios.map((ar) => (
                <button
                  key={ar.value}
                  onClick={() => setAspectRatio(ar.value)}
                  className={`flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs transition-all ${
                    aspectRatio === ar.value
                      ? "border-violet-500/50 bg-violet-500/10 text-violet-300"
                      : "border-white/10 text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                  }`}
                >
                  <ar.icon className="h-3 w-3" />
                  {ar.label}
                </button>
              ))}
            </div>
          </div>

          {/* Resolution */}
          <div className="mb-5">
            <label className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Resolution
            </label>
            <div className="flex h-8 items-center rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-zinc-300">
              1K
            </div>
          </div>

          {/* Remove BG toggle */}
          <div className="mb-5">
            <label className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Background
            </label>
            <button
              onClick={() => setRemoveBg(!removeBg)}
              className={`flex h-8 items-center gap-2 rounded-lg border px-3 text-xs transition-all ${
                removeBg
                  ? "border-violet-500/50 bg-violet-500/10 text-violet-300"
                  : "border-white/10 text-zinc-500 hover:bg-white/5"
              }`}
            >
              <Eraser className="h-3 w-3" />
              Remove BG {removeBg ? "ON" : "OFF"}
            </button>
          </div>

          <Separator className="my-3 bg-white/[0.06]" />

          {/* Prompt */}
          <div className="mb-4 flex-1">
            <label className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Prompt
            </label>
            <Textarea
              placeholder="Describe your icon..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              className="min-h-[120px] resize-none rounded-xl border-white/10 bg-white/[0.03] text-sm text-white placeholder:text-zinc-600 focus-visible:ring-violet-500/50"
            />
            {/* Quick suggestions */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["Sword", "Shield", "Potion", "Crown", "Gem"].map((s) => (
                <button
                  key={s}
                  onClick={() => setPrompt((p) => (p ? `${p}, ${s.toLowerCase()}` : s.toLowerCase()))}
                  className="rounded-md border border-white/[0.06] px-2 py-0.5 text-[10px] text-zinc-500 transition-colors hover:border-violet-500/30 hover:text-violet-300"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate button - pinned to bottom */}
        <div className="border-t border-white/[0.06] p-4">
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white gap-2 h-10"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Generate
          </Button>
        </div>
      </aside>

      {/* Main feed */}
      <main ref={feedRef} className="flex-1 overflow-y-auto">
        {groups.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-zinc-600">
            <ImageIcon className="mb-4 h-16 w-16 opacity-30" />
            <p className="text-lg font-medium">No icons yet</p>
            <p className="mt-1 text-sm text-zinc-700">Write a prompt and hit Generate</p>
          </div>
        ) : (
          <div className="p-6 space-y-8">
            {groups.map((group) => (
              <div key={group.id}>
                {/* Group header */}
                <div className="mb-3 flex items-center gap-3">
                  <p className="flex-1 truncate text-sm text-zinc-300">{group.prompt}</p>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="secondary" className="bg-white/5 text-zinc-500 text-[10px] border-0">
                      {group.aspectRatio}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/5 text-zinc-500 text-[10px] border-0">
                      1K
                    </Badge>
                    {group.removeBg && (
                      <Badge variant="secondary" className="bg-violet-500/10 text-violet-400 text-[10px] border-0">
                        BG Removed
                      </Badge>
                    )}
                    <span className="text-[10px] text-zinc-600">
                      {group.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>

                {/* Icons grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {group.icons.map((icon) => (
                    <div
                      key={icon.id}
                      className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]"
                    >
                      <div className="relative aspect-square">
                        {/* Checkerboard */}
                        <div
                          className="absolute inset-0 rounded-t-xl"
                          style={{
                            backgroundImage:
                              "repeating-conic-gradient(#161616 0% 25%, #111 0% 50%)",
                            backgroundSize: "16px 16px",
                          }}
                        />

                        {icon.status === "generating" && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
                            <span className="text-[10px] text-zinc-500">Generating...</span>
                          </div>
                        )}

                        {icon.status === "removing-bg" && (
                          <>
                            {icon.originalUrl && (
                              <Image
                                src={icon.originalUrl}
                                alt="generating"
                                fill
                                className="object-contain p-3 opacity-40"
                                unoptimized
                              />
                            )}
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40">
                              <Eraser className="h-5 w-5 animate-pulse text-violet-400" />
                              <span className="text-[10px] text-zinc-500">Removing BG...</span>
                            </div>
                          </>
                        )}

                        {icon.status === "done" && (
                          <>
                            <Image
                              src={icon.cleanUrl || icon.originalUrl}
                              alt={group.prompt}
                              fill
                              className="object-contain p-3"
                              unoptimized
                            />
                            {/* Hover overlay */}
                            <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                              <button
                                onClick={() =>
                                  handleDownload(
                                    icon.cleanUrl || icon.originalUrl,
                                    `${group.prompt.replace(/\s+/g, "-").toLowerCase()}-${icon.id}`
                                  )
                                }
                                className="mb-3 flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                              >
                                <Download className="h-3 w-3" />
                                Download
                              </button>
                            </div>
                          </>
                        )}

                        {icon.status === "error" && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs text-red-400">Failed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
