import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { ilanSemasi } from "../lib/ilan-sema";
import { istanbulBugunu } from "../lib/tarih";
const args = process.argv.slice(2);
const bugunIndeks = args.indexOf("--bugun");
const bilinmeyenBayrak = args.find((a) => a.startsWith("--") && a !== "--bugun");
if (bilinmeyenBayrak) {
  console.error(`HATA  bilinmeyen seçenek: ${bilinmeyenBayrak}`);
  process.exit(1);
}
const kokArg = args.find((a, i) => a !== "--bugun" && !(bugunIndeks >= 0 && i === bugunIndeks + 1));
let bugun = bugunIndeks >= 0 ? args[bugunIndeks + 1] : undefined;
if (bugunIndeks >= 0 && !/^\d{4}-\d{2}-\d{2}$/.test(bugun ?? "")) {
  console.error("HATA  --bugun: YYYY-MM-DD biçiminde tarih gerekli.");
  process.exit(1);
}
if (!bugun) bugun = istanbulBugunu();
const kok = path.resolve(kokArg ?? "ilanlar");
if (!fs.existsSync(kok) || !fs.statSync(kok).isDirectory()) {
  console.error(`HATA  klasör bulunamadı: ${kok}`);
  process.exit(1);
}
const dosyalar: string[] = [];
function tara(dizin: string) {
  for (const g of fs.readdirSync(dizin, { withFileTypes: true })) {
    const p = path.join(dizin, g.name);
    if (g.isDirectory()) tara(p);
    else if (g.isFile() && /\.ya?ml$/i.test(g.name)) dosyalar.push(p);
  }
}
tara(kok);
if (!dosyalar.length) {
  console.log("ilan dosyası bulunamadı");
  process.exit(0);
}
let hatalar = 0;
let uyarilar = 0;
function bildir(tur: "HATA" | "UYARI", dosya: string, mesaj: string) {
  console.log(`${tur}  ${path.relative(process.cwd(), dosya)}: ${mesaj}`);
  if (tur === "HATA") hatalar++;
  else uyarilar++;
}
// Yardımcı bir süzgeçtir, tam koruma değildir. İfadeler normallestir() çıktısı biçiminde yazılır:
// Türkçe küçük harf, ASCII'ye indirilmiş, boşluklar teke düşürülmüş. Yorum satırları da taranır.
// Proje kuralı: öğrencinin para ödediği hiçbir ilan siteye girmez; hepsi her bölümde HATA.
// Öğrenciye ödenen para (maaş, ücretli staj, burs miktarı) kural dışıdır; bu yüzden "ücret ödenir" gibi
// yönü belirsiz ifadeler listede yok, yalnız öğrencinin ödediğini gösterenler var.
const bayraklar = [
  "iban",
  "papara",
  "havale",
  "eft",
  "kredi karti",
  "kart bilgi",
  "kimlik fotografi",
  "kimlik fotokopisi",
  "basvuru ucreti",
  "kayit ucreti",
  "katilim ucreti",
  "egitim ucreti",
  "kurs ucreti",
  "ucret yatir",
  "ucreti yatir",
  "on odeme",
  "depozito",
];
function ascii(metin: string) {
  return metin.replace(/[çğıöşü]/g, (h) => ({ ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" })[h]!);
}
function normallestir(metin: string) {
  return ascii(metin.toLocaleLowerCase("tr-TR")).replace(/\s+/g, " ");
}
// Soldan kelime sınırı ("taliban" eşleşmesin, "ibanı" eşleşsin); "eft" iki yandan sınırlı.
const bayrakDesenleri = bayraklar.map((ifade) => ({
  ifade,
  desen: new RegExp(`(?<![a-z0-9])${ifade}${ifade === "eft" ? "(?![a-z0-9])" : ""}`),
}));
// Tekrar denetimi için linki sadeleştirir: büyük/küçük harf, #parça, utm_ parametreleri ve sondaki / yok sayılır.
function linkAnahtari(link: string) {
  try {
    const url = new URL(link);
    url.hash = "";
    for (const ad of [...url.searchParams.keys()]) if (ad.startsWith("utm_")) url.searchParams.delete(ad);
    return `${url.host}${url.pathname.replace(/\/+$/, "")}${url.search}`.toLowerCase();
  } catch {
    return link;
  }
}
const linkler = new Map<string, string>();
for (const dosya of dosyalar) {
  const ham = fs.readFileSync(dosya, "utf8");
  let deger: unknown;
  let yamlOk = true;
  try {
    deger = parse(ham);
  } catch (e) {
    yamlOk = false;
    bildir("HATA", dosya, `YAML ayrıştırılamadı: ${e instanceof Error ? e.message : String(e)}`);
  }
  if (yamlOk) {
    const sonuc = ilanSemasi.safeParse(deger);
    if (!sonuc.success)
      for (const i of sonuc.error.issues)
        bildir("HATA", dosya, `${i.path.join(".") || "ilan"}: ${i.message}`);
    if (deger && typeof deger === "object") {
      const ilan = deger as Record<string, unknown>;
      const ust = path.dirname(path.relative(kok, dosya));
      if (typeof ilan.bolum === "string" && ust !== "." && ilan.bolum !== path.basename(ust))
        bildir("HATA", dosya, `bolum klasör adıyla aynı olmalı (${path.basename(ust)}).`);
      if (
        typeof ilan.son_basvuru === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(ilan.son_basvuru) &&
        ilan.son_basvuru < bugun
      )
        bildir("HATA", dosya, "son_basvuru tarihi geçmiş.");
      if (typeof ilan.basvuru_linki === "string") {
        const anahtar = linkAnahtari(ilan.basvuru_linki);
        const onceki = linkler.get(anahtar);
        if (onceki)
          bildir(
            "UYARI",
            dosya,
            `basvuru_linki başka dosyada kullanılıyor: ${path.relative(process.cwd(), onceki)}.`,
          );
        else linkler.set(anahtar, dosya);
      }
    }
  }
  const metin = normallestir(ham);
  for (const { ifade, desen } of bayrakDesenleri)
    if (desen.test(metin)) bildir("HATA", dosya, `kırmızı bayrak ifade bulundu: "${ifade}".`);
}
console.log(`${dosyalar.length} dosya tarandı, ${hatalar} hata, ${uyarilar} uyarı.`);
process.exitCode = hatalar ? 1 : 0;
