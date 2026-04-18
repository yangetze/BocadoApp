import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';

import { JWT_SECRET } from '../config/auth.js';
import logger from '../utils/logger.js';

export const login = async (req, res) => {
  try {
    const { loginId, password } = req.body;

    if (!loginId || !password) {
      return res.status(400).json({ error: 'Debes proporcionar tu usuario/email y contraseña' });
    }

    if (typeof loginId !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Formato de credenciales inválido' });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: loginId },
          { email: loginId }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (!user.active) {
      return res.status(403).json({ error: 'Usuario inactivo' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, active: user.active },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        identificationNumber: user.identificationNumber,
        defaultCurrency: user.defaultCurrency,
        companyLogo: user.companyLogo,
        policies: user.policies,
        paymentMethods: user.paymentMethods
      }
    });
  } catch (error) {
    logger.error('❌ ERROR EN LOGIN:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const register = async (req, res) => {
  try {
    const { username, email, identificationNumber, name } = req.body;

    if (!username || !email || !identificationNumber) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (usuario, email o cédula)' });
    }

    // Validación de formato de email simple
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'El formato del correo electrónico no es válido' });
    }

    // Validación de longitud
    if (username?.length < 3 || username?.length > 50) {
      return res.status(400).json({ error: 'El nombre de usuario debe tener entre 3 y 50 caracteres' });
    }

    if (email?.length > 255) {
      return res.status(400).json({ error: 'El correo electrónico no debe exceder 255 caracteres' });
    }

    if (identificationNumber?.length > 50) {
      return res.status(400).json({ error: 'La cédula/identificación no debe exceder 50 caracteres' });
    }

    if (name && name?.length > 100) {
      return res.status(400).json({ error: 'El nombre no debe exceder 100 caracteres' });
    }

    // Default password for users is their identification number
    const hashedPassword = await bcrypt.hash(identificationNumber, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        identificationNumber,
        password: hashedPassword,
        name: name || '',
        role: 'USER',
        active: true
      }
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name
      }
    });
  } catch (error) {
    logger.error('❌ ERROR EN REGISTRO:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'El usuario, email o cédula ya existen.' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        identificationNumber: user.identificationNumber
      }
    });
  } catch (error) {
    logger.error('❌ ERROR EN GETME:', error);
    res.status(500).json({ error: 'Error al recuperar perfil de usuario' });
  }
};
