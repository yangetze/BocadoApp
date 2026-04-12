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

    const dataToUpdate = {};
    if (username !== undefined) dataToUpdate.username = username;
    if (email !== undefined) dataToUpdate.email = email;
    if (identificationNumber !== undefined) dataToUpdate.identificationNumber = identificationNumber;
    if (name !== undefined) dataToUpdate.name = name;
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
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
