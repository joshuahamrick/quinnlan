import type { Metadata } from "next";
import { Nunito, Inter, Poppins, Roboto, Open_Sans, Montserrat, Lato } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-nunito",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-open-sans",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
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
    <html
      lang="en"
      className={`${nunito.variable} ${inter.variable} ${poppins.variable} ${roboto.variable} ${openSans.variable} ${montserrat.variable} ${lato.variable} ${nunito.className}`}
    >
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
