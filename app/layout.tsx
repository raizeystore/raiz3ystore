import type { Metadata, Viewport } from "next";
import { Alexandria, Cairo } from "next/font/google";
import "./globals.css";
import "./auth-ui.css";
import "./storefront-theme.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900", "1000"],
  display: "swap",
  variable: "--font-cairo",
});

const alexandria = Alexandria({
  subsets: ["arabic", "latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
  variable: "--font-alexandria",
});

export const metadata: Metadata = {
  title: {
    default: "RAIZEY STORE",
    template: "%s | RAIZEY STORE",
  },
  description: "متجر شحن ألعاب وخدمات رقمية بتجربة سريعة وآمنة.",
};

export const viewport: Viewport = {
  themeColor: "#fffaf6",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${alexandria.variable}`}>
      <body>{children}</body>
    </html>
  );
}
