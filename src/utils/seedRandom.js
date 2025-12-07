function seedRandom(seed){
  let x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

module.exports = seedRandom