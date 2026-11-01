import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { ilanSemasi, type IlanGorunur } from "@/lib/ilan-sema";
function dosyalariBul(dizin: string): string[] {
  return fs.readdirSync(dizin, { withFileTypes: true }).flatMap((girdi) => {
    const dosya = path.join(dizin, girdi.name);
    return girdi.isDirectory() ? dosyalariBul(dosya) : /\.ya?ml$/i.test(girdi.name) ? [dosya] : [];
  });
}
export function ilanlariGetir(): IlanGorunur[] {
  const kok = path.join(process.cwd(), "ilanlar");
  return dosyalariBul(kok).map((dosya) => {
    try {
      const sonuc = ilanSemasi.safeParse(parse(fs.readFileSync(dosya, "utf8")));
      if (!sonuc.success)
        throw new Error(
          sonuc.error.issues.map((i) => `${i.path.join(".") || "ilan"}: ${i.message}`).join("; "),
        );
      const klasor = path.basename(path.dirname(dosya));
      if (sonuc.data.bolum !== klasor) throw new Error(`bolum klasör adıyla aynı olmalı (${klasor}).`);
      const { eklenme_tarihi: _eklenme, son_kontrol: _kontrol, ...gorunur } = sonuc.data;
      return {
        ...gorunur,
        id: path
          .relative(kok, dosya)
          .replaceAll(path.sep, "/")
          .replace(/\.ya?ml$/i, ""),
      };
    } catch (hata) {
      throw new Error(
        `${path.relative(process.cwd(), dosya)}: ${hata instanceof Error ? hata.message : String(hata)}`,
      );
    }
  });
}
