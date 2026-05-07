const prisma = require('../config/db');

const findByEmail = async (email) => {
  return await prisma.pengguna.findUnique({
    where: { email },
  });
};

const createPengguna = async (data) => {
  return await prisma.pengguna.create({
    data,
  });
};

module.exports = {
  findByEmail,
  createPengguna,
};
