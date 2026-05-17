import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { mkdirSync } from "fs";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
mkdirSync(UPLOAD_DIR, { recursive: true });

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("image") as File;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `upload_${Date.now()}${path.extname(file.name)}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  await writeFile(filepath, buffer);

  return NextResponse.json({ filename, filepath });
}
