export const bolumler = [
  { slug: "yarismalar", ad: "Yarışmalar", sira: 1 },
  { slug: "hackathonlar", ad: "Hackathonlar", sira: 2 },
  { slug: "burslar", ad: "Burslar", sira: 3 },
  { slug: "stajlar", ad: "Stajlar", sira: 4 },
  { slug: "arastirma-destekleri", ad: "Araştırma ve proje destekleri", sira: 5 },
  { slug: "yurt-disi-degisim", ad: "Yurt dışı ve değişim programları", sira: 6 },
  { slug: "egitim-bootcamp", ad: "Eğitim programları ve bootcamp'ler", sira: 7 },
  { slug: "etkinlik-zirve", ad: "Etkinlik, zirve ve konferanslar", sira: 8 },
  { slug: "gonulluluk-genclik", ad: "Gönüllülük ve gençlik programları", sira: 9 },
] as const;
export const bolumGruplari: { slug: string; ad: string; bolumler: string[] }[] = [
  { slug: "yarisma", ad: "Yarışma", bolumler: ["yarismalar", "hackathonlar"] },
  { slug: "burs-destek", ad: "Burs ve destek", bolumler: ["burslar", "arastirma-destekleri"] },
  { slug: "staj", ad: "Staj", bolumler: ["stajlar"] },
  { slug: "egitim-etkinlik", ad: "Eğitim ve etkinlik", bolumler: ["egitim-bootcamp", "etkinlik-zirve"] },
  { slug: "yurtdisi-gonulluluk", ad: "Yurt dışı ve gönüllülük", bolumler: ["yurt-disi-degisim", "gonulluluk-genclik"] },
];
export const maddiBolumler = ["burslar", "stajlar", "arastirma-destekleri"] as const;
export const kurumVerenEtiketleri = [
  "Kamu",
  "Vakıf/Dernek",
  "Şirket",
  "Üniversite",
  "Uluslararası",
  "Diğer",
] as const;
export const digerVerenEtiketleri = ["Kurum", "Topluluk"] as const;
