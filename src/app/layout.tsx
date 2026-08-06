import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "REBO SALON | Schweinfurt",
  description: "Dein Stil. Deine Zeit. Präzision & Handwerk am Roßmarkt.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#1a1814] text-[#e8e6e3] font-sans-custom selection:bg-[#c5a059] selection:text-[#1a1814] antialiased">
        {children}
      </body>
    </html>
  );
}