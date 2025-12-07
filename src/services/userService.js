const prisma = require('../utils/prisma')

async function touchActivity(userId) {
    
  const user = await prisma.user.findUnique({ 
    where:{ id:userId },
    select:{ lastActive:true }
  })

  if(!user) return

  const now = Date.now()
  const last = new Date(user.lastActive).getTime()
  
  const FIVE_MIN = 5 * 60 * 1000

  if(now - last > FIVE_MIN) {
    await prisma.user.update({
      where:{ id:userId },
      data:{ lastActive:new Date() }
    })
  }
}

module.exports = { touchActivity }
