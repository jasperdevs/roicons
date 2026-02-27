"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  Loader2,
  Eraser,
  ImageIcon,
  Minus,
  Plus,
  X,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type GeneratedIcon = {
  id: string;
  originalUrl: string;
  cleanUrl: string | null;
  croppedUrl: string | null;
  status: "generating" | "removing-bg" | "cropping" | "done" | "error";
};

type GenerationGroup = {
  id: string;
  prompt: string;
  timestamp: Date;
  removeBg: boolean;
  icons: GeneratedIcon[];
};

type ViewerState = {
  groupId: string;
  iconIndex: number;
} | null;

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [numImages, setNumImages] = useState(1);
  const [removeBg, setRemoveBg] = useState(true);
  const [groups, setGroups] = useState<GenerationGroup[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewer, setViewer] = useState<ViewerState>(null);
  const [zoom, setZoom] = useState(1);
  const feedRef = useRef<HTMLDivElement>(null);

  // Close viewer on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setViewer(null);
      if (!viewer) return;
      const group = groups.find((g) => g.id === viewer.groupId);
      if (!group) return;
      if (e.key === "ArrowLeft") {
        setViewer({ ...viewer, iconIndex: Math.max(0, viewer.iconIndex - 1) });
        setZoom(1);
      }
      if (e.key === "ArrowRight") {
        setViewer({
          ...viewer,
          iconIndex: Math.min(group.icons.length - 1, viewer.iconIndex + 1),
        });
        setZoom(1);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [viewer, groups]);

  useEffect(() => {
    if (feedRef.current && groups.length > 0) {
      feedRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [groups.length]);

  const getIconDisplay = useCallback((icon: GeneratedIcon) => {
    return icon.croppedUrl || icon.cleanUrl || icon.originalUrl;
  }, []);

  async function generateSingleIcon(
    groupId: string,
    iconId: string,
    promptText: string,
    shouldRemoveBg: boolean
  ) {
    try {
      // Step 1: Generate
      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText }),
      });

      if (!genRes.ok) throw new Error("Generation failed");
      const genData = await genRes.json();

      let currentUrl = genData.imageUrl;

      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? {
                ...g,
                icons: g.icons.map((icon) =>
                  icon.id === iconId
                    ? {
                        ...icon,
                        originalUrl: currentUrl,
                        status: shouldRemoveBg ? "removing-bg" : "cropping",
                      }
                    : icon
                ),
              }
            : g
        )
      );

      // Step 2: Remove background (optional)
      if (shouldRemoveBg) {
        const bgRes = await fetch("/api/remove-bg", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: currentUrl }),
        });

        if (bgRes.ok) {
          const bgData = await bgRes.json();
          currentUrl = bgData.imageUrl;
          setGroups((prev) =>
            prev.map((g) =>
              g.id === groupId
                ? {
                    ...g,
                    icons: g.icons.map((icon) =>
                      icon.id === iconId
                        ? { ...icon, cleanUrl: currentUrl, status: "cropping" }
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
                      icon.id === iconId ? { ...icon, status: "cropping" } : icon
                    ),
                  }
                : g
            )
          );
        }
      }

      // Step 3: Crop and resize
      const cropRes = await fetch("/api/crop-icon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: currentUrl }),
      });

      if (cropRes.ok) {
        const cropData = await cropRes.json();
        setGroups((prev) =>
          prev.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  icons: g.icons.map((icon) =>
                    icon.id === iconId
                      ? { ...icon, croppedUrl: cropData.imageUrl, status: "done" }
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
      croppedUrl: null,
      status: "generating" as const,
    }));

    const newGroup: GenerationGroup = {
      id: groupId,
      prompt: prompt.trim(),
      timestamp: new Date(),
      removeBg,
      icons,
    };

    setGroups((prev) => [newGroup, ...prev]);
    setIsGenerating(true);

    await Promise.all(
      icons.map((icon) =>
        generateSingleIcon(groupId, icon.id, prompt.trim(), removeBg)
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

  // Get viewer data
  const viewerGroup = viewer ? groups.find((g) => g.id === viewer.groupId) : null;
  const viewerIcon = viewerGroup ? viewerGroup.icons[viewer!.iconIndex] : null;

  return (
    <div className="flex h-screen bg-[#080808] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-white/[0.06] bg-[#0a0a0a]">
        {/* Logo */}
        <div className="flex h-12 items-center border-b border-white/[0.06] px-4">
          <Link href="/" className="font-mono text-xs font-bold text-white">
            RoIcons
          </Link>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto p-4">
          {/* Number of images */}
          <div className="mb-5">
            <label className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-zinc-600">
              count
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setNumImages(Math.max(1, numImages - 1))}
                className="flex h-7 w-7 items-center justify-center rounded border border-white/[0.08] text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-5 text-center font-mono text-xs tabular-nums">{numImages}</span>
              <button
                onClick={() => setNumImages(Math.min(4, numImages + 1))}
                className="flex h-7 w-7 items-center justify-center rounded border border-white/[0.08] text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Remove BG toggle */}
          <div className="mb-5">
            <label className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-zinc-600">
              background
            </label>
            <button
              onClick={() => setRemoveBg(!removeBg)}
              className={`flex h-7 items-center gap-1.5 rounded border px-2.5 font-mono text-[10px] transition-all ${
                removeBg
                  ? "border-white/20 bg-white/10 text-white"
                  : "border-white/[0.08] text-zinc-600 hover:bg-white/5"
              }`}
            >
              <Eraser className="h-3 w-3" />
              remove {removeBg ? "on" : "off"}
            </button>
          </div>

          <Separator className="my-3 bg-white/[0.04]" />

          {/* Prompt */}
          <div className="mb-4 flex-1">
            <label className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-zinc-600">
              prompt
            </label>
            <Textarea
              placeholder="describe your icon..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              className="min-h-[100px] resize-none rounded-lg border-white/[0.08] bg-white/[0.03] font-mono text-xs text-white placeholder:text-zinc-700 focus-visible:ring-white/20"
            />
            <div className="mt-2 flex flex-wrap gap-1">
              {["sword", "shield", "potion", "crown", "gem", "skull"].map((s) => (
                <button
                  key={s}
                  onClick={() => setPrompt((p) => (p ? `${p}, ${s}` : s))}
                  className="rounded border border-white/[0.06] px-1.5 py-0.5 font-mono text-[9px] text-zinc-600 transition-colors hover:border-white/20 hover:text-white"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate button */}
        <div className="border-t border-white/[0.06] p-3">
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full bg-white text-black hover:bg-zinc-200 font-mono text-[10px] h-8 gap-1.5"
          >
            {isGenerating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              "generate"
            )}
          </Button>
        </div>
      </aside>

      {/* Main feed */}
      <main ref={feedRef} className="flex-1 overflow-y-auto">
        {groups.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-zinc-700">
            <ImageIcon className="mb-3 h-10 w-10 opacity-20" />
            <p className="font-mono text-xs">no icons yet</p>
            <p className="mt-1 font-mono text-[10px] text-zinc-800">write a prompt and hit generate</p>
          </div>
        ) : (
          <div className="p-5 space-y-6">
            {groups.map((group) => (
              <div key={group.id}>
                {/* Group header */}
                <div className="mb-2 flex items-baseline gap-3">
                  <p className="flex-1 truncate font-mono text-xs text-zinc-400">{group.prompt}</p>
                  <div className="flex shrink-0 items-center gap-2">
                    {group.removeBg && (
                      <span className="font-mono text-[9px] text-zinc-600">bg:removed</span>
                    )}
                    <span className="font-mono text-[9px] text-zinc-700">
                      {group.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>

                {/* Icons grid */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {group.icons.map((icon, idx) => (
                    <button
                      key={icon.id}
                      onClick={() => {
                        if (icon.status === "done") {
                          setViewer({ groupId: group.id, iconIndex: idx });
                          setZoom(1);
                        }
                      }}
                      className="group relative overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.015] text-left transition-all hover:border-white/[0.12]"
                    >
                      <div className="relative aspect-square">
                        {/* Checkerboard */}
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundImage:
                              "repeating-conic-gradient(#111 0% 25%, #0d0d0d 0% 50%)",
                            backgroundSize: "12px 12px",
                          }}
                        />

                        {icon.status === "generating" && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                            <Loader2 className="h-4 w-4 animate-spin text-zinc-600" />
                            <span className="font-mono text-[9px] text-zinc-700">generating</span>
                          </div>
                        )}

                        {icon.status === "removing-bg" && (
                          <>
                            {icon.originalUrl && (
                              <Image
                                src={icon.originalUrl}
                                alt=""
                                fill
                                className="object-contain p-2 opacity-30"
                                unoptimized
                              />
                            )}
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/30">
                              <Eraser className="h-4 w-4 animate-pulse text-zinc-500" />
                              <span className="font-mono text-[9px] text-zinc-600">removing bg</span>
                            </div>
                          </>
                        )}

                        {icon.status === "cropping" && (
                          <>
                            {(icon.cleanUrl || icon.originalUrl) && (
                              <Image
                                src={icon.cleanUrl || icon.originalUrl}
                                alt=""
                                fill
                                className="object-contain p-2 opacity-40"
                                unoptimized
                              />
                            )}
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/30">
                              <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                              <span className="font-mono text-[9px] text-zinc-600">resizing</span>
                            </div>
                          </>
                        )}

                        {icon.status === "done" && (
                          <>
                            <Image
                              src={getIconDisplay(icon)}
                              alt={group.prompt}
                              fill
                              className="object-contain p-2"
                              unoptimized
                            />
                            {/* Hover hint */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                              <ZoomIn className="h-4 w-4 text-white/80" />
                            </div>
                          </>
                        )}

                        {icon.status === "error" && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="font-mono text-[9px] text-zinc-500">failed</span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Fullscreen viewer modal */}
      {viewer && viewerGroup && viewerIcon && (
        <div
          className="fixed inset-0 z-50 flex bg-black/90 backdrop-blur-sm"
          onClick={() => setViewer(null)}
        >
          {/* Main image area */}
          <div
            className="flex flex-1 flex-col items-center justify-center p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <p className="truncate font-mono text-xs text-zinc-400 max-w-md">
                  {viewerGroup.prompt}
                </p>
                <span className="font-mono text-[9px] text-zinc-700">
                  {viewer.iconIndex + 1}/{viewerGroup.icons.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                  className="flex h-7 w-7 items-center justify-center rounded border border-white/[0.08] text-zinc-500 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <ZoomOut className="h-3 w-3" />
                </button>
                <span className="font-mono text-[10px] text-zinc-500 w-10 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                  className="flex h-7 w-7 items-center justify-center rounded border border-white/[0.08] text-zinc-500 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <ZoomIn className="h-3 w-3" />
                </button>
                <button
                  onClick={() =>
                    handleDownload(
                      getIconDisplay(viewerIcon),
                      `${viewerGroup.prompt.replace(/\s+/g, "-").toLowerCase()}-${viewerIcon.id}`
                    )
                  }
                  className="flex h-7 items-center gap-1.5 rounded border border-white/[0.08] px-2.5 font-mono text-[10px] text-zinc-500 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Download className="h-3 w-3" />
                  download
                </button>
                <button
                  onClick={() => setViewer(null)}
                  className="flex h-7 w-7 items-center justify-center rounded border border-white/[0.08] text-zinc-500 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Navigation arrows */}
            {viewer.iconIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setViewer({ ...viewer, iconIndex: viewer.iconIndex - 1 });
                  setZoom(1);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-black/50 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            {viewer.iconIndex < viewerGroup.icons.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setViewer({ ...viewer, iconIndex: viewer.iconIndex + 1 });
                  setZoom(1);
                }}
                className="absolute right-72 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-black/50 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}

            {/* Main image with zoom */}
            <div
              className="relative overflow-hidden rounded-xl border border-white/[0.06]"
              style={{
                width: `min(70vh, 70vw)`,
                height: `min(70vh, 70vw)`,
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "repeating-conic-gradient(#161616 0% 25%, #111 0% 50%)",
                  backgroundSize: "20px 20px",
                }}
              />
              <div
                className="absolute inset-0 flex items-center justify-center transition-transform duration-200"
                style={{ transform: `scale(${zoom})` }}
              >
                <Image
                  src={getIconDisplay(viewerIcon)}
                  alt={viewerGroup.prompt}
                  fill
                  className="object-contain p-4"
                  unoptimized
                />
              </div>
            </div>
          </div>

          {/* Right sidebar - other images from same prompt */}
          <div
            className="w-64 shrink-0 border-l border-white/[0.06] bg-[#0a0a0a] overflow-y-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-600 mb-3">
              from this prompt
            </p>
            <div className="grid grid-cols-2 gap-2">
              {viewerGroup.icons.map((icon, idx) => (
                <button
                  key={icon.id}
                  onClick={() => {
                    setViewer({ ...viewer, iconIndex: idx });
                    setZoom(1);
                  }}
                  className={`relative aspect-square overflow-hidden rounded-lg border transition-all ${
                    idx === viewer.iconIndex
                      ? "border-white/30"
                      : "border-white/[0.06] hover:border-white/[0.15]"
                  }`}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        "repeating-conic-gradient(#131313 0% 25%, #0e0e0e 0% 50%)",
                      backgroundSize: "8px 8px",
                    }}
                  />
                  {icon.status === "done" ? (
                    <Image
                      src={getIconDisplay(icon)}
                      alt=""
                      fill
                      className="object-contain p-1.5"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-3 w-3 animate-spin text-zinc-700" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
