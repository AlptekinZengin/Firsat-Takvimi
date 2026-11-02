import type { IlanGorunur } from "@/lib/ilan-sema";
import { gunFarki, tarihYaz } from "@/lib/tarih";

type BolumSunumu = { ad: string; nesne: string; renk: string };

export const bolumSunumlari: Record<string, BolumSunumu> = {
  yarismalar: { ad: "Yarışma", nesne: "kupa", renk: "tur" },
  hackathonlar: { ad: "Hackathon", nesne: "laptop", renk: "pem" },
  burslar: { ad: "Burs", nesne: "kep", renk: "sari" },
  stajlar: { ad: "Staj", nesne: "canta", renk: "gok" },
  "arastirma-destekleri": { ad: "Araştırma", nesne: "mikroskop", renk: "nane" },
  "yurt-disi-degisim": { ad: "Yurt dışı", nesne: "dunya", renk: "lila" },
  "egitim-bootcamp": { ad: "Eğitim", nesne: "kitap", renk: "sari" },
  "etkinlik-zirve": { ad: "Etkinlik", nesne: "mikrofon", renk: "pem" },
  "gonulluluk-genclik": { ad: "Gönüllülük", nesne: "kalp", renk: "nane" },
};

export function Basvur({ ilan, buyuk = false }: { ilan: IlanGorunur; buyuk?: boolean }) {
  return (
    <a className="btn" href={ilan.basvuru_linki} target="_blank" rel="noopener noreferrer">
      {buyuk ? "Resmi sayfada başvur" : "Başvur"}
      <span className="sr-only">: {ilan.baslik}</span> ↗
    </a>
  );
}

type IlanKartiProps = {
  ilan: IlanGorunur;
  bugun: string;
  bicim: "buyuk" | "kart" | "satir";
  id?: string;
};

export function IlanKarti({ ilan, bugun, bicim, id }: IlanKartiProps) {
  const bolum = bolumSunumlari[ilan.bolum];
  const kalan = gunFarki(ilan.son_basvuru, bugun);
  const renk = { background: `var(--${bolum.renk})` };
  const kimler = ilan.kimler + (
    ilan.on_lisans && !ilan.kimler.toLocaleLowerCase("tr").includes("ön lisans")
      ? " Ön lisans öğrencileri de başvurabilir."
      : ""
  );
  const ornek = ilan.ornek && <small className="ornek"> · Örnek ilan</small>;
  const tarih = new Date(`${ilan.son_basvuru}T00:00:00Z`);
  const kisaTarih = new Intl.DateTimeFormat("tr-TR", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
  }).format(tarih);
  const ay = new Intl.DateTimeFormat("tr-TR", {
    timeZone: "UTC",
    month: "short",
  }).format(tarih).toLocaleUpperCase("tr");

  if (bicim === "satir") {
    return (
      <article id={id} className="sat">
        <div className={`ik ${ilan.gorsel ? "gorselli" : ""}`} style={renk}>
          {ilan.gorsel ? (
            <>
              <img className="bulanik" src={`/${ilan.gorsel}`} alt="" loading="lazy" />
              <img className="asil" src={`/${ilan.gorsel}`} alt="" loading="lazy" />
            </>
          ) : (
            <img src={`/3d/${bolum.nesne}.png`} alt="" />
          )}
        </div>
        <div className="bilgi">
          <h3>{ilan.baslik}</h3>
          <p className="d">{ilan.duzenleyen} · {bolum.ad} · {ilan.yer}{ornek}</p>
        </div>
        <div className="son-tarih">
          <time dateTime={ilan.son_basvuru}>{kisaTarih}</time>
          <small>{kalan} gün kaldı</small>
        </div>
        <Basvur ilan={ilan} />
      </article>
    );
  }

  const buyuk = bicim === "buyuk";
  const kapakBasligi = ilan.baslik.replace(/^Örnek\s+/i, "");
  const yaprak = !buyuk && (
    <time
      className={`yaprak ${ilan.gorsel ? "ici " : ""}${kalan <= 7 ? "acil" : ""}`}
      dateTime={ilan.son_basvuru}
      aria-label={`Son başvuru: ${tarihYaz(ilan.son_basvuru)}, ${kalan} gün kaldı`}
    >
      <b>{ay}</b>
      <span>{tarih.getUTCDate()}</span>
    </time>
  );

  return (
    <article id={id} className={buyuk ? "one kutu" : "kart kutu"}>
      <div className={`afis ${ilan.gorsel ? "gorselli" : "otomatik"}`} style={renk}>
        {ilan.gorsel ? (
          <>
            <img className="bulanik" src={`/${ilan.gorsel}`} alt="" />
            <img className="asil" src={`/${ilan.gorsel}`} alt={ilan.baslik} />
          </>
        ) : (
          <>
            <span className="u">{buyuk ? ilan.duzenleyen : bolum.ad}</span>
            <span className="t">{kapakBasligi}</span>
            <img className="nesne" src={`/3d/${bolum.nesne}.png`} alt="" />
          </>
        )}
        {!ilan.gorsel && yaprak}
      </div>
      <div className="bilgi">
        {buyuk && (
          <div className="etk">
            <span>{bolum.ad}</span>
            <span>{ilan.veren_etiketi}</span>
            <span>{ilan.yer}</span>
            {ilan.etkinlik_tarihi && <span>Etkinlik: {tarihYaz(ilan.etkinlik_tarihi)}</span>}
          </div>
        )}
        {!buyuk && ilan.gorsel ? (
          <div className="bas-satir">
            <h3>{ilan.baslik}</h3>
            {yaprak}
          </div>
        ) : <h3>{ilan.baslik}</h3>}
        {!buyuk && <p className="d">{ilan.duzenleyen} · {ilan.yer}{ornek}</p>}
        <p className="kim">{kimler}</p>
        {buyuk && (
          <div className={`geri ${kalan <= 7 ? "acil" : ""}`}>
            <div><b>{kalan} gün</b><span>kaldı</span></div>
          </div>
        )}
        <Basvur ilan={ilan} buyuk={buyuk} />
      </div>
    </article>
  );
}
