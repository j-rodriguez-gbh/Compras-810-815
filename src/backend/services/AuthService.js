const UsuarioRepository = require('../repositories/UsuarioRepository');
const jwt = require('jsonwebtoken');
const config = require('../config/environment');

class AuthService {
  async login(username, password) {
    const usuario = await UsuarioRepository.findByUsername(username);
    
    if (!usuario) {
      throw new Error('Credenciales inválidas');
    }

    if (usuario.estado !== 'Activo') {
      throw new Error('Usuario inactivo');
    }

    const isPasswordValid = await usuario.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas');
    }

    const token = this.generateToken(usuario);

    return {
      token,
      usuario: {
        id: usuario.id,
        username: usuario.username,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
        estado: usuario.estado,
      },
    };
  }

  async register(data) {
    const usuarioExistente = await UsuarioRepository.findByUsername(data.username);
    if (usuarioExistente) {
      throw new Error('El nombre de usuario ya está en uso');
    }

    const emailExistente = await UsuarioRepository.findByEmail(data.email);
    if (emailExistente) {
      throw new Error('El email ya está en uso');
    }

    const usuario = await UsuarioRepository.create(data);
    const token = this.generateToken(usuario);

    return {
      token,
      usuario: {
        id: usuario.id,
        username: usuario.username,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
        estado: usuario.estado,
      },
    };
  }

  generateToken(usuario) {
    return jwt.sign(
      {
        id: usuario.id,
        username: usuario.username,
        email: usuario.email,
        rol: usuario.rol,
      },
      config.jwtSecret,
      {
        expiresIn: '24h',
      }
    );
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }

  async getCurrentUser(userId) {
    const usuario = await UsuarioRepository.findById(userId);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    return usuario;
  }
}

module.exports = new AuthService();

