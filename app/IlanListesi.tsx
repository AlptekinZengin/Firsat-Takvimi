"use client";

import { useEffect, useMemo, useState } from "react";
import { bolumler, bolumGruplari } from "@/lib/bolumler";
import type { IlanGorunur } from "@/lib/ilan-sema";
import { istanbulBugunu } from "@/lib/tarih";
import { IlanKarti, bolumSunumlari } from "./IlanKarti";
import { Vitrin } from "./Vitrin";
import { grupNotu, tarihGruplari } from "./ilan-gruplari";

type IlanListesiProps = { ilanlar: IlanGorunur[]; derlemeGunu: string };

const bolumdeMi = (ilan: IlanGorunur, slug: string) => (
  ilan.bolum === slug || ilan.ek_bolumler?.includes(slug)
);

const menuBaglantilari = [
  { href: "#bolumler", ad: "Bölümler" },
  { href: "#ilanlar", ad: "Bu hafta kapananlar", sinif: "b" },
];

export function IlanListesi({ ilanlar, derlemeGunu }: IlanListesiProps) {
  const [grup, setGrup] = useState<string | null>(null);
  const [altBolum, setAltBolum] = useState<string | null>(null);
  const seciliGrup = bolumGruplari.find((g) => g.slug === grup);
  const grupSec = (slug: string | null) => {
    setGrup(slug);
    setAltBolum(null);
  };
  const [arama, setArama] = useState("");
  // İlk çizim sunucuyla aynı günü kullanır; tarayıcıda İstanbul gününe geçilir.
  const [bugun, setBugun] = useState(derlemeGunu);
  useEffect(() => {
    const guncelle = () => setBugun(istanbulBugunu());
    guncelle();
    const id = window.setInterval(guncelle, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const acikIlanlar = useMemo(
    () => ilanlar
      .filter((i) => i.son_basvuru >= bugun)
      .sort((a, b) => (
        a.son_basvuru.localeCompare(b.son_basvuru) || a.baslik.localeCompare(b.baslik, "tr")
      )),
    [ilanlar, bugun],
  );
  const sorgu = arama.trim().toLocaleLowerCase("tr");
  const gorunenler = acikIlanlar.filter((i) => (
    (altBolum ? bolumdeMi(i, altBolum) : !seciliGrup || seciliGrup.bolumler.some((b) => bolumdeMi(i, b))) &&
    (!sorgu || [i.baslik, i.duzenleyen, i.kimler, i.yer].some((metin) => (
      metin.toLocaleLowerCase("tr").includes(sorgu)
    )))
  ));
  const gruplar = tarihGruplari(gorunenler, bugun);
  const ilkGruplar = new Map<string, string>();
  for (const grup of gruplar) {
    for (const ilan of grup.ilanlar) {
      if (!ilkGruplar.has(ilan.id)) ilkGruplar.set(ilan.id, grup.id);
    }
  }

  return (
    <main className="kap">
      <nav aria-label="Ana gezinme">
        <a className="logo" href="/">
          <img src="/3d/spiral.png" alt="" />Fırsat Takvimi
        </a>
        <div className="nl">
          {menuBaglantilari.map((b) => <a key={b.href} className={b.sinif} href={b.href}>{b.ad}</a>)}
        </div>
        <details className="menu">
          <summary aria-label="Menüyü aç">☰</summary>
          <div className="nl kutu">
            {menuBaglantilari.map((b) => <a key={b.href} className={b.sinif} href={b.href}>{b.ad}</a>)}
          </div>
        </details>
      </nav>
      <Vitrin ilanlar={acikIlanlar} bugun={bugun} />
      <form className="ara kutu" role="search" onSubmit={(e) => e.preventDefault()}>
        <label className="sr-only" htmlFor="arama">İlanlarda ara</label>
        <input
          id="arama"
          type="search"
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          placeholder="⌕ Ne arıyorsun? Staj, burs, kurum adı, şehir…"
        />
        <label className="sr-only" htmlFor="bolum">Bölüm</label>
        <select id="bolum" value={grup ?? ""} onChange={(e) => grupSec(e.target.value || null)}>
          <option value="">Bölüm: Tümü</option>
          {bolumGruplari.map((b) => (
            <option key={b.slug} value={b.slug}>{b.ad}</option>
          ))}
        </select>
        <button type="submit">Bul</button>
      </form>
      <div className="bolum" id="bolumler" role="group" aria-label="İlan bölümleri">
        {bolumGruplari.map((b) => (
          <button
            type="button"
            key={b.slug}
            className={`bl ${grup === b.slug ? "secili" : ""}`}
            aria-pressed={grup === b.slug}
            onClick={() => grupSec(grup === b.slug ? null : b.slug)}
          >
            <img src={`/3d/${bolumSunumlari[b.bolumler[0]].nesne}.png`} alt="" />
            <b>{b.ad}</b>
            <span>{acikIlanlar.filter((i) => b.bolumler.some((slug) => bolumdeMi(i, slug))).length} açık</span>
          </button>
        ))}
      </div>
      {seciliGrup && seciliGrup.bolumler.length > 1 && (
        <div className="altb" role="group" aria-label={`${seciliGrup.ad} alt bölümleri`}>
          <button type="button" aria-pressed={altBolum === null} onClick={() => setAltBolum(null)}>
            Tümü
          </button>
          {seciliGrup.bolumler.map((slug) => (
            <button key={slug} type="button" aria-pressed={altBolum === slug} onClick={() => setAltBolum(slug)}>
              {bolumler.find((b) => b.slug === slug)?.ad} ({acikIlanlar.filter((i) => bolumdeMi(i, slug)).length})
            </button>
          ))}
        </div>
      )}
      <div id="ilanlar" aria-live="polite">
        {gruplar.filter((g) => g.ilanlar.length).map((g) => (
          <section key={g.id} id={g.id} aria-labelledby={`${g.id}-baslik`}>
            <div className="bas">
              <h2 id={`${g.id}-baslik`}>{g.ad}</h2>
              <small>{grupNotu(g, bugun)}</small>
            </div>
            <div className={g.bicim === "kart" ? "izg" : g.bicim === "satir" ? "liste kutu" : ""}>
              {g.ilanlar.map((i) => (
                <IlanKarti
                  key={i.id} ilan={i} bugun={bugun} bicim={g.bicim}
                  id={ilkGruplar.get(i.id) === g.id ? `ilan-${i.id.replaceAll("/", "-")}` : undefined}
                />
              ))}
            </div>
          </section>
        ))}
        {!gorunenler.length && (
          <p className="bos kutu">
            {sorgu ? "Aramana uyan açık ilan yok." : "Bu bölümde şu an açık ilan yok."}
          </p>
        )}
      </div>
    </main>
  );
}
