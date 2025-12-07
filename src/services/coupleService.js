const prisma = require('../utils/prisma')
const { generateInviteCode } = require('../utils/code')

async function createCouple(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error("User not found")
  if (user.coupleId) throw new Error("Already in a couple")

  const couple = await prisma.couple.create({
    data: {
      inviteCode: generateInviteCode(),
      users: { connect: { id: userId } }
    }
  })

  return couple
}

async function joinCouple(userId, code) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error("User not found")
  if (user.coupleId) throw new Error("Already in a couple")

  const couple = await prisma.couple.findUnique({ where: { inviteCode: code } })
  if (!couple) throw new Error("Code d'invitation invalide")

  // Vérifie que le couple n’est pas déjà plein
  const members = await prisma.user.findMany({ where: { coupleId: couple.id } })
  if (members.length >= 2) throw new Error("Un partenaire est déjà connecté")

  return prisma.user.update({
    where: { id: userId },
    data: { coupleId: couple.id }
  })
}

async function getCoupleCode(userId){
  const user = await prisma.user.findUnique({ where:{ id:userId } })
  if(!user || !user.coupleId) throw new Error("User not in a couple")

  const couple = await prisma.couple.findUnique({ 
    where:{ id:user.coupleId },
    select:{ inviteCode:true }
  })

  return couple.inviteCode
}

module.exports = { createCouple, joinCouple, getCoupleCode }