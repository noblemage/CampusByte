import type { Metadata } from "next";
import { Outfit, Zen_Dots } from "next/font/google";
import { Toaster } from 'sonner';
import "./globals.css";
import Providers from "@/providers";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const pixelFont = Zen_Dots({
  weight: "400",
  variable: "--font-pixel",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CampusBytes.",
  description: "Student mess management and meal verification system.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${outfit.variable} ${pixelFont.variable} antialiased`}>
        <Providers>{children}</Providers>
        <Toaster position="top-center" theme="dark" richColors />
      </body>
    </html>
  );
}
