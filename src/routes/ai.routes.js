const express = require("express");
const router = express.Router();

const aiController = require("../controllers/ai.controller");

router.post("/ai/skin-test", aiController.skinTest);

module.exports = router;