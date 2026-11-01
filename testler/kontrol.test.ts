import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { test } from "node:test";

// Kontrol betiğini örnek klasörle çalıştırır. Gün sabit, böylece örneklerin tarihi eskimez.
function kontrol(klasor: string) {
  const sonuc = spawnSync(
    process.execPath,
    [
      "--import",
      "tsx",
      "scripts/kontrol.ts",
      path.join("testler", "ornekler", klasor),
      "--bugun",
      "2026-11-02",
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

test("öğrencinin para ödediği ilan her bölümde HATA verir", () => {
  const { kod, cikti } = kontrol("ucretli");
  assert.equal(kod, 1, cikti);
  assert.match(cikti, /katilim-ucreti\.yml: kırmızı bayrak ifade bulundu: "katilim ucreti"/);
  assert.match(cikti, /kayit-ucreti\.yml: kırmızı bayrak ifade bulundu: "kayit ucreti"/);
  assert.match(cikti, /on-odeme\.yml: kırmızı bayrak ifade bulundu: "on odeme"/);
});
