import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'bocado-super-secret-key-2026';

export const login = async (req, res) => {
  try {
    const { loginId, password } = req.body;

    if (!loginId || !password) {
      return res.status(400).json({ error: 'Debes proporcionar tu usuario/email y contraseña' });
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
        identificationNumber: user.identificationNumber
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const register = async (req, res) => {
  try {
    const { username, email, identificationNumber, name } = req.body;

    if (!username || !email || !identificationNumber) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
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
    console.error('Error registering user:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'El usuario, email o cédula ya existen.' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
