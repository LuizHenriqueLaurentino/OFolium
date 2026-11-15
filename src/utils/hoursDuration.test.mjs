import { parseHoursToMinutes, valueToDecimalHours } from './hoursDuration.ts';

const accepted = [
  ['0,5h', 30, 0.5],
  ['0.5h', 30, 0.5],
  ['1,5h', 90, 1.5],
  ['1.5h', 90, 1.5],
  ['30min', 30, 0.5],
  ['30 min', 30, 0.5],
  ['30m', 30, 0.5],
  ['2h30', 150, 2.5],
  ['2h30min', 150, 2.5],
  ['2h 30', 150, 2.5],
  ['1h', 60, 1],
  ['2h', 120, 2],
  ['5h', 300, 5],
  ['0h30', 30, 0.5],
  ['1,50h', 90, 1.5],
  ['0,5 h', 30, 0.5],
];

const rejected = ['', '   ', 'abc', '5', '0,5', '-1h', '-0,5h', '-30min', '2h-30', 'mês', '0h', '0,0h'];

let failed = 0;

for (const [input, minutes, decimalHours] of accepted) {
  const parsedMinutes = parseHoursToMinutes(input);
  const parsedHours = valueToDecimalHours(input);
  if (parsedMinutes !== minutes) {
    console.error(`parseHoursToMinutes(${JSON.stringify(input)}) = ${parsedMinutes}, expected ${minutes}`);
    failed += 1;
  }
  if (parsedHours !== decimalHours) {
    console.error(`valueToDecimalHours(${JSON.stringify(input)}) = ${parsedHours}, expected ${decimalHours}`);
    failed += 1;
  }
}

for (const input of rejected) {
  const parsedMinutes = parseHoursToMinutes(input);
  const parsedHours = valueToDecimalHours(input);
  if (parsedMinutes !== 0) {
    console.error(`parseHoursToMinutes(${JSON.stringify(input)}) = ${parsedMinutes}, expected rejection`);
    failed += 1;
  }
  if (parsedHours !== null) {
    console.error(`valueToDecimalHours(${JSON.stringify(input)}) = ${parsedHours}, expected null`);
    failed += 1;
  }
}

if (failed > 0) {
  throw new Error(`${failed} assertion(s) failed`);
}

console.log(`hours duration tests passed (${accepted.length + rejected.length} cases)`);
