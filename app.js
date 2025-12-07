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
const PORT = 3000

app.use(express.json())
app.use(cookieParser())

app.use(express.static('public'))

app.use('/auth', authRoutes)
app.use('/couple', coupleRoutes)
app.use('/note', noteRoutes)
app.use('/memory', memoryRoutes)
app.use('/stats', statsRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

cron.schedule('*/15 * * * *', expireNotes)

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
