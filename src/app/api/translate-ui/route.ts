import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebaseAdmin';
import { validateRequest, translateUiRequestSchema, createAuditLog, logAudit } from '@/lib/validation';

const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
const DEEPL_ENDPOINT = DEEPL_API_KEY?.endsWith(':fx')
  ? 'https://api-free.deepl.com/v2/translate'
  : 'https://api.deepl.com/v2/translate';

const LANG_CODE_MAP: Record<string, string> = {
  en: 'EN-US',
  es: 'ES',
  fr: 'FR',
  it: 'IT',
  nl: 'NL',
  tr: 'TR',
  pl: 'PL',
  ru: 'RU',
  ar: 'AR',
  zh: 'ZH',
  ja: 'JA',
};

type LeafPath = string[];

function flatten(obj: any, path: LeafPath = [], out: { path: LeafPath; text: string }[] = []) {
  if (typeof obj === 'string') {
    out.push({ path, text: obj });
  } else if (Array.isArray(obj)) {
    obj.forEach((item, i) => flatten(item, [...path, String(i)], out));
  } else if (obj && typeof obj === 'object') {
    for (const key in obj) flatten(obj[key], [...path, key], out);
  }
  return out;
}

function unflatten(template: any, translatedTexts: Map<string, string>, path: LeafPath = []): any {
  if (typeof template === 'string') {
    return translatedTexts.get(path.join('.')) ?? template;
  } else if (Array.isArray(template)) {
    return template.map((item, i) => unflatten(item, translatedTexts, [...path, String(i)]));
  } else if (template && typeof template === 'object') {
    const result: any = {};
    for (const key in template) result[key] = unflatten(template[key], translatedTexts, [...path, key]);
    return result;
  }
  return template;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let userId: string | undefined;

  try {
    // Verify internal API secret
    const authHeader = req.headers.get('x-internal-secret');
    if (process.env.INTERNAL_API_SECRET && authHeader !== process.env.INTERNAL_API_SECRET) {
      const auditLog = createAuditLog(req, undefined, undefined, 'translate_ui', undefined, 'translation_cache', false, 'Invalid internal API secret');
      logAudit(auditLog);
      return NextResponse.json({ error: 'Unauthorized request' }, { status: 401 });
    }

    if (!DEEPL_API_KEY) {
      const auditLog = createAuditLog(req, userId, undefined, 'translate_ui', undefined, 'translation_cache', false, 'DeepL API key not configured');
      logAudit(auditLog);
      return NextResponse.json({ error: 'Translation service not configured' }, { status: 503 });
    }

    // Validate request body
    const body = await req.json();
    const validation = validateRequest(translateUiRequestSchema, body);

    if (!validation.success) {
      const auditLog = createAuditLog(req, userId, undefined, 'translate_ui', undefined, 'translation_cache', false, 'Validation failed', { errors: validation.errors.flatten() });
      logAudit(auditLog);
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors.flatten() },
        { status: 400 }
      );
    }

    const { targetLang, sourceDict } = validation.data;

    const deeplLang = LANG_CODE_MAP[targetLang];
    if (!deeplLang) {
      const auditLog = createAuditLog(req, userId, undefined, 'translate_ui', undefined, 'translation_cache', false, `Unsupported language: ${targetLang}`);
      logAudit(auditLog);
      return NextResponse.json(
        { error: `Language "${targetLang}" is not supported by DeepL` },
        { status: 400 }
      );
    }

    const leaves = flatten(sourceDict);
    const texts = leaves.map(l => l.text);

    // DeepL accepts up to 50 texts per request on free tier; chunk to be safe
    const CHUNK_SIZE = 50;
    const translatedTexts: string[] = [];

    for (let i = 0; i < texts.length; i += CHUNK_SIZE) {
      const chunk = texts.slice(i, i + CHUNK_SIZE);
      const res = await fetch(DEEPL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: chunk, target_lang: deeplLang, source_lang: 'DE' }),
        signal: AbortSignal.timeout(30000),
      });

      if (!res.ok) {
        const errText = await res.text();
        const auditLog = createAuditLog(req, userId, undefined, 'translate_ui', undefined, 'translation_cache', false, `DeepL API error: ${res.status}`, { error: errText });
        logAudit(auditLog);
        return NextResponse.json({ error: `Translation service error: ${res.status}` }, { status: 502 });
      }

      const data = await res.json();
      translatedTexts.push(...data.translations.map((t: { text: string }) => t.text));
    }

    const translatedMap = new Map<string, string>();
    leaves.forEach((leaf, i) => translatedMap.set(leaf.path.join('.'), translatedTexts[i]));

    const translatedDict = unflatten(sourceDict, translatedMap);

    // Persist via Admin SDK (bypasses Firestore security rules - system-level cache write)
    try {
      await adminDb.doc('settings/translations').set({ [targetLang]: translatedDict }, { merge: true });
    } catch (cacheError) {
      // Don't fail the whole request if only caching has an issue
      console.error('Failed to cache translation in Firestore:', cacheError);
    }

    const auditLog = createAuditLog(req, userId, undefined, 'translate_ui', undefined, 'translation_cache', true, undefined, {
      targetLang,
      stringsTranslated: texts.length,
      durationMs: Date.now() - startTime,
    });
    logAudit(auditLog);

    return NextResponse.json({ success: true, translatedDict }, { status: 200 });
  } catch (error: any) {
    const auditLog = createAuditLog(req, userId, undefined, 'translate_ui', undefined, 'translation_cache', false, error.message || 'Translation failed', {
      durationMs: Date.now() - startTime,
    });
    logAudit(auditLog);

    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    );
  }
}