import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cash 3 Edge",
  description: "Cash 3 Edge — an independent number tracking and visualization tool for entertainment purposes. Not affiliated with any lottery organization.",
  applicationName: "Cash 3 Edge",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Cash 3 Edge",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // lets content extend behind notch / home bar
  themeColor: "#020b2d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
