"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
                    ? { ...icon, originalUrl: currentUrl, status: shouldRemoveBg ? "removing-bg" : "cropping" }
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
                      icon.id === iconId ? { ...icon, cleanUrl: currentUrl, status: "cropping" } : icon
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
                    icon.id === iconId ? { ...icon, croppedUrl: cropData.imageUrl, status: "done" } : icon
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

  const viewerGroup = viewer ? groups.find((g) => g.id === viewer.groupId) : null;
  const viewerIcon = viewerGroup ? viewerGroup.icons[viewer!.iconIndex] : null;

  return (
    <div className="flex h-screen bg-[#191b20] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="flex w-72 shrink-0 flex-col border-r border-[#2e3135] bg-[#1e2024]">
        {/* Logo */}
        <div className="flex h-14 items-center border-b border-[#2e3135] px-5">
          <Link href="/" className="text-base font-bold text-white tracking-tight">
            RoIcons
          </Link>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto p-5">
          {/* Number of images */}
          <div className="mb-6">
            <label className="mb-2.5 block text-xs font-medium text-[#8b8d91]">
              Number of images
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setNumImages(Math.max(1, numImages - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2a2d31] text-[#8b8d91] transition-colors hover:bg-[#333639] hover:text-white"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-6 text-center text-sm font-medium tabular-nums">{numImages}</span>
              <button
                onClick={() => setNumImages(Math.min(4, numImages + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2a2d31] text-[#8b8d91] transition-colors hover:bg-[#333639] hover:text-white"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Remove BG toggle */}
          <div className="mb-6">
            <label className="mb-2.5 block text-xs font-medium text-[#8b8d91]">
              Background removal
            </label>
            <button
              onClick={() => setRemoveBg(!removeBg)}
              className={`flex h-9 items-center gap-2 rounded-lg px-3 text-sm transition-all ${
                removeBg
                  ? "bg-[#2f53f7]/15 text-[#5b7fff] border border-[#2f53f7]/30"
                  : "bg-[#2a2d31] text-[#8b8d91] border border-transparent hover:bg-[#333639]"
              }`}
            >
              <Eraser className="h-3.5 w-3.5" />
              {removeBg ? "Enabled" : "Disabled"}
            </button>
          </div>

          <Separator className="my-2 bg-[#2e3135]" />

          {/* Prompt */}
          <div className="mt-4 flex-1">
            <label className="mb-2.5 block text-xs font-medium text-[#8b8d91]">
              Describe your icon
            </label>
            <Textarea
              placeholder="A golden sword with a glowing aura..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              className="min-h-[120px] resize-none rounded-lg border-[#2e3135] bg-[#232527] text-sm text-white placeholder:text-[#555] focus-visible:ring-[#2f53f7]"
            />
            {/* Quick suggestions */}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {["Golden crown", "Blue shield", "Red potion", "Magic wand", "Pixel heart", "Diamond gem"].map((s) => (
                <button
                  key={s}
                  onClick={() => setPrompt(s)}
                  className="rounded-lg bg-[#2a2d31] px-2.5 py-1 text-xs text-[#8b8d91] transition-colors hover:bg-[#333639] hover:text-white"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate button */}
        <div className="border-t border-[#2e3135] p-4">
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full bg-[#2f53f7] hover:bg-[#2545d4] text-white text-sm h-10 rounded-lg gap-2"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Generate"
            )}
          </Button>
        </div>
      </aside>

      {/* Main feed */}
      <main ref={feedRef} className="flex-1 overflow-y-auto">
        {groups.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#232527] mb-4">
              <ImageIcon className="h-7 w-7 text-[#555]" />
            </div>
            <p className="text-sm font-medium text-[#8b8d91]">No icons generated yet</p>
            <p className="mt-1 text-xs text-[#555]">Write a prompt and hit Generate to get started</p>
          </div>
        ) : (
          <div className="p-6 space-y-8">
            {groups.map((group) => (
              <div key={group.id}>
                {/* Group header */}
                <div className="mb-3 flex items-center gap-3">
                  <p className="flex-1 truncate text-sm font-medium text-white">{group.prompt}</p>
                  <div className="flex shrink-0 items-center gap-3">
                    {group.removeBg && (
                      <span className="rounded-md bg-[#2f53f7]/10 px-2 py-0.5 text-xs text-[#5b7fff]">
                        BG removed
                      </span>
                    )}
                    <span className="text-xs text-[#555]">
                      {group.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>

                {/* Icons grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {group.icons.map((icon, idx) => (
                    <button
                      key={icon.id}
                      onClick={() => {
                        if (icon.status === "done") {
                          setViewer({ groupId: group.id, iconIndex: idx });
                          setZoom(1);
                        }
                      }}
                      className="group relative overflow-hidden rounded-xl bg-[#232527] text-left transition-all hover:ring-2 hover:ring-[#2f53f7]/40"
                    >
                      <div className="relative aspect-square">
                        {/* Checkerboard */}
                        <div
                          className="absolute inset-0 rounded-xl"
                          style={{
                            backgroundImage:
                              "repeating-conic-gradient(#282a2e 0% 25%, #232527 0% 50%)",
                            backgroundSize: "14px 14px",
                          }}
                        />

                        {icon.status === "generating" && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin text-[#2f53f7]" />
                            <span className="text-xs text-[#8b8d91]">Generating...</span>
                          </div>
                        )}

                        {icon.status === "removing-bg" && (
                          <>
                            {icon.originalUrl && (
                              <Image src={icon.originalUrl} alt="" fill className="object-contain p-3 opacity-30" unoptimized />
                            )}
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#191b20]/50">
                              <Eraser className="h-5 w-5 animate-pulse text-[#2f53f7]" />
                              <span className="text-xs text-[#8b8d91]">Removing background...</span>
                            </div>
                          </>
                        )}

                        {icon.status === "cropping" && (
                          <>
                            {(icon.cleanUrl || icon.originalUrl) && (
                              <Image src={icon.cleanUrl || icon.originalUrl} alt="" fill className="object-contain p-3 opacity-40" unoptimized />
                            )}
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#191b20]/40">
                              <Loader2 className="h-5 w-5 animate-spin text-[#2f53f7]" />
                              <span className="text-xs text-[#8b8d91]">Resizing...</span>
                            </div>
                          </>
                        )}

                        {icon.status === "done" && (
                          <>
                            <Image src={getIconDisplay(icon)} alt={group.prompt} fill className="object-contain p-3" unoptimized />
                            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                              <ZoomIn className="h-5 w-5 text-white" />
                            </div>
                          </>
                        )}

                        {icon.status === "error" && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs text-red-400">Generation failed</span>
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
        <div className="fixed inset-0 z-50 flex bg-[#191b20]/95 backdrop-blur-sm" onClick={() => setViewer(null)}>
          {/* Main image area */}
          <div className="flex flex-1 flex-col items-center justify-center p-8" onClick={(e) => e.stopPropagation()}>
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <p className="truncate text-sm font-medium text-white max-w-md">{viewerGroup.prompt}</p>
                <span className="text-xs text-[#555]">{viewer.iconIndex + 1}/{viewerGroup.icons.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#232527] text-[#8b8d91] hover:bg-[#2a2d31] hover:text-white transition-colors"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="text-xs text-[#8b8d91] w-12 text-center">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#232527] text-[#8b8d91] hover:bg-[#2a2d31] hover:text-white transition-colors"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  onClick={() =>
                    handleDownload(
                      getIconDisplay(viewerIcon),
                      `${viewerGroup.prompt.replace(/\s+/g, "-").toLowerCase()}-${viewerIcon.id}`
                    )
                  }
                  className="flex h-8 items-center gap-2 rounded-lg bg-[#2f53f7] hover:bg-[#2545d4] px-3 text-xs text-white transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
                <button
                  onClick={() => setViewer(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#232527] text-[#8b8d91] hover:bg-[#2a2d31] hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
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
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-[#232527] text-[#8b8d91] hover:bg-[#2a2d31] hover:text-white transition-colors"
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
                className="absolute right-72 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-[#232527] text-[#8b8d91] hover:bg-[#2a2d31] hover:text-white transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}

            {/* Main image with zoom */}
            <div
              className="relative overflow-hidden rounded-2xl bg-[#232527]"
              style={{ width: "min(70vh, 70vw)", height: "min(70vh, 70vw)" }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: "repeating-conic-gradient(#282a2e 0% 25%, #232527 0% 50%)",
                  backgroundSize: "20px 20px",
                }}
              />
              <div
                className="absolute inset-0 flex items-center justify-center transition-transform duration-200"
                style={{ transform: `scale(${zoom})` }}
              >
                <Image src={getIconDisplay(viewerIcon)} alt={viewerGroup.prompt} fill className="object-contain p-4" unoptimized />
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="w-64 shrink-0 border-l border-[#2e3135] bg-[#1e2024] overflow-y-auto p-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-xs font-medium text-[#8b8d91] mb-3">From this prompt</p>
            <div className="grid grid-cols-2 gap-2">
              {viewerGroup.icons.map((icon, idx) => (
                <button
                  key={icon.id}
                  onClick={() => {
                    setViewer({ ...viewer, iconIndex: idx });
                    setZoom(1);
                  }}
                  className={`relative aspect-square overflow-hidden rounded-lg transition-all ${
                    idx === viewer.iconIndex
                      ? "ring-2 ring-[#2f53f7]"
                      : "hover:ring-1 hover:ring-[#2f53f7]/40"
                  }`}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: "repeating-conic-gradient(#282a2e 0% 25%, #232527 0% 50%)",
                      backgroundSize: "10px 10px",
                    }}
                  />
                  {icon.status === "done" ? (
                    <Image src={getIconDisplay(icon)} alt="" fill className="object-contain p-1.5" unoptimized />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#2f53f7]" />
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
