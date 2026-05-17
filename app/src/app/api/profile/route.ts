import { NextRequest, NextResponse } from "next/server";
import { getProfile, saveProfile } from "@/lib/db";

export async function GET() {
  return NextResponse.json(getProfile());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  saveProfile(body);
  return NextResponse.json({ ok: true });
}
