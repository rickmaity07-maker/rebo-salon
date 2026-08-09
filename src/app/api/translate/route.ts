import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Check authorization secret header
  const authHeader = req.headers.get('x-internal-secret');
  if (process.env.NEXT_PUBLIC_INTERNAL_API_SECRET && authHeader !== process.env.NEXT_PUBLIC_INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized request' }, { status: 401 });
  }

  try {
    const { text, targetLang } = await req.json();

    if (!text || !targetLang) {
      return NextResponse.json({ error: 'Text and targetLang are required' }, { status: 400 });
    }

    // Call free translation service endpoint or your preferred AI API
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${targetLang === 'en' ? 'de|en' : 'en|de'}`
    );
    const data = await response.json();

    const translatedText = data.responseData?.translatedText || text;

    return NextResponse.json({ success: true, translatedText }, { status: 200 });
  } catch (error: any) {
    console.error('Translation API Error:', error);
    return NextResponse.json({ error: 'Failed to translate' }, { status: 500 });
  }
}