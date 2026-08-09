import { NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(req: Request) {
  const authHeader = req.headers.get('x-internal-secret');
  if (process.env.NEXT_PUBLIC_INTERNAL_API_SECRET && authHeader !== process.env.NEXT_PUBLIC_INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized request' }, { status: 401 });
  }

  try {
    const { phone, message } = await req.json();
    if (!phone || !message) return NextResponse.json({ error: 'Phone and message are required' }, { status: 400 });

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhone) {
      return NextResponse.json({ error: 'Twilio credentials not configured' }, { status: 500 });
    }

    const client = twilio(accountSid, authToken);
    const cleanPhone = phone.replace(/\s+/g, '');

    const response = await client.messages.create({
      body: message,
      from: twilioPhone,
      to: cleanPhone,
    });

    return NextResponse.json({ success: true, sid: response.sid }, { status: 200 });
  } catch (error: any) {
    console.error('SMS API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send SMS' }, { status: 500 });
  }
}