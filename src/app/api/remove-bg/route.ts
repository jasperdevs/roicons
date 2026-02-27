import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
    }

    const result = await fal.subscribe("fal-ai/birefnet", {
      input: {
        image_url: imageUrl,
        model: "General Use (Light)",
        operating_resolution: "1024x1024",
        output_format: "png",
      },
    });

    const data = result.data as { image?: { url: string } };

    if (!data.image) {
      return NextResponse.json({ error: "Background removal failed" }, { status: 500 });
    }

    return NextResponse.json({ imageUrl: data.image.url });
  } catch (error) {
    console.error("Background removal error:", error);
    return NextResponse.json({ error: "Failed to remove background" }, { status: 500 });
  }
}
