const express = require('express')
const cookieParser = require('cookie-parser')
const cron = require('node-cron')
const prisma = require('./src/utils/prisma')

const expireNotes = require('./src/jobs/expireNotes')
const authRoutes = require('./src/routes/auth')
const coupleRoutes = require('./src/routes/couple')
const noteRoutes = require('./src/routes/note')
const memoryRoutes = require('./src/routes/memory')
const statsRoutes = require('./src/routes/stats');

const app = express()
const PORT = 4000

app.use(express.json())
app.use(cookieParser())

app.use(express.static('public'))

app.use('/api/auth', authRoutes)
app.use('/api/couple', coupleRoutes)
app.use('/api/note', noteRoutes)
app.use('/api/memory', memoryRoutes)
app.use('/api/stats', statsRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

cron.schedule('*/15 * * * *', expireNotes)

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
