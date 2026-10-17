export function ruPluralRule(choice: number, choicesLength: number): number {
  const abs = Math.abs(choice);
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  let index = 2;
  if (mod10 === 1 && mod100 !== 11) index = 0;
  else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) index = 1;
  return Math.min(index, choicesLength - 1);
}
