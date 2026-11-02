import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { test } from "node:test";

// Kontrol betiğini örnek klasörle çalıştırır. Gün sabit, böylece örneklerin tarihi eskimez.
function kontrol(klasor: string, secenekler: string[] = [], bugun = "2026-11-02") {
  const sonuc = spawnSync(
    process.execPath,
    [
      "--import",
      "tsx",
      "scripts/kontrol.ts",
      path.isAbsolute(klasor) ? klasor : path.join("testler", "ornekler", klasor),
      "--bugun",
      bugun,
      ...secenekler,
    ],
    { encoding: "utf8" },
  );
  return { kod: sonuc.status, cikti: sonuc.stdout + sonuc.stderr };
}

test("öğrenciye ödenen para (maaş, ücretli staj, burs miktarı) kırmızı bayrak sayılmaz", () => {
  const { kod, cikti } = kontrol("temiz");
  assert.equal(kod, 0, cikti);
  assert.match(cikti, /2 dosya tarandı, 0 hata, 0 uyarı\./);
});

function gorselOrnegi(alanlar: string[], boyut?: number) {
  const kok = fs.mkdtempSync(path.join(os.tmpdir(), "ilan-kontrol-"));
  const ilanDizini = path.join(kok, "ilanlar");
  const publicDizini = path.join(kok, "public");
  fs.mkdirSync(ilanDizini);
  fs.mkdirSync(path.join(publicDizini, "gorseller"), { recursive: true });
  const temel = fs.readFileSync("testler/ornekler/temiz/stajlar/ucretli-staj.yml", "utf8");
  alanlar.forEach((alan, indeks) => {
    fs.writeFileSync(path.join(ilanDizini, `ilan-${indeks}.yml`), `${temel}\n${alan}\n`);
  });
  if (boyut !== undefined)
    fs.writeFileSync(path.join(publicDizini, "gorseller", "afis.webp"), Buffer.alloc(boyut));
  return { ilanDizini, publicDizini };
}

for (const [bugun, beklenenKod, mesaj] of [
  ["2027-06-30", 0, "0 hata, 0 uyarı"],
  ["2027-07-01", 0, "kapandı, 7 gün sonra sitede görünmez"],
  ["2027-07-07", 0, "kapandı, 1 gün sonra sitede görünmez"],
  ["2027-07-08", 1, "son_basvuru tarihi geçmiş."],
] as const)
  test(`kapanan ilan için yedi günlük sınır: ${bugun}`, () => {
    const { ilanDizini } = gorselOrnegi([""]);
    const { kod, cikti } = kontrol(ilanDizini, [], bugun);
    assert.equal(kod, beklenenKod, cikti);
    assert.ok(cikti.includes(mesaj), cikti);
    if (bugun === "2027-07-01" || bugun === "2027-07-07")
      assert.match(cikti, /1 dosya tarandı, 0 hata, 1 uyarı/);
  });

test("ek_bolumler geçerli slug kabul eder; geçersiz slug, ana bölüm ve üçten fazlasını reddeder", () => {
  for (const [bolumler, beklenenKod] of [
    [["yurt-disi-degisim"], 0],
    [["gecersiz-bolum"], 1],
    [["stajlar"], 1],
    [["burslar", "yarismalar", "hackathonlar", "yurt-disi-degisim"], 1],
  ] as const) {
    const { ilanDizini } = gorselOrnegi([`ek_bolumler: ${JSON.stringify(bolumler)}`]);
    const { kod, cikti } = kontrol(ilanDizini);
    assert.equal(kod, beklenenKod, cikti);
    if (beklenenKod) assert.match(cikti, /HATA .*ek_bolumler/);
  }
});

test("görsel dosyası mevcutsa hata yok; --public ve --bugun birlikte çalışır", () => {
  const { ilanDizini, publicDizini } = gorselOrnegi(["gorsel: gorseller/afis.webp\nvitrin: 1"], 3);
  const { kod, cikti } = kontrol(ilanDizini, ["--public", publicDizini]);
  assert.equal(kod, 0, cikti);
  assert.match(cikti, /0 hata, 0 uyarı/);
});

test("görsel dosyası yoksa HATA verir", () => {
  const { ilanDizini, publicDizini } = gorselOrnegi(["gorsel: gorseller/afis.webp"]);
  const { kod, cikti } = kontrol(ilanDizini, ["--public", publicDizini]);
  assert.equal(kod, 1, cikti);
  assert.ok(cikti.includes(`gorsel dosyası bulunamadı: ${path.join(publicDizini, "gorseller", "afis.webp")}`));
});

for (const yol of ["../x.png", "https://example.com/x.png", "gorseller/A.PNG", "gorseller/../x.png", "/gorseller/x.png", "gorseller\\x.png"])
  test(`geçersiz görsel yolu şema HATA verir: ${yol}`, () => {
    const { ilanDizini } = gorselOrnegi([`gorsel: '${yol}'`]);
    const { kod, cikti } = kontrol(ilanDizini);
    assert.equal(kod, 1, cikti);
    assert.match(cikti, /HATA .*gorsel: gorseller\//);
  });

test("vitrindeki ilanın görseli zorunludur", () => {
  const { ilanDizini } = gorselOrnegi(["vitrin: 1"]);
  const { kod, cikti } = kontrol(ilanDizini);
  assert.equal(kod, 1, cikti);
  assert.match(cikti, /vitrindeki ilanın görseli olmalı/);
});

test("aynı vitrini kullanan her ilan HATA verir", () => {
  const alan = "gorsel: gorseller/afis.webp\nvitrin: 2";
  const { ilanDizini, publicDizini } = gorselOrnegi([alan, alan, alan], 3);
  const { kod, cikti } = kontrol(ilanDizini, ["--public", publicDizini]);
  assert.equal(kod, 1, cikti);
  for (const indeks of [0, 1, 2])
    assert.match(cikti, new RegExp(`HATA .*ilan-${indeks}\\.yml: vitrin 2 başka ilanda da kullanılıyor:`));
});

for (const vitrin of ["3", "'1'"])
  test(`geçersiz vitrin şema HATA verir: ${vitrin}`, () => {
    const { ilanDizini, publicDizini } = gorselOrnegi([`gorsel: gorseller/afis.webp\nvitrin: ${vitrin}`], 3);
    const { kod, cikti } = kontrol(ilanDizini, ["--public", publicDizini]);
    assert.equal(kod, 1, cikti);
    assert.match(cikti, /HATA .*vitrin:/);
  });

for (const boyut of [500 * 1024, 500 * 1024 + 1])
  test(`görsel boyutu uyarı sınırı: ${boyut} bayt`, () => {
    const { ilanDizini, publicDizini } = gorselOrnegi(["gorsel: gorseller/afis.webp"], boyut);
    const { kod, cikti } = kontrol(ilanDizini, ["--public", publicDizini]);
    assert.equal(kod, 0, cikti);
    assert.equal(cikti.includes("gorsel 500 KB'tan büyük, sayfayı yavaşlatır"), boyut > 500 * 1024);
  });

test("bilinmeyen seçenek ve eksik --public değeri HATA verir", () => {
  for (const secenek of ["--bilinmeyen", "--public"]) {
    const { kod, cikti } = kontrol("temiz", [secenek]);
    assert.equal(kod, 1, cikti);
    assert.match(cikti, /HATA/);
  }
});

test("öğrencinin para ödediği ilan her bölümde HATA verir", () => {
  const { kod, cikti } = kontrol("ucretli");
  assert.equal(kod, 1, cikti);
  assert.match(cikti, /katilim-ucreti\.yml: kırmızı bayrak ifade bulundu: "katilim ucreti"/);
  assert.match(cikti, /kayit-ucreti\.yml: kırmızı bayrak ifade bulundu: "kayit ucreti"/);
  assert.match(cikti, /on-odeme\.yml: kırmızı bayrak ifade bulundu: "on odeme"/);
});
