import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Plickify Academy | AI দিয়ে Smart Work, Smart Income",
    template: "%s | Plickify Academy",
  },
  description:
    "Plickify Academy Batch 2026 - AI দিয়ে Smart Work, Smart Income. ৩ মাসে ৩টি Income Stream তৈরি করুন Plickify Academy-তে।",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "bn_BD",
    siteName: "Plickify Academy",
    title: "Plickify Academy | AI দিয়ে Smart Work, Smart Income",
    description:
      "AI-Assisted Workflow ব্যবহার করে ৩ মাসে ৩টি Income Stream তৈরি করুন এবং আপনার Skill কে Income-এ Convert করতে শিখুন।",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster
          position="top-center"
          richColors
          closeButton
        />
      </body>
    </html>
  );
}
