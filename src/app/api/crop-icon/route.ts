import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
    }

    // Fetch the image
    const res = await fetch(imageUrl);
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
    }

    const buffer = Buffer.from(await res.arrayBuffer());

    // Use sharp to trim transparent pixels and resize to fill 1024x1024
    const trimmed = sharp(buffer).trim();
    const trimmedMeta = await trimmed.metadata();
    const trimmedBuffer = await trimmed.toBuffer({ resolveWithObject: true });

    const { width, height } = trimmedBuffer.info;

    if (!width || !height) {
      return NextResponse.json({ error: "Could not determine image dimensions" }, { status: 500 });
    }

    // Calculate size: fit into 1024x1024 with 8% padding
    const targetSize = 1024;
    const padding = Math.round(targetSize * 0.08);
    const innerSize = targetSize - padding * 2;

    const scale = Math.min(innerSize / width, innerSize / height);
    const scaledW = Math.round(width * scale);
    const scaledH = Math.round(height * scale);

    // Resize the trimmed icon, then composite onto a transparent 1024x1024 canvas
    const resizedIcon = await sharp(trimmedBuffer.data)
      .resize(scaledW, scaledH, { fit: "inside", kernel: "lanczos3" })
      .toBuffer();

    const result = await sharp({
      create: {
        width: targetSize,
        height: targetSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        {
          input: resizedIcon,
          left: Math.round((targetSize - scaledW) / 2),
          top: Math.round((targetSize - scaledH) / 2),
        },
      ])
      .png()
      .toBuffer();

    // Return as base64 data URL
    const base64 = result.toString("base64");
    return NextResponse.json({
      imageUrl: `data:image/png;base64,${base64}`,
    });
  } catch (error) {
    console.error("Crop error:", error);
    return NextResponse.json({ error: "Failed to crop icon" }, { status: 500 });
  }
}
