import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/layout/Sidebar";
import SiteHeader from "@/components/layout/SiteHeader";
import { TooltipProvider } from "@/components/ui/tooltip";
import "leaflet/dist/leaflet.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClimaPH",
  description: "High-performance environmental telemetry dashboard.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${instrumentSans.variable} font-sans antialiased h-screen w-full overflow-hidden bg-background text-foreground selection:bg-primary/30`}>
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