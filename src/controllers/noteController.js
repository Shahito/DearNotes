const { addNote, getActiveNotes } = require('../services/noteService')

async function addNoteController(req, res) {
  try {
    const { image } = req.body
    if (!image) return res.status(400).json({ error:"Missing image" })

    const note = await addNote(req.user.id, image)
    res.json({ success:true, note })
  } catch(e) {
    res.status(400).json({ error:e.message })
  }
}

async function getNotesController(req,res){
  try{
    const notes = await getActiveNotes(req.user.id)

    const formatted = notes.map(n => ({
      id:n.id,
      createdAt:n.createdAt,
      expiresAt:n.expiresAt,
      authorId:n.authorId,
      image:`data:image/png;base64,${Buffer.from(n.image).toString('base64')}`
    }))

    res.json({notes:formatted})
  }catch(e){
    res.status(400).json({error:e.message})
  }
}

module.exports = { addNoteController, getNotesController }
