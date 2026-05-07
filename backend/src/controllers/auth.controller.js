const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/response');

const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const result = await authService.registerUser(email, password, name);
    return successResponse(res, 'User registered successfully', result, 201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    return successResponse(res, 'Login successful', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};
