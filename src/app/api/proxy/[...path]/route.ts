import { NextRequest, NextResponse } from "next/server";
import { isValidToken } from "@/lib/auth";

const DIDDYSMS_BASE = "https://api.diddysms.com/v1";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, await params);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, await params);
}

async function proxyRequest(req: NextRequest, params: { path: string[] }) {
  // Verify session token
  const token = req.headers.get("x-session-token");
  if (!token || !isValidToken(token)) {
    return NextResponse.json(
      { detail: { error: { code: "UNAUTHORIZED", message: "Invalid or missing session." } } },
      { status: 401 }
    );
  }

  const apiKey = process.env.DIDDYSMS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { detail: { error: { code: "NO_API_KEY", message: "DIDDYSMS_API_KEY is not configured on the server." } } },
      { status: 500 }
    );
  }

  const pathSegments = params.path ?? [];
  const upstreamPath = "/" + pathSegments.join("/");
  const incomingSearch = req.nextUrl.search;
  const upstreamUrl = `${DIDDYSMS_BASE}${upstreamPath}${incomingSearch}`;

  const isPost = req.method === "POST";
  let body: string | undefined;
  if (isPost) {
    try {
      body = await req.text();
    } catch {
      body = undefined;
    }
  }

  const upstream = await fetch(upstreamUrl, {
    method: req.method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    ...(body ? { body } : {}),
  });

  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}
