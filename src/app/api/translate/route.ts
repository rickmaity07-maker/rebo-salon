import { NextRequest, NextResponse } from 'next/server';
import { validateRequest, translateRequestSchema, createAuditLog, logAudit } from '@/lib/validation';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let userId: string | undefined;

  try {
    // Verify internal API secret
    const authHeader = req.headers.get('x-internal-secret');
    if (process.env.INTERNAL_API_SECRET && authHeader !== process.env.INTERNAL_API_SECRET) {
      const auditLog = createAuditLog(req, undefined, undefined, 'translate', undefined, 'translation', false, 'Invalid internal API secret');
      logAudit(auditLog);
      return NextResponse.json({ error: 'Unauthorized request' }, { status: 401 });
    }

    // Validate request body
    const body = await req.json();
    const validation = validateRequest(translateRequestSchema, body);

    if (!validation.success) {
      const auditLog = createAuditLog(req, userId, undefined, 'translate', undefined, 'translation', false, 'Validation failed', { errors: validation.errors.flatten() });
      logAudit(auditLog);
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors.flatten() },
        { status: 400 }
      );
    }

    const { text, targetLang } = validation.data;

    // MyMemory API (free tier)
    const sourceLang = targetLang === 'en' ? 'de' : 'en';
    const langPair = `${sourceLang}|${targetLang}`;

    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`,
      {
        headers: {
          'User-Agent': 'ReboSalon/1.0',
        },
        // Timeout after 10 seconds
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      const auditLog = createAuditLog(req, userId, undefined, 'translate', undefined, 'translation', false, `MyMemory API error: ${response.status}`);
      logAudit(auditLog);
      return NextResponse.json({ error: 'Translation service unavailable' }, { status: 502 });
    }

    const data = await response.json();

    const translatedText = data.responseData?.translatedText || text;

    const auditLog = createAuditLog(req, userId, undefined, 'translate', undefined, 'translation', true, undefined, {
      sourceLang,
      targetLang,
      textLength: text.length,
      durationMs: Date.now() - startTime,
    });
    logAudit(auditLog);

    return NextResponse.json({ success: true, translatedText }, { status: 200 });
  } catch (error: any) {
    const auditLog = createAuditLog(req, userId, undefined, 'translate', undefined, 'translation', false, error.message || 'Failed to translate', {
      durationMs: Date.now() - startTime,
    });
    logAudit(auditLog);

    return NextResponse.json(
      { error: 'Failed to translate' },
      { status: 500 }
    );
  }
}