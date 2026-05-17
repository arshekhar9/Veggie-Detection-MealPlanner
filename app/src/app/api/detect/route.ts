import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getAnthropic, MODEL } from "@/lib/anthropic";

export async function POST(req: NextRequest) {
  const { filename } = await req.json();
  if (!filename) return NextResponse.json({ error: "No filename provided" }, { status: 400 });

  const filepath = path.join(process.cwd(), "uploads", filename);
  const imageBuffer = await readFile(filepath);
  const base64 = imageBuffer.toString("base64");
  const ext = path.extname(filename).toLowerCase().replace(".", "");
  const mediaType = ext === "jpg" ? "image/jpeg" : `image/${ext}`;

  const response = await getAnthropic().messages.create({
    model: MODEL,
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp", data: base64 },
          },
          {
            type: "text",
            text: `Identify all vegetables visible in this image. Return ONLY a JSON array of vegetable names in lowercase, e.g. ["carrot", "spinach", "bell pepper"]. No explanation.`,
          },
        ],
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text.trim() : "[]";
  const match = text.match(/\[[\s\S]*\]/);
  const vegetables: string[] = match ? JSON.parse(match[0]) : [];

  return NextResponse.json({ vegetables });
}
