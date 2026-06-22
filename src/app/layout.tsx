import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL("https://almonther.studio"),
  title: "Bialetti Moka Express - Interactive 3D Experience",
  description: "Explore the deconstructed engineering, thermodynamics, and design physics of the iconic Italian Bialetti Moka Pot in an interactive 3D anti-gravity experience.",
  icons: {
    icon: "/moka_logo.png",
    apple: "/moka_logo.png",
  },
  openGraph: {
    title: "Bialetti Moka Express - Interactive 3D Experience",
    description: "Explore the deconstructed engineering, thermodynamics, and design physics of the iconic Italian Bialetti Moka Pot in an interactive 3D anti-gravity experience.",
    url: "https://almonther.studio/",
    siteName: "Bialetti Moka Pot 3D Lab",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Bialetti Moka Express - Interactive 3D Experience",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bialetti Moka Express - Interactive 3D Experience",
    description: "Explore the deconstructed engineering, thermodynamics, and design physics of the iconic Italian Bialetti Moka Pot in an interactive 3D anti-gravity experience.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
