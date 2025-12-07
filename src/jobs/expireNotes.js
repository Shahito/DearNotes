const prisma = require('../utils/prisma')

async function expireNotes() {
  const now = new Date()

  await prisma.note.updateMany({
    where: {
      isMemory: false,
      expiresAt: { lt: now }
    },
    data: { isMemory: true }
  })
}

module.exports = expireNotes
