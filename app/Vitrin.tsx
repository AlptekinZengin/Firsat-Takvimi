"use client";

import { useEffect, useRef, useState } from "react";
import type { IlanGorunur } from "@/lib/ilan-sema";
import { gunFarki } from "@/lib/tarih";
import { Basvur, GuvenSatiri, bolumSunumlari, kontrolYaz } from "./IlanKarti";
import { gunEkle } from "./ilan-gruplari";

type VitrinProps = { ilanlar: IlanGorunur[]; bugun: string };

const SURE = 5000;
const bicimle = (secenekler: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("tr-TR", { timeZone: "UTC", ...secenekler });
const kisaGun = bicimle({ weekday: "short" });
const uzunGun = bicimle({ weekday: "long" });
const gunAy = bicimle({ day: "numeric", month: "short" });
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
  const gunler = Array.from({ length: 7 }, (_, n) => gunEkle(bugun, n));
  const etkinlikler = [1, 2].flatMap((sira) => {
    const ilan = ilanlar.find((i) => i.vitrin === sira && i.gorsel);
    return ilan ? [ilan] : [];
  });
  const toplam = etkinlikler.length + 1;
  const haftaBos = !gunler.some((g) => ilanlar.some((i) => i.son_basvuru === g));

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
            className="vt-s"
            inert={aktif !== 0}
            aria-roledescription="slide"
            aria-label={`1 / ${toplam}: Önümüzdeki 7 gün`}
          >
            <div className="sol">
              <h1>Fırsatı gör, <em>son günü</em> kaçırma.</h1>
              <p>
                Üniversite öğrencilerine açık burs, staj, hackathon, yarışma ve etkinlikler tek takvimde.
                Hepsi ücretsiz, hepsi düzenleyenin kendi sayfasından.
              </p>
              <img className="saat" src="/3d/saat.png" alt="" />
            </div>
            <div className="vt-tak">
              <ol className="vt-hafta" aria-label="Önümüzdeki 7 gün ve son başvurusu o gün olan ilanlar">
                {gunler.map((g, n) => {
                  const liste = ilanlar.filter((i) => i.son_basvuru === g);
                  return (
                    <li key={g} className={`vt-gun ${n === 0 ? "bugun" : ""}`}>
                      <time className="vt-et" dateTime={g}>
                        <b>{n === 0 ? "Bugün" : n === 1 ? "Yarın" : kisaGun.format(tarihNesnesi(g))}</b>
                        {n > 1 && <span>{gunAy.format(tarihNesnesi(g))}</span>}
                      </time>
                      {liste.length > 0 && (
                        <ul className="vt-mini">
                          {liste.map((i) => {
                            const bolum = bolumSunumlari[i.bolum];
                            return (
                              <li key={i.id}>
                                <a
                                  href={`#ilan-${i.id.replaceAll("/", "-")}`}
                                  title={i.baslik}
                                  aria-label={`${i.baslik}, ${i.duzenleyen}`}
                                  style={{ background: `var(--${bolum.renk})` }}
                                >
                                  {i.gorsel ? (
                                    <>
                                      <img className="bulanik" src={`/${i.gorsel}`} alt="" loading="lazy" />
                                      <img className="asil" src={`/${i.gorsel}`} alt="" loading="lazy" />
                                    </>
                                  ) : (
                                    <img className="nesne" src={`/3d/${bolum.nesne}.png`} alt="" loading="lazy" />
                                  )}
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ol>
              {haftaBos && <p className="vt-bos">Önümüzdeki 7 günde son başvurusu olan ilan yok.</p>}
            </div>
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
                  <GuvenSatiri kontrol={kontrolYaz(ilan, bugun)} />
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
