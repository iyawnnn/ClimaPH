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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://climaph.iansebastian.dev"),
  title: {
    default: "ClimaPH | Weather for the Philippines",
    template: "%s | ClimaPH",
  },
  description: "Get real-time weather updates and typhoon tracking for the Philippines. ClimaPH provides accurate local forecasts, interactive radar maps, and fast emergency alerts to keep you prepared and safe.",
  keywords: [
    "Philippine weather",
    "typhoon tracker",
    "live weather radar Philippines",
    "local weather forecast",
    "rain map",
    "weather alerts",
    "ClimaPH"
  ],
  openGraph: {
    title: "ClimaPH | Weather for the Philippines",
    description: "Get real-time weather updates and typhoon tracking for the Philippines. View accurate local forecasts and interactive radar maps.",
    url: "/",
    siteName: "ClimaPH",
    locale: "en_PH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClimaPH | Weather for the Philippines",
    description: "Get real-time weather updates and typhoon tracking for the Philippines. View accurate local forecasts and interactive radar maps.",
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