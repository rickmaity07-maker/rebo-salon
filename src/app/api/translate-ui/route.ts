import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebaseAdmin';

const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
// Free-tier keys (ending in :fx) must use the api-free host; paid keys use api.deepl.com
const DEEPL_ENDPOINT = DEEPL_API_KEY?.endsWith(':fx')
  ? 'https://api-free.deepl.com/v2/translate'
  : 'https://api.deepl.com/v2/translate';

// DeepL uses its own language codes, which don't always match the simple
// ISO codes used elsewhere in this app. Map from the app's codes to DeepL's.
// 'hi' (Hindi) is intentionally omitted — DeepL does not support it yet.
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

// Flattens the nested translation dictionary into a flat list of strings
// (with their paths) so every string can be translated in ONE batched DeepL
// request instead of one network call per string.
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

// Reconstructs the nested structure from the flat list, using the original
// object as a shape template so array-vs-object structure is preserved.
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

export async function POST(req: Request) {
  const authHeader = req.headers.get('x-internal-secret');
  if (process.env.NEXT_PUBLIC_INTERNAL_API_SECRET && authHeader !== process.env.NEXT_PUBLIC_INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized request' }, { status: 401 });
  }

  if (!DEEPL_API_KEY) {
    console.error('DEEPL_API_KEY is not set in .env.local');
    return NextResponse.json({ error: 'Translation service not configured' }, { status: 500 });
  }

  try {
    const { targetLang, sourceDict } = await req.json();
    if (!targetLang || !sourceDict) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });

    const deeplLang = LANG_CODE_MAP[targetLang];
    if (!deeplLang) {
      return NextResponse.json(
        { error: `Sprache "${targetLang}" wird von DeepL derzeit nicht unterstützt.` },
        { status: 400 }
      );
    }

    const leaves = flatten(sourceDict);
    const texts = leaves.map(l => l.text);

    // DeepL accepts up to 50 texts per request on the free tier; chunk to be safe.
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
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`DeepL API error (${res.status}):`, errText);
        return NextResponse.json({ error: `DeepL API error: ${res.status}` }, { status: 502 });
      }

      const data = await res.json();
      translatedTexts.push(...data.translations.map((t: { text: string }) => t.text));
    }

    const translatedMap = new Map<string, string>();
    leaves.forEach((leaf, i) => translatedMap.set(leaf.path.join('.'), translatedTexts[i]));

    const translatedDict = unflatten(sourceDict, translatedMap);

    // Persist via the Admin SDK, which bypasses Firestore security rules —
    // this is a system-level cache write, not something a visiting browser
    // should ever need admin rights to do.
    try {
      await adminDb.doc('settings/translations').set({ [targetLang]: translatedDict }, { merge: true });
    } catch (cacheError) {
      // Don't fail the whole request if only the caching step has an issue —
      // the person still gets their translation, it just won't persist for
      // future visitors this time.
      console.error('Failed to cache translation in Firestore:', cacheError);
    }

    return NextResponse.json({ success: true, translatedDict }, { status: 200 });

  } catch (error: any) {
    console.error('UI Translation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}