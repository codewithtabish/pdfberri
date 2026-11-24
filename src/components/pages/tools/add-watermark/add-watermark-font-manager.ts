import { StandardFonts } from 'pdf-lib';

export function getStandardFont(fontFamily: string) {
  switch (fontFamily) {
    case 'TimesRoman': return StandardFonts.TimesRoman;
    case 'Courier': return StandardFonts.Courier;
    case 'Helvetica':
    default: return StandardFonts.Helvetica;
  }
}