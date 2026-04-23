import { NextRequest, NextResponse } from "next/server";

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

async function proxyRequest(
  req: NextRequest,
  params: { path: string[] }
) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) {
    return NextResponse.json(
      { detail: { error: { code: "MISSING_KEY", message: "API key required" } } },
      { status: 401 }
    );
  }

  const pathSegments = params.path ?? [];
  const upstreamPath = "/" + pathSegments.join("/");

  // Forward query parameters (search, page, per_page, etc.)
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
