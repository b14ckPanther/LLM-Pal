import type { Metadata, Viewport } from "next";
import { Cairo, Heebo, Ubuntu } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/layout/app-providers";

const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
});

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "700"],
});

const languageFonts = `${ubuntu.variable} ${cairo.variable} ${heebo.variable}`;

export const viewport: Viewport = {
  themeColor: "#7c5cff",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "LLM Pal",
  description: "Premium multimodal-ready AI chat workspace.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192" },
      { url: "/icon-512.png", sizes: "512x512" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "LLM Pal",
    statusBarStyle: "default",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${languageFonts} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
