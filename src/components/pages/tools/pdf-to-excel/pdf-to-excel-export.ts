// src/components/pages/tools/pdf-to-excel/pdf-to-excel-export.ts
import ExcelJS from 'exceljs';
import { ExtractedTable } from './pdf-to-excel-types';

export async function generateExcelWorkbook(
  tables: ExtractedTable[],
  settings: { sheets: 'per-page' | 'all-one'; numbers: 'text' | 'detect' }
): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'PDFBerri';

  tables.forEach((table, i) => {
    const sheetName = `Page ${table.pageNumber}`.substring(0, 31);
    const worksheet = workbook.addWorksheet(sheetName);
    
    // Auto-detect RTL (Urdu/Arabic) and set sheet direction
    const containsRTL = table.rows.some(r => /[\u0600-\u06FF]/.test(r[0]));
    if (containsRTL) {
      worksheet.views = [{ rightToLeft: true }];
    }
    
    const headerRow = worksheet.addRow(table.headers);
    headerRow.font = { bold: true, size: 12 };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };

    table.rows.forEach(row => {
      const r = worksheet.addRow(row);
      // Ensure proper alignment and wrapping
      r.alignment = { 
        horizontal: containsRTL ? 'right' : 'left', 
        vertical: 'middle', 
        wrapText: true 
      };
    });
    
    // Set column width to a readable size (e.g., 80 characters wide)
    worksheet.columns[0].width = 80; 
    
    // Auto-adjust row heights for wrapped text
    worksheet.eachRow((row, rowNumber) => {
      row.height = 20; // Default height, Excel will expand based on text
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}