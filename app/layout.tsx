import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RAIZ3Y STORE",
  description: "متجر شحن ألعاب إلكتروني آمن وسريع.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
