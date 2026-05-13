const XLSX = require('xlsx');

const parseExcelBuffer = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const namaSheet = workbook.SheetNames[0];
  const sheet = workbook.Sheets[namaSheet];
  return XLSX.utils.sheet_to_json(sheet, { defval: '' });
};

const normalisasiHeader = (key) => {
  return key
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
};

const normalisasiBaris = (rows) => {
  return rows.map((row) => {
    const normalized = {};
    Object.keys(row).forEach((key) => {
      normalized[normalisasiHeader(key)] = row[key];
    });
    return normalized;
  });
};

module.exports = { parseExcelBuffer, normalisasiBaris };
