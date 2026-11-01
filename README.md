# Fırsat Takvimi

Türkiye'deki üniversite öğrencilerine açık fırsatları son başvuru tarihleriyle listeleyen statik Türkçe site. Site başvuru almaz; başvurular düzenleyenin kendi sayfasında yapılır.

## Klasörler

- `app/`: Next.js sayfaları ve görünüm
- `lib/`: bölüm tanımları, ilan şeması ve veri okuyucu
- `ilanlar/<bölüm-slug>/`: YAML ilan dosyaları
- `scripts/kontrol.ts`: ilan doğrulama betiği

İlanlarda `baslik`, `bolum`, `duzenleyen`, `veren_etiketi`, `son_basvuru`, `kimler`, `on_lisans`, `yer`, `ucretli`, `basvuru_linki` ve `eklenme_tarihi` zorunludur. `etkinlik_tarihi`, `son_kontrol` ve `ornek` isteğe bağlıdır. Tarihler tırnaklı `YYYY-MM-DD` biçiminde yazılır.

## Komutlar

- `npm run dev` — yerel geliştirme sunucusu
- `npm run build` — statik siteyi `out/` klasörüne çıkarır
- `npm run kontrol` — ilanları doğrular: zorunlu alanlar, bölüm/klasör uyumu, tarihi geçmiş ilan, kırmızı bayrak ifadeleri (IBAN, başvuru ücreti, havale…) ve tekrar eden link. Kırmızı bayrak listesi yardımcı bir süzgeçtir, tam koruma değildir; son onay insandadır. `--bugun YYYY-MM-DD` ile başka bir gün denenebilir.
