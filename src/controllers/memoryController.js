const { randomMemory } = require('../services/memoryService')

async function randomMemoryController(req,res){
  try{
    const memory = await randomMemory(req.user.id)

    if(!memory) return res.json({memory:null})

    res.json({
      memory:{
        id:memory.id,
        createdAt:memory.createdAt,
        image:`data:image/png;base64,${Buffer.from(memory.image).toString('base64')}`
      }
    })
  } catch(e) {
    res.status(400).json({error:e.message})
  }
}

module.exports = { randomMemoryController }