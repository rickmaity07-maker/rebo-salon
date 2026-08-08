import { NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

export async function POST(request: Request) {
  try {
    const { phone, message } = await request.json();

    if (!phone) {
      return NextResponse.json({ success: false, error: 'Missing phone number' }, { status: 400 });
    }

    const client = twilio(accountSid, authToken);

    // Format phone number to ensure E.164 standard (+49 for Germany)
    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+49' + formattedPhone.slice(1);
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+49' + formattedPhone;
    }

    const response = await client.messages.create({
      // We are now passing the actual custom text message here!
      body: message,
      from: twilioPhone,
      to: formattedPhone,
    });

    return NextResponse.json({ success: true, sid: response.sid });
  } catch (error: any) {
    console.error('Twilio Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}