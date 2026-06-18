import { Outfit } from "next/font/google";
import "./globals.css";
import Providers from "@/providers"; // 1. Import the providers

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} antialiased`}>
        {/* 2. Wrap the children inside Providers */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

