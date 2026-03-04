const { getPatchnotes } = require("../services/patchnotesService");

async function patchnotesController(req, res) {
  try {
    const data = await getPatchnotes();
    res.json({ patchnotes: data });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

module.exports = { patchnotesController };