const prisma = require('../utils/prisma')
const seedRandom = require('../utils/seedRandom')

async function randomMemory(userId){
  const user = await prisma.user.findUnique({ where: { id:userId } })
  if(!user || !user.coupleId) throw new Error("User not in a couple")

  const memories = await prisma.note.findMany({
    where:{ coupleId:user.coupleId, authorId: { not: userId }, isMemory:true },
    orderBy: { createdAt:'asc' }
  })

  if(memories.length === 0) return null

  // ----- Daily seed -----
  const today = new Date().toISOString().slice(0,10);
  const seed = parseInt(`${user.coupleId}${today.replace(/-/g,'')}`,10);
  const r = seedRandom(seed);
  const index = Math.floor(r * memories.length);

  // récup d'hier pour éviter redondance directe
    const yesterday = new Date(Date.now()-86400000).toISOString().slice(0,10);
    const yesterdaySeed = parseInt(`${user.coupleId}${yesterday.replace(/-/g,'')}`,10);
    const yesterdayR = seedRandom(yesterdaySeed);
    const yesterdayIndex = Math.floor(yesterdayR * memories.length);

    if(index === yesterdayIndex && memories.length > 1){
        index = (index + 1) % memories.length;
    }

  return memories[index]
}

module.exports = { randomMemory }
