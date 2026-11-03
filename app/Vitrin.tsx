"use client";

import { useEffect, useRef, useState } from "react";
import type { IlanGorunur } from "@/lib/ilan-sema";
import { gunFarki } from "@/lib/tarih";
import { Basvur, bolumSunumlari } from "./IlanKarti";

type VitrinProps = { ilanlar: IlanGorunur[]; bugun: string };

const SURE = 5000;
const bicimle = (secenekler: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("tr-TR", { timeZone: "UTC", ...secenekler });
const uzunGun = bicimle({ weekday: "long" });
const gunAyUzun = bicimle({ day: "numeric", month: "long" });
const gunAyYil = bicimle({ day: "numeric", month: "long", year: "numeric" });
const tarihNesnesi = (tarih: string) => new Date(`${tarih}T00:00:00Z`);

function sonGunYaz(tarih: string, bugun: string) {
  const yazici = tarih.slice(0, 4) === bugun.slice(0, 4) ? gunAyUzun : gunAyYil;
  return `${uzunGun.format(tarihNesnesi(tarih))}, ${yazici.format(tarihNesnesi(tarih))}`;
}

function kalanYaz(kalan: number) {
  if (kalan === 0) return "bugün son gün";
  if (kalan === 1) return "yarın son gün";
  return `${kalan} gün kaldı`;
}

export function Vitrin({ ilanlar, bugun }: VitrinProps) {
  const yakin = ilanlar.find((i) => i.gorsel && !i.vitrin);
  const etkinlikler = [1, 2].flatMap((sira) => {
    const ilan = ilanlar.find((i) => i.vitrin === sira && i.gorsel);
    return ilan ? [ilan] : [];
  });
  const toplam = etkinlikler.length + 1;

  const [secili, setSecili] = useState(0);
  const [fare, setFare] = useState(false);
  const [odak, setOdak] = useState(false);
  const [azHareket, setAzHareket] = useState(false);
  const baslangicX = useRef<number | null>(null);
  const aktif = Math.min(secili, toplam - 1);
  const durdur = fare || odak;

  useEffect(() => {
    const sorgu = window.matchMedia("(prefers-reduced-motion: reduce)");
    const guncelle = () => setAzHareket(sorgu.matches);
    guncelle();
    sorgu.addEventListener("change", guncelle);
    return () => sorgu.removeEventListener("change", guncelle);
  }, []);

  useEffect(() => {
    if (toplam < 2 || durdur || azHareket) return;
    const id = window.setTimeout(() => setSecili((aktif + 1) % toplam), SURE);
    return () => window.clearTimeout(id);
  }, [aktif, toplam, durdur, azHareket]);

  const git = (yon: number) => setSecili((aktif + yon + toplam) % toplam);

  return (
    <header className="hero" aria-roledescription="carousel" aria-label="Vitrin">
      <div
        className="vt"
        onMouseEnter={() => setFare(true)}
        onMouseLeave={() => setFare(false)}
        onFocus={() => setOdak(true)}
        onBlur={() => setOdak(false)}
        onPointerDown={(e) => { baslangicX.current = e.clientX; }}
        onPointerCancel={() => { baslangicX.current = null; }}
        onPointerUp={(e) => {
          if (baslangicX.current === null) return;
          const fark = e.clientX - baslangicX.current;
          baslangicX.current = null;
          if (toplam > 1 && Math.abs(fark) > 50) git(fark < 0 ? 1 : -1);
        }}
      >
        <div className="vt-iz" style={{ transform: `translateX(-${aktif * 100}%)` }}>
          <section
            className="vt-s vt-ily vt-ilk"
            inert={aktif !== 0}
            aria-roledescription="slide"
            aria-label={`1 / ${toplam}: Fırsatı gör, son günü kaçırma`}
          >
            <div>
              <h1>Fırsatı gör, <em>son günü</em> kaçırma.</h1>
              <p>
                Üniversite öğrencilerine açık burs, staj, hackathon, yarışma ve etkinlikler tek takvimde.
                Hepsi ücretsiz, hepsi düzenleyenin kendi sayfasından.
              </p>
              {yakin && (
                <div className="vt-yakin">
                  <p className="vt-kicker">Son günü en yakın</p>
                  <h2>{yakin.baslik}</h2>
                  <p className="son">
                    {sonGunYaz(yakin.son_basvuru, bugun)} · <em>{kalanYaz(gunFarki(yakin.son_basvuru, bugun))}</em>
                  </p>
                  <Basvur ilan={yakin} />
                </div>
              )}
            </div>
            {yakin && (
              <div className="afis gorselli vt-afis" style={{ background: `var(--${bolumSunumlari[yakin.bolum].renk})` }}>
                <img className="bulanik" src={`/${yakin.gorsel}`} alt="" />
                <img className="asil" src={`/${yakin.gorsel}`} alt={yakin.baslik} />
              </div>
            )}
          </section>
          {etkinlikler.map((ilan, n) => {
            const bolum = bolumSunumlari[ilan.bolum];
            const kalan = gunFarki(ilan.son_basvuru, bugun);
            return (
              <section
                key={ilan.id}
                className="vt-s vt-ily"
                inert={aktif !== n + 1}
                aria-roledescription="slide"
                aria-label={`${n + 2} / ${toplam}: ${ilan.baslik}`}
              >
                <div>
                  <p className="vt-kicker">Öne çıkan · {n + 2} / {toplam}</p>
                  <h2>{ilan.baslik}</h2>
                  <p className="alt">{ilan.duzenleyen} · {ilan.yer} · {bolum.ad}</p>
                  <p className="son">
                    Son gün: {sonGunYaz(ilan.son_basvuru, bugun)} · <em>{kalanYaz(kalan)}</em>
                  </p>
                  <Basvur ilan={ilan} />
                </div>
                <div className="afis gorselli vt-afis" style={{ background: `var(--${bolum.renk})` }}>
                  <img className="bulanik" src={`/${ilan.gorsel}`} alt="" />
                  <img className="asil" src={`/${ilan.gorsel}`} alt={ilan.baslik} />
                </div>
              </section>
            );
          })}
        </div>
      </div>
      {toplam > 1 && (
        <>
          <button type="button" className="vt-ok onceki" onClick={() => git(-1)} aria-label="Önceki slayt">‹</button>
          <button type="button" className="vt-ok sonraki" onClick={() => git(1)} aria-label="Sonraki slayt">›</button>
          <div className={`vt-nk ${durdur ? "dur" : ""}`}>
            {Array.from({ length: toplam }, (_, n) => (
              <button
                type="button"
                key={n}
                className={n === aktif ? "on" : ""}
                aria-label={`${n + 1}. slayta git`}
                aria-current={n === aktif}
                onClick={() => setSecili(n)}
              >
                {n === aktif && <i />}
              </button>
            ))}
          </div>
        </>
      )}
    </header>
  );
}
