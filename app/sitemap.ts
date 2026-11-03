import type { MetadataRoute } from "next";
import { ilanlariGetir } from "@/lib/ilanlar";

export const dynamic = "force-static";

export default function siteHaritasi(): MetadataRoute.Sitemap {
  // En son kontrol edilen ilanın günü, sayfanın son değişikliği sayılır.
  const sonGun = ilanlariGetir()
    .flatMap((i) => (i.son_kontrol ? [i.son_kontrol] : []))
    .sort()
    .at(-1);
  return [
    {
      url: "https://firsat-takvimi.com/",
      lastModified: sonGun,
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
