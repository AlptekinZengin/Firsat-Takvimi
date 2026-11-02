import type { IlanGorunur } from "@/lib/ilan-sema";

export function gunEkle(tarih: string, gun: number): string {
  const sonuc = new Date(`${tarih}T00:00:00Z`);
  sonuc.setUTCDate(sonuc.getUTCDate() + gun);
  return sonuc.toISOString().slice(0, 10);
}

export function tarihGruplari(ilanlar: IlanGorunur[], bugun: string) {
  const tarih = new Date(`${bugun}T00:00:00Z`);
  const pazar = gunEkle(bugun, (7 - tarih.getUTCDay()) % 7);
  const gelecekPazar = gunEkle(pazar, 7);
  const aySonu = new Date(Date.UTC(tarih.getUTCFullYear(), tarih.getUTCMonth() + 1, 0))
    .toISOString()
    .slice(0, 10);
  const [ilk, ...kalan] = ilanlar;
  const ileri = kalan.filter(i => i.son_basvuru > gelecekPazar && i.son_basvuru > aySonu);
  return [
    {
      ad: "Son günü en yakın",
      id: "en-yakin",
      bicim: "buyuk" as const,
      bas: ilk?.son_basvuru,
      son: ilk?.son_basvuru,
      ilanlar: ilk ? [ilk] : [],
    },
    {
      ad: "Bu hafta kapanacaklar",
      id: "bu-hafta",
      bicim: "kart" as const,
      bas: bugun,
      son: pazar,
      ilanlar: kalan.filter(i => i.son_basvuru <= pazar),
    },
    {
      ad: "Gelecek hafta kapanacaklar",
      id: "gelecek-hafta",
      bicim: "kart" as const,
      bas: gunEkle(pazar, 1),
      son: gelecekPazar,
      ilanlar: kalan.filter(i => i.son_basvuru > pazar && i.son_basvuru <= gelecekPazar),
    },
    {
      ad: "Bu ay",
      id: "bu-ay",
      bicim: "satir" as const,
      bas: gunEkle(gelecekPazar, 1),
      son: aySonu,
      ilanlar: kalan.filter(i => i.son_basvuru > gelecekPazar && i.son_basvuru <= aySonu),
    },
    {
      ad: "Daha ileri",
      id: "daha-ileri",
      bicim: "satir" as const,
      bas: ileri[0]?.son_basvuru,
      son: ileri.at(-1)?.son_basvuru,
      ilanlar: ileri,
    },
  ];
}

function kisaTarih(tarih: string, yilli: boolean) {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    ...(yilli && { year: "numeric" }),
  }).format(new Date(`${tarih}T00:00:00Z`));
}

function gunAdi(tarih: string) {
  return new Intl.DateTimeFormat("tr-TR", { timeZone: "UTC", weekday: "long" })
    .format(new Date(`${tarih}T00:00:00Z`));
}

export function aralikYaz(bas: string, son: string, bugun: string) {
  // Yıl yalnız bugünün yılından farklıysa yazılır.
  const yilli = (t: string) => t.slice(0, 4) !== bugun.slice(0, 4);
  if (bas === son) return kisaTarih(bas, yilli(bas));
  if (bas.slice(0, 7) === son.slice(0, 7)) return `${Number(bas.slice(8))}–${kisaTarih(son, yilli(son))}`;
  return `${kisaTarih(bas, yilli(bas))} – ${kisaTarih(son, yilli(son))}`;
}

type GrupOzeti = ReturnType<typeof tarihGruplari>[number];

export function grupNotu(grup: GrupOzeti, bugun: string) {
  if (grup.bicim === "buyuk") {
    const yilli = grup.bas!.slice(0, 4) !== bugun.slice(0, 4);
    return `Son gün: ${gunAdi(grup.bas!)}, ${kisaTarih(grup.bas!, yilli)}`;
  }
  const aralik = aralikYaz(grup.bas!, grup.son!, bugun);
  return grup.bicim === "satir" ? `${aralik} · liste görünümü` : `${aralik} · ${grup.ilanlar.length} ilan`;
}
