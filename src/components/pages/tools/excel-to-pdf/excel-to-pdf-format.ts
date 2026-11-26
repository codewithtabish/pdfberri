import type { CellKind } from './excel-to-pdf-types';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const pad2 = (n: number) => String(n).padStart(2, '0');

function splitSections(fmt: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuote = false;
  for (const ch of fmt) {
    if (ch === '"') inQuote = !inQuote;
    if (ch === ';' && !inQuote) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

// [$€-407] becomes €, [Red] / [$-409] become nothing
function cleanBrackets(s: string): string {
  return s.replace(/\[([^\]]*)\]/g, (_m, inner: string) => {
    const cur = /^\$([^-\]]*)/.exec(inner);
    return cur ? cur[1] : '';
  });
}

function stripLiterals(s: string): string {
  return s.replace(/"[^"]*"/g, '').replace(/\\./g, '').replace(/_./g, '').replace(/\*./g, '');
}

function isDateSection(section: string): boolean {
  const s = stripLiterals(cleanBrackets(section)).trim();
  return /[ymdhs]/i.test(s) && !/^general$/i.test(s);
}

function generalNumber(n: number): string {
  if (!Number.isFinite(n)) return String(n);
  if (Number.isInteger(n) && Math.abs(n) < 1e11) return String(n);
  const a = Math.abs(n);
  if (a >= 1e11 || (a !== 0 && a < 1e-9)) {
    return n.toExponential(5).toUpperCase().replace(/\.?0+E/, 'E');
  }
  return String(parseFloat(n.toPrecision(10)));
}

interface DateToken {
  type: 'lit' | 'tok';
  v: string;
}

function formatDate(d: Date, section: string): string {
  const cleaned = cleanBrackets(section);
  const hasAmPm = /am\/pm|a\/p/i.test(cleaned);
  const re = /"([^"]*)"|\\(.)|_(.)|\*(.)|(yyyy|yy|mmmmm|mmmm|mmm|mm|m|dddd|ddd|dd|d|hh|h|ss|s|am\/pm|a\/p)|(.)/gi;

  const tokens: DateToken[] = [];
  for (const m of cleaned.matchAll(re)) {
    if (m[1] !== undefined) tokens.push({ type: 'lit', v: m[1] });
    else if (m[2] !== undefined) tokens.push({ type: 'lit', v: m[2] });
    else if (m[3] !== undefined) tokens.push({ type: 'lit', v: ' ' });
    else if (m[4] !== undefined) continue;
    else if (m[5] !== undefined) tokens.push({ type: 'tok', v: m[5].toLowerCase() });
    else if (m[6] !== undefined) tokens.push({ type: 'lit', v: m[6] });
  }

  const Y = d.getUTCFullYear();
  const Mo = d.getUTCMonth();
  const D = d.getUTCDate();
  const H = d.getUTCHours();
  const Mi = d.getUTCMinutes();
  const S = d.getUTCSeconds();
  const W = d.getUTCDay();
  const hour = hasAmPm ? ((H + 11) % 12) + 1 : H;

  const isMinute = (idx: number): boolean => {
    for (let k = idx - 1; k >= 0; k--) {
      if (tokens[k].type === 'tok') {
        if (tokens[k].v === 'h' || tokens[k].v === 'hh') return true;
        break;
      }
    }
    for (let k = idx + 1; k < tokens.length; k++) {
      if (tokens[k].type === 'tok') {
        if (tokens[k].v === 's' || tokens[k].v === 'ss') return true;
        break;
      }
    }
    return false;
  };

  let out = '';
  tokens.forEach((t, idx) => {
    if (t.type === 'lit') {
      out += t.v;
      return;
    }
    switch (t.v) {
      case 'yyyy': out += String(Y); break;
      case 'yy': out += pad2(Y % 100); break;
      case 'mmmmm': out += MONTHS[Mo][0]; break;
      case 'mmmm': out += MONTHS[Mo]; break;
      case 'mmm': out += MONTHS[Mo].slice(0, 3); break;
      case 'mm': out += isMinute(idx) ? pad2(Mi) : pad2(Mo + 1); break;
      case 'm': out += isMinute(idx) ? String(Mi) : String(Mo + 1); break;
      case 'dddd': out += DAYS[W]; break;
      case 'ddd': out += DAYS[W].slice(0, 3); break;
      case 'dd': out += pad2(D); break;
      case 'd': out += String(D); break;
      case 'hh': out += pad2(hour); break;
      case 'h': out += String(hour); break;
      case 'ss': out += pad2(S); break;
      case 's': out += String(S); break;
      case 'am/pm': out += H < 12 ? 'AM' : 'PM'; break;
      case 'a/p': out += H < 12 ? 'A' : 'P'; break;
      default: break;
    }
  });
  return out;
}

function renderPlaceholder(valueIn: number, ph: string): string {
  const dot = ph.indexOf('.');
  let intPart = dot >= 0 ? ph.slice(0, dot) : ph;
  const fracPart = dot >= 0 ? ph.slice(dot + 1) : '';

  let value = valueIn;
  const trailing = /,+$/.exec(intPart)?.[0].length ?? 0;
  if (trailing > 0) {
    value /= Math.pow(1000, trailing);
    intPart = intPart.replace(/,+$/, '');
  }

  const thousands = intPart.includes(',');
  const minInt = (intPart.match(/0/g) ?? []).length;
  const maxDec = fracPart.replace(/,/g, '').length;
  const reqDec = (fracPart.match(/0/g) ?? []).length;

  const fixed = value.toFixed(Math.min(maxDec, 20));
  const [intRaw, fracRaw = ''] = fixed.split('.');
  let frac = fracRaw;
  while (frac.length > reqDec && frac.endsWith('0')) frac = frac.slice(0, -1);

  let int = intRaw.padStart(minInt, '0');
  if (minInt === 0 && int === '0') int = '';
  if (thousands) int = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return frac ? `${int}.${frac}` : int;
}

export function formatNumber(n: number, fmt: string | undefined): string {
  if (!fmt || /^general$/i.test(fmt) || fmt === '@') return generalNumber(n);

  const sections = splitSections(fmt);
  if (isDateSection(sections[0])) {
    const date = new Date(Math.round((n - 25569) * 86400000));
    return formatDate(date, sections[0]);
  }

  let section = sections[0];
  let value = n;
  let autoMinus = false;
  if (n < 0) {
    if (sections.length > 1) {
      section = sections[1];
      value = -n;
    } else {
      value = -n;
      autoMinus = true;
    }
  } else if (n === 0 && sections.length > 2) {
    section = sections[2];
  }

  const cleaned = cleanBrackets(section);
  if (/e[+-]/i.test(cleaned)) return generalNumber(n);
  if (stripLiterals(cleaned).includes('%')) value *= 100;

  const re = /"([^"]*)"|\\(.)|_(.)|\*(.)|([#0?,.]+)|(.)/g;
  let out = '';
  let done = false;
  for (const m of cleaned.matchAll(re)) {
    if (m[1] !== undefined) out += m[1];
    else if (m[2] !== undefined) out += m[2];
    else if (m[3] !== undefined) out += ' ';
    else if (m[4] !== undefined) continue;
    else if (m[5] !== undefined) {
      if (!done) {
        out += renderPlaceholder(value, m[5]);
        done = true;
      } else {
        out += m[5];
      }
    } else if (m[6] !== undefined) out += m[6];
  }
  if (!done) return generalNumber(n);
  return autoMinus ? `-${out}` : out;
}

export function formatCellValue(
  value: number | string | boolean | Date,
  numFmt?: string
): { text: string; kind: CellKind } {
  if (typeof value === 'string') return { text: value, kind: 'text' };
  if (typeof value === 'boolean') return { text: value ? 'TRUE' : 'FALSE', kind: 'bool' };

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return { text: '', kind: 'text' };
    const first = numFmt ? splitSections(numFmt)[0] : undefined;
    if (first && isDateSection(first)) return { text: formatDate(value, first), kind: 'number' };
    const iso = value.toISOString();
    const hasTime = !iso.endsWith('T00:00:00.000Z');
    return { text: hasTime ? iso.slice(0, 19).replace('T', ' ') : iso.slice(0, 10), kind: 'number' };
  }

  if (numFmt === '@') return { text: generalNumber(value), kind: 'text' };
  return { text: formatNumber(value, numFmt), kind: 'number' };
}