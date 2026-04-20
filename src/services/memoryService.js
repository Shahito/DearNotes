const prisma = require('../utils/prisma')
const Chooser = require('random-seed-weighted-chooser').default

async function randomMemory(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || !user.coupleId) throw new Error("User not in a couple")

  const today = new Date().toISOString().slice(0, 10)

  const memories = await prisma.note.findMany({
    where: { coupleId: user.coupleId, authorId: { not: userId }, isMemory: true },
    select: { id: true, createdAt: true, lastSeenAt: true },
    orderBy: { createdAt: 'asc' }
  })

  if (memories.length === 0) return null

  // Already seen today memory, no need to random pick again
  const alreadySeen = memories.find(
    m => m.lastSeenAt && new Date(m.lastSeenAt).toISOString().slice(0, 10) === today
  )
  if (alreadySeen) {
    return prisma.note.findUnique({ where: { id: alreadySeen.id } })
  }

  // Weighted shuffle
  const seed = `${user.coupleId}-${today}`
  const now = new Date(today).getTime()

  const weightedMemories = memories.map(m => ({
    ...m,
    weight: m.lastSeenAt
      ? Math.max(1, (now - new Date(new Date(m.lastSeenAt).toISOString().slice(0, 10)).getTime()) / 86_400_000)
      : 1000
  }))

  // Zero out yesterday's pick
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)
  const yesterdaySeed = `${user.coupleId}-${yesterday}`
  const yesterdayPick = Chooser.chooseWeightedObject(weightedMemories, 'weight', 1, yesterdaySeed)
  if (yesterdayPick && memories.length > 1) {
    const yIdx = weightedMemories.findIndex(m => m.id === yesterdayPick.id)
    if (yIdx !== -1) weightedMemories[yIdx].weight = 0
  }

  const selected = Chooser.chooseWeightedObject(weightedMemories, 'weight', 1, seed)

  await prisma.note.update({
    where: { id: selected.id },
    data: { lastSeenAt: new Date() }
  })

  return prisma.note.findUnique({ where: { id: selected.id } })
}

module.exports = { randomMemory }