import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cash3 Probability Engine",
  description: "Clean Cash 3 analytics dashboard with saved picks and weighted recommendations",
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
