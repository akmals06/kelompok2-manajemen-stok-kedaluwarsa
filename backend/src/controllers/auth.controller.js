const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) return errorResponse(res, 'User already exists', 400);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    return successResponse(res, 'User registered successfully', { id: user.id, email: user.email }, 201);
  } catch (error) {
    return errorResponse(res, 'Registration failed', 500, error);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return errorResponse(res, 'Invalid credentials', 401);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return errorResponse(res, 'Invalid credentials', 401);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return successResponse(res, 'Login successful', {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
    });
  } catch (error) {
    return errorResponse(res, 'Login failed', 500, error);
  }
};

module.exports = {
  register,
  login,
};
