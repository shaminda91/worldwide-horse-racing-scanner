interface Env {
  GEMINI_API_KEY?: string;
}

interface PagesContext {
  request: Request;
  env: Env;
}

export const onRequestPost = async ({ request, env }: PagesContext) => {
  try {
    const body = await request.json() as {
      imageBase64?: string;
      mimeType?: string;
      sampleId?: string;
      clientLang?: string;
    };

    const { imageBase64, mimeType = 'image/jpeg', sampleId } = body;

    if (!imageBase64 && !sampleId) {
      return Response.json(
        { success: false, error: 'No image or sampleId provided' },
        { status: 400 }
      );
    }

    if (sampleId) {
      return Response.json({
        success: false,
        error: 'Sample scan API is connected, but race fixture matching is not configured yet.',
        source: 'pages_function',
      });
    }

    if (!env.GEMINI_API_KEY) {
      return Response.json({
        success: false,
        error: 'GEMINI_API_KEY is not configured in Cloudflare Pages.',
      }, { status: 503 });
    }

    const cleanBase64 = imageBase64!.replace(/^data:[^;]+;base64,/, '');

    const aiResponse = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                inline_data: {
                  mime_type: mimeType,
                  data: cleanBase64,
                },
              },
              {
                text: 'Analyze this horse racing slip image. Extract the horse name, racecourse, race number, bet type, finishing position, finish status, odds, jockey, trainer, and any payout. Return JSON only with keys success, detectedHorseName, detectedHorseNameSi, detectedTrack, detectedTrackSi, raceDate, raceNumber, betType, finishPosition, finishStatus, margin, odds, payout, jockey, trainer, confidenceScore, extractedRawText, sinhalaExplanation, englishExplanation, source, scannedAt. Do not invent missing information. Use null for unknown values. Set source to ai_vision and scannedAt to the current ISO timestamp.',
              },
            ],
          }],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    const result = await aiResponse.json() as any;

    if (!aiResponse.ok) {
      return Response.json({
        success: false,
        error: result?.error?.message || 'Gemini API request failed',
      }, { status: 502 });
    }

    const text = result?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || '')
      .join('');

    if (!text) {
      return Response.json({
        success: false,
        error: 'No scan result returned by AI.',
      }, { status: 502 });
    }

    const parsed = JSON.parse(text);

    return Response.json({
      ...parsed,
      success: true,
      source: 'ai_vision',
      scannedAt: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 });
  }
};
