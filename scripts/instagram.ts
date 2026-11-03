// Instagram için "Bu hafta kapanıyor" carousel'i: bugünden başlayan 7 günde kapanan ilanlar.
// Çıktı instagram/<bugun>/ altında 01.png… ve aciklama.txt (git'e girmez).
// Kullanım: npm run instagram [-- --bugun YYYY-MM-DD]
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { bolumler } from "../lib/bolumler";
import { ilanlariGetir } from "../lib/ilanlar";
import { gunFarki, istanbulBugunu } from "../lib/tarih";

const EN_COK_ILAN = 10; // Instagram carousel'i en çok 20 slayt alır; okunurluk için 10'da kesilir.

const args = process.argv.slice(2);
const bugunIndeks = args.indexOf("--bugun");
const bugun = bugunIndeks >= 0 ? args[bugunIndeks + 1] : istanbulBugunu();
if (!/^\d{4}-\d{2}-\d{2}$/.test(bugun ?? "")) {
  console.error("HATA  --bugun: YYYY-MM-DD biçiminde tarih gerekli.");
  process.exit(1);
}

// Slaytta yer dar; bölümlerin kısa adları.
const KISA_AD: Record<string, [string, string]> = {
  yarismalar: ["Yarışma", "var(--tur)"],
  hackathonlar: ["Hackathon", "var(--tur)"],
  burslar: ["Burs", "var(--sari)"],
  stajlar: ["Staj", "var(--nane)"],
  "arastirma-destekleri": ["Araştırma", "var(--sari)"],
  "yurt-disi-degisim": ["Yurt dışı", "var(--gok)"],
  "egitim-bootcamp": ["Eğitim", "var(--gok)"],
  "etkinlik-zirve": ["Etkinlik", "var(--lila)"],
  "gonulluluk-genclik": ["Gönüllülük", "var(--pem)"],
};

function gunEkle(tarih: string, gun: number): string {
  return new Date(Date.parse(`${tarih}T00:00:00Z`) + gun * 86_400_000).toISOString().slice(0, 10);
}
const gunAy = (tarih: string) =>
  new Intl.DateTimeFormat("tr-TR", { timeZone: "UTC", day: "numeric", month: "long" }).format(
    new Date(`${tarih}T00:00:00Z`),
  );
function aralikYaz(bas: string, son: string): string {
  const [g1, a1] = gunAy(bas).split(" ");
  const [g2, a2] = gunAy(son).split(" ");
  return a1 === a2 ? `${g1}–${g2} ${a1}` : `${g1} ${a1} – ${g2} ${a2}`;
}
const kacis = (s: string) =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

const haftaSonu = gunEkle(bugun, 6);
const hepsi = ilanlariGetir()
  .filter((i) => !i.ornek && i.son_basvuru >= bugun && i.son_basvuru <= haftaSonu)
  .sort((a, b) => a.son_basvuru.localeCompare(b.son_basvuru) || a.baslik.localeCompare(b.baslik, "tr"));
if (!hepsi.length) {
  console.log(`${bugun} – ${haftaSonu} arasında kapanan ilan yok; gönderi üretilmedi.`);
  process.exit(0);
}
const secilen = hepsi.slice(0, EN_COK_ILAN);
const kalan = hepsi.length - secilen.length;
const aralik = aralikYaz(bugun, haftaSonu);

const kok = process.cwd();
const dosyaUrl = (p: string) => pathToFileURL(path.join(kok, "public", p)).href;
const etiketler = bolumler
  .filter((b) => hepsi.some((i) => i.bolum === b.slug))
  .map((b) => `<span>${KISA_AD[b.slug][0]}</span>`)
  .join("");

const kapak = `<section class="slayt kapak">
  <div class="ust"><img src="${dosyaUrl("logo.png")}"><span class="alan">firsat-takvimi.com</span></div>
  <h1>Bu hafta<br><em>kapanıyor</em></h1>
  <div class="aralik">${aralik}</div>
  <div class="sayi"><b>${hepsi.length}</b><span>fırsatın<br>son haftası</span></div>
  <div class="etiketler">${etiketler}</div>
</section>`;

const ilanSlayti = (x: (typeof secilen)[number], i: number) => {
  const k = gunFarki(x.son_basvuru, bugun);
  const [ad, renk] = KISA_AD[x.bolum];
  // Kural gereği her ilanın görseli var; yoksa afiş alanı düz lacivert kalır.
  const afis = x.gorsel
    ? `<div class="zemin" style="background-image:url('${dosyaUrl(x.gorsel)}')"></div><img src="${dosyaUrl(x.gorsel)}">`
    : "";
  return `<section class="slayt ilan">
  <div class="afis">${afis}</div>
  <span class="sira">${i + 1} / ${secilen.length}</span>
  <div class="govde">
    <span class="bolum" style="background:${renk}">${ad}</span>
    <h2>${kacis(x.baslik)}</h2>
    <div class="duzenleyen">${kacis(x.duzenleyen)}</div>
    <div class="tarih">Son gün ${gunAy(x.son_basvuru)} <span class="kalan${k <= 3 ? " acil" : ""}">${k === 0 ? "Bugün" : `${k} gün kaldı`}</span></div>
    <div class="kimler">${kacis(x.kimler)}</div>
    ${x.on_lisans ? '<div class="onlisans">Ön lisans öğrencilerine de açık</div>' : ""}
  </div>
  <div class="alt"><span>Başvuru linki sitede</span><b>firsat-takvimi.com</b></div>
</section>`;
};

const kapanis = `<section class="slayt kapanis">
  <div class="ust"><img src="${dosyaUrl("logo.png")}"></div>
  <h1>Hepsi<br>tek yerde.</h1>
  <div class="site">firsat-takvimi.com</div>
  <p>${kalan > 0 ? `Bu hafta kapanan ${kalan} ilan daha sitede.<br>` : "Burs, staj, hackathon ve yarışmalar.<br>"}Link profilde.</p>
  <div class="cagri">Kaydet, bir arkadaşına gönder.</div>
</section>`;

const sablon = fs.readFileSync(path.join(kok, "scripts", "instagram-sablon.html"), "utf8");
const html = sablon.replace("<!--SLAYTLAR-->", kapak + secilen.map(ilanSlayti).join("") + kapanis);

const cikti = path.join(kok, "instagram", bugun);
fs.rmSync(cikti, { recursive: true, force: true });
fs.mkdirSync(cikti, { recursive: true });
const htmlYolu = path.join(cikti, "slaytlar.html");
fs.writeFileSync(htmlYolu, html);

const tarayici = [
  process.env.CHROME_YOLU,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].find((p) => p && fs.existsSync(p));
if (!tarayici) {
  console.error("HATA  Chrome bulunamadı; CHROME_YOLU ortam değişkeniyle yolunu ver.");
  process.exit(1);
}

const slaytSayisi = secilen.length + 2;
for (let n = 1; n <= slaytSayisi; n++) {
  const png = path.join(cikti, `${String(n).padStart(2, "0")}.png`);
  execFileSync(tarayici, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--allow-file-access-from-files",
    "--virtual-time-budget=6000",
    "--window-size=1080,1350",
    `--screenshot=${png}`,
    `${pathToFileURL(htmlYolu).href}#${n}`,
  ], { stdio: "ignore" });
  if (!fs.existsSync(png)) {
    console.error(`HATA  ${path.basename(png)} üretilemedi.`);
    process.exit(1);
  }
}

const aciklama = [
  `Bu hafta kapanıyor (${aralik})`,
  "",
  ...hepsi.map((i) => `• ${gunAy(i.son_basvuru)} · ${i.baslik} · ${i.duzenleyen}`),
  "",
  "Başvuru linklerinin hepsi firsat-takvimi.com'da, link profilde.",
  "Görseller ilgili kurumlarındır.",
  "",
  "#burs #staj #hackathon #yarışma #üniversite",
].join("\n");
fs.writeFileSync(path.join(cikti, "aciklama.txt"), aciklama);

console.log(`${slaytSayisi} slayt ve aciklama.txt → ${path.relative(kok, cikti)}`);
if (kalan > 0) console.log(`Not: ${kalan} ilan slayta sığmadı, açıklamada ve kapanışta anılıyor.`);
