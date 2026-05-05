import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export data to Excel (.xlsx)
 * @param {Array} data - Array of objects to export
 * @param {string} fileName - Name of the file (without extension)
 * @param {string} sheetName - Name of the worksheet
 */
export const exportToExcel = (data, fileName = 'Export', sheetName = 'Data') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

/**
 * Export data to PDF
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Array of objects { header: 'Title', dataKey: 'key' }
 * @param {string} title - Title of the PDF document
 * @param {string} fileName - Name of the file
 */
export const exportToPDF = (data, columns, title = 'Data Report', fileName = 'Report') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  try {
    const doc = new jsPDF();

    // Add Branding / Logo placeholder
    doc.setFillColor(0, 212, 255);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("TelcoVision", 14, 20);

    doc.setFontSize(12);
    doc.text("Network Management System", 14, 28);

    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text(title, 14, 55);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 62);
    doc.text(`Report ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}`, 14, 68);

    const tableData = data.map(item => columns.map(col => item[col.dataKey]));
    const headers = columns.map(col => col.header);

    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 75,
      margin: { top: 75 },
      styles: {
        fontSize: 9,
        cellPadding: 4,
        overflow: 'linebreak',
        halign: 'left'
      },
      headStyles: {
        fillColor: [0, 212, 255],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { fontStyle: 'bold' }
      }
    });

    doc.save(`${fileName}.pdf`);
  } catch (err) {
    console.error('PDF Export Error:', err);
    alert('Failed to generate PDF. Check console for details.');
  }
};
