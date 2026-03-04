const express = require("express");
const router = express.Router();
const { patchnotesController } = require("../controllers/patchnotesController");

router.get("/", patchnotesController);

module.exports = router;