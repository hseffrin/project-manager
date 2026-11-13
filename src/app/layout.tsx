import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Header, HeaderFallback } from "@/components/Header/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gerenciador de Projetos",
  description: "Projetos agendados",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
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
