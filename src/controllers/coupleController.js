const { createCouple, joinCouple, getCoupleCode } = require('../services/coupleService')

async function createCoupleController(req, res) {
  try {
    const couple = await createCouple(req.user.id)
    res.json({ success:true, couple })
  } catch(e) {
    res.status(400).json({ error:e.message })
  }
}

async function joinCoupleController(req, res) {
  try {
    const { code } = req.body
    if(!code) return res.status(400).json({ error:"Code manquant" })

    const updated = await joinCouple(req.user.id, code)
    res.json({ success:true, updated })
  } catch(e) {
    res.status(400).json({ error:e.message })
  }
}

async function getCoupleCodeController(req,res){
  try{
    const code = await getCoupleCode(req.user.id)
    res.json({ code })
  }catch(e){
    res.status(400).json({ error:e.message })
  }
}

module.exports = { createCoupleController, joinCoupleController, getCoupleCodeController }
