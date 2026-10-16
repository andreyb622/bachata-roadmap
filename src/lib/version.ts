// buildDate is an ISO date (YYYY-MM-DD) injected at build time; shown as DD.MM.YYYY.
export function formatVersionLabel(version: string, buildDate: string, commit: string): string {
  const [year, month, day] = buildDate.split('-');
  const date = year && month && day ? `${day}.${month}.${year}` : buildDate;
  return `Версия ${version} · ${date} · ${commit}`;
}
