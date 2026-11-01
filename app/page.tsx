import { IlanListesi } from "./IlanListesi";
import { ilanlariGetir } from "@/lib/ilanlar";
import { istanbulBugunu } from "@/lib/tarih";

export default function AnaSayfa() {
  // Derleme günü ilk çizimde kullanılır; tarayıcı açılınca gerçek bugüne geçer.
  return <IlanListesi ilanlar={ilanlariGetir()} derlemeGunu={istanbulBugunu()} />;
}
