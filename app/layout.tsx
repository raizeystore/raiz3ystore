import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./auth-ui.css";
import "./auth-visual-v2.css";

export const metadata: Metadata = {
  title: {
    default: "RAIZEY STORE",
    template: "%s | RAIZEY STORE",
  },
  description: "متجر شحن ألعاب وخدمات رقمية بتجربة سريعة وآمنة.",
};

export const viewport: Viewport = {
  themeColor: "#080808",
  colorScheme: "dark",
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
