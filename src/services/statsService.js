const prisma = require('../utils/prisma');

async function getStats(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { couple: true }
  });

  if (!user || !user.coupleId) {
    return {
      sent: 0,
      received: 0,
      partner: null,
      since: null
    };
  }

  const [sent, received, partner, couple] = await Promise.all([
    prisma.note.count({ where: { authorId: userId } }),
    prisma.note.count({
      where: {
        coupleId: user.coupleId,
        authorId: { not: userId }
      }
    }),
    prisma.user.findFirst({
      where: { coupleId: user.coupleId, id: { not: userId } }
    }),
    prisma.couple.findUnique({ where: { id: user.coupleId } })
  ]);

  return {
    sent,
    received,
    partner: partner ? partner.displayUsername : null,
    since: couple ? couple.createdAt : null
  };
}

module.exports = { getStats };
