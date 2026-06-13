import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { Response } from 'express';

export interface ExportCol {
  key: string;
  header: string;
  width?: number;
}

@Injectable()
export class ExportService {
  async toExcel(
    res: Response,
    filename: string,
    sheetName: string,
    cols: ExportCol[],
    rows: Record<string, any>[],
  ): Promise<void> {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet(sheetName);

    ws.columns = cols.map((c) => ({ header: c.header, key: c.key, width: c.width ?? 22 }));

    const hrow = ws.getRow(1);
    hrow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    hrow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
    hrow.alignment = { vertical: 'middle', horizontal: 'center' };
    hrow.height = 22;

    rows.forEach((r) => ws.addRow(r));

    ws.eachRow((row, n) => {
      if (n > 1 && n % 2 === 0) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
      }
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
    await wb.xlsx.write(res);
    res.end();
  }

  toPdf(
    res: Response,
    filename: string,
    title: string,
    cols: ExportCol[],
    rows: Record<string, any>[],
  ): void {
    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
    doc.pipe(res);

    doc.fontSize(14).font('Helvetica-Bold').fillColor('#1E3A5F').text(title, { align: 'center' });
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#6B7280')
      .text(
        `Exporté le ${new Date().toLocaleDateString('fr-FR')} — SMART SMOE IFDL`,
        { align: 'center' },
      );
    doc.moveDown(1);

    const margin = 40;
    const pageW = doc.page.width - margin * 2;
    const colW = pageW / cols.length;
    const rowH = 18;
    let y = doc.y;

    doc.rect(margin, y, pageW, rowH).fill('#1E3A5F');
    cols.forEach((col, i) => {
      doc
        .fontSize(7)
        .font('Helvetica-Bold')
        .fillColor('white')
        .text(col.header.toUpperCase(), margin + i * colW + 3, y + 5, {
          width: colW - 6,
          lineBreak: false,
        });
    });
    y += rowH;

    rows.forEach((row, ri) => {
      if (y + rowH > doc.page.height - margin) {
        doc.addPage();
        y = margin;
      }
      if (ri % 2 === 0) doc.rect(margin, y, pageW, rowH).fill('#F9FAFB');
      cols.forEach((col, i) => {
        const val = row[col.key] != null ? String(row[col.key]) : '-';
        doc
          .fontSize(7)
          .font('Helvetica')
          .fillColor('#111827')
          .text(val, margin + i * colW + 3, y + 5, { width: colW - 6, lineBreak: false });
      });
      y += rowH;
    });

    doc.end();
  }
}
