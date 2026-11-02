import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
const yaziTipi = Bricolage_Grotesque({ subsets: ["latin", "latin-ext"], variable: "--yazi-tipi" });
export const metadata: Metadata = {
  title: "Fırsat Takvimi",
  description: "Üniversite öğrencilerine açık burs, staj, hackathon ve yarışmalar, son başvuru tarihleriyle.",
};
export default function KokLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body className={yaziTipi.variable}>{children}</body>
    </html>
  );
}
