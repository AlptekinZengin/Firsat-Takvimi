import { z } from "zod";
import { bolumler, digerVerenEtiketleri, kurumVerenEtiketleri, maddiBolumler } from "@/lib/bolumler";

const tarih = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((deger) => {
    const [yil, ay, gun] = deger.split("-").map(Number);
    const nesne = new Date(Date.UTC(yil, ay - 1, gun));
    return nesne.getUTCFullYear() === yil && nesne.getUTCMonth() === ay - 1 && nesne.getUTCDate() === gun;
  }, "gerçek bir takvim tarihi olmalı");

export const ilanSemasi = z
  .object({
    baslik: z.string().min(1).max(150),
    bolum: z.enum(bolumler.map((b) => b.slug) as [string, ...string[]]),
    duzenleyen: z.string().min(1).max(120),
    veren_etiketi: z.string().min(1),
    son_basvuru: tarih,
    etkinlik_tarihi: tarih.optional(),
    kimler: z.string().min(1).max(200),
    on_lisans: z.boolean(),
    yer: z.string().min(1).max(60),
    ucretli: z.boolean(),
    // Kullanıcı bilgili link (https://banka.com@kotu.site/) kimlik avında kullanılır, kabul edilmez.
    basvuru_linki: z
      .string()
      .max(500)
      .refine((v) => {
        try {
          const url = new URL(v);
          return v.startsWith("https://") && !url.username && !url.password;
        } catch {
          return false;
        }
      }, "https:// ile başlayan, kullanıcı bilgisi içermeyen geçerli bir link olmalı"),
    eklenme_tarihi: tarih,
    son_kontrol: tarih.optional(),
    ornek: z.boolean().optional(),
  })
  .strict()
  .superRefine((ilan, ctx) => {
    const secenekler = (maddiBolumler as readonly string[]).includes(ilan.bolum)
      ? kurumVerenEtiketleri
      : digerVerenEtiketleri;
    if (!(secenekler as readonly string[]).includes(ilan.veren_etiketi))
      ctx.addIssue({
        code: "custom",
        path: ["veren_etiketi"],
        message: `şu değerlerden biri olmalı: ${secenekler.join(", ")}`,
      });
  });
export type Ilan = z.infer<typeof ilanSemasi>;
export type IlanGorunur = Omit<Ilan, "eklenme_tarihi" | "son_kontrol"> & { id: string };
