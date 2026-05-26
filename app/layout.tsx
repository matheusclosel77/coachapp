import type { Metadata } from "next";
import { Geist_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "@/components/providers";
import { AppFrame } from "@/components/app-frame";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Coach App — Gestão de Aulas",
  description: "Painel de gestão de aulas, clientes, créditos e contratos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={cn("font-sans", ibmPlexSans.variable)}>
      <body className={`${geistMono.variable} antialiased`}>
        <Providers>
          <TooltipProvider>
            <AppFrame>{children}</AppFrame>
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
