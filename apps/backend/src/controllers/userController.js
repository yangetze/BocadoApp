import bcrypt from 'bcryptjs';
import prisma from '../prisma.js';
import logger from '../utils/logger.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        identificationNumber: true,
        active: true,
        role: true,
        createdAt: true
      }
    });
    res.json(users);
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { username, email, identificationNumber, name, active, role } = req.body;

    if (!username || !email || !identificationNumber) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'El formato del correo electrónico no es válido' });
    }

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

    const hashedPassword = await bcrypt.hash(identificationNumber, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        identificationNumber,
        password: hashedPassword,
        name: name || '',
        active: active !== undefined ? active : true,
        role: role || 'USER'
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        identificationNumber: true,
        active: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json(newUser);
  } catch (error) {
    logger.error('Error creating user:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'El usuario, email o cédula ya existen.' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, identificationNumber, name, active, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const dataToUpdate = {};

    if (email !== undefined) {
      if (typeof email !== 'string' || email.length > 255) {
        return res.status(400).json({ error: 'El correo electrónico no es válido o es muy largo' });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'El formato del correo electrónico no es válido' });
      }
      dataToUpdate.email = email;
    }

    if (username !== undefined) {
      if (typeof username !== 'string' || username.length < 3 || username.length > 50) {
        return res.status(400).json({ error: 'El nombre de usuario debe tener entre 3 y 50 caracteres' });
      }
      dataToUpdate.username = username;
    }

    if (identificationNumber !== undefined) {
      if (typeof identificationNumber !== 'string' || identificationNumber.length > 50) {
        return res.status(400).json({ error: 'La cédula/identificación no debe exceder 50 caracteres' });
      }
      dataToUpdate.identificationNumber = identificationNumber;
    }

    if (name !== undefined) {
      if (typeof name !== 'string' || name.length > 100) {
        return res.status(400).json({ error: 'El nombre no debe exceder 100 caracteres' });
      }
      dataToUpdate.name = name;
    }

    if (active !== undefined) dataToUpdate.active = active;
    if (role !== undefined) dataToUpdate.role = role;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        identificationNumber: true,
        active: true,
        role: true,
        createdAt: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    logger.error('Error updating user:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'El usuario, email o cédula ya existen.' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await prisma.user.delete({ where: { id } });
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, defaultCurrency, companyLogo, policies, paymentMethods } = req.body;

    const dataToUpdate = {};
    if (name !== undefined) {
      if (typeof name !== 'string' || name.length > 100) {
        return res.status(400).json({ error: 'El nombre no debe exceder 100 caracteres' });
      }
      dataToUpdate.name = name;
    }
    if (defaultCurrency !== undefined) dataToUpdate.defaultCurrency = defaultCurrency;
    if (companyLogo !== undefined) dataToUpdate.companyLogo = companyLogo;
    if (policies !== undefined) dataToUpdate.policies = policies;
    if (paymentMethods !== undefined) dataToUpdate.paymentMethods = paymentMethods;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        identificationNumber: true,
        active: true,
        role: true,
        defaultCurrency: true,
        companyLogo: true,
        policies: true,
        paymentMethods: true,
        createdAt: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    logger.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
