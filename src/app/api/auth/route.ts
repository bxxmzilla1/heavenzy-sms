import { NextRequest, NextResponse } from "next/server";
import { deriveToken } from "@/lib/auth";

const APP_PASSWORD = process.env.APP_PASSWORD ?? "";

export async function POST(req: NextRequest) {
  if (!APP_PASSWORD) {
    return NextResponse.json(
      { error: "APP_PASSWORD environment variable is not set." },
      { status: 500 }
    );
  }

  const { password } = await req.json().catch(() => ({ password: "" }));

  if (!password || password !== APP_PASSWORD) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const token = deriveToken(password);
  return NextResponse.json({ token });
}
