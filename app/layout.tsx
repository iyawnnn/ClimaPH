import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import SiteHeader from "@/components/layout/SiteHeader";
import { TooltipProvider } from "@/components/ui/tooltip";

const googleSans = localFont({
  src: [
    {
      path: "../public/fonts/GoogleSans-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/GoogleSans-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/GoogleSans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-google-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "ClimaPH",
    template: "%s | ClimaPH",
  },
  description: "High-performance environmental telemetry and weather dashboard for the Philippines. Features real-time localized emergency alerts and atmospheric monitoring.",
  keywords: ["weather", "Philippines", "telemetry", "emergency alerts", "ClimaPH", "radar"],
  openGraph: {
    title: "ClimaPH",
    description: "High-performance environmental telemetry and weather dashboard for the Philippines.",
    url: "/",
    siteName: "ClimaPH",
    locale: "en_PH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClimaPH",
    description: "High-performance environmental telemetry and weather dashboard for the Philippines.",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-touch-icon.png",
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
    <html lang="en" suppressHydrationWarning className={googleSans.variable}>
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
                {/* Added relative, flex, flex-col, and min-h-0.
                  This guarantees the main container strictly bounds any absolute or heavy children.
                */}
                <main className="relative flex flex-1 flex-col min-h-0 overflow-y-auto scroll-smooth z-10 will-change-scroll">
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