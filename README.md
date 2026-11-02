# Fırsat Takvimi

Türkiye'deki üniversite öğrencilerine açık fırsatları son başvuru tarihleriyle listeleyen statik Türkçe site. Site başvuru almaz; başvurular düzenleyenin kendi sayfasında yapılır.

Kural: Öğrencinin para ödediği hiçbir ilan siteye girmez (başvuru, kayıt, katılım ya da eğitim ücreti; IBAN, kart, kimlik fotoğrafı isteyen ilanlar). Öğrenciye ödenen para (ücretli staj, maaş, burs) bu kuralın dışındadır.

## Klasörler

- `app/`: Next.js sayfaları ve görünüm
- `lib/`: bölüm tanımları, ilan şeması ve veri okuyucu
- `ilanlar/<bölüm-slug>/`: YAML ilan dosyaları
- `scripts/kontrol.ts`: ilan doğrulama betiği

İlanlarda `baslik`, `bolum`, `duzenleyen`, `veren_etiketi`, `son_basvuru`, `kimler`, `on_lisans`, `yer`, `basvuru_linki` ve `eklenme_tarihi` zorunludur. `etkinlik_tarihi`, `son_kontrol`, `ornek`, `gorsel` ve `vitrin` isteğe bağlıdır. Tarihler tırnaklı `YYYY-MM-DD` biçiminde yazılır.

`gorsel`, kurumun kendi afişinin `public/` altındaki yoludur; `public/` öneki yazılmaz (ör. `gorseller/yarismalar/teknofest-2027.webp`). Yol `gorseller/` ile başlar; uzantı öncesinde yalnız küçük harf a-z, rakam, `-`, `_`, `/` içerir ve `.png`, `.jpg`, `.jpeg` ya da `.webp` ile biter. `..`, ters bölü, baştaki `/` ve HTTP adresleri kabul edilmez. Dosya mevcut olmalıdır; 500 KB üzerindeki görseller uyarı verir. Kontrol betiğinde `--public <dizin>` ile varsayılan çalışma dizinindeki `public` yerine başka bir dizin seçilebilir.

`vitrin`, ana sayfadaki kayan vitrinin etkinlik slaytı sırasıdır: sayı olarak yalnız `1` veya `2` yazılır. Vitrindeki ilanın `gorsel` alanı zorunludur ve aynı vitrin numarası birden fazla ilanda kullanılamaz. `son_kontrol` sayfaya aktarılan veride korunur.

## Komutlar

- `npm run dev` — yerel geliştirme sunucusu
- `npm run build` — statik siteyi `out/` klasörüne çıkarır
- `npm run kontrol` — ilanları doğrular: zorunlu alanlar, bölüm/klasör uyumu, tarihi geçmiş ilan, kırmızı bayrak ifadeleri (IBAN, başvuru ücreti, havale…) ve tekrar eden link. Kırmızı bayrak listesi yardımcı bir süzgeçtir, tam koruma değildir; son onay insandadır. `--bugun YYYY-MM-DD` ile başka bir gün denenebilir.
- `npm test` — kontrol betiğini `testler/ornekler/` altındaki temiz ve ücretli örneklerle dener.
