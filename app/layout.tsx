import type { Metadata } from "next";
import { Geist, Geist_Mono, Orbitron } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Game Score",
  description: "AI-powered gameplay analysis",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-grid`}>
        <Providers session={session}>
          <header className="relative border-b border-white/10 bg-black/40 backdrop-blur">
            <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
              <Link href="/" className={`${orbitron.className} text-xl font-semibold neon tracking-wider`}>Game Score</Link>
              <nav className="flex gap-6 text-sm">
                <Link href="/upload" className="text-zinc-300 hover:text-cyan-300">Upload</Link>
                <Link href="/dashboard" className="text-zinc-300 hover:text-cyan-300">Dashboard</Link>
                <Link href="/auth" className="text-zinc-300 hover:text-cyan-300">Account</Link>
              </nav>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-cyan-400/40 via-transparent to-violet-500/40" />
          </header>
          <main className="max-w-6xl mx-auto p-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
