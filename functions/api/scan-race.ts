import { WORLDWIDE_RACES } from '../../src/data/racingFixtures';

interface Env {
  GEMINI_API_KEY?: string;
  OPENROUTER_API_KEY?: string;
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
     scanEngine?: 'gemini' | 'openrouter'; 
    };

    const { imageBase64, mimeType = 'image/jpeg', sampleId, scanEngine = 'gemini' } = body;

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

    const cleanBase64 = imageBase64!.replace(/^data:[^;]+;base64,/, '');

    const scanPrompt = 'Analyze this image carefully. First decide whether it visibly contains a horse-racing betting slip or horse-racing result document. Handwritten slips are allowed: read handwriting cautiously and use only text you can actually see. Do not invent or guess horse names, racecourses, dates, race numbers, results, odds, jockeys, trainers, or payouts. If this is not clearly a horse-racing slip, or the horse name and racecourse cannot be read, return JSON with success false, isHorseRacingTicket false when not a racing slip (true only when clearly a racing slip), and empty strings for unknown fields. Never infer a WIN/PLACE/LOST result from a bet slip alone; unless an official result is visible, finishStatus must be UNKNOWN and finishPosition null. Return only a valid JSON object with keys success, isHorseRacingTicket, detectedHorseName, detectedHorseNameSi, detectedTrack, detectedTrackSi, raceDate, raceNumber, betType, finishPosition, finishStatus, margin, odds, payout, jockey, trainer, confidenceScore, extractedRawText, sinhalaExplanation, englishExplanation. Use empty strings for unknown text and null for unknown finishPosition.';

    let text = '';

    if (scanEngine === 'openrouter') {
      if (!env.OPENROUTER_API_KEY) {
        return Response.json({
          success: false,
          error: 'OpenRouter is not configured. Add OPENROUTER_API_KEY in Cloudflare Pages Settings → Variables and Secrets.',
        }, { status: 503 });
      }

      const aiResponse = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://worldwide-horse-racing-scanner.pages.dev',
            'X-Title': 'Worldwide Horse Racing Scanner',
          },
          body: JSON.stringify({
            model: 'openrouter/free',
            messages: [{
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${mimeType};base64,${cleanBase64}`,
                  },
                },
                {
                  type: 'text',
                  text: scanPrompt,
                },
              ],
            }],
          }),
        }
      );

      const result = await aiResponse.json() as any;

      if (!aiResponse.ok) {
        console.error('[RaceScan OpenRouter error]', JSON.stringify({
          status: aiResponse.status,
          message: result?.error?.message || 'No error message returned',
        }));
        return Response.json({
          success: false,
          error: result?.error?.message || 'OpenRouter API request failed',
        }, { status: 502 });
      }

      const content = result?.choices?.[0]?.message?.content;
      text = typeof content === 'string'
        ? content
        : Array.isArray(content)
          ? content.filter((part: any) => part.type === 'text')
              .map((part: any) => part.text || '').join('')
          : '';
    } else {
      if (!env.GEMINI_API_KEY) {
        return Response.json({
          success: false,
          error: 'Photo scanning is not configured yet. Add GEMINI_API_KEY in Cloudflare Pages Settings → Variables and Secrets.',
        }, { status: 503 });
      }

      const aiResponse = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/interactions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': env.GEMINI_API_KEY,
          },
          body: JSON.stringify({
            model: 'gemini-3.6-flash',
            input: [
              {
                type: 'image',
                mime_type: mimeType,
                data: cleanBase64,
              },
              {
                type: 'text',
                text: scanPrompt,
              },
            ],
          }),
        }
      );

      const result = await aiResponse.json() as any;

      if (!aiResponse.ok) {
        console.error('[RaceScan Gemini error]', JSON.stringify({
          status: aiResponse.status,
          message: result?.error?.message || 'No error message returned',
        }));
        return Response.json({
          success: false,
          error: result?.error?.message || 'Gemini API request failed',
        }, { status: 502 });
      }

      text = (result?.steps || [])
        .filter((step: any) => step.type === 'model_output')
        .flatMap((step: any) => step.content || [])
        .filter((part: any) => part.type === 'text')
        .map((part: any) => part.text || '')
        .join('');
    }

    if (!text) {
      return Response.json(
        { success: false, error: 'AI did not return a scan result.' },
        { status: 502 }
      );
    }

    let parsed: any;
    try {
      const cleanedText = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
      parsed = JSON.parse(cleanedText);
    } catch {
      return Response.json({
        success: false,
        error: 'Could not read the scan response. Please try a clearer photo.',
      }, { status: 422 });
    }

    console.log('[RaceScan diagnostic]', JSON.stringify({
      candidateReceived: Boolean(text),
      parsedAsJson: true,
      isHorseRacingTicket: parsed.isHorseRacingTicket ?? null,
      horseNamePresent: Boolean(
        typeof parsed.detectedHorseName === 'string' && parsed.detectedHorseName.trim()
      ),
      trackNamePresent: Boolean(
        typeof parsed.detectedTrack === 'string' && parsed.detectedTrack.trim()
      ),
      rawTextPresent: Boolean(
        typeof parsed.extractedRawText === 'string' && parsed.extractedRawText.trim()
      ),
      confidenceScore: parsed.confidenceScore ?? null,
    }));

    const horseName = typeof parsed.detectedHorseName === 'string'
      ? parsed.detectedHorseName.trim()
      : '';
    const trackName = typeof parsed.detectedTrack === 'string'
      ? parsed.detectedTrack.trim()
      : '';
    const rawText = typeof parsed.extractedRawText === 'string'
      ? parsed.extractedRawText.trim()
      : '';

    if (
      parsed.isHorseRacingTicket === false ||
      !horseName ||
      !trackName ||
      !rawText
    ) {
      return Response.json({
        success: false,
        error: 'Could not recognize a valid horse racing ticket. Please try a clearer photo.',
      }, { status: 422 });
    }

    return Response.json({
      ...parsed,
      detectedHorseName: horseName,
      detectedTrack: trackName,
      finishPosition: Number.isInteger(parsed.finishPosition)
        ? parsed.finishPosition
        : null,
      finishStatus: ['WIN', 'PLACE', 'LOST', 'UPCOMING', 'UNKNOWN'].includes(parsed.finishStatus)
        ? parsed.finishStatus
        : 'UNKNOWN',
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
