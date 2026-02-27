import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { prompt, aspectRatio } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 3) {
      return NextResponse.json({ error: "Prompt must be at least 3 characters" }, { status: 400 });
    }

    const validRatios = ["1:1", "16:9", "9:16", "4:3", "3:4"];
    const ratio = validRatios.includes(aspectRatio) ? aspectRatio : "1:1";

    const iconPrompt = `A clean, flat icon design on a solid colored background: ${prompt.trim()}. Minimal, vector-style, game icon, sharp edges, vibrant colors, centered composition.`;

    const result = await fal.subscribe("fal-ai/nano-banana-pro", {
      input: {
        prompt: iconPrompt,
        num_images: 1,
        resolution: "1K",
        aspect_ratio: ratio,
        output_format: "png",
      },
    });

    const data = result.data as { images?: { url: string }[] };

    if (!data.images || data.images.length === 0) {
      return NextResponse.json({ error: "No image generated" }, { status: 500 });
    }

    return NextResponse.json({ imageUrl: data.images[0].url });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json({ error: "Failed to generate icon" }, { status: 500 });
  }
}
