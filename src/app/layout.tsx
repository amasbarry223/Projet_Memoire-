import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ESGic · Gestion des Inscriptions et Suivi Pédagogique",
  description: "Interface web centralisée pour la gestion des inscriptions, le suivi pédagogique et l'automatisation avec n8n et l'IA.",
  keywords: ["ESGic", "Inscriptions", "Suivi pédagogique", "RBAC", "n8n", "IA", "Éducation"],
  authors: [{ name: "ESGic" }],
  icons: {
    icon: "/logo-esgic.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
