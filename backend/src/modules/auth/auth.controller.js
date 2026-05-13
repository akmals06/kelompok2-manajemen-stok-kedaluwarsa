const authService = require('./auth.service');
const { successResponse } = require('../../utils/response');

const login = async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password);
  return successResponse(res, 'Login berhasil.', result);
};

module.exports = { login };
