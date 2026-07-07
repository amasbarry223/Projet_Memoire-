import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

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
    <html lang="fr">
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
