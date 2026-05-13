export const formatTanggal = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatAngka = (num) => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('id-ID').format(num);
};

export const formatRupiah = (num) => {
  if (num === null || num === undefined) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num);
};
