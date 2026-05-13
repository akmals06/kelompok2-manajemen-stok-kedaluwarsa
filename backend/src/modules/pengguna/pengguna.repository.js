const prisma = require('../../config/prisma');

const findByEmail = async (email) => {
  return prisma.pengguna.findUnique({
    where: { email },
  });
};

const findById = async (id) => {
  return prisma.pengguna.findUnique({
    where: { id_pengguna: id },
    select: {
      id_pengguna: true,
      nama: true,
      email: true,
      peran: true,
      status_aktif: true,
      created_at: true,
    },
  });
};

module.exports = { findByEmail, findById };
