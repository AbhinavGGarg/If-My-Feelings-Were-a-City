import { NextResponse } from "next/server";

const defaultVoiceId = process.env.ELEVENLABS_CALM_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

export async function GET() {
  const available = Boolean(process.env.ELEVENLABS_API_KEY);
  return NextResponse.json({
    available,
    provider: available ? "elevenlabs" : "browser",
  });
}

export async function POST(request: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "ELEVENLABS_API_KEY is not configured." },
      { status: 503 },
    );
  }

  let body: { text?: string; voiceId?: string };
  try {
    body = (await request.json()) as { text?: string; voiceId?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const text = body.text?.trim();
  if (!text) {
    return NextResponse.json({ error: "Text is required." }, { status: 400 });
  }

  const voiceId = body.voiceId?.trim() || defaultVoiceId;

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.72,
        similarity_boost: 0.82,
        style: 0.05,
        use_speaker_boost: true,
        speed: 0.78,
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      { error: `ElevenLabs request failed (${response.status}).`, details: errorText },
      { status: 502 },
    );
  }

  const audioBuffer = await response.arrayBuffer();

  return new Response(audioBuffer, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
    },
  });
}
