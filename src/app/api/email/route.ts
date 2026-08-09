import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  const authHeader = req.headers.get('x-internal-secret');
  if (process.env.NEXT_PUBLIC_INTERNAL_API_SECRET && authHeader !== process.env.NEXT_PUBLIC_INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized request' }, { status: 401 });
  }

  try {
    const { email, subject, message } = await req.json();
    if (!email || !message) return NextResponse.json({ error: 'Email and message are required' }, { status: 400 });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Rebo Salon" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject || 'Rebo Salon Notification',
      text: message,
    });

    return NextResponse.json({ success: true, message: 'Email sent successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Email API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}