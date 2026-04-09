import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quinnlan — Production Schedule Builder",
  description: "Build and export professional production shoot schedules",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen flex flex-col bg-white antialiased">
        <header className="border-b border-gray-200 px-6 py-3">
          <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">
            Quinnlan
          </Link>
        </header>
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
