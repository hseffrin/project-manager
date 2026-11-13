import type { Metadata } from "next";
import { Encode_Sans } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Header, HeaderFallback } from "@/components/Header/header";

// The designs' font. Variable font: one file covers every weight.
const encodeSans = Encode_Sans({
  variable: "--font-encode-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gerenciador de Projetos",
  description: "Projetos agendados",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${encodeSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {/* Header reads the pathname, which needs a Suspense boundary on
            routes with dynamic params (Cache Components). */}
        <Suspense fallback={<HeaderFallback />}>
          <Header />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
