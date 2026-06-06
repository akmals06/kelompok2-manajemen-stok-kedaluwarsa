const labelService = require('../services/label.service');

const buatLabelProduk = async (req, res, next) => {
  try {
    const { id_produk, jumlah_per_item } = req.body;
    const pdfBuffer = await labelService.buatLabelProduk(id_produk, jumlah_per_item);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=label-produk.pdf');
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

const buatLabelBatch = async (req, res, next) => {
  try {
    const { id_batch, jumlah_per_item } = req.body;
    const pdfBuffer = await labelService.buatLabelBatch(id_batch, jumlah_per_item);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=label-batch.pdf');
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

module.exports = { buatLabelProduk, buatLabelBatch };
