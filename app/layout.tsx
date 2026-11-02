import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
const yaziTipi = Bricolage_Grotesque({ subsets: ["latin", "latin-ext"], variable: "--yazi-tipi" });
export const metadata: Metadata = {
  title: "Fırsat Takvimi",
  description: "Üniversite öğrencilerine açık burs, staj, hackathon ve yarışmalar, son başvuru tarihleriyle.",
  metadataBase: new URL("https://firsat-takvimi.com"),
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Fırsat Takvimi",
    title: "Fırsat Takvimi",
    description: "Üniversite öğrencilerine açık burs, staj, hackathon ve yarışmalar, son başvuru tarihleriyle.",
    url: "https://firsat-takvimi.com",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Fırsat Takvimi" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fırsat Takvimi",
    description: "Üniversite öğrencilerine açık burs, staj, hackathon ve yarışmalar, son başvuru tarihleriyle.",
    images: [{ url: "/og.png", alt: "Fırsat Takvimi" }],
  },
};
export default function KokLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body className={yaziTipi.variable}>{children}</body>
    </html>
  );
}
