const prisma = require('../config/prisma');

const cariPenggunaByEmail = async (email) => {
  return prisma.pengguna.findUnique({
    where: { email },
  });
};

const ambilPenggunaById = async (id) => {
  return prisma.pengguna.findUnique({
    where: { id_pengguna: id },
    select: {
      id_pengguna: true,
      nama: true,
      email: true,
      peran: true,
      status_aktif: true,
      created_at: true,
      updated_at: true,
    },
  });
};

const perbaruiPengguna = async (id, data) => {
  return prisma.pengguna.update({
    where: { id_pengguna: id },
    data,
    select: {
      id_pengguna: true,
      nama: true,
      email: true,
      peran: true,
      foto_profil: true,
      no_telepon: true,
      status_aktif: true,
    },
  });
};

const cariPenggunaByIdDenganPassword = async (id) => {
  return prisma.pengguna.findUnique({
    where: { id_pengguna: id },
  });
};

const cekEmailSudahAda = async (email, idPengguna) => {
  return prisma.pengguna.findFirst({
    where: {
      email,
      NOT: { id_pengguna: idPengguna },
    },
  });
};

module.exports = { cariPenggunaByEmail, ambilPenggunaById, perbaruiPengguna, cariPenggunaByIdDenganPassword, cekEmailSudahAda };
