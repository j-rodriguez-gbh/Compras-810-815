const AuthService = require('../services/AuthService');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación requerido',
      });
    }

    const token = authHeader.substring(7);
    const decoded = AuthService.verifyToken(token);

    const usuario = await AuthService.getCurrentUser(decoded.id);
    
    if (usuario.estado !== 'Activo') {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo',
      });
    }

    req.user = {
      id: usuario.id,
      username: usuario.username,
      email: usuario.email,
      rol: usuario.rol,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Token inválido o expirado',
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción',
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};

