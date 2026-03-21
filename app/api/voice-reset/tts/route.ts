import { NextResponse } from "next/server";

export const runtime = "nodejs";

const defaultModelId =
  process.env.FEATHERLESS_REALTIME_MODEL || "recursal/QRWKV6-32B-Instruct-Preview-v0.1";

const getApiKey = () => process.env.FEATHERLESS_API_KEY?.trim();

export async function GET() {
  const apiKey = getApiKey();
  if (!apiKey) {
    return NextResponse.json({
      available: false,
      provider: "none",
      reason: "Missing FEATHERLESS_API_KEY on the server.",
    });
  }

  try {
    const probe = await fetch("https://api.featherless.ai/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      cache: "no-store",
    });

    if (!probe.ok) {
      const raw = await probe.text();
      return NextResponse.json({
        available: false,
        provider: "none",
        reason: `Featherless check failed (${probe.status}): ${raw.slice(0, 180)}`,
      });
    }

    const realtimeProbe = await fetch(
      `https://api.featherless.ai/v1/realtime?model=${encodeURIComponent(defaultModelId)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sdp: "v=0" }),
        cache: "no-store",
      },
    );

    if (realtimeProbe.status >= 500) {
      const raw = await realtimeProbe.text();
      return NextResponse.json({
        available: false,
        provider: "none",
        reason: `Featherless realtime is unavailable right now (${realtimeProbe.status}): ${raw.slice(0, 180)}`,
      });
    }

    return NextResponse.json({
      available: true,
      provider: "featherless",
    });
  } catch {
    return NextResponse.json({
      available: false,
      provider: "none",
      reason: "Unable to reach Featherless.",
    });
  }
}

export async function POST(request: Request) {
  const apiKey = getApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing FEATHERLESS_API_KEY on the server." },
      { status: 503 },
    );
  }

  let body: { sdp?: string; modelId?: string };
  try {
    body = (await request.json()) as { sdp?: string; modelId?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const sdp = body.sdp?.trim();
  if (!sdp) {
    return NextResponse.json({ error: "SDP is required." }, { status: 400 });
  }

  const modelId = body.modelId?.trim() || defaultModelId;

  try {
    const upstream = await fetch(
      `https://api.featherless.ai/v1/realtime?model=${encodeURIComponent(modelId)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sdp }),
        cache: "no-store",
      },
    );

    const responseBody = await upstream.text();
    if (!upstream.ok) {
      return NextResponse.json(
        {
          error: `Featherless realtime handshake failed (${upstream.status}).`,
          details: responseBody.slice(0, 240),
        },
        { status: 502 },
      );
    }

    let normalizedSdp = responseBody;
    try {
      const parsed = JSON.parse(responseBody) as { sdp?: string; answer?: string };
      normalizedSdp = parsed.sdp || parsed.answer || responseBody;
    } catch {
      normalizedSdp = responseBody;
    }

    return new Response(normalizedSdp, {
      status: 200,
      headers: {
        "Content-Type": "application/sdp",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Featherless realtime handshake failed.";
    return NextResponse.json(
      { error: "Featherless realtime handshake failed.", details: message },
      { status: 502 },
    );
  }
}
