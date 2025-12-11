import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface PaymentData {
  id: number;
  nama_lokasi: string;
  year?: number;
  jenis?: string;
  tagihan?: number;
  tarif?: number;
  jan: boolean;
  feb: boolean;
  mar: boolean;
  apr: boolean;
  mei: boolean;
  jun: boolean;
  jul: boolean;
  agu: boolean;
  sep: boolean;
  okt: boolean;
  nov: boolean;
  des: boolean;
  total: number;
}

interface MonthlySummaryData {
  month: string;
  monthName: string;
  unitKerja: number;
  edc: number;
  total: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const formatBoolean = (value: boolean) => value ? '✓' : '✗';

// Export Unit Kerja to Excel
export const exportUnitKerjaToExcel = (data: PaymentData[], year: number) => {
  const worksheet = XLSX.utils.json_to_sheet(
    data.map(item => ({
      'Nama Lokasi': item.nama_lokasi,
      'Tarif': formatCurrency(item.tarif || 0),
      'Januari': formatBoolean(item.jan),
      'Februari': formatBoolean(item.feb),
      'Maret': formatBoolean(item.mar),
      'April': formatBoolean(item.apr),
      'Mei': formatBoolean(item.mei),
      'Juni': formatBoolean(item.jun),
      'Juli': formatBoolean(item.jul),
      'Agustus': formatBoolean(item.agu),
      'September': formatBoolean(item.sep),
      'Oktober': formatBoolean(item.okt),
      'November': formatBoolean(item.nov),
      'Desember': formatBoolean(item.des),
      'Total': formatCurrency(item.total)
    }))
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Unit Kerja ${year}`);
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Rekap_Unit_Kerja_${year}.xlsx`);
};

// Export EDC to Excel
export const exportEdcToExcel = (data: PaymentData[], year: number) => {
  const worksheet = XLSX.utils.json_to_sheet(
    data.map(item => ({
      'Nama Lokasi': item.nama_lokasi,
      'Jenis': item.jenis,
      'Tagihan': formatCurrency(item.tagihan || 0),
      'Januari': formatBoolean(item.jan),
      'Februari': formatBoolean(item.feb),
      'Maret': formatBoolean(item.mar),
      'April': formatBoolean(item.apr),
      'Mei': formatBoolean(item.mei),
      'Juni': formatBoolean(item.jun),
      'Juli': formatBoolean(item.jul),
      'Agustus': formatBoolean(item.agu),
      'September': formatBoolean(item.sep),
      'Oktober': formatBoolean(item.okt),
      'November': formatBoolean(item.nov),
      'Desember': formatBoolean(item.des),
      'Total': formatCurrency(item.total)
    }))
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `EDC CCTV ${year}`);
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Rekap_EDC_CCTV_${year}.xlsx`);
};

// Export Monthly Summary to Excel
export const exportMonthlySummaryToExcel = (data: MonthlySummaryData[], year: number) => {
  const worksheet = XLSX.utils.json_to_sheet(
    data.map(item => ({
      'Bulan': item.monthName,
      'Unit Kerja': formatCurrency(item.unitKerja),
      'EDC & CCTV': formatCurrency(item.edc),
      'Total': formatCurrency(item.total)
    }))
  );

  // Add total row
  const totalRow = {
    'Bulan': 'TOTAL TAHUNAN',
    'Unit Kerja': formatCurrency(data.reduce((sum, item) => sum + item.unitKerja, 0)),
    'EDC & CCTV': formatCurrency(data.reduce((sum, item) => sum + item.edc, 0)),
    'Total': formatCurrency(data.reduce((sum, item) => sum + item.total, 0))
  };

  XLSX.utils.sheet_add_json(worksheet, [totalRow], { skipHeader: true, origin: -1 });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Rekap Bulanan ${year}`);
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Rekap_Bulanan_${year}.xlsx`);
};

// Export Unit Kerja to PDF
export const exportUnitKerjaToPDF = (data: PaymentData[], year: number) => {
  const doc = new jsPDF('l', 'mm', 'a4'); // landscape orientation
  
  // Add title
  doc.setFontSize(16);
  doc.text(`Rekap Pembayaran Unit Kerja - ${year}`, 20, 20);
  
  // Add generation date
  doc.setFontSize(10);
  doc.text(`Digenerate pada: ${new Date().toLocaleDateString('id-ID')}`, 20, 30);

  // Prepare table data
  const tableData = data.map(item => [
    item.nama_lokasi,
    formatCurrency(item.tarif || 0),
    formatBoolean(item.jan),
    formatBoolean(item.feb),
    formatBoolean(item.mar),
    formatBoolean(item.apr),
    formatBoolean(item.mei),
    formatBoolean(item.jun),
    formatBoolean(item.jul),
    formatBoolean(item.agu),
    formatBoolean(item.sep),
    formatBoolean(item.okt),
    formatBoolean(item.nov),
    formatBoolean(item.des),
    formatCurrency(item.total)
  ]);

  // Add table
  doc.autoTable({
    head: [['Nama Lokasi', 'Tarif', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des', 'Total']],
    body: tableData,
    startY: 40,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });

  doc.save(`Rekap_Unit_Kerja_${year}.pdf`);
};

// Export EDC to PDF
export const exportEdcToPDF = (data: PaymentData[], year: number) => {
  const doc = new jsPDF('l', 'mm', 'a4'); // landscape orientation
  
  // Add title
  doc.setFontSize(16);
  doc.text(`Rekap Pembayaran EDC & CCTV - ${year}`, 20, 20);
  
  // Add generation date
  doc.setFontSize(10);
  doc.text(`Digenerate pada: ${new Date().toLocaleDateString('id-ID')}`, 20, 30);

  // Prepare table data
  const tableData = data.map(item => [
    item.nama_lokasi,
    item.jenis || '',
    formatCurrency(item.tagihan || 0),
    formatBoolean(item.jan),
    formatBoolean(item.feb),
    formatBoolean(item.mar),
    formatBoolean(item.apr),
    formatBoolean(item.mei),
    formatBoolean(item.jun),
    formatBoolean(item.jul),
    formatBoolean(item.agu),
    formatBoolean(item.sep),
    formatBoolean(item.okt),
    formatBoolean(item.nov),
    formatBoolean(item.des),
    formatCurrency(item.total)
  ]);

  // Add table
  doc.autoTable({
    head: [['Nama Lokasi', 'Jenis', 'Tagihan', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des', 'Total']],
    body: tableData,
    startY: 40,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [16, 185, 129] },
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });

  doc.save(`Rekap_EDC_CCTV_${year}.pdf`);
};

// Export Monthly Summary to PDF
export const exportMonthlySummaryToPDF = (data: MonthlySummaryData[], year: number) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text(`Rekap Pendapatan Bulanan - ${year}`, 20, 20);
  
  // Add generation date
  doc.setFontSize(10);
  doc.text(`Digenerate pada: ${new Date().toLocaleDateString('id-ID')}`, 20, 30);

  // Prepare table data
  const tableData = data.map(item => [
    item.monthName,
    formatCurrency(item.unitKerja),
    formatCurrency(item.edc),
    formatCurrency(item.total)
  ]);

  // Add total row
  const totalRow = [
    'TOTAL TAHUNAN',
    formatCurrency(data.reduce((sum, item) => sum + item.unitKerja, 0)),
    formatCurrency(data.reduce((sum, item) => sum + item.edc, 0)),
    formatCurrency(data.reduce((sum, item) => sum + item.total, 0))
  ];
  tableData.push(totalRow);

  // Add table
  doc.autoTable({
    head: [['Bulan', 'Unit Kerja', 'EDC & CCTV', 'Total']],
    body: tableData,
    startY: 40,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [139, 92, 246] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    footStyles: { fillColor: [139, 92, 246], fontStyle: 'bold' }
  });

  doc.save(`Rekap_Bulanan_${year}.pdf`);
};