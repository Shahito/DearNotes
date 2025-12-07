const prisma = require('../utils/prisma')

async function addNote(userId, imageBase64) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || !user.coupleId) throw new Error("User not in a couple")

  const memberCount = await prisma.user.count({ where: { coupleId: user.coupleId } })

  if (memberCount < 2) throw new Error("Tu as besoin d'un partenaire pour envoyer des notes")

  const expires = new Date(Date.now() + 24*60*60*1000) // +24h
  const buffer = Buffer.from(imageBase64.split(",")[1], 'base64');

  return prisma.note.create({
    data: {
      coupleId: user.coupleId,
      authorId: userId,
      image: buffer,
      expiresAt: expires
    }
  })
}

async function getActiveNotes(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || !user.coupleId) throw new Error("User not in a couple")

  return prisma.note.findMany({
    where:{
      coupleId:user.coupleId,
      isMemory:false,
      expiresAt:{ gt:new Date() }
    },
    orderBy:{ createdAt:'desc' },
    select:{
      id:true,
      createdAt:true,
      expiresAt:true,
      authorId:true,
      image:true
    }
  })
}

module.exports = { addNote, getActiveNotes }
