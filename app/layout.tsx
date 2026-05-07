import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FileVault — Secure File Storage",
  description: "Premium end-to-end secure file storage. Beautiful, fast, and built for peace of mind.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
