import type { Metadata } from "next";
import { Nunito, Inter, Poppins, Roboto, Open_Sans, Montserrat, Lato, Raleway, Source_Sans_3, Cabin, Karla, Rubik, DM_Sans, Josefin_Sans, Comfortaa, Outfit } from "next/font/google";
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

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-raleway",
});

const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-source-sans-3",
});

const cabin = Cabin({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cabin",
});

const karla = Karla({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-karla",
});

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-rubik",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-dm-sans",
});

const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-josefin-sans",
});

const comfortaa = Comfortaa({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-comfortaa",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-outfit",
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
      className={`${nunito.variable} ${inter.variable} ${poppins.variable} ${roboto.variable} ${openSans.variable} ${montserrat.variable} ${lato.variable} ${raleway.variable} ${sourceSans3.variable} ${cabin.variable} ${karla.variable} ${rubik.variable} ${dmSans.variable} ${josefinSans.variable} ${comfortaa.variable} ${outfit.variable} ${nunito.className}`}
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
