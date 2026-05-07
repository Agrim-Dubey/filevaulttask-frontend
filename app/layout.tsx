import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FileVault | Secure File Management",
  description: "Experience the next generation of secure, fast, and beautiful file storage.",
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
