// app/layout.tsx
"use client";

import { usePathname } from "next/navigation";
import { Inter } from "next/font/google";
import "./globals.css";
import ChatbotWrapper from "./components/ChatbotWrapper";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isWbos = pathname?.startsWith("/wbos/");

  return (
    <html lang="en">
      <head>
        {/* ✅ PWA – Only load on WBOS pages */}
        {isWbos ? (
          <>
            <link rel="manifest" href="/wbos/manifest.json" />
            <meta name="theme-color" content="#0068e3" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          </>
        ) : (
          <>
            {/* Agency site – no PWA manifest */}
            <meta name="theme-color" content="#ffffff" />
          </>
        )}

        {/* ✅ Favicon (always load) */}
        <link rel="icon" href="/favicon.ico" sizes="any" />

        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-0RS96NZPSJ"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-0RS96NZPSJ');
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
        <ChatbotWrapper />
      </body>
    </html>
  );
}