const XLSX = require('xlsx');

const parseExcelDate = (val) => {
  if (val === undefined || val === null || val === '') return val;
  if (val instanceof Date) {
    return val.toISOString().split('T')[0];
  }
  if (typeof val === 'number') {
    const d = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  }
  if (typeof val === 'string') {
    const cleanStr = val.trim();
    // DD/MM/YYYY atau DD-MM-YYYY
    const match = cleanStr.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (match) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10);
      const year = parseInt(match[3], 10);
      const isoStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const d = new Date(isoStr);
      if (!isNaN(d.getTime())) {
        return isoStr;
      }
    }
    
    // YYYY/MM/DD atau YYYY-MM-DD
    const matchIso = cleanStr.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
    if (matchIso) {
      const year = parseInt(matchIso[1], 10);
      const month = parseInt(matchIso[2], 10);
      const day = parseInt(matchIso[3], 10);
      const isoStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const d = new Date(isoStr);
      if (!isNaN(d.getTime())) {
        return isoStr;
      }
    }
  }
  return val;
};

const parseExcelBuffer = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
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
      const normKey = normalisasiHeader(key);
      let val = row[key];
      if (typeof val === 'string') {
        val = val.trim();
      }
      if (normKey === 'tanggal_masuk' || normKey === 'tanggal_kedaluwarsa') {
        val = parseExcelDate(val);
      }
      normalized[normKey] = val;
    });
    return normalized;
  });
};

module.exports = { parseExcelBuffer, normalisasiBaris };

