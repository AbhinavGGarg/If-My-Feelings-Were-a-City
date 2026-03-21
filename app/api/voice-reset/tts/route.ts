import { NextResponse } from "next/server";

const defaultVoiceId = process.env.ELEVENLABS_CALM_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
const defaultModelId = process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";

const getApiKey = () => process.env.ELEVENLABS_API_KEY?.trim();

const extractElevenLabsError = (raw: string) => {
  try {
    const parsed = JSON.parse(raw) as {
      detail?: { status?: string; message?: string } | string;
    };
    if (typeof parsed.detail === "string") {
      return parsed.detail;
    }
    if (parsed.detail && typeof parsed.detail === "object") {
      const status = parsed.detail.status?.trim();
      const message = parsed.detail.message?.trim();
      if (status && message) {
        return `${status}: ${message}`;
      }
      if (message) {
        return message;
      }
      if (status) {
        return status;
      }
    }
  } catch {
    return raw.slice(0, 220);
  }
  return raw.slice(0, 220);
};

export async function GET() {
  const apiKey = getApiKey();
  if (!apiKey) {
    return NextResponse.json({
      available: false,
      provider: "none",
      reason: "Missing ELEVENLABS_API_KEY on the server.",
    });
  }

  try {
    const probe = await fetch("https://api.elevenlabs.io/v1/user", {
      method: "GET",
      headers: {
        "xi-api-key": apiKey,
      },
      cache: "no-store",
    });

    if (!probe.ok) {
      const details = await probe.text();
      const parsedError = extractElevenLabsError(details);
      if (parsedError.includes("missing_permissions") && parsedError.includes("user_read")) {
        return NextResponse.json({
          available: true,
          provider: "elevenlabs",
          reason: "Restricted key detected. Voice is still available for text-to-speech.",
        });
      }

      return NextResponse.json({
        available: false,
        provider: "none",
        reason: `ElevenLabs key check failed: ${parsedError}`,
      });
    }

    return NextResponse.json({
      available: true,
      provider: "elevenlabs",
    });
  } catch {
    return NextResponse.json({
      available: false,
      provider: "none",
      reason: "Unable to reach ElevenLabs.",
    });
  }
}

export async function POST(request: Request) {
  const apiKey = getApiKey();

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
      model_id: defaultModelId,
      output_format: "mp3_44100_128",
      voice_settings: {
        stability: 0.78,
        similarity_boost: 0.85,
        style: 0,
        use_speaker_boost: true,
        speed: 0.76,
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      {
        error: `ElevenLabs request failed (${response.status}).`,
        details: extractElevenLabsError(errorText),
      },
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
