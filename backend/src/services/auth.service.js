const penggunaRepository = require('../repositories/pengguna.repository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerUser = async (email, password, name) => {
  const existingUser = await penggunaRepository.findByEmail(email);
  if (existingUser) {
    const error = new Error('User already exists');
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  const newUser = await penggunaRepository.createPengguna({
    email,
    password_hash: hashedPassword,
    nama: name,
    peran: 'ADMIN_USAHA', // Default role untuk pendaftaran baru
    status_aktif: true,
  });

  return { id: newUser.id_pengguna, email: newUser.email };
};

const loginUser = async (email, password) => {
  const user = await penggunaRepository.findByEmail(email);
  if (!user || !user.status_aktif) {
    const error = new Error('Invalid credentials or inactive user');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    { id: user.id_pengguna, email: user.email, role: user.peran },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  return {
    user: {
      id: user.id_pengguna,
      email: user.email,
      name: user.nama,
      role: user.peran
    },
    token
  };
};

module.exports = {
  registerUser,
  loginUser,
};
