const AuthService = require('../services/AuthService');

class AuthController {
  async login(req, res, next) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username y password son requeridos',
        });
      }

      const result = await AuthService.login(username, password);

      res.json({
        success: true,
        data: result,
        message: 'Login exitoso',
      });
    } catch (error) {
      next(error);
    }
  }

  async register(req, res, next) {
    try {
      const result = await AuthService.register(req.body);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Usuario registrado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req, res, next) {
    try {
      const usuario = await AuthService.getCurrentUser(req.user.id);

      res.json({
        success: true,
        data: usuario,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();

