import { WORLDWIDE_RACES } from '../../src/data/racingFixtures';

interface Env {
  GEMINI_API_KEY?: string;
}

interface PagesContext {
  request: Request;
  env: Env;
}

const sampleHorseNames: Record<string, string> = {
  'sample-ascot': 'Kyprios',
  'sample-nuwara-eliya': 'Western Charm',
  'sample-melbourne': 'Without A Fight',
  'sample-derby': 'Mystik Dan',
  'sample-dubai': 'Laurel River',
  'sample-hksar': 'Romantic Warrior',
};

function matchSample(sampleId: string) {
  const horseName = sampleHorseNames[sampleId];

  if (!horseName) return null;

  for (const race of WORLDWIDE_RACES) {
    const runner = race.runners.find(
      (item) => item.horseName.toLowerCase() === horseName.toLowerCase()
    );

    if (!runner) continue;

    const position = runner.finishPosition;
    const finishStatus =
      position === 1 ? 'WIN' :
      position === 2 || position === 3 ? 'PLACE' :
      position == null ? 'UPCOMING' : 'LOST';

    return {
      success: true,
      detectedHorseName: runner.horseName,
      detectedHorseNameSi: runner.horseNameSi,
      detectedTrack: race.track,
      detectedTrackSi: race.trackSi,
      raceDate: race.date,
      raceNumber: race.raceNumber,
      betType: 'Win / Single',
      finishPosition: position,
      finishStatus,
      margin: runner.margin || '',
      odds: runner.odds,
      payout: runner.payout || 'Unknown',
      jockey: runner.jockey,
      trainer: runner.trainer,
      confidenceScore: 98,
      extractedRawText: `${race.track} · Race ${race.raceNumber} · ${runner.horseName}`,
      sinhalaExplanation: `${runner.horseNameSi} — ${race.trackSi}. ස්ථානය: ${position ?? 'තවම තීරණය කර නැත'}.`,
      englishExplanation: `${runner.horseName} at ${race.track}. Finishing position: ${position ?? 'unknown'}.`,
      fullRunners: race.runners,
      source: 'catalog_match',
      scannedAt: new Date().toISOString(),
      matchedFixtureId: race.id,
    };
  }

  return null;
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
      const sampleResult = matchSample(sampleId);

      if (sampleResult) return Response.json(sampleResult);

      return Response.json(
        { success: false, error: 'Sample ticket not found.' },
        { status: 404 }
      );
    }

    if (!env.GEMINI_API_KEY) {
      return Response.json({
        success: false,
        error: 'Photo scanning is not configured yet. Add GEMINI_API_KEY in Cloudflare Pages Settings → Variables and Secrets.',
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
                text: 'Read this horse racing betting slip image. Extract only information visibly supported by the image. Do not guess the result or invent a horse, track, finishing position, odds, jockey, trainer, or payout. If the image does not show an official result, use finishStatus UNKNOWN and finishPosition null. Return JSON with keys success, detectedHorseName, detectedHorseNameSi, detectedTrack, detectedTrackSi, raceDate, raceNumber, betType, finishPosition, finishStatus, margin, odds, payout, jockey, trainer, confidenceScore, extractedRawText, sinhalaExplanation, englishExplanation. Use strings for unknown text values as empty strings, and null for unknown finishPosition.',
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
      return Response.json(
        { success: false, error: 'AI did not return a scan result.' },
        { status: 502 }
      );
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
