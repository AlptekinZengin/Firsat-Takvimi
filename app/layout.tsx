import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Fırsat Takvimi",
  description: "Üniversite öğrencilerine açık burs, staj, hackathon ve yarışmalar, son başvuru tarihleriyle.",
};
export default function KokLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
