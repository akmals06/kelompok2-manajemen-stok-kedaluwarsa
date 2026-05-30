const PDFDocument = require('pdfkit');
const labelRepo = require('./label.repository');
const { hitungStatusBatch } = require('../batch/batch.service');

const LABEL_WIDTH = 200;
const LABEL_HEIGHT = 100;
const MARGIN = 10;
const LABELS_PER_ROW = 2;

const buatLabelProduk = async (idList, jumlahPerItem) => {
  const produkList = await labelRepo.ambilProdukUntukLabel(idList);

  if (produkList.length === 0) {
    throw Object.assign(new Error('Produk tidak ditemukan'), { statusCode: 404 });
  }

  const doc = new PDFDocument({ size: 'A4', margin: 20 });
  const buffers = [];

  doc.on('data', (chunk) => buffers.push(chunk));

  const selesai = new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)));
  });

  let posX = 20;
  let posY = 20;
  let kolom = 0;

  produkList.forEach((produk) => {
    for (let i = 0; i < (jumlahPerItem || 1); i++) {
      if (posY + LABEL_HEIGHT > doc.page.height - 20) {
        doc.addPage();
        posX = 20;
        posY = 20;
        kolom = 0;
      }

      doc.rect(posX, posY, LABEL_WIDTH, LABEL_HEIGHT).stroke();

      doc.fontSize(10).font('Helvetica-Bold')
        .text(produk.nama_produk, posX + MARGIN, posY + MARGIN, {
          width: LABEL_WIDTH - MARGIN * 2,
          align: 'center',
        });

      doc.fontSize(8).font('Helvetica')
        .text(produk.kategori.nama_kategori, posX + MARGIN, posY + 30, {
          width: LABEL_WIDTH - MARGIN * 2,
          align: 'center',
        });

      doc.fontSize(8).font('Helvetica')
        .text(`Satuan: ${produk.satuan}`, posX + MARGIN, posY + 45, {
          width: LABEL_WIDTH - MARGIN * 2,
          align: 'center',
        });

      kolom++;
      if (kolom >= LABELS_PER_ROW) {
        kolom = 0;
        posX = 20;
        posY += LABEL_HEIGHT + 10;
      } else {
        posX += LABEL_WIDTH + 10;
      }
    }
  });

  doc.end();
  return selesai;
};

const buatLabelBatch = async (idList, jumlahPerItem) => {
  const batchList = await labelRepo.ambilBatchUntukLabel(idList);

  if (batchList.length === 0) {
    throw Object.assign(new Error('Batch tidak ditemukan'), { statusCode: 404 });
  }

  const doc = new PDFDocument({ size: 'A4', margin: 20 });
  const buffers = [];

  doc.on('data', (chunk) => buffers.push(chunk));

  const selesai = new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)));
  });

  let posX = 20;
  let posY = 20;
  let kolom = 0;

  batchList.forEach((batch) => {
    const statusTerhitung = batch.status_batch === 'DIARSIPKAN'
      ? 'DIARSIPKAN'
      : hitungStatusBatch(batch.tanggal_kedaluwarsa);

    for (let i = 0; i < (jumlahPerItem || 1); i++) {
      if (posY + LABEL_HEIGHT > doc.page.height - 20) {
        doc.addPage();
        posX = 20;
        posY = 20;
        kolom = 0;
      }

      doc.rect(posX, posY, LABEL_WIDTH, LABEL_HEIGHT).stroke();

      doc.fontSize(10).font('Helvetica-Bold')
        .text(batch.produk.nama_produk, posX + MARGIN, posY + MARGIN, {
          width: LABEL_WIDTH - MARGIN * 2,
          align: 'center',
        });

      doc.fontSize(8).font('Helvetica')
        .text(`Batch: ${batch.kode_batch}`, posX + MARGIN, posY + 28, {
          width: LABEL_WIDTH - MARGIN * 2,
          align: 'center',
        });

      const tglExp = new Date(batch.tanggal_kedaluwarsa).toLocaleDateString('id-ID');
      doc.fontSize(8).font('Helvetica')
        .text(`Kedaluwarsa: ${tglExp}`, posX + MARGIN, posY + 42, {
          width: LABEL_WIDTH - MARGIN * 2,
          align: 'center',
        });

      doc.fontSize(8).font('Helvetica-Bold')
        .text(statusTerhitung, posX + MARGIN, posY + 56, {
          width: LABEL_WIDTH - MARGIN * 2,
          align: 'center',
        });

      kolom++;
      if (kolom >= LABELS_PER_ROW) {
        kolom = 0;
        posX = 20;
        posY += LABEL_HEIGHT + 10;
      } else {
        posX += LABEL_WIDTH + 10;
      }
    }
  });

  doc.end();
  return selesai;
};

module.exports = { buatLabelProduk, buatLabelBatch };
