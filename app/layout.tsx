import type { Metadata, Viewport } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/layout/Sidebar";
import SiteHeader from "@/components/layout/SiteHeader";
import { TooltipProvider } from "@/components/ui/tooltip";
import "leaflet/dist/leaflet.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ClimaPH",
  description: "High-performance environmental telemetry and weather dashboard for the Philippines, featuring real-time localized emergency alerts and atmospheric monitoring.",
  icons: {
    icon: "/icon.svg",
  },
  applicationName: "ClimaPH",
  authors: [
    { 
      name: "Ian Macabulos", 
      url: "https://www.iansebastian.dev/"
    }
  ],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={instrumentSans.variable}>
      <body className="font-sans antialiased h-screen w-full overflow-hidden bg-background text-foreground selection:bg-primary/30">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={200}>
            <div className="flex h-screen w-full overflow-hidden">
              <Sidebar />
              
              <div className="flex flex-1 flex-col min-w-0 h-full">
                <SiteHeader />
                <main className="flex-1 overflow-y-auto scroll-smooth z-10 will-change-scroll">
                  {children}
                </main>
              </div>
            </div>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}