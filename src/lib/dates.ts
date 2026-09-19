const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function formatBakeDate(isoDate: string): string {
  const parts = isoDate.split("-");
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!month || !day) {
    return isoDate;
  }
  const monthName = MONTHS[month - 1];
  if (!monthName) {
    return isoDate;
  }
  const year = parts[0];
  return year ? `${monthName} ${day}, ${year}` : `${monthName} ${day}`;
}

export function todayStamp(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function formatMadeAt(ms: number): string {
  const date = new Date(ms);
  const monthName = MONTHS[date.getMonth()];
  if (!monthName) {
    return "";
  }
  return `${monthName} ${date.getDate()}, ${date.getFullYear()}`;
}
