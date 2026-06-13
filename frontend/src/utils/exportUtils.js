import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportCSV(data, filename = 'atendimentos.csv') {
  if (!data || data.length === 0) return;

  const headers = ['ID', 'Cliente', 'Advogado', 'Área', 'Tipo', 'Status', 'Data', 'Hora', 'Valor (R$)', 'Processo'];
  const rows = data.map(a => [
    a.id,
    a.cliente,
    a.advogado,
    a.area,
    a.tipo,
    a.status,
    formatDate(a.data),
    a.hora,
    a.valor.toFixed(2),
    a.observacoes,
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportPDF(data, filename = 'atendimentos.pdf') {
  if (!data || data.length === 0) return;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text('Relatório de Atendimentos Jurídicos', 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')} · Total: ${data.length} registros`, 14, 25);

  autoTable(doc, {
    startY: 30,
    head: [['ID', 'Cliente', 'Advogado', 'Área', 'Tipo', 'Status', 'Data', 'Hora', 'Valor (R$)']],
    body: data.map(a => [
      a.id,
      a.cliente,
      a.advogado,
      a.area,
      a.tipo,
      a.status,
      formatDate(a.data),
      a.hora,
      `R$ ${a.valor.toFixed(2)}`,
    ]),
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 0: { cellWidth: 10 }, 8: { halign: 'right' } },
    margin: { left: 14, right: 14 },
  });

  doc.save(filename);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}
