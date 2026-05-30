import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carle",
  description:
    "Vibe-code a single component, train an agent on it, deploy it to build the whole site.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
