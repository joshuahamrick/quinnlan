import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
    <html lang="en" className={nunito.className}>
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
