const { verifyToken } = require('../utils/jwt')
const prisma = require('../utils/prisma')
const { touchActivity } = require('../services/userService')

async function authRequired(req, res, next) {
  try {
    const token = req.cookies.token
    if (!token) return res.status(401).json({ error: "Not authenticated" })

    const decoded = verifyToken(token)

    const user = await prisma.user.findUnique({ where: { id: decoded.id } })
    if (!user) return res.status(401).json({ error: "User not found" })

    req.user = user

    // update lastActive if > 5min
    touchActivity(user.id).catch(() => {})

    next()
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" })
  }
}

module.exports = authRequired