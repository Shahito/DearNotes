const patchnotes = require("../data/patchnotes.json");

async function getPatchnotes() {
  return patchnotes;
}

module.exports = { getPatchnotes };