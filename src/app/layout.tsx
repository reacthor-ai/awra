import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ProviderInitializer } from "@/provider/ProviderInitializer";
import { AuthProvider } from "@/provider/AuthProvider";
import NextTopLoader from 'nextjs-toploader';
import { GoogleAnalytics } from '@next/third-parties/google'
import { ThemeProvider } from "@/provider/ThemeProvider";
import { Toaster } from "@/components/ui/toaster"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "awra",
};

export default async function RootLayout(props: Readonly<{ children: React.ReactNode }>) {
  const {children} = props
  return (
    <html lang="en" suppressHydrationWarning>
    <body
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
    <meta name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no"/>
    <meta name="apple-mobile-web-app-capable" content="yes"/>
    <meta name="mobile-web-app-capable" content="yes"/>
    <meta name="theme-color" content="#ffffff"/>
    <NextTopLoader
      color="hsl(229 100% 62%)"
      initialPosition={0.08}
      crawlSpeed={200}
      height={4}
      crawl={true}
      showSpinner={false}
      easing="ease"
      speed={200}
      shadow="0 0 0px hsl(229 100% 62%),0 0 0px hsl(229 100% 62%)"
      template='<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
      zIndex={1600}
      showAtBottom={false}
    />
    <AuthProvider>
      <ProviderInitializer>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster/>
        </ThemeProvider>
        {
          process.env.NODE_ENV === 'production' && (
            <GoogleAnalytics gaId={process.env.GOOGLE_ID ?? ''}/>
          )
        }
      </ProviderInitializer>
    </AuthProvider>
    </body>
    </html>
  );
}
