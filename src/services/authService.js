const prisma = require('../utils/prisma')
const bcrypt = require('bcrypt')
const { signToken } = require('../utils/jwt')

async function register(username, password) {
  const displayUsername = username;            // version affichée
  const normalized = username.toLowerCase();   // version stockée pour login

  const exists = await prisma.user.findUnique({ where: { username: normalized } })
  if (exists) throw new Error("Username already taken")

  const hash = await bcrypt.hash(password, 10)

  return prisma.user.create({
    data: { 
      username: normalized,
      displayUsername,
      password: hash
    }
  })
}

async function login(username, password) {
  const normalized = username.toLowerCase();

  const user = await prisma.user.findUnique({ where: { username: normalized } })
  if (!user) throw new Error("Identifiants invalides")

  const ok = await bcrypt.compare(password, user.password)
  if (!ok) throw new Error("Identifiants invalides")

  await prisma.user.update({
    where: { id: user.id },
    data: { lastActive: new Date() }
  })

  const token = signToken({ id: user.id })
  return { user, token }
}

async function changePassword(userId, oldPassword, newPassword) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) throw new Error('Anicen mot de passe invalide');

  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hash }
  });

  return true;
}

module.exports = { register, login, changePassword };