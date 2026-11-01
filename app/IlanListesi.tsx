"use client";
import { useEffect, useMemo, useState } from "react";
import { bolumler } from "@/lib/bolumler";
import type { IlanGorunur } from "@/lib/ilan-sema";
import { gunFarki, istanbulBugunu, tarihYaz } from "@/lib/tarih";

const sekmeler = [{ slug: "tum", ad: "Tümü" }, ...bolumler];

export function IlanListesi({ ilanlar, derlemeGunu }: { ilanlar: IlanGorunur[]; derlemeGunu: string }) {
  const [sekme, setSekme] = useState("tum");
  const [onLisans, setOnLisans] = useState(false);
  // Sunucu HTML'iyle aynı değerle başlar (hydration uyumsuzluğu olmasın), sonra gerçek güne geçer.
  const [bugun, setBugun] = useState(derlemeGunu);

  useEffect(() => {
    const guncelle = () => setBugun(istanbulBugunu());
    guncelle();
    const id = window.setInterval(guncelle, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const acikIlanlar = useMemo(
    () =>
      ilanlar
        .filter((i) => i.son_basvuru >= bugun && (!onLisans || i.on_lisans))
        .sort((a, b) => a.son_basvuru.localeCompare(b.son_basvuru) || a.baslik.localeCompare(b.baslik, "tr")),
    [ilanlar, bugun, onLisans],
  );
  const gorunenler = sekme === "tum" ? acikIlanlar : acikIlanlar.filter((i) => i.bolum === sekme);

  return (
    <main className="sayfa">
      <header className="ust">
        <h1>Fırsat Takvimi</h1>
        <p>Burs, staj, hackathon ve yarışmalar</p>
      </header>

      <div className="sekme-kaydir" role="group" aria-label="İlan bölümleri">
        {sekmeler.map((b) => {
          const adet =
            b.slug === "tum" ? acikIlanlar.length : acikIlanlar.filter((i) => i.bolum === b.slug).length;
          return (
            <button
              key={b.slug}
              type="button"
              aria-pressed={sekme === b.slug}
              className={`sekme ${sekme === b.slug ? "secili" : ""}`}
              onClick={() => setSekme(b.slug)}
            >
              {b.ad} ({adet})
            </button>
          );
        })}
      </div>

      <label className="filtre">
        <input type="checkbox" checked={onLisans} onChange={(e) => setOnLisans(e.target.checked)} /> Yalnız ön
        lisansa açık olanlar
      </label>

      {gorunenler.length ? (
        <section className="kart-listesi" aria-label="Açık ilanlar">
          {gorunenler.map((i) => {
            const kalan = gunFarki(i.son_basvuru, bugun);
            return (
              <article className="kart" key={i.id}>
                <div className="kart-ust">
                  <div>
                    <h2>{i.baslik}</h2>
                    <p className="duzenleyen">{i.duzenleyen}</p>
                  </div>
                  {i.ornek && <span className="ornek">Örnek ilan</span>}
                </div>
                <p className="son-tarih">
                  <strong>Son başvuru:</strong> {tarihYaz(i.son_basvuru)}{" "}
                  <span>· {kalan === 0 ? "Bugün son gün" : `${kalan} gün kaldı`}</span>
                </p>
                {i.etkinlik_tarihi && (
                  <p>
                    <strong>Etkinlik tarihi:</strong> {tarihYaz(i.etkinlik_tarihi)}
                  </p>
                )}
                <p>{i.kimler}</p>
                <div className="etiketler">
                  {sekme === "tum" && <span>{bolumler.find((b) => b.slug === i.bolum)?.ad}</span>}
                  <span>{i.veren_etiketi}</span>
                  {i.on_lisans && <span>Ön lisans</span>}
                  <span>{i.yer}</span>
                  <span>{i.ucretli ? "Ücretli" : "Ücretsiz"}</span>
                </div>
                <a className="basvuru" href={i.basvuru_linki} target="_blank" rel="noopener noreferrer">
                  Başvur
                </a>
              </article>
            );
          })}
        </section>
      ) : (
        <p className="bos">Bu bölümde şu an açık ilan yok.</p>
      )}

      <footer>Site başvuru almaz; Başvur düğmesi düzenleyenin kendi sayfasına götürür.</footer>
    </main>
  );
}
