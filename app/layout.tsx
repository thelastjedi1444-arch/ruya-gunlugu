
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rüya Günlüğü",
  description: "Rüyalarını kaydet, kendini keşfet.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} flex h-screen overflow-hidden bg-[#0a0a0a]`}>
        <Providers>
          <main className="flex-1 relative flex flex-col overflow-hidden w-full h-full">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
