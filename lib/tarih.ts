// Bütün tarihler "YYYY-MM-DD" stringi; gün Europe/Istanbul'a göre sayılır.

export function istanbulBugunu(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function tarihYaz(tarih: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${tarih}T00:00:00Z`));
}

export function gunFarki(sonra: string, once: string): number {
  return Math.round((Date.parse(`${sonra}T00:00:00Z`) - Date.parse(`${once}T00:00:00Z`)) / 86_400_000);
}
